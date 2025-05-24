import { useState, useEffect, useRef } from 'react';
import { getFirestore, collection, query, orderBy, limit, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth } from '../firebase/firebaseConfig';
//import { Cloudinary } from 'cloudinary-core';

 export default function Chat () {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const db = getFirestore();

  // Cloudinary configuration
//   const cloudinary = new Cloudinary({
//     cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
//     api_key: import.meta.env.VITE_CLOUDINARY_API_KEY,
//     api_secret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
//   });

  // Real-time messages listener
  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
      setMessages(messagesData.reverse());
    });

    return () => unsubscribe();
  }, [db]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle image upload to Cloudinary
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  // Handle message submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedImage) return;

    setLoading(true);
    try {
      let imageUrl = '';
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        timestamp: serverTimestamp(),
        uid: auth.currentUser.uid,
        photoURL: auth.currentUser.photoURL,
        displayName: auth.currentUser.displayName,
        imageUrl
      });

      setNewMessage('');
      setSelectedImage(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
    setLoading(false);
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Chat Header */}
      <header className="bg-white shadow-sm py-4 px-6 flex items-center">
        <h1 className="text-xl font-bold text-gray-800">ChatGram</h1>
        <div className="ml-auto flex items-center">
          <img 
            src={auth.currentUser?.photoURL} 
            alt="Profile" 
            className="w-8 h-8 rounded-full"
          />
          <span className="ml-2 text-gray-600">{auth.currentUser?.displayName}</span>
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`flex ${message.uid === auth.currentUser?.uid ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-md p-4 rounded-lg ${
              message.uid === auth.currentUser?.uid 
                ? 'bg-blue-500 text-white' 
                : 'bg-white shadow-sm'
            }`}
            >
              {message.uid !== auth.currentUser?.uid && (
                <div className="flex items-center mb-2">
                  <img 
                    src={message.photoURL} 
                    alt="Profile" 
                    className="w-6 h-6 rounded-full mr-2"
                  />
                  <span className="text-sm font-medium">{message.displayName}</span>
                </div>
              )}
              
              {message.imageUrl && (
                <img 
                  src={message.imageUrl} 
                  alt="Chat content" 
                  className="mb-2 rounded-lg max-w-full h-48 object-cover"
                />
              )}
              
              {message.text && <p className="break-words">{message.text}</p>}
              
              <div className={`mt-2 text-xs ${
                message.uid === auth.currentUser?.uid 
                  ? 'text-blue-100' 
                  : 'text-gray-500'
              }`}
              >
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="bg-white p-4 shadow-lg">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="absolute right-2 bottom-2 opacity-0 w-8 h-8 cursor-pointer"
              id="fileInput"
            />
            <label 
              htmlFor="fileInput"
              className="absolute right-2 bottom-2 p-2 hover:bg-gray-100 rounded-full cursor-pointer"
              title="Attach image"
            >
              📎
            </label>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
        
        {selectedImage && (
          <div className="mt-4 flex items-center">
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Selected"
              className="w-16 h-16 object-cover rounded-lg mr-2"
            />
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="text-red-500 hover:text-red-600"
            >
              Remove
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
