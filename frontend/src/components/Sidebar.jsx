import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import Avatar from './Avatar';

const Sidebar = ({ currentUser, onNavigate }) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User logged out successfully!');
      if (onNavigate) onNavigate('logout');
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  return (
    <div className="w-16 bg-gray-900 flex flex-col items-center py-6 shadow-2xl z-20 animate-fade-in-left-sidebar h-full"> {/* h-full makes it fill remaining height */}
      {/* Removed the "CG" logo from here, it's now in MainHeader */}

      <nav className="flex flex-col space-y-6 flex-grow mt-4"> {/* Added mt-4 for spacing */}
        <button
          onClick={() => onNavigate('profile')}
          className="p-3 rounded-full hover:bg-violet-700 transition-colors duration-200 transform hover:scale-110 group focus:outline-none focus:ring-2 focus:ring-violet-500"
          title="Profile"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-300 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>

        <button
          onClick={() => onNavigate('ai')}
          className="p-3 rounded-full hover:bg-violet-700 transition-colors duration-200 transform hover:scale-110 group focus:outline-none focus:ring-2 focus:ring-violet-500"
          title="AI Chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-300 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 7h2m-2 10h2M17 7h2m-2 10h2M11 3v18m-4-6h8m-8-6h8" />
          </svg>
        </button>
      </nav>

      <div className="mt-auto">
        {currentUser && (
          <div className="mb-4">
            <Avatar user={currentUser} size="xl" />
          </div>
        )}
        <button
          onClick={handleLogout}
          className="p-3 rounded-full bg-red-700 hover:bg-red-800 transition-colors duration-200 transform hover:scale-110 group focus:outline-none focus:ring-2 focus:ring-red-500"
          title="Logout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;