import React from 'react';
import { FaTimes, FaUser, FaEnvelope, FaIdBadge, FaCalendarAlt } from 'react-icons/fa';
import { format } from 'date-fns';
import Avatar from './Avatar';

const Profile = ({ user, onClose }) => {
  // Safe date formatting with proper error handling
  const formatDate = (timestamp) => {
    try {
      if (!timestamp) return 'Not available';
      
      // Handle Firebase Timestamp objects
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return format(timestamp.toDate(), 'MMMM d, yyyy h:mm a');
      }
      
      // Handle JavaScript Date objects
      if (timestamp instanceof Date) {
        return format(timestamp, 'MMMM d, yyyy h:mm a');
      }
      
      // Handle timestamp numbers (milliseconds)
      if (typeof timestamp === 'number') {
        return format(new Date(timestamp), 'MMMM d, yyyy h:mm a');
      }
      
      return 'Not available';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const formattedDate = formatDate(user?.createdAt);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <FaTimes className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <div className="p-1 rounded-full border-4 border-indigo-500 bg-gray-800">
              <Avatar 
                user={user} 
                size="w-20 h-20" 
                status="offline"
              />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white">
            {user?.name || user?.displayName || 'User'}
          </h2>
          <p className="text-gray-400">
            @{user?.chatgramId || user?.username || 'user'}
          </p>
        </div>

        <div className="space-y-4">
          {/* Display Name */}
          <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
            <FaUser className="text-indigo-400 h-5 w-5" />
            <div>
              <p className="text-sm text-gray-400">Name</p>
              <p className="text-white">
                {user?.name || user?.displayName || 'Not set'}
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
            <FaEnvelope className="text-indigo-400 h-5 w-5" />
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="text-white">
                {user?.email || 'Not set'}
              </p>
            </div>
          </div>

          {/* Chatgram ID */}
          <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
            <FaIdBadge className="text-indigo-400 h-5 w-5" />
            <div>
              <p className="text-sm text-gray-400">Chatgram ID</p>
              <p className="text-white">
                {user?.chatgramId || user?.username || 'Not set'}
              </p>
            </div>
          </div>

          {/* Member Since */}
          <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
            <FaCalendarAlt className="text-indigo-400 h-5 w-5" />
            <div>
              <p className="text-sm text-gray-400">Member Since</p>
              <p className="text-white">{formattedDate}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;