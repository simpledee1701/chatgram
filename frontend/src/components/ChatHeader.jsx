import React from 'react';
import Avatar from './Avatar';

const ChatHeader = ({ selectedUser }) => {
  if (selectedUser) {
    return (
      <header className="bg-white shadow-sm py-4 px-6 flex items-center border-b">
        <div className="flex items-center">
          <Avatar user={selectedUser} />
          <span className="ml-3 text-gray-800 font-semibold">{selectedUser.name}</span>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm py-4 px-6 border-b">
      <h1 className="text-xl font-bold text-gray-800">Select a user to start chatting</h1>
    </header>
  );
};

export default ChatHeader;