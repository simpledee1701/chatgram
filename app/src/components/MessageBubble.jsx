import React from 'react';
import Avatar from './Avatar';
import moment from 'moment'; // Make sure to install: npm install moment

const MessageBubble = ({ message, isCurrentUser, messageUser }) => {
  const messageTime = message.timestamp ? moment(message.timestamp).format('h:mm A') : '';

  return (
    <div className={`flex items-start ${isCurrentUser ? 'justify-end' : 'justify-start'} group`}>
      {!isCurrentUser && (
        <div className="mr-3 flex-shrink-0">
          <Avatar user={messageUser} size="sm" />
        </div>
      )}

      <div className={`flex flex-col max-w-[75%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-2 rounded-xl shadow-md relative break-words whitespace-pre-wrap transition-all duration-300 ease-in-out transform group-hover:scale-[1.01]
            ${isCurrentUser
              ? 'bg-violet-600 text-white rounded-br-none animate-fade-in-right'
              : 'bg-gray-700 text-gray-100 rounded-bl-none animate-fade-in-left'
            }`}
        >
          {message.imageUrl && (
            <div className="mb-2 max-w-full overflow-hidden rounded-lg">
              <img
                src={message.imageUrl}
                alt="Attached"
                className="w-full h-auto object-cover rounded-lg transform transition-transform duration-300 hover:scale-105 cursor-pointer"
                onClick={() => window.open(message.imageUrl, '_blank')} // Open image in new tab
              />
            </div>
          )}
          {message.text && <p>{message.text}</p>}
        </div>
        <span className={`text-xs mt-1 text-gray-400 ${isCurrentUser ? 'pr-1' : 'pl-1'}`}>
          {messageTime}
        </span>
      </div>

      {isCurrentUser && (
        <div className="ml-3 flex-shrink-0">
          <Avatar user={messageUser} size="sm" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;