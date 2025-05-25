import React from 'react';
import Avatar from './Avatar';

const UsersList = ({ users, selectedUser, onUserSelect, currentUserUid }) => {
  return (
    <div className="w-1/4 bg-gray-800 border-r border-gray-700 shadow-xl overflow-hidden">
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-violet-400">Chats</h2>
      </div>
      <div className="overflow-y-auto h-[calc(100vh-80px)] custom-scrollbar"> {/* Adjust height as needed based on header */}
        {users.filter(user => user.uid !== currentUserUid).map((user) => (
          <div
            key={user.uid}
            onClick={() => onUserSelect(user)}
            className={`p-4 border-b border-gray-700 cursor-pointer flex items-center hover:bg-gray-700 transition-all duration-300 ease-in-out transform hover:scale-[1.02] ${
              selectedUser?.uid === user.uid ? 'bg-violet-800 bg-opacity-40 border-l-4 border-violet-500' : ''
            }`}
          >
            <Avatar user={user} />
            <span className="ml-3 text-gray-100 font-medium text-lg">{user.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersList;