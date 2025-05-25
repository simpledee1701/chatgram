import { useState } from 'react';
import Avatar from './Avatar';


const ChatHeader = ({ selectedUser, selectedGroup, currentUser, onGroupSettings }) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
      <div className="flex items-center">
        {selectedGroup ? (
          <>
            <div className="bg-gray-600 rounded-full h-10 w-10 flex items-center justify-center mr-3">
              👥
            </div>
            <div>
              <h2 className="text-white font-semibold">{selectedGroup.name}</h2>
              <p className="text-xs text-gray-400">
                {selectedGroup.members.length} members
              </p>
            </div>
          </>
        ) : selectedUser ? (
          <>
            <Avatar user={selectedUser} />
            <div className="ml-3">
              <h2 className="text-white font-semibold">{selectedUser.name}</h2>
              <p className="text-xs text-gray-400">Online</p>
            </div>
          </>
        ) : null}
      </div>

      {selectedGroup && (
        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="text-gray-400 hover:text-white p-2"
          >
            ⚙️
          </button>
          
          {showOptions && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
              <button
                onClick={() => {
                  onGroupSettings();
                  setShowOptions(false);
                }}
                className="w-full px-4 py-2 text-sm text-left text-white hover:bg-gray-700"
              >
                Group Settings
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatHeader;