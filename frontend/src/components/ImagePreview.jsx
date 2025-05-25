import React, { useEffect, useState } from 'react';

const ImagePreview = ({ selectedImage, onRemove }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (selectedImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(selectedImage);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedImage]);

  if (!previewUrl) {
    return null;
  }

  return (
    <div className="mt-4 flex items-center bg-gray-700 p-3 rounded-lg shadow-inner animate-fade-in-up">
      <img src={previewUrl} alt="Preview" className="w-20 h-20 object-cover rounded-md border border-gray-600" />
      <div className="ml-4 flex-1">
        <p className="text-gray-100 font-medium truncate">{selectedImage.name}</p>
        <p className="text-gray-400 text-sm">{(selectedImage.size / 1024 / 1024).toFixed(2)} MB</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="ml-4 p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 transform active:scale-95"
        title="Remove image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default ImagePreview;