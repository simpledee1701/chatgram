import React from 'react';
import { X, Download, FileText, Film, Image, Music, Archive, File } from 'lucide-react';

const FilePreview = ({ selectedFile, onRemove }) => {
  if (!selectedFile) return null;

  const getFileIcon = (file) => {
    const type = file.type;
    
    if (type.startsWith('image/')) return <Image className="h-6 w-6" />;
    if (type.startsWith('video/')) return <Film className="h-6 w-6" />;
    if (type.startsWith('audio/')) return <Music className="h-6 w-6" />;
    if (type.includes('pdf') || type.includes('document') || type.includes('text')) return <FileText className="h-6 w-6" />;
    if (type.includes('zip') || type.includes('rar') || type.includes('archive')) return <Archive className="h-6 w-6" />;
    return <File className="h-6 w-6" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = selectedFile.type.startsWith('image/');
  const isVideo = selectedFile.type.startsWith('video/');
  const isAudio = selectedFile.type.startsWith('audio/');

  return (
    <div className="mt-3 p-4 bg-gray-800 rounded-lg border border-gray-600">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-200">File Preview</h4>
        <button
          onClick={onRemove}
          className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-full transition-colors"
          title="Remove file"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-start space-x-4">
        {/* File Preview */}
        <div className="flex-shrink-0">
          {isImage && (
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-700">
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {isVideo && (
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
              <video
                src={URL.createObjectURL(selectedFile)}
                className="w-full h-full object-cover"
                muted
              />
            </div>
          )}

          {isAudio && (
            <div className="w-20 h-20 rounded-lg bg-gray-700 flex items-center justify-center">
              <Music className="h-8 w-8 text-gray-400" />
            </div>
          )}

          {!isImage && !isVideo && !isAudio && (
            <div className="w-20 h-20 rounded-lg bg-gray-700 flex items-center justify-center">
              {getFileIcon(selectedFile)}
            </div>
          )}
        </div>

        {/* File Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate" title={selectedFile.name}>
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}
              </p>
            </div>
            
            <button
              onClick={() => {
                const url = URL.createObjectURL(selectedFile);
                const a = document.createElement('a');
                a.href = url;
                a.download = selectedFile.name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="ml-2 p-1 text-gray-400 hover:text-violet-400 hover:bg-gray-700 rounded-full transition-colors"
              title="Download file"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>

          {/* Audio Player */}
          {isAudio && (
            <div className="mt-2">
              <audio
                controls
                className="w-full max-w-xs"
                style={{ height: '32px' }}
              >
                <source src={URL.createObjectURL(selectedFile)} type={selectedFile.type} />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Video Player */}
          {isVideo && (
            <div className="mt-2">
              <video
                controls
                className="w-full max-w-xs rounded-lg"
                style={{ maxHeight: '120px' }}
              >
                <source src={URL.createObjectURL(selectedFile)} type={selectedFile.type} />
                Your browser does not support the video element.
              </video>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreview;