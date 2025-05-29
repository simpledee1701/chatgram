import React from 'react';
import {
  X, Download, FileText, Film, Image, Music, Archive, File,
} from 'lucide-react';

const FilePreview = ({ selectedFile, onRemove }) => {
  if (!selectedFile) return null;

  const fileURL = URL.createObjectURL(selectedFile);

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <Image className="h-6 w-6 text-blue-400" />;
    if (type.startsWith('video/')) return <Film className="h-6 w-6 text-purple-400" />;
    if (type.startsWith('audio/')) return <Music className="h-6 w-6 text-pink-400" />;
    if (type.includes('pdf') || type.includes('text') || type.includes('document')) return <FileText className="h-6 w-6 text-yellow-400" />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className="h-6 w-6 text-orange-400" />;
    return <File className="h-6 w-6 text-gray-400" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const isImage = selectedFile.type.startsWith('image/');
  const isVideo = selectedFile.type.startsWith('video/');
  const isAudio = selectedFile.type.startsWith('audio/');

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = fileURL;
    a.download = selectedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(fileURL);
  };

  return (
    <div className="mt-3 rounded-xl border border-gray-700 bg-gray-900 p-4 text-sm text-gray-200 shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <span className="font-semibold">File Preview</span>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 transition"
          title="Remove"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-4">
        <div className="w-20 h-20 flex items-center justify-center rounded-lg overflow-hidden bg-gray-800">
          {isImage && <img src={fileURL} alt="preview" className="w-full h-full object-cover" />}
          {isVideo && (
            <video src={fileURL} muted className="w-full h-full object-cover" />
          )}
          {isAudio && <Music className="w-8 h-8 text-pink-400" />}
          {!isImage && !isVideo && !isAudio && getFileIcon(selectedFile.type)}
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="overflow-hidden">
              <p className="font-medium truncate" title={selectedFile.name}>
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown'}
              </p>
            </div>
            <button
              onClick={handleDownload}
              className="text-gray-400 hover:text-indigo-400 transition"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {isAudio && (
            <audio
              controls
              className="mt-2 w-full rounded"
              src={fileURL}
              style={{ height: '32px' }}
            />
          )}

          {isVideo && (
            <video
              controls
              src={fileURL}
              className="mt-2 w-full max-h-40 rounded"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreview;