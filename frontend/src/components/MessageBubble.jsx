import React from 'react';
import Avatar from './Avatar';

const MessageBubble = ({ message, isCurrentUser, messageUser }) => {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} gap-3 max-w-[70%]`}>
        {/* Avatar */}
        <Avatar user={messageUser} size="w-8 h-8" />

        {/* Message bubble */}
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm ${
            isCurrentUser
              ? 'bg-blue-500 text-white rounded-br-md'
              : 'bg-white text-gray-800 rounded-bl-md border'
          }`}
        >
          {message.imageUrl && message.imageUrl.trim() !== '' && (
            <div className="mb-2">
              <img
                src={message.imageUrl}
                alt="Chat image"
                className="rounded-lg max-w-full max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onError={(e) => {
                  console.log('Image failed to load:', message.imageUrl);
                  e.target.style.display = 'none';
                }}
                onClick={() => {
                  // Optional: Open image in full size
                  window.open(message.imageUrl, '_blank');
                }}
                loading="lazy"
              />
            </div>
          )}

          {message.text && (
            <p className="break-words leading-relaxed">{message.text}</p>
          )}

          <div
            className={`mt-1 text-xs ${
              isCurrentUser ? 'text-blue-100' : 'text-gray-500'
            }`}
          >
            {message.timestamp && new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;