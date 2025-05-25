import { useState, useEffect } from 'react';
import { getFirestore, doc, setDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { auth } from '../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { createAvatar } from '@dicebear/core';
import { micah } from '@dicebear/collection';

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [chatgramId, setChatgramId] = useState('');
  const [name, setName] = useState(auth.currentUser?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [avatarSvg, setAvatarSvg] = useState('');

  useEffect(() => {
    const generateAndSetAvatar = async () => {
      const seed = chatgramId || name || auth.currentUser?.email || 'default-chatgram-user';
      try {
        const avatar = createAvatar(micah, { // Use the 'micah' style
          seed: seed,
        });
        const dataUri = await avatar.toDataUri(); 
        setAvatarSvg(dataUri);
      } catch (err) {
        console.error("Error generating avatar:", err);
        setAvatarSvg('');
      }
    };
    generateAndSetAvatar();
  }, [chatgramId, name, auth.currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!auth.currentUser) {
      setError("No authenticated user found. Please sign in again.");
      setLoading(false);
      return;
    }

    if (!chatgramId.trim()) {
        setError("Chatgram ID cannot be empty.");
        setLoading(false);
        return;
    }

    // Basic regex for chatgramId (letters, numbers, underscores, dashes, periods)
    if (!/^[a-zA-Z0-9_.-]+$/.test(chatgramId)) {
        setError("Chatgram ID can only contain letters, numbers, underscores, dashes, and periods.");
        setLoading(false);
        return;
    }
    // Length validation for chatgramId
    if (chatgramId.length < 3 || chatgramId.length > 20) {
        setError("Chatgram ID must be between 3 and 20 characters long.");
        setLoading(false);
        return;
    }
    if (!name.trim()) {
        setError("Display Name cannot be empty.");
        setLoading(false);
        return;
    }

    try {
      const db = getFirestore();

      // --- 1. Check for duplicate Chatgram ID (by querying) ---
      // This is crucial because the Firestore document ID is the UID,
      // but we need to ensure the `chatgramId` field is unique across all users.
      const chatgramIdQuery = query(
        collection(db, 'users'),
        where('chatgramId', '==', chatgramId)
      );
      const querySnapshot = await getDocs(chatgramIdQuery);

      if (!querySnapshot.empty) {
        // If any document matches the chatgramId, it's a duplicate
        throw new Error('Chatgram ID already taken. Please choose another.');
      }

      // --- 2. Save user data to Firestore using UID as document ID ---
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      
      await setDoc(userDocRef, {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        chatgramId: chatgramId, // Store the chosen unique chatgram ID
        name: name,
        avatarSvg: avatarSvg, // Save the generated SVG data URI
        createdAt: new Date(),
      }, { merge: false }); // Use merge: false to ensure we're creating a new doc or overwriting fully

      // Redirect to main chat page
      navigate('/chat');
      
    } catch (err) {
      console.error("Profile setup error:", err.message);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-400">Complete Your Profile</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-300 text-sm text-center p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex flex-col items-center mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Avatar
            </label>
            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-purple-500">
              {avatarSvg ? (
                <img src={avatarSvg} alt="Generated Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-500 text-xs">Generating...</div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Avatar generated based on your Chatgram ID.
            </p>
          </div>

          <div>
            <label htmlFor="chatgramId" className="block text-sm font-medium text-gray-300 mb-1">
              Chatgram ID <span className="text-red-400">*</span>
            </label>
            <input
              id="chatgramId"
              type="text"
              value={chatgramId}
              // Enforce lowercase and remove spaces for chatgramId
              onChange={(e) => setChatgramId(e.target.value.toLowerCase().replace(/\s/g, ''))}
              required
              placeholder="e.g., john.doe123"
              className="w-full px-4 py-3 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-500"
              maxLength="20" // Limit length for chatgramId
            />
            <p className="text-xs text-gray-500 mt-1">
                Unique identifier for your profile (3-20 characters). Letters, numbers, underscores, dashes, and periods only.
            </p>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Display Name <span className="text-red-400">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., John Doe"
              className="w-full px-4 py-3 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-500"
              maxLength="50" // Example: Limit display name length
            />
          </div>

          <button
            type="submit"
            disabled={loading || !chatgramId.trim() || !name.trim() || error} // Disable if there's an error
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-md hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {loading ? 'Saving...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}