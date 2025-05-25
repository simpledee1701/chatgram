import React, { useState, useEffect } from 'react';
import Avatar from './Avatar';

const UsersList = ({ 
  users = [], 
  selectedUser, 
  onUserSelect, 
  currentUserUid, 
  messages = [] 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    const filtered = users.filter(user => 
      user.uid !== currentUserUid && 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users, currentUserUid]);

  const getLastMessage = (userUid) => {
    if (!messages || !Array.isArray(messages)) return null;
    
    const userMessages = messages.filter(
      msg => msg?.uid === userUid || msg?.receiverId === userUid
    ).sort((a, b) => (b?.timestamp || 0) - (a?.timestamp || 0));
    
    return userMessages[0];
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="w-1/4 bg-gray-800 border-r border-gray-900 overflow-hidden rounded-tl-2xl rounded-bl-2xl shadow-lg">
      {/* Header with Title and Search */}
      <div className="p-3 bg-gray-800 border-b border-gray-700">
        <h2 className="text-lg font-bold text-gray-100 tracking-wide mb-2 px-1">Chats</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search or start new chat"
            className="w-full py-2 px-4 pl-10 bg-gray-700 text-white rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Chats List */}
      <div className="overflow-y-auto h-[calc(100vh-120px)] custom-scrollbar">
        {filteredUsers.map((user) => {
          const lastMessage = getLastMessage(user.uid);
          return (
            <div
              key={user.uid}
              onClick={() => onUserSelect(user)}
              className={`p-3 cursor-pointer flex items-start hover:bg-gray-700 transition-colors duration-200 ${
                selectedUser?.uid === user.uid ? 'bg-gray-700' : 'bg-gray-800'
              }`}
            >
              <Avatar user={user} />
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <span className="text-white font-medium text-sm truncate">
                    {user.name}
                  </span>
                  {lastMessage?.timestamp && (
                    <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                      {formatTime(lastMessage.timestamp)}
                    </span>
                  )}
                </div>
                {lastMessage?.text && (
                  <p className="text-xs text-gray-400 truncate mt-1">
                    {lastMessage.text}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UsersList;
