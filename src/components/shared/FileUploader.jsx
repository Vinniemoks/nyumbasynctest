import { useState, useRef } from 'react';

const FileUploader = ({ 
  images = [], 
  setImages, 
  maxImages = 5, 
  maxSizeMB = 10 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const validateFile = (file) => {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return 'Invalid file type. Please upload JPG, PNG, GIF, or WebP images.';
    }

    // Check file size
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxSizeMB}MB limit.`;
    }

    return null;
  };

  const handleFiles = (files) => {
    setError(null);

    // Check if adding these files would exceed max images
    if (images.length + files.length > maxImages) {
      setError(`You can only upload up to ${maxImages} images.`);
      return;
    }

    const newImages = [];
    const fileArray = Array.from(files);

    fileArray.forEach((file) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Create preview URL
      const preview = URL.createObjectURL(file);
      newImages.push({
        file,
        preview,
        name: file.name,
        size: file.size
      });
    });

    if (newImages.length > 0) {
      setImages([...images, ...newImages]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    // Revoke the object URL to free memory
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
    setError(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div>
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => images.length < maxImages && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleChange}
          className="hidden"
          disabled={images.length >= maxImages}
        />

        <div className="flex flex-col items-center">
          <i className={`fas fa-cloud-upload-alt text-5xl mb-4 ${
            dragActive ? 'text-blue-500' : 'text-gray-400'
          }`}></i>
          <p className="text-lg font-medium text-gray-700 mb-1">
            {dragActive ? 'Drop files here' : 'Drag and drop images here'}
          </p>
          <p className="text-sm text-gray-500 mb-3">or</p>
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={images.length >= maxImages}
          >
            Browse Files
          </button>
          <p className="text-xs text-gray-500 mt-3">
            {images.length}/{maxImages} images • Max {maxSizeMB}MB per file
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square"
            >
              <img
                src={image.preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay with file info */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 text-white w-10 h-10 rounded-full flex items-center justify-center"
                  title="Remove image"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>

              {/* File name and size */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                <p className="text-white text-xs truncate">{image.name}</p>
                <p className="text-white text-xs opacity-75">{formatFileSize(image.size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
