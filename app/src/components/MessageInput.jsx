import { useEffect, useState } from 'react';
import FilePreview from './FilePreview';
import VoiceRecorder from './VoiceRecorder';
import EmojiStickerPicker from './EmojiStickerPicker';
import { ref, set, serverTimestamp } from 'firebase/database';
import { auth } from '../firebase/firebaseConfig';
import { Paperclip, Mic, X, Smile } from 'lucide-react';

const MessageInput = ({
  newMessage,
  setNewMessage,
  selectedFile,
  setSelectedFile,
  loading,
  onSubmit,
  onFileSelect,
  selectedUser,
  rtdb,
  isAI,
  aiLoading,
  conversationHistory = [] // For AI suggestions context
}) => {
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showFileOptions, setShowFileOptions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleTyping = (isTyping) => {
    if (!auth.currentUser?.uid || !selectedUser?.uid) return;

    const typingRef = ref(rtdb, `typing/${auth.currentUser.uid}`);

    set(typingRef, {
      isTyping,
      to: selectedUser.uid,
      timestamp: serverTimestamp()
    });

    if (isTyping) {
      setTimeout(() => {
        set(typingRef, {
          isTyping: false,
          timestamp: serverTimestamp()
        });
      }, 3000);
    }
  };

  useEffect(() => {
    return () => {
      if (auth.currentUser?.uid) {
        const typingRef = ref(rtdb, `typing/${auth.currentUser.uid}`);
        set(typingRef, {
          isTyping: false,
          timestamp: serverTimestamp()
        });
      }
    };
  }, [rtdb]);

  const handleFileSelect = (e, fileType = 'all') => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type if specific type is requested
      if (fileType === 'image' && !file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (fileType === 'video' && !file.type.startsWith('video/')) {
        alert('Please select a video file');
        return;
      }
      if (fileType === 'document' && !file.type.includes('pdf') && !file.type.includes('document') && !file.type.includes('text')) {
        alert('Please select a document file');
        return;
      }

      setSelectedFile(file);
      setShowFileOptions(false);
    }
  };

  const handleVoiceRecording = (audioFile) => {
    setSelectedFile(audioFile);
    setShowVoiceRecorder(false);
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
  };

  const handleStickerSelect = (sticker) => {
    setNewMessage(prev => prev + sticker);
  };

  const handleSuggestionSelect = (suggestion) => {
    setNewMessage(suggestion);
    setShowSuggestions(false);
  };

  const handleSubmitWithFile = (e) => {
    e.preventDefault();
    onSubmit(e);
    setShowEmojiPicker(false);
    setShowSuggestions(false);
  };

  // Close all dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowFileOptions(false);
        setShowEmojiPicker(false);
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="p-4 shadow-2xl">
      {aiLoading && (
        <div className="mb-2 text-sm text-violet-400 flex items-center">
          <div className="animate-pulse mr-2">⠋</div>
          AI is generating response...
        </div>
      )}

      {/* Voice Recorder */}
      {showVoiceRecorder && (
        <VoiceRecorder
          onRecordingComplete={handleVoiceRecording}
          onCancel={() => setShowVoiceRecorder(false)}
        />
      )}

      {/* Message Suggestions */}
      {showSuggestions && (
        <div className="mb-4">
          <MessageSuggestions
            conversationHistory={conversationHistory}
            onSuggestionSelect={handleSuggestionSelect}
            onClose={() => setShowSuggestions(false)}
          />
        </div>
      )}

      {/* File Preview */}
      <FilePreview
        selectedFile={selectedFile}
        onRemove={() => setSelectedFile(null)}
      />

      <form onSubmit={handleSubmitWithFile} className="relative">
        <div className="flex space-x-3 items-center">
          <div className="flex-1 relative dropdown-container">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping(e.target.value.length > 0);
              }}
              placeholder="Type your message..."
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-full text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent pr-32 transition-all duration-300 ease-in-out"
            />

            {/* Input controls container */}
            <div className="absolute right-3 top-2 flex items-center space-x-1">

              {/* Emoji & Sticker button */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-gray-700 rounded-full cursor-pointer transition-colors duration-200"
                title="Emojis & Stickers"
              >
                <Smile className="h-5 w-5" />
              </button>

              {/* File attachment button */}
              <button
                type="button"
                onClick={() => setShowFileOptions(!showFileOptions)}
                className="p-2 text-gray-400 hover:text-violet-400 hover:bg-gray-700 rounded-full cursor-pointer transition-colors duration-200"
                title="Attach file"
              >
                <Paperclip className="h-5 w-5" />
              </button>

              {/* Voice recording button */}
              <button
                type="button"
                onClick={() => setShowVoiceRecorder(true)}
                className="p-2 text-gray-400 hover:text-violet-400 hover:bg-gray-700 rounded-full cursor-pointer transition-colors duration-200"
                title="Voice message"
              >
                <Mic className="h-5 w-5" />
              </button>
            </div>

            {/* Emoji & Sticker Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 z-50">
                <EmojiStickerPicker
                  onEmojiSelect={handleEmojiSelect}
                  onStickerSelect={handleStickerSelect}
                  onClose={() => setShowEmojiPicker(false)}
                />
              </div>
            )}

            {/* File options dropdown */}
            {showFileOptions && (
              <div className="absolute bottom-full right-0 mb-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg py-2 min-w-48 z-50">
                <div className="flex justify-between items-center px-4 pb-2 border-b border-gray-600">
                  <span className="text-sm font-medium text-gray-200">Choose file type</span>
                  <button
                    onClick={() => setShowFileOptions(false)}
                    className="text-gray-400 hover:text-gray-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <label className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'image')}
                    className="hidden"
                  />
                  📷 Photos
                </label>
                
                <label className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileSelect(e, 'video')}
                    className="hidden"
                  />
                  🎥 Videos
                </label>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || aiLoading || (!newMessage.trim() && !selectedFile)}
            className="bg-violet-600 text-white px-6 py-3 rounded-full hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out font-medium flex items-center gap-2 transform active:scale-95"
          >
            {loading || aiLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {aiLoading ? 'Generating...' : 'Sending...'}
              </>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;