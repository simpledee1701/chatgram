import React from 'react';

const ImagePreview = ({ selectedImage, onRemove }) => {
  if (!selectedImage) return null;

  return (
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
        onClick={onRemove}
        className="text-red-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
      >
        ✕
      </button>
    </div>
  );
};

export default ImagePreview;