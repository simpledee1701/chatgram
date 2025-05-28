import React from 'react';
import Avatar from './Avatar';

const MessagesList = ({ messages, users, currentUserUid, messagesEndRef, isGroup, isAI }) => {
  const getUserById = (uid) => users.find(user => user.uid === uid);

  const getTimestamp = (timestamp) => {
    try {
      if (timestamp?.toDate) return timestamp.toDate();
      if (timestamp instanceof Date) return timestamp;
      return new Date();
    } catch {
      return new Date();
    }
  };

  const hasMessages = messages && messages.length > 0;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {!hasMessages && (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-2">
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-2">
            <p className="text-2xl font-semibold text-gray-200 tracking-tight">
              No messages yet
            </p>
            <p className="text-lg font-medium text-gray-400">
              Start the conversation your messages are private and end-to-end encrypted.
            </p>
            <p className="text-sm text-gray-500 max-w-xs">
              Only you and the recipient can read them. Not even our servers can peek.
            </p>
          </div>

        </div>
      )}

      {hasMessages && messages.map((message) => {
        const isCurrentUser = message.isAI ? false :
          (message.uid === currentUserUid || (!message.uid && !message.isAI));
        const sender = getUserById(message.uid);
        const isAIMessage = message.isAI;
        const timestamp = getTimestamp(message.timestamp);

        return (
          <div
            key={message.id}
            className={`flex ${isAIMessage ? 'justify-start' :
                isCurrentUser ? 'justify-end' : 'justify-start'
              }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${isAIMessage ? 'bg-gray-700' :
                  isCurrentUser ? 'bg-green-800 ml-auto' : 'bg-gray-900'
                }`}
            >
              {isAIMessage && (
                <div className="flex items-center mb-1 space-x-2">
                  <span className="text-xs text-violet-400 font-medium">
                    AI Assistant:
                  </span>
                </div>
              )}

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
