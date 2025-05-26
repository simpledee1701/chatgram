import React, { useEffect } from 'react';
import ImagePreview from './ImagePreview';
import { ref, set, serverTimestamp } from 'firebase/database';
import { auth } from '../firebase/firebaseConfig';

const MessageInput = ({
  newMessage,
  setNewMessage,
  selectedImage,
  setSelectedImage,
  loading,
  onSubmit,
  onImageSelect,
  selectedUser,
  rtdb
}) => {
  const handleTyping = (isTyping) => {
    if (!auth.currentUser?.uid || !selectedUser?.uid) return;

    const typingRef = ref(rtdb, `typing/${auth.currentUser.uid}`);

    set(typingRef, {
      isTyping,
      to: selectedUser.uid,
      timestamp: serverTimestamp()
    });

    if (isTyping) {
      // Clear typing status after 3 seconds of inactivity
      setTimeout(() => {
        set(typingRef, {
          isTyping: false,
          timestamp: serverTimestamp()
        });
      }, 3000);
    }
  };

  useEffect(() => {
    // Clear typing status when component unmounts
    return () => {
      if (auth.currentUser?.uid) {
        const typingRef = ref(rtdb, `typing/${auth.currentUser.uid}`);
        set(typingRef, {
          isTyping: false,
          timestamp: serverTimestamp()
        });
      }
    };
  }, [rtdb]);

  return (
    <form onSubmit={onSubmit} className="p-4 shadow-2xl">
      <div className="flex space-x-3 items-center">
        <div className="flex-1 relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping(e.target.value.length > 0);
            }}
            placeholder="Type your message..."
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-full text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent pr-12 transition-all duration-300 ease-in-out"
          />
          <input
            type="file"
            accept="image/*"
            onChange={onImageSelect}
            className="absolute right-2 top-2 opacity-0 w-8 h-8 cursor-pointer z-10"
            id="fileInput"
          />
          <label
            htmlFor="fileInput"
            className="absolute right-2 top-2 p-2 text-gray-400 hover:text-violet-400 hover:bg-gray-700 rounded-full cursor-pointer transition-colors duration-200"
            title="Attach image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.415a6 6 0 108.486 8.486L20.5 13.5" />
            </svg>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || (!newMessage.trim() && !selectedImage)}
          className="bg-violet-600 text-white px-6 py-3 rounded-full hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out font-medium flex items-center gap-2 transform active:scale-95"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Sending...
            </>
          ) : (
            'Send'
          )}
        </button>
      </div>

      <ImagePreview
        selectedImage={selectedImage}
        onRemove={() => setSelectedImage(null)}
      />
    </form>
  );
};

export default MessageInput;