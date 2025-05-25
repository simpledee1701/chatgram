import React from 'react';
import ImagePreview from './ImagePreview';

const MessageInput = ({ 
  newMessage, 
  setNewMessage, 
  selectedImage, 
  setSelectedImage, 
  loading, 
  onSubmit, 
  onImageSelect 
}) => {
  return (
    <form onSubmit={onSubmit} className="bg-white p-4 shadow-lg border-t">
      <div className="flex space-x-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
          />
          <input
            type="file"
            accept="image/*"
            onChange={onImageSelect}
            className="absolute right-2 top-2 opacity-0 w-8 h-8 cursor-pointer"
            id="fileInput"
          />
          <label
            htmlFor="fileInput"
            className="absolute right-2 top-2 p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
            title="Attach image"
          >
            📎
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || (!newMessage.trim() && !selectedImage)}
          className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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