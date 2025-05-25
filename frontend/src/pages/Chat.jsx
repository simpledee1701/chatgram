import { useState, useEffect, useRef } from 'react';
import { getFirestore, collection, query, where, orderBy, limit, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth } from '../firebase/firebaseConfig';

export default function Chat() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const db = getFirestore();

  // Fetch all users except current user
  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Include ALL users (including current user) for avatar lookup
      setUsers(usersData);
    });
    return () => unsubscribe();
  }, [db]);

  // Fetch messages for the selected conversation
  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
      return;
    }

    const currentUserUid = auth.currentUser?.uid;
    const selectedUserUid = selectedUser.uid;
    const participants = [currentUserUid, selectedUserUid].sort();
    const conversationId = participants.join('_');

    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
      setMessages(messagesData);
    }, (error) => {
      console.error('Error fetching messages:', error);
    });

    return () => unsubscribe();
  }, [db, selectedUser]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Helper function to get user avatar (photoURL or avatarSvg or fallback)
  const getUserAvatar = (user) => {
    if (user?.photoURL && user.photoURL.trim() !== '') {
      return { type: 'image', src: user.photoURL };
    }
    if (user?.avatarSvg && user.avatarSvg.trim() !== '') {
      return { type: 'svg', src: user.avatarSvg };
    }
    return { type: 'fallback', initial: user?.name?.charAt(0).toUpperCase() || '?' };
  };

  // Helper function to get current user data
  const getCurrentUser = () => {
    const currentUserFromDb = users.find(u => u.uid === auth.currentUser?.uid);
    if (currentUserFromDb) {
      return currentUserFromDb;
    }
    // Fallback to auth user data if not found in users collection
    return {
      uid: auth.currentUser?.uid,
      name: auth.currentUser?.displayName || 'Unknown User',
      photoURL: auth.currentUser?.photoURL || null,
      avatarSvg: null
    };
  };

  // Avatar component
  const Avatar = ({ user, size = 'w-8 h-8' }) => {
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

  // Handle image upload (keep your existing implementation)
  const uploadImage = async (file) => { 
    // Your existing upload implementation
    return '';
  };

  // Handle message submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedImage) || !selectedUser) return;

    setLoading(true);
    try {
      let imageUrl = '';
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      const currentUser = getCurrentUser();
      const receiverId = selectedUser.uid;
      const participants = [auth.currentUser.uid, receiverId].sort();
      const conversationId = participants.join('_');

      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        timestamp: serverTimestamp(),
        uid: auth.currentUser.uid,
        photoURL: currentUser.photoURL || null,
        avatarSvg: currentUser.avatarSvg || null,
        displayName: currentUser.name || auth.currentUser.displayName || 'Unknown User',
        imageUrl,
        receiverId,
        conversationId
      });

      setNewMessage('');
      setSelectedImage(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
    setLoading(false);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Users List */}
      <div className="w-1/4 bg-white border-r">
        <div className="p-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Users</h2>
        </div>
        <div className="overflow-y-auto">
          {users.filter(user => user.uid !== auth.currentUser?.uid).map((user) => (
            <div
              key={user.uid}
              onClick={() => setSelectedUser(user)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedUser?.uid === user.uid ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-center">
                <Avatar user={user} />
                <span className="ml-3 text-gray-800 font-medium">{user.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Area - Chat */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        {selectedUser ? (
          <header className="bg-white shadow-sm py-4 px-6 flex items-center border-b">
            <div className="flex items-center">
              <Avatar user={selectedUser} />
              <span className="ml-3 text-gray-800 font-semibold">{selectedUser.name}</span>
            </div>
          </header>
        ) : (
          <header className="bg-white shadow-sm py-4 px-6 border-b">
            <h1 className="text-xl font-bold text-gray-800">Select a user to start chatting</h1>
          </header>
        )}

        {/* Messages */}
        {selectedUser && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => {
              const isCurrentUser = message.uid === auth.currentUser?.uid;
              // Look up user data from the users collection
              const messageUser = users.find(u => u.uid === message.uid) || {
                uid: message.uid,
                name: message.displayName,
                photoURL: message.photoURL,
                avatarSvg: message.avatarSvg
              };
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} gap-3 max-w-[70%]`}>
                    {/* Avatar */}
                    <Avatar user={messageUser} size="w-8 h-8" />

                    {/* Message bubble */}
                    <div
                      className={`px-4 py-3 rounded-2xl shadow-sm ${
                        isCurrentUser
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-white text-gray-800 rounded-bl-md border'
                      }`}
                    >
                      {message.imageUrl && (
                        <img
                          src={message.imageUrl}
                          alt="Chat content"
                          className="mb-2 rounded-lg max-w-full h-48 object-cover"
                        />
                      )}

                      {message.text && (
                        <p className="break-words leading-relaxed">{message.text}</p>
                      )}

                      <div
                        className={`mt-1 text-xs ${
                          isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {message.timestamp && new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Message Input */}
        {selectedUser && (
          <form onSubmit={handleSubmit} className="bg-white p-4 shadow-lg border-t">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="absolute right-2 top-2 opacity-0 w-8 h-8 cursor-pointer"
                  id="fileInput"
                />
                <label
                  htmlFor="fileInput"
                  className="absolute right-2 top-2 p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
                  title="Attach image"
                >
                  📎
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || (!newMessage.trim() && !selectedImage)}
                className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>

            {selectedImage && (
              <div className="mt-4 flex items-center p-3 bg-gray-50 rounded-lg">
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Selected"
                  className="w-16 h-16 object-cover rounded-lg mr-3"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{selectedImage.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="text-red-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                >
                  ✕
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}