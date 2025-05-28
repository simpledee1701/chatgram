import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { FaUser, FaRobot, FaSignOutAlt,FaComments} from 'react-icons/fa';
import Profile from './Profile';

const Sidebar = ({ currentUser, onNavigate }) => {
  const [showProfile, setShowProfile] = React.useState(false);
  const [activeNav, setActiveNav] = React.useState('chat');

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
    <>
      <div className="w-16 bg-gray-950 flex flex-col items-center py-6 shadow-xl z-20 h-full">
        <nav className="flex flex-col space-y-6 flex-grow mt-4">

          {/* Chats Button */}
          <button
            onClick={() => { 
              setActiveNav('chat');
              if (onNavigate) onNavigate('chat');
            }}
            className={`p-3 rounded-full transition-colors duration-200 transform hover:scale-110 group focus:outline-none focus:ring-2 focus:ring-indigo-500
                        ${activeNav === 'chat' ? 'bg-indigo-600' : 'hover:bg-indigo-600'}`}
            title="Chats"
          >
            <FaComments className={`h-5 w-5 ${activeNav === 'chat' ? 'text-white' : 'text-gray-300 group-hover:text-white'}`} />
          </button>
          
          {/* Profile Button */}
          <button
            onClick={() => { 
              setActiveNav('profile');
              setShowProfile(true);
            }}
            className={`p-3 rounded-full transition-colors duration-200 transform hover:scale-110 group focus:outline-none focus:ring-2 focus:ring-indigo-500
                        ${activeNav === 'profile' ? 'bg-indigo-600' : 'hover:bg-indigo-600'}`}
            title="Profile"
          >
            <FaUser className={`h-5 w-5 ${activeNav === 'profile' ? 'text-white' : 'text-gray-300 group-hover:text-white'}`} />
          </button>

          {/* AI Assistant Button */}
          <button
            onClick={() => { 
              setActiveNav('ai');
              if (onNavigate) onNavigate('ai');
            }}
            className={`p-3 rounded-full transition-colors duration-200 transform hover:scale-110 group focus:outline-none focus:ring-2 focus:ring-indigo-500
                        ${activeNav === 'ai' ? 'bg-indigo-600' : 'hover:bg-indigo-600'}`}
            title="AI Assistant"
          >
            <FaRobot className={`h-5 w-5 ${activeNav === 'ai' ? 'text-white' : 'text-gray-300 group-hover:text-white'}`} />
          </button>
        </nav>

        {/* Logout Button */}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors duration-200 transform hover:scale-110 group focus:outline-none focus:ring-2 focus:ring-red-500"
            title="Logout"
          >
            <FaSignOutAlt className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* Profile Modal - Pass the currentUser prop correctly */}
      {showProfile && (
        <Profile
          user={currentUser}
          onClose={() => {
            setShowProfile(false);
            setActiveNav('chat');
          }}
        />
      )}
    </>
  );
};

export default Sidebar;