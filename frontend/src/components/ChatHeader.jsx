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
    <></>
  );
};

export default ChatHeader;