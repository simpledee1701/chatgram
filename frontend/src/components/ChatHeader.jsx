import React from 'react';
import Avatar from './Avatar';

const ChatHeader = ({ selectedUser }) => {
  if (selectedUser) {
    return (
      <header className="bg-gray-800 p-4 flex items-center">
        <div className="flex items-center">
          <Avatar user={selectedUser} />
          <span className="ml-3 text-gray-100 font-semibold text-lg">{selectedUser.name}</span>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-gray-800 py-4 px-6 border-b border-gray-700 shadow-lg animate-fade-in-down">
      <h1 className="text-xl font-bold text-gray-300">Select a user to start chatting</h1>
    </header>
  );
};

export default ChatHeader;