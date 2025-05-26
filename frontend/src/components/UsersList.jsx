import React, { useState, useEffect, useRef } from 'react';
import Avatar from './Avatar';
import GroupChat from './GroupChat';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical } from 'lucide-react';

const UsersList = ({
  users = [],
  groups = [],
  selectedUser,
  selectedGroup,
  onUserSelect,
  onGroupSelect,
  currentUserUid,
  messages = [],
  onGroupCreate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showGroupChat, setShowGroupChat] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const filteredU = users.filter(user =>
      user.uid !== currentUserUid &&
      user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const filteredG = groups.filter(group =>
      group.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filteredU);
    setFilteredGroups(filteredG);
  }, [searchTerm, users, groups, currentUserUid]);

  const getLastMessage = (id, isGroup) => {
    if (!messages) return null;
    const filtered = messages
      .filter(msg =>
        isGroup ? msg.groupId === id : msg.conversationId?.includes(id)
      )
      .sort((a, b) => (b?.timestamp || 0) - (a?.timestamp || 0));
    return filtered[0];
  };

  const formatTime = (timestamp) => {
    try {
      const date = timestamp?.toDate?.() || new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="w-1/4 bg-gray-900 border-r border-gray-900 overflow-hidden rounded-tl-2xl rounded-bl-2xl shadow-lg relative">
      <div className="p-3 bg-gray-900 border-b border-gray-900">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-gray-100 tracking-wide">Chats</h2>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(prev => !prev)}
              className="text-gray-400 hover:text-gray-100 p-1 rounded-full transition duration-200"
            >
              <MoreVertical size={20} />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 z-50 mt-2 w-40 bg-gray-700 rounded-lg shadow-lg overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowGroupChat(true);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-100 hover:bg-gray-600 transition"
                  >
                    Create Group
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search chats"
            className="w-full py-2 px-4 pl-10 bg-gray-800 text-white rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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

      <div className="overflow-y-auto h-[calc(100vh-120px)] custom-scrollbar">
        {filteredGroups.map((group) => {
          const lastMessage = getLastMessage(group.id, true);
          return (
            <div
              key={group.id}
              onClick={() => onGroupSelect(group)}
              className={`p-3 cursor-pointer flex items-start hover:bg-gray-800 transition-colors ${selectedGroup?.id === group.id ? 'bg-gray-800' : 'bg-gray-900'}`}
            >
              <div className="bg-gray-600 rounded-full h-10 w-10 flex items-center justify-center">
                <span className="text-lg">👥</span>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <span className="text-white font-medium text-sm truncate">
                    {group.name}
                    {group.admin === currentUserUid && (
                      <span className="ml-1 text-xs text-indigo-400">(Admin)</span>
                    )}
                  </span>
                  {lastMessage?.timestamp && (
                    <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                      {formatTime(lastMessage.timestamp)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate mt-1">
                  {lastMessage?.text}
                </p>
              </div>
            </div>
          );
        })}

        {filteredUsers.map((user) => {
          const lastMessage = getLastMessage(user.uid, false);
          return (
            <div
              key={user.uid}
              onClick={() => onUserSelect(user)}
              className={`p-3 cursor-pointer flex items-start hover:bg-gray-800 transition-colors ${selectedUser?.uid === user.uid ? 'bg-gray-800' : 'bg-gray-900'}`}
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
                <p className="text-xs text-gray-400 truncate mt-1">
                  {lastMessage?.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {showGroupChat && (
          <GroupChat
            users={users}
            currentUser={{ uid: currentUserUid }}
            onGroupCreate={(group) => {
              onGroupCreate(group);
              setShowGroupChat(false);
            }}
            onClose={() => setShowGroupChat(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default UsersList;