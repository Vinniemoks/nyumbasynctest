import { useState, useRef } from 'react';
import apiService from '../../../api/api';

const DocumentUpload = ({ onClose, onDocumentUploaded }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [category, setCategory] = useState('personal');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const maxSizeMB = 20;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const acceptedFormats = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  const acceptedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];

  const categories = [
    { value: 'lease', label: 'Lease', icon: 'fa-file-contract' },
    { value: 'inspection', label: 'Inspection', icon: 'fa-clipboard-check' },
    { value: 'insurance', label: 'Insurance', icon: 'fa-shield-alt' },
    { value: 'utilities', label: 'Utilities', icon: 'fa-bolt' },
    { value: 'personal', label: 'Personal', icon: 'fa-user' },
    { value: 'other', label: 'Other', icon: 'fa-file' }
  ];

  const validateFile = (file) => {
    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      return `Invalid file type. Please upload PDF, JPG, or PNG files only.`;
    }

    // Check file size
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxSizeMB}MB limit. Your file is ${formatFileSize(file.size)}.`;
    }

    return null;
  };

  const handleFileSelect = (file) => {
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
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
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    if (!category) {
      setError('Please select a category');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const uploadedDocument = await apiService.uploadDocument(selectedFile, category);
      
      if (onDocumentUploaded) {
        onDocumentUploaded(uploadedDocument);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload document');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return 'fa-file-pdf text-red-600';
    if (fileType.includes('image')) return 'fa-file-image text-blue-600';
    return 'fa-file text-gray-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upload Document</h2>
            <p className="text-sm text-gray-600 mt-1">
              Upload PDF, JPG, or PNG files up to {maxSizeMB}MB
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={uploading}
          >
            <i className="fas fa-times text-2xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Document Category *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  disabled={uploading}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                    category === cat.value
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <i className={`fas ${cat.icon} text-lg`}></i>
                  <span className="font-medium">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Select File *
            </label>
            
            {!selectedFile ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={acceptedExtensions.join(',')}
                  onChange={handleFileInputChange}
                  className="hidden"
                  disabled={uploading}
                />

                <div className="flex flex-col items-center">
                  <i className={`fas fa-cloud-upload-alt text-6xl mb-4 ${
                    dragActive ? 'text-blue-500' : 'text-gray-400'
                  }`}></i>
                  <p className="text-lg font-medium text-gray-700 mb-1">
                    {dragActive ? 'Drop file here' : 'Drag and drop file here'}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">or</p>
                  <button
                    type="button"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    disabled={uploading}
                  >
                    Browse Files
                  </button>
                  <p className="text-xs text-gray-500 mt-4">
                    Accepted formats: PDF, JPG, PNG • Max size: {maxSizeMB}MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="border-2 border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <i className={`fas ${getFileIcon(selectedFile.type)} text-5xl`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-semibold text-gray-900 truncate">
                      {selectedFile.name}
                    </h4>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-hdd text-gray-400"></i>
                        <span>{formatFileSize(selectedFile.size)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="fas fa-file-alt text-gray-400"></i>
                        <span>{selectedFile.type}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    disabled={uploading}
                    className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <i className="fas fa-spinner fa-spin text-blue-600"></i>
                <span className="text-blue-900 font-medium">Uploading document...</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || !category || uploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {uploading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <i className="fas fa-upload"></i>
                <span>Upload Document</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
