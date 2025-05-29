import { useState, useEffect, useRef } from 'react';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import Avatar from './Avatar';
import ChatSummarizerModal from './ChatSummarizerModal';
import { EllipsisVerticalIcon, CogIcon, UsersIcon, SparklesIcon } from '@heroicons/react/24/outline';

const ChatHeader = ({
  selectedUser,
  selectedGroup,
  selectedAI,
  currentUser,
  onGroupSettings,
  userStatus,
  typingStatus
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showSummarizer, setShowSummarizer] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(selectedGroup);
  const db = getFirestore();
  const optionsRef = useRef(null); // Ref for options menu

  // Handle outside click for options menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };

    if (showOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptions]);

  // Listen for real-time updates to the selected group
  useEffect(() => {
    if (selectedGroup?.id) {
      const unsubscribe = onSnapshot(doc(db, 'groups', selectedGroup.id), (doc) => {
        if (doc.exists()) {
          setCurrentGroup({ id: doc.id, ...doc.data() });
        }
      });
      return () => unsubscribe();
    } else {
      setCurrentGroup(selectedGroup);
    }
  }, [db, selectedGroup?.id]);

  useEffect(() => {
    setCurrentGroup(selectedGroup);
  }, [selectedGroup]);

  const getStatusText = () => {
    if (currentGroup) {
      return `${currentGroup.members?.length || 0} members • ${currentGroup.members?.some(m => m.uid === currentUser.uid && m.isAdmin) ? 'Admin' : 'Member'}`;
    }

    if (!selectedUser) return '';

    if (typingStatus[selectedUser.uid]?.isTyping) {
      return 'typing...';
    }

    const status = userStatus[selectedUser.uid]?.status;
    if (status === 'online') {
      return 'Online';
    } else if (status === 'offline') {
      const lastChanged = userStatus[selectedUser.uid]?.lastChanged;
      if (lastChanged) {
        const lastSeen = new Date(lastChanged);
        return `Last seen ${formatLastSeen(lastSeen)}`;
      }
      return 'Offline';
    }

    return 'Offline';
  };

  const formatLastSeen = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  return (
    <div className={`flex items-center justify-between p-4 border-b ${selectedUser || selectedGroup || selectedAI ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-950' : 'bg-gray-50 dark:bg-gray-950 border-gray-100 dark:border-gray-950'}`}>
      <div className="flex items-center space-x-3">
        {currentGroup ? (
          <>
            <div className="relative">
              <div className="bg-indigo-100 dark:bg-indigo-900 rounded-full h-10 w-10 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                <UsersIcon className="h-5 w-5" />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-900 dark:text-white">{currentGroup.name}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {getStatusText()}
              </p>
            </div>
          </>
        ) : selectedUser ? (
          <>
            <Avatar
              user={selectedUser}
              status={userStatus[selectedUser?.uid]?.status}
              isTyping={typingStatus[selectedUser?.uid]?.isTyping}
              size="w-10 h-10"
            />
            <div>
              <h2 className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.name}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{getStatusText()}</p>
            </div>
          </>
        ) : selectedAI ? (
          <>
            <div className="bg-purple-100 dark:bg-purple-900 rounded-full h-10 w-10 flex items-center justify-center text-purple-600 dark:text-purple-300">
              <SparklesIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-900 dark:text-white">{selectedAI.name || 'AI Assistant'}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Always available</p>
            </div>
          </>
        ) : null}
      </div>

      <div className="flex items-center space-x-2">
        {(currentGroup || selectedUser) && (
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <EllipsisVerticalIcon className="h-5 w-5" />
            </button>

            {showOptions && (
              <div
                ref={optionsRef}
                className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100 dark:divide-gray-700"
              >
                <div className="py-1">
                  {currentGroup && (
                    <button
                      onClick={() => {
                        onGroupSettings();
                        setShowOptions(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                    >
                      <CogIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                      Group settings
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowSummarizer(true);
                      setShowOptions(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Summarize chat
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showSummarizer && (
        <ChatSummarizerModal
          onClose={() => setShowSummarizer(false)}
          selectedUser={selectedUser}
          selectedGroup={currentGroup}
          selectedAI={selectedAI}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default ChatHeader;
