import React from 'react';
import Avatar from './Avatar';


const MessagesList = ({ messages, users, currentUserUid, messagesEndRef, isGroup }) => {
  const getUserById = (uid) => users.find(user => user.uid === uid);

  // Safe timestamp conversion
  const getTimestamp = (timestamp) => {
    try {
      // If it's a Firestore Timestamp
      if (timestamp?.toDate) return timestamp.toDate();
      // If it's already a Date object
      if (timestamp instanceof Date) return timestamp;
      // Fallback to current time
      return new Date();
    } catch {
      return new Date();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((message) => {
        const isCurrentUser = message.uid === currentUserUid;
        const sender = getUserById(message.uid);
        const timestamp = getTimestamp(message.timestamp);

        return (
          <div
            key={message.id}
            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${isCurrentUser
                  ? 'bg-indigo-600 ml-auto'
                  : 'bg-gray-800'
                }`}
            >
              {/* Sender info */}
              {isGroup && !isCurrentUser && (
                <div className="flex items-center mb-1 space-x-2 overflow-hidden">
                  <div className="w-5 h-5 flex-shrink-0">
                    <Avatar user={sender} size="xs" />
                  </div>
                  <span className="text-xs text-gray-300 truncate max-w-[150px]">
                    {sender?.name || 'Unknown user'}
                  </span>
                </div>
              )}

              {/* Message content */}
              {message.imageUrl && (
                <img
                  src={message.imageUrl}
                  alt="Message"
                  className="max-w-full h-32 object-cover rounded mb-2"
                />
              )}
              <p className="text-white text-sm">{message.text}</p>

              {/* Timestamp */}
              <div className="flex items-center justify-end mt-1">
                <span className="text-xs text-gray-300">
                  {timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesList;