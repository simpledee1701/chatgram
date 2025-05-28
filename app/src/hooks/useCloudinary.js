export const useCloudinary = () => {
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;

  const uploadFileToCloudinary = async (file, options = {}) => {
    try {
      if (!file) throw new Error('No file provided');
      if (!CLOUDINARY_UPLOAD_PRESET || !CLOUDINARY_CLOUD_NAME) {
        throw new Error('Cloudinary configuration missing');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('api_key', CLOUDINARY_API_KEY);

      // Determine resource type and folder
      let resourceType = 'auto';
      let folder = options.folder || 'assets/chat-files';

      if (file.type.startsWith('image/')) {
        folder = options.folder || 'assets/chat-images';
        resourceType = 'image';
      } else if (file.type.startsWith('video/')) {
        folder = options.folder || 'assets/chat-videos';
        resourceType = 'video';
      } else if (file.type.startsWith('audio/')) {
        folder = options.folder || 'assets/chat-audio';
        resourceType = 'video'; // Cloudinary treats audio as video
      } else {
        folder = options.folder || 'assets/chat-documents';
        resourceType = 'raw'; // For PDFs, docs, etc.
      }

      formData.append('folder', folder);

      // Optional public_id override
      if (options.publicId) {
        formData.append('public_id', options.publicId);
      }

      // Add timestamp for consistency
      const timestamp = Math.round(Date.now() / 1000);
      formData.append('timestamp', timestamp);

      const uploadEndpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `Upload failed with status ${response.status}`
        );
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Upload failed');
      }

      const fileExtension = data.format || file.name.split('.').pop().toLowerCase();
      const isPDF = fileExtension === 'pdf';
      const isDocument = resourceType === 'raw';

      let previewUrl = data.secure_url;
      let downloadUrl = data.secure_url;

      if (isDocument) {
        if (isPDF) {
          previewUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/raw/upload/${data.public_id}.${fileExtension}`;
          downloadUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/raw/upload/fl_attachment/${data.public_id}.${fileExtension}`;
        } else {
          previewUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/raw/upload/${data.public_id}.${fileExtension}`;
          downloadUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/raw/upload/fl_attachment/${data.public_id}.${fileExtension}`;
        }
      }

      // Warn if access is restricted
      if (data.access_mode && data.access_mode === 'authenticated') {
        console.warn(
          '⚠️ Cloudinary asset is marked as authenticated and will not be publicly accessible. Check your upload preset configuration in the Cloudinary dashboard.'
        );
      }

      return {
        url: data.secure_url,
        publicId: data.public_id,
        format: data.format,
        resourceType: data.resource_type,
        previewUrl,
        downloadUrl,
        originalFilename: data.original_filename,
        bytes: data.bytes,
        width: data.width,
        height: data.height,
        duration: data.duration,
        pages: data.pages,
        createdAt: data.created_at,
        signature: data.signature,
        type: data.type,
        folder: data.folder,
        accessMode: data.access_mode,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', {
        error: error.message,
        file: file?.name,
        type: file?.type,
      });
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  };

  const uploadImageToCloudinary = async (file) => {
    const result = await uploadFileToCloudinary(file);
    return result.url;
  };

  const getOptimizedUrl = (publicId, options = {}) => {
    if (!publicId) return '';

    const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}`;
    const {
      width,
      height,
      quality = 'auto',
      format = 'auto',
      crop = 'fill',
      resourceType = 'image',
      gravity = 'auto',
      effect,
    } = options;

    const transformations = [];
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (quality) transformations.push(`q_${quality}`);
    if (format) transformations.push(`f_${format}`);
    if (crop) transformations.push(`c_${crop}`);
    if (gravity) transformations.push(`g_${gravity}`);
    if (effect) transformations.push(`e_${effect}`);

    const transformationString = transformations.length > 0 
      ? transformations.join(',') 
      : '';

    return `${baseUrl}/${resourceType}/upload/${transformationString}/${publicId}`;
  };

  const getDocumentUrl = (publicId, format, options = {}) => {
    if (!publicId || !format) return '';

    const { forceDownload = false, inline = false, filename } = options;
    let url = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/raw/upload`;

    if (forceDownload) {
      url += `/fl_attachment`;
      if (filename) url += `:${encodeURIComponent(filename)}`;
    } else if (inline) {
      url += `/fl_inline`;
    }

    return `${url}/${publicId}.${format}`;
  };

  const getVideoThumbnail = (publicId, options = {}) => {
    return getOptimizedUrl(publicId, {
      resourceType: 'video',
      format: 'jpg',
      width: options.width || 640,
      height: options.height || 360,
      crop: options.crop || 'fill',
      quality: options.quality || 'auto',
      effect: 'so:0',
    });
  };

  const deleteFile = async (publicId, resourceType = 'image') => {
    console.warn('File deletion must be implemented server-side');
    return {
      success: false,
      message: 'Client-side deletion is disabled for security. Use server-side implementation.',
    };
  };

  return {
    uploadFileToCloudinary,
    uploadImageToCloudinary,
    getOptimizedUrl,
    getDocumentUrl,
    getVideoThumbnail,
    deleteFile,
  };
};
