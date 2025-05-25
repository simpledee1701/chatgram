import React from 'react';

const Avatar = ({ user, size = 'w-8 h-8' }) => {
  const getUserAvatar = (user) => {
    if (user?.photoURL && user.photoURL.trim() !== '') {
      return { type: 'image', src: user.photoURL };
    }
    if (user?.avatarSvg && user.avatarSvg.trim() !== '') {
      return { type: 'svg', src: user.avatarSvg };
    }
    return { type: 'fallback', initial: user?.name?.charAt(0).toUpperCase() || '?' };
  };

  const avatar = getUserAvatar(user);
  
  if (avatar.type === 'image') {
    return (
      <img
        src={avatar.src}
        alt={user?.name || 'User'}
        className={`${size} rounded-full object-cover`}
      />
    );
  }
  
  if (avatar.type === 'svg') {
    return (
      <img
        src={avatar.src}
        alt={user?.name || 'User'}
        className={`${size} rounded-full object-cover`}
      />
    );
  }
  
  return (
    <div className={`${size} rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white flex items-center justify-center font-semibold text-sm`}>
      {avatar.initial}
    </div>
  );
};

export default Avatar;