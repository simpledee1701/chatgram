import React from 'react';
import Avatar from './Avatar';

const MessagesList = ({ messages, users, currentUserUid, messagesEndRef, isGroup, isAI }) => {
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
        // Handle undefined uid case - if uid is undefined and it's not an AI message, 
        // assume it's from current user (temporary fix)
        const isCurrentUser = message.isAI ? false : 
          (message.uid === currentUserUid || (!message.uid && !message.isAI));
        const sender = getUserById(message.uid);
        const isAIMessage = message.isAI;
        const timestamp = getTimestamp(message.timestamp);

        // Debug logging - remove this after fixing
        console.log('Message:', {
          id: message.id,
          uid: message.uid,
          currentUserUid,
          isCurrentUser,
          isAIMessage,
          text: message.text?.substring(0, 20)
        });

        return (
          <div
            key={message.id}
            className={`flex ${
              isAIMessage ? 'justify-start' : 
              isCurrentUser ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                isAIMessage ? 'bg-gray-700' :
                isCurrentUser ? 'bg-indigo-600 ml-auto' : 'bg-gray-800'
              }`}
            >
              {/* AI Label */}
              {isAIMessage && (
                <div className="flex items-center mb-1 space-x-2">
                  <span className="text-xs text-violet-400 font-medium">
                    AI Assistant:
                  </span>
                </div>
              )}

              {/* Sender info - hidden for AI messages and current user messages */}
              {!isAIMessage && isGroup && !isCurrentUser && (
                <div className="flex items-center mb-1 space-x-2 overflow-hidden">
                  <div className="w-5 h-5 flex-shrink-0">
                    <Avatar user={sender} size="w-5 h-5" />
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
              <p className={`text-sm ${isAIMessage ? 'text-gray-100' : 'text-white'}`}>
                {message.text}
              </p>

              {/* Timestamp */}
              <div className={`flex mt-1 ${isCurrentUser || isAIMessage ? 'justify-end' : 'justify-start'}`}>
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