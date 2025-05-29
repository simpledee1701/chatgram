// EmojiStickerPicker.js
import React, { useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { X } from 'lucide-react';

const EmojiStickerPicker = ({ onEmojiSelect, onStickerSelect, onClose }) => {
  const [activeTab, setActiveTab] = useState('emoji');

  // Predefined stickers/emojis organized by categories
  const stickerCategories = {
    reactions: [
      '👍', '👎', '❤️', '😍', '😂', '😭', '😱', '🤔',
      '👏', '🙌', '🔥', '✨', '💯', '🎉', '💪', '🤝'
    ],
    gestures: [
      '👋', '🤚', '✋', '🖐️', '🖖', '👌', '🤏', '✌️',
      '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇'
    ],
    animals: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
      '🐸', '🐵', '🦁', '🐯', '🐨', '🐷', '🐮', '🐙'
    ],
    food: [
      '🍕', '🍔', '🌭', '🍟', '🍗', '🥓', '🌮', '🌯',
      '🥙', '🧆', '🥚', '🍳', '🥞', '🧇', '🥖', '🍞'
    ],
    activities: [
      '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉',
      '🎱', '🏓', '🏸', '🥅', '⛳', '🏹', '🎣', '🤿'
    ]
  };

  const handleEmojiClick = (emojiData) => {
    onEmojiSelect(emojiData.emoji);
  };

  const handleStickerClick = (sticker) => {
    onStickerSelect(sticker);
  };

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-xl w-80 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-600 bg-gray-750">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('emoji')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'emoji'
                ? 'bg-violet-600 text-white'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
            }`}
          >
            😀 Emojis
          </button>
          <button
            onClick={() => setActiveTab('stickers')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'stickers'
                ? 'bg-violet-600 text-white'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
            }`}
          >
            🎭 Stickers
          </button>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-200 p-1 rounded-md hover:bg-gray-700 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="max-h-80 overflow-y-auto">
        {activeTab === 'emoji' ? (
          <div className="p-2">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme="dark"
              width="100%"
              height={300}
              previewConfig={{
                showPreview: false
              }}
              skinTonesDisabled={true}
              searchDisabled={false}
              emojiStyle="native"
            />
          </div>
        ) : (
          <div className="p-3">
            {Object.entries(stickerCategories).map(([category, stickers]) => (
              <div key={category} className="mb-4">
                <h3 className="text-sm font-medium text-gray-300 mb-2 capitalize">
                  {category}
                </h3>
                <div className="grid grid-cols-8 gap-2">
                  {stickers.map((sticker, index) => (
                    <button
                      key={index}
                      onClick={() => handleStickerClick(sticker)}
                      className="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-700 rounded-md transition-colors duration-200 hover:scale-110 transform"
                      title={`Add ${sticker}`}
                    >
                      {sticker}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Custom animated stickers */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-300 mb-2">
                Animated
              </h3>
              <div className="grid grid-cols-8 gap-2">
                {['🔄', '⏰', '💫', '🌟', '⚡', '🌈', '🎪', '🎨'].map((sticker, index) => (
                  <button
                    key={index}
                    onClick={() => handleStickerClick(sticker)}
                    className="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-700 rounded-md transition-colors duration-200 hover:scale-110 transform animate-pulse"
                    title={`Add ${sticker}`}
                  >
                    {sticker}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmojiStickerPicker;