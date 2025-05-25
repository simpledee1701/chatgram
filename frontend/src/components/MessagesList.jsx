import React from 'react';
import MessageBubble from './MessageBubble';

const MessagesList = ({ messages, users, currentUserUid, messagesEndRef }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900 custom-scrollbar">
      {messages.map((message) => {
        const isCurrentUser = message.uid === currentUserUid;
        // Look up user data from the users collection
        const messageUser = users.find(u => u.uid === message.uid) || {
          uid: message.uid,
          name: message.displayName,
          photoURL: message.photoURL,
          avatarSvg: message.avatarSvg
        };

        return (
          <MessageBubble
            key={message.id}
            message={message}
            isCurrentUser={isCurrentUser}
            messageUser={messageUser}
          />
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesList;