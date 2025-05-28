import React, { useState, useEffect, useRef } from 'react';
import Avatar from './Avatar';
import { FiCopy, FiCornerUpRight, FiTrash2, FiSmile, FiX, FiCheck } from 'react-icons/fi';
import EmojiPicker from 'emoji-picker-react';
import { getFirestore, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';

const MessagesList = ({ messages, users, currentUserUid, messagesEndRef, isGroup, isAI, onDeleteMessage, onForwardMessage }) => {
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState(null);
  const [reactions, setReactions] = useState({});
  const [showReactionDetails, setShowReactionDetails] = useState(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const messageRefs = useRef({});

  // Load reactions from messages
  useEffect(() => {
    const initialReactions = {};
    messages.forEach(message => {
      if (message.reactions) {
        initialReactions[message.id] = message.reactions;
      }
    });
    setReactions(initialReactions);
  }, [messages]);

  // Close all popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideMessage = Object.values(messageRefs.current).some(ref =>
        ref && ref.contains(event.target)
      );

      if (!isClickInsideMessage) {
        setShowEmojiPickerFor(null);
        setShowReactionDetails(null);
        setHoveredMessageId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-close other popups when opening a new one
  const handlePopupOpen = (type, messageId, value = null) => {
    if (type === 'emoji') {
      setShowReactionDetails(null);
      setShowEmojiPickerFor(showEmojiPickerFor === messageId ? null : messageId);
    } else if (type === 'reactions') {
      setShowEmojiPickerFor(null);
      setShowReactionDetails(showReactionDetails === value ? null : value);
    }
  };

  const getUserById = (uid) => users.find(user => user.uid === uid);

  const getTimestamp = (timestamp) => {
    try {
      if (timestamp?.toDate) return timestamp.toDate();
      if (timestamp instanceof Date) return timestamp;
      return new Date();
    } catch {
      return new Date();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    const today = new Date();
    const isToday = isSameDay(date, today);

    if (isToday) {
      return 'Today';
    }

    return date.toLocaleDateString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const handleCopy = (text, messageId) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      const newReaction = {
        emoji,
        userId: auth.currentUser.uid,
        timestamp: new Date()
      };

      setReactions(prev => ({
        ...prev,
        [messageId]: [...(prev[messageId] || []), newReaction]
      }));

      let messageRef;
      if (isAI) {
        messageRef = doc(db, 'aiMessages', messageId);
      } else {
        messageRef = doc(db, 'messages', messageId);
      }

      await updateDoc(messageRef, {
        reactions: arrayUnion(newReaction)
      });

      setShowEmojiPickerFor(null);
    } catch (error) {
      console.error('Error adding reaction:', error);
      setReactions(prev => ({
        ...prev,
        [messageId]: prev[messageId]?.filter(r => !(r.emoji === emoji && r.userId === auth.currentUser.uid)) || []
      }));
    }
  };

  const handleRemoveReaction = async (messageId, reaction) => {
    try {
      setReactions(prev => ({
        ...prev,
        [messageId]: prev[messageId]?.filter(r =>
          !(r.emoji === reaction.emoji && r.userId === reaction.userId && r.timestamp?.seconds === reaction.timestamp?.seconds)
        ) || []
      }));

      let messageRef;
      if (isAI) {
        messageRef = doc(db, 'aiMessages', messageId);
      } else {
        messageRef = doc(db, 'messages', messageId);
      }

      await updateDoc(messageRef, {
        reactions: arrayRemove(reaction)
      });
    } catch (error) {
      console.error('Error removing reaction:', error);
      setReactions(prev => ({
        ...prev,
        [messageId]: [...(prev[messageId] || []), reaction]
      }));
    }
  };

  const hasMessages = messages && messages.length > 0;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 hide-scrollbar relative bg-gray-950">
      {/* Custom CSS for enhanced animations and effects */}
      <style>{`
        .message-bubble {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(12px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .message-bubble:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        .message-options {
          animation: slideIn 0.2s ease-out;
          backdrop-filter: blur(16px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .emoji-popup {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        .reaction-details {
          animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          backdrop-filter: blur(20px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        .reaction-bubble:hover {
          transform: scale(1.05);
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
        }
        
        .glow-effect {
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
        }
        
        .ai-glow {
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .gradient-border {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(59, 130, 246, 0.3));
          padding: 1px;
          border-radius: 16px;
        }
        
        .gradient-border-content {
          background: rgba(31, 41, 55, 0.9);
          border-radius: 15px;
          backdrop-filter: blur(12px);
        }
      `}</style>

      {!hasMessages && (
        <div className="flex flex-col items-center justify-center h-screen w-full text-center space-y-6 bg-gray-950">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center border border-purple-500/30">
              <FiSmile className="w-12 h-12 text-purple-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">💬</span>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-3xl font-bold text-purple-300">
              No messages yet
            </h3>
            <p className="text-lg text-gray-400 max-w-md">
              Start the conversation - your messages are private and end-to-end encrypted.
            </p>
          </div>
        </div>

      )}

      {hasMessages && messages.map((message, index) => {
        const isCurrentUser = message.isAI ? false :
          (message.uid === currentUserUid || (!message.uid && !message.isAI));
        const sender = getUserById(message.uid);
        const isAIMessage = message.isAI;
        const timestamp = getTimestamp(message.timestamp);
        const messageReactions = reactions[message.id] || [];

        const showDateSeparator = index === 0 ||
          !isSameDay(
            getTimestamp(messages[index - 1].timestamp),
            timestamp
          );

        const groupedReactions = {};
        messageReactions.forEach(reaction => {
          if (!groupedReactions[reaction.emoji]) {
            groupedReactions[reaction.emoji] = [];
          }
          groupedReactions[reaction.emoji].push(reaction);
        });

        return (
          <React.Fragment key={message.id}>
            {showDateSeparator && (
              <div className="flex justify-center my-8">
                <div className="gradient-border">
                  <div className="gradient-border-content px-6 py-3">
                    <span className="text-gray-300 text-sm font-medium">
                      {formatDate(timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className={`relative flex ${isAIMessage ? 'justify-start' :
              isCurrentUser ? 'justify-end' : 'justify-start'
              } mb-2`}>
              <div
                ref={el => messageRefs.current[message.id] = el}
                className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} relative max-w-[75%] min-w-[200px]`}
                onMouseEnter={() => setHoveredMessageId(message.id)}
                onMouseLeave={() => {
                  if (showEmojiPickerFor !== message.id && !showReactionDetails?.startsWith(message.id)) {
                    setHoveredMessageId(null);
                  }
                }}
              >
                {/* Message Options */}
                {(hoveredMessageId === message.id || showEmojiPickerFor === message.id) && (
                  <div className={`absolute -top-8 z-50 ${isCurrentUser ? 'right-0' : 'left-0'}`}>
                    <div className="message-options flex items-center space-x-1 bg-gray-800/95 rounded-xl px-2 py-1.5 border border-gray-600/50">
                      {!isCurrentUser ? (
                        <>
                          <button
                            className="text-gray-300 hover:text-yellow-400 p-1.5 rounded-lg hover:bg-gray-700/50 transition-all duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePopupOpen('emoji', message.id);
                            }}
                            title="Add reaction"
                          >
                            <FiSmile size={16} />
                          </button>
                          <button
                            className="text-gray-300 hover:text-blue-400 p-1.5 rounded-lg hover:bg-gray-700/50 transition-all duration-200"
                            onClick={() => handleCopy(message.text, message.id)}
                            title="Copy message"
                          >
                            {copiedMessageId === message.id ? <FiCheck size={16} /> : <FiCopy size={16} />}
                          </button>
                          <button
                            className="text-gray-300 hover:text-green-400 p-1.5 rounded-lg hover:bg-gray-700/50 transition-all duration-200"
                            onClick={() => onForwardMessage(message)}
                            title="Forward message"
                          >
                            <FiCornerUpRight size={16} />
                          </button>
                          <button
                            className="text-gray-300 hover:text-red-400 p-1.5 rounded-lg hover:bg-gray-700/50 transition-all duration-200"
                            onClick={() => onDeleteMessage(message.id, 'everyone')}
                            title="Delete message"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="text-gray-300 hover:text-red-400 p-1.5 rounded-lg hover:bg-gray-700/50 transition-all duration-200"
                            onClick={() => onDeleteMessage(message.id, 'self')}
                            title="Delete message"
                          >
                            <FiTrash2 size={16} />
                          </button>
                          <button
                            className="text-gray-300 hover:text-green-400 p-1.5 rounded-lg hover:bg-gray-700/50 transition-all duration-200"
                            onClick={() => onForwardMessage(message)}
                            title="Forward message"
                          >
                            <FiCornerUpRight size={16} />
                          </button>
                          <button
                            className="text-gray-300 hover:text-blue-400 p-1.5 rounded-lg hover:bg-gray-700/50 transition-all duration-200"
                            onClick={() => handleCopy(message.text, message.id)}
                            title="Copy message"
                          >
                            {copiedMessageId === message.id ? <FiCheck size={16} /> : <FiCopy size={16} />}
                          </button>
                          <button
                            className="text-gray-300 hover:text-yellow-400 p-1.5 rounded-lg hover:bg-gray-700/50 transition-all duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePopupOpen('emoji', message.id);
                            }}
                            title="Add reaction"
                          >
                            <FiSmile size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Message bubble */}
                <div
                  className={`message-bubble relative rounded-2xl px-4 py-3 ${isAIMessage
                      ? 'bg-gradient-to-br from-purple-900/80 to-violet-900/80 border border-purple-600/50 ai-glow'
                      : isCurrentUser
                        ? 'bg-gradient-to-br from-green-900/80 to-emerald-900/80 border border-green-600/50 glow-effect'
                        : 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-600/50'
                    }`}
                >
                  {/* Message header */}
                  {!isAIMessage && isGroup && !isCurrentUser && (
                    <div className="flex items-center mb-2 space-x-2">
                      <Avatar user={sender} size="w-6 h-6" />
                      <span className="text-sm font-semibold text-gray-200">
                        {sender?.name || 'Unknown user'}
                      </span>
                    </div>
                  )}

                  {isAIMessage && (
                    <div className="flex items-center mb-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center mr-2 shadow-lg">
                        <span className="text-xs font-bold text-white">AI</span>
                      </div>
                      <span className="text-sm font-semibold bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent">
                        AI Assistant
                      </span>
                    </div>
                  )}

                  {/* Message content */}
                  {message.imageUrl && (
                    <div className="mb-3">
                      <img
                        src={message.imageUrl}
                        alt="Message"
                        className="max-w-full max-h-64 object-cover rounded-xl border border-gray-600/30 shadow-lg"
                      />
                    </div>
                  )}

                  <p className={`text-sm leading-relaxed ${isAIMessage ? 'text-gray-100' : 'text-white'}`}>
                    {message.text}
                  </p>

                  {/* Message footer */}
                  <div className="flex items-center justify-end mt-2">
                    <span className={`text-xs font-medium ${isCurrentUser ? 'text-green-300/90' : 'text-gray-400/90'
                      }`}>
                      {formatTime(timestamp)}
                    </span>
                  </div>
                </div>

                {/* Emoji picker */}
                {showEmojiPickerFor === message.id && (
                  <div
                    className={`emoji-popup absolute z-50 ${isCurrentUser ? 'right-0' : 'left-0'} 
                      bottom-full mb-4`}
                  >
                    <div className="rounded-xl overflow-hidden border border-gray-600/50 shadow-2xl">
                      <EmojiPicker
                        onEmojiClick={(emojiData) => handleReaction(message.id, emojiData.emoji)}
                        width={300}
                        height={350}
                        theme="dark"
                        previewConfig={{ showPreview: false }}
                        searchPlaceholder="Search emojis..."
                        lazyLoadEmojis={true}
                      />
                    </div>
                  </div>
                )}

                {/* Reactions */}
                {Object.keys(groupedReactions).length > 0 && (
                  <div className={`flex mt-2 space-x-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                    {Object.entries(groupedReactions).map(([emoji, reactions]) => (
                      <div key={emoji} className="relative">
                        <button
                          className="reaction-bubble text-sm bg-gradient-to-r from-gray-800/90 to-gray-700/90 hover:from-purple-800/90 hover:to-purple-700/90 border border-gray-600/50 rounded-full px-3 py-1.5 flex items-center space-x-1.5 transition-all duration-300 backdrop-blur-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePopupOpen('reactions', message.id, `${message.id}-${emoji}`);
                          }}
                        >
                          <span className="text-base">{emoji}</span>
                          <span className="text-xs text-gray-200 font-semibold">{reactions.length}</span>
                        </button>

                        {/* Reaction Details Popup */}
                        {showReactionDetails === `${message.id}-${emoji}` && (
                          <div
                            className={`reaction-details absolute z-50 bg-gray-800/95 rounded-xl p-4 w-72 max-h-64 overflow-y-auto 
                              ${isCurrentUser ? 'right-0' : 'left-0'} bottom-full mb-3 border border-gray-600/50`}
                          >
                            {/* Header */}
                            <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-700/50">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{emoji}</span>
                                <span className="text-sm font-semibold text-gray-200">
                                  {reactions.length} {reactions.length === 1 ? 'reaction' : 'reactions'}
                                </span>
                              </div>
                              <button
                                className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-700/50 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowReactionDetails(null);
                                }}
                              >
                                <FiX size={16} />
                              </button>
                            </div>

                            {/* Reactions List */}
                            <div className="space-y-2">
                              {reactions.map((reaction, idx) => {
                                const user = getUserById(reaction.userId);
                                const isCurrentUserReaction = reaction.userId === currentUserUid;

                                return (
                                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/30 transition-colors">
                                    <div className="flex items-center space-x-3">
                                      <Avatar user={user} size="w-7 h-7" />
                                      <div>
                                        <div className="text-sm text-gray-200 font-medium">
                                          {user?.name || 'Unknown user'}
                                          {isCurrentUserReaction && (
                                            <span className="text-xs text-purple-400 ml-2 font-semibold">(You)</span>
                                          )}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                          {new Date(reaction.timestamp.seconds ? reaction.timestamp.seconds * 1000 : reaction.timestamp).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                    {isCurrentUserReaction && (
                                      <button
                                        className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-900/20 transition-all duration-200 font-medium"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveReaction(message.id, reaction);
                                          setShowReactionDetails(null);
                                        }}
                                      >
                                        Remove
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </React.Fragment>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesList;