import React, { useState } from 'react';
import { Download, Play, Pause, FileText, Film, Image, Music, Archive, File, Eye, ExternalLink } from 'lucide-react';

const MessageFileDisplay = ({ fileData, isCurrentUser }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  if (!fileData) return null;

  const { url, name, size, type, resourceType } = fileData;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    if (type.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (type.startsWith('video/')) return <Film className="h-5 w-5" />;
    if (type.startsWith('audio/')) return <Music className="h-5 w-5" />;
    if (type.includes('pdf') || type.includes('document') || type.includes('text')) return <FileText className="h-5 w-5" />;
    if (type.includes('zip') || type.includes('rar') || type.includes('archive')) return <Archive className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePlayPause = (audioElement) => {
    if (audioElement.paused) {
      audioElement.play();
      setIsPlaying(true);
    } else {
      audioElement.pause();
      setIsPlaying(false);
    }
  };

  // Image Display
  if (type.startsWith('image/')) {
    return (
      <div className="mt-2 max-w-sm">
        <div className="relative group">
          <img
            src={url}
            alt={name}
            className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
            style={{ maxHeight: '300px' }}
            onClick={() => setShowFullImage(true)}
          />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleDownload}
              className="p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1">{name} • {formatFileSize(size)}</p>

        {/* Full Image Modal */}
        {showFullImage && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4">
            <div className="relative max-w-full max-h-full">
              <img
                src={url}
                alt={name}
                className="max-w-full max-h-full object-contain"
              />
              <button
                onClick={() => setShowFullImage(false)}
                className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70"
              >
                ✕
              </button>
              <button
                onClick={handleDownload}
                className="absolute bottom-4 right-4 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Video Display
  if (type.startsWith('video/')) {
    return (
      <div className="mt-2 max-w-md">
        <div className="relative group bg-gray-800 rounded-lg overflow-hidden">
          <video
            controls
            className="w-full h-auto"
            style={{ maxHeight: '300px' }}
          >
            <source src={url} type={type} />
            Your browser does not support the video tag.
          </video>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleDownload}
              className="p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1">{name} • {formatFileSize(size)}</p>
      </div>
    );
  }

  // Audio Display
  if (type.startsWith('audio/')) {
    return (
      <div className="mt-2 max-w-md">
        <div className={`p-4 rounded-lg border ${
          isCurrentUser 
            ? 'bg-violet-600 border-violet-500' 
            : 'bg-gray-700 border-gray-600'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Music className="h-8 w-8 text-gray-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{name}</p>
              <p className="text-xs text-gray-300">{formatFileSize(size)}</p>
            </div>
            <button
              onClick={handleDownload}
              className="p-2 text-gray-300 hover:text-white transition-colors"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3">
            <audio
              controls
              className="w-full"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            >
              <source src={url} type={type} />
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>
      </div>
    );
  }

  // Document/Other Files Display
  return (
    <div className="mt-2 max-w-md">
      <div className={`p-4 rounded-lg border ${
        isCurrentUser 
          ? 'bg-violet-600 border-violet-500' 
          : 'bg-gray-700 border-gray-600'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 text-gray-300">
            {getFileIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate" title={name}>
              {name}
            </p>
            <p className="text-xs text-gray-300">
              {formatFileSize(size)} • {type.split('/')[1]?.toUpperCase() || 'File'}
            </p>
          </div>
          <div className="flex space-x-1">
            {/* View button for documents */}
            {(type.includes('pdf') || type.includes('text')) && (
              <button
                onClick={() => window.open(url, '_blank')}
                className="p-2 text-gray-300 hover:text-white transition-colors"
                title="View"
              >
                <Eye className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handleDownload}
              className="p-2 text-gray-300 hover:text-white transition-colors"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageFileDisplay;