import React from 'react';

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  typing: 'bg-yellow-500 animate-pulse'
};

const Avatar = ({ user, size = 'w-8 h-8', status = 'offline', isTyping = false }) => {
  const getStatusIndicator = () => {
    // Don't show status if user is offline
    if (status === 'offline' && !isTyping) return null;
    
    const statusClass = isTyping ? statusColors.typing : statusColors[status];
    
    return (
      <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-gray-800 ${statusClass}`}>
        {isTyping && <span className="sr-only">Typing</span>}
      </div>
    );
  };

  const renderAvatar = () => {
    if (user?.photoURL?.trim()) {
      return (
        <img
          src={user.photoURL}
          alt={user?.name || 'User'}
          className={`${size} rounded-full object-cover`}
        />
      );
    }
    
    if (user?.avatarSvg?.trim()) {
      return (
        <img
          src={user.avatarSvg}
          alt={user?.name || 'User'}
          className={`${size} rounded-full object-cover`}
        />
      );
    }
    
    return (
      <div className={`${size} rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white flex items-center justify-center font-semibold text-sm`}>
        {user?.name?.charAt(0)?.toUpperCase() || '?'}
      </div>
    );
  };

  return (
    <div className="relative inline-flex">
      {renderAvatar()}
      {getStatusIndicator()}
    </div>
  );
};

export default Avatar;