import { useState, useEffect, useRef } from 'react';
import { getFirestore, collection, query, where, orderBy, limit, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth } from '../firebase/firebaseConfig';
import UsersList from '../components/UsersList';
import ChatHeader from '../components/ChatHeader';
import MessagesList from '../components/MessagesList';
import MessageInput from '../components/MessageInput';
import Sidebar from '../components/Sidebar'; // Import Sidebar
import MainHeader from '../components/MainHeader'; // Import MainHeader
import { useCloudinary } from '../hooks/useCloudinary';

export default function Chat() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(null);
  const messagesEndRef = useRef(null);
  const db = getFirestore();
  const { uploadImageToCloudinary } = useCloudinary();

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);

      if (auth.currentUser) {
        const current = usersData.find(u => u.uid === auth.currentUser.uid);
        setCurrentUserData(current || {
          uid: auth.currentUser.uid,
          name: auth.currentUser.displayName || 'Me',
          photoURL: auth.currentUser.photoURL,
          avatarSvg: null
        });
      }
    });
    return () => unsubscribe();
  }, [db]);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getCurrentUserForMessage = () => {
    return currentUserData || {
      uid: auth.currentUser?.uid,
      name: auth.currentUser?.displayName || 'Unknown User',
      photoURL: auth.currentUser?.photoURL || null,
      avatarSvg: null
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedImage) || !selectedUser) return;

    setLoading(true);
    try {
      let imageUrl = '';
      if (selectedImage) {
        try {
          imageUrl = await uploadImageToCloudinary(selectedImage);
          console.log('Image uploaded successfully:', imageUrl);
        } catch (uploadError) {
          console.error('Failed to upload image:', uploadError);
          alert('Failed to upload image. Please try again.');
          setLoading(false);
          return;
        }
      }

      const currentUser = getCurrentUserForMessage();
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
      alert('Failed to send message. Please try again.');
    }
    setLoading(false);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        e.target.value = null;
        return;
      }
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('Image size must be less than 10MB.');
        e.target.value = null;
        return;
      }
      setSelectedImage(file);
      e.target.value = null;
    }
  };

  const handleSidebarNavigate = (item) => {
    console.log(`Navigating to: ${item}`);
    if (item === 'logout') {
      // Logic handled in Sidebar itself
    } else if (item === 'profile') {
      alert('Profile page functionality not yet implemented! (You can show a modal or navigate here)');
    } else if (item === 'ai') {
      alert('AI Chat functionality not yet implemented!');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Top Header Row: MainHeader spanning across the entire top */}
      <MainHeader />

      {/* Main Content Area: Sidebar on left, UsersList & Chat on right */}
      <div className="flex flex-1 overflow-hidden"> {/* Use overflow-hidden to contain scrolling if necessary */}
        {/* Sidebar - fixed to the left, takes full height of this flex container */}
        <Sidebar currentUser={currentUserData} onNavigate={handleSidebarNavigate} />

        {/* The rest of the content (UsersList + Chat Area) */}
        <div className="flex flex-1">
          {/* UsersList column */}
          <UsersList
            users={users}
            selectedUser={selectedUser}
            onUserSelect={setSelectedUser}
            currentUserUid={auth.currentUser?.uid}
          />

          {/* Main Chat Area */}
          <div className="flex flex-col flex-1">
            <ChatHeader selectedUser={selectedUser} />

            {selectedUser && (
              <MessagesList
                messages={messages}
                users={users}
                currentUserUid={auth.currentUser?.uid}
                messagesEndRef={messagesEndRef}
              />
            )}

            {!selectedUser && (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-2xl font-light">
                <p className="animate-fade-in">Select a user to start your conversation.</p>
              </div>
            )}

            {selectedUser && (
              <MessageInput
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
                loading={loading}
                onSubmit={handleSubmit}
                onImageSelect={handleImageSelect}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}