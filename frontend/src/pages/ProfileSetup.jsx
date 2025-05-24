import { useState } from 'react';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
//import { v4 as uuidv4 } from 'uuid';
import { auth } from '../firebase/firebaseConfig';
// import { Cloudinary } from 'cloudinary-core';

// const cloudinary = new Cloudinary({
//   cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
//   api_key: import.meta.env.VITE_CLOUDINARY_API_KEY,
//   api_secret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
// });

export default function ProfileSetup() {
  const [chatgramId, setChatgramId] = useState('');
  const [name, setName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');

  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      return data.secure_url;
    } catch (err) {
      throw new Error('Failed to upload image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if chatgram ID is unique
      const db = getFirestore();
      const idDoc = await getDoc(doc(db, 'users', chatgramId));
      
      if (idDoc.exists()) {
        throw new Error('Chatgram ID already taken');
      }

      // Upload profile photo if exists
      let photoURL = '';
      if (profilePhoto) {
        photoURL = await handleImageUpload(profilePhoto);
      }

      // Save user data to Firestore
      await setDoc(doc(db, 'users', chatgramId), {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        chatgramId,
        name,
        photoURL,
        createdAt: new Date(),
      });

      // Redirect to main chat page
      window.location = '/chat';
      
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Complete Your Profile</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chatgram ID (unique)
            </label>
            <input
              type="text"
              value={chatgramId}
              onChange={(e) => setChatgramId(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Photo
            </label>
            <div className="flex items-center space-x-4">
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}