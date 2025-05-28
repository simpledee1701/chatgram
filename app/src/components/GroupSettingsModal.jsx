import React, { useState, useEffect } from 'react';
import { getFirestore, doc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import Avatar from './Avatar';

const GroupSettingsModal = ({ group, users, currentUser, onClose }) => {
  const db = getFirestore();
  const [newMembers, setNewMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentGroup, setCurrentGroup] = useState(group); // Local state for real-time updates

  // Listen for real-time updates to the group
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'groups', group.id), (doc) => {
      if (doc.exists()) {
        setCurrentGroup({ id: doc.id, ...doc.data() });
      }
    });

    return () => unsubscribe();
  }, [db, group.id]);

  // Get current group members from the real-time updated group data
  const currentGroupMembers = currentGroup.members || [];
  
  const availableUsers = users.filter(user => 
    !currentGroupMembers.includes(user.uid) && 
    user.uid !== currentUser.uid
  );

  const handleAddMembers = async () => {
    if (newMembers.length === 0) return;
    setLoading(true);
    
    try {
      await updateDoc(doc(db, 'groups', group.id), {
        members: [...currentGroupMembers, ...newMembers],
        updatedAt: serverTimestamp()
      });
      setNewMembers([]);
      setError('');
    } catch (error) {
      console.error('Error adding members:', error);
      setError('Failed to add members. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (memberId === currentGroup.admin) return;
    if (currentUser.uid !== currentGroup.admin) {
      setError('Only admin can remove members');
      return;
    }

    try {
      setLoading(true);
      await updateDoc(doc(db, 'groups', group.id), {
        members: currentGroupMembers.filter(uid => uid !== memberId),
        updatedAt: serverTimestamp()
      });
      setError('');
    } catch (error) {
      console.error('Remove member error:', error);
      setError('Failed to remove member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        {error && (
          <div className="mb-4 p-2 bg-red-800 text-red-200 rounded text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Current Members</h4>
          <div className="space-y-2">
            {currentGroupMembers.map(uid => {
              const user = users.find(u => u.uid === uid);
              return (
                <div key={uid} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                  <div className="flex items-center">
                    <Avatar user={user} size="small" />
                    <span className="ml-2 text-sm">
                      {user?.name}
                      {uid === currentGroup.admin && (
                        <span className="ml-1 text-xs text-indigo-400">(Admin)</span>
                      )}
                    </span>
                  </div>
                  {uid !== currentGroup.admin && currentUser.uid === currentGroup.admin && (
                    <button
                      onClick={() => handleRemoveMember(uid)}
                      className="text-red-400 hover:text-red-300 text-xs"
                      disabled={loading}
                    >
                      {loading ? 'Removing...' : 'Remove'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {currentUser.uid === currentGroup.admin && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Add Members</h4>
            <select
              multiple
              value={newMembers}
              onChange={(e) => setNewMembers([...e.target.selectedOptions].map(o => o.value))}
              className="w-full bg-gray-700 rounded p-2 text-sm h-32"
            >
              {availableUsers.map(user => (
                <option key={user.uid} value={user.uid}>{user.name}</option>
              ))}
            </select>
            <button
              onClick={handleAddMembers}
              disabled={loading || newMembers.length === 0}
              className="mt-2 px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 rounded disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Selected Members'}
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default GroupSettingsModal;