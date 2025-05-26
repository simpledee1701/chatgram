import React, { useState } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Avatar from './Avatar';

const GroupChat = ({ users, currentUser, onGroupCreate, onClose }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const db = getFirestore();

  const createGroup = async () => {
    if (!groupName || selectedMembers.length < 1) return;
    
    try {
      const newGroup = {
        name: groupName,
        admin: currentUser.uid,
        members: [...selectedMembers, currentUser.uid],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'groups'), newGroup);
      onGroupCreate({ id: docRef.id, ...newGroup });
      setGroupName('');
      setSelectedMembers([]);
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Create New Group</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            &times;
          </button>
        </div>
        <input
          type="text"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full mb-4 p-2 bg-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <div className="h-64 overflow-y-auto mb-4 border border-gray-700 rounded p-2">
          <p className="text-sm text-gray-400 mb-2">Select Members:</p>
          {users.filter(u => u.uid !== currentUser.uid).map(user => (
            <label 
              key={user.uid}
              className="flex items-center mb-2 p-2 hover:bg-gray-700 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                value={user.uid}
                checked={selectedMembers.includes(user.uid)}
                onChange={(e) => {
                  const uid = e.target.value;
                  setSelectedMembers(prev => 
                    e.target.checked ? [...prev, uid] : prev.filter(id => id !== uid)
                  );
                }}
                className="mr-2 rounded focus:ring-indigo-500"
              />
              <Avatar user={user} />
              <span className="ml-2 text-sm">{user.name}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 rounded"
          >
            Cancel
          </button>
          <button 
            onClick={createGroup}
            className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 rounded"
            disabled={!groupName || selectedMembers.length < 1}
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupChat;