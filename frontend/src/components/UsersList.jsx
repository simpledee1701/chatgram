import React from 'react';
import Avatar from './Avatar';

const UsersList = ({ users, selectedUser, onUserSelect, currentUserUid }) => {
  return (
    <div className="w-1/4 bg-white border-r">
      <div className="p-4 bg-gray-50 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Users</h2>
      </div>
      <div className="overflow-y-auto">
        {users.filter(user => user.uid !== currentUserUid).map((user) => (
          <div
            key={user.uid}
            onClick={() => onUserSelect(user)}
            className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
              selectedUser?.uid === user.uid ? 'bg-blue-50 border-blue-200' : ''
            }`}
          >
            <div className="flex items-center">
              <Avatar user={user} />
              <span className="ml-3 text-gray-800 font-medium">{user.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersList;