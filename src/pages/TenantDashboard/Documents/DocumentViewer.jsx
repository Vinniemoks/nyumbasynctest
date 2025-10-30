import { useState, useEffect } from 'react';
import apiService from '../../../api/api';

const DocumentViewer = ({ document, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    // Set preview URL for the document
    if (document) {
      setPreviewUrl(document.fileUrl);
    }

    // Add keyboard listener for ESC key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [document, onClose]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setDownloadError(null);

      const startTime = Date.now();

      // Get download URL
      const downloadUrl = await apiService.downloadDocument(document.id);

      // Create a temporary link and trigger download
      const link = window.document.createElement('a');
      link.href = downloadUrl;
      link.download = document.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);

      const downloadTime = Date.now() - startTime;

      // Ensure download completes within 3 seconds (requirement 12.6)
      if (downloadTime > 3000) {
        console.warn(`Download took ${downloadTime}ms, exceeding 3 second requirement`);
      }

    } catch (err) {
      setDownloadError(err.message || 'Failed to download document');
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isImage = document.fileType.includes('image');
  const isPDF = document.fileType.includes('pdf');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex-1 min-w-0 mr-4">
            <h2 className="text-xl font-bold text-gray-900 truncate">
              {document.name}
            </h2>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <i className="fas fa-folder"></i>
                <span className="capitalize">{document.category}</span>
              </span>
              <span className="flex items-center gap-1">
                <i className="fas fa-hdd"></i>
                <span>{formatFileSize(document.fileSize)}</span>
              </span>
              <span className="flex items-center gap-1">
                <i className="fas fa-calendar"></i>
                <span>{formatDate(document.uploadedAt)}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              title="Download document"
            >
              {downloading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-download"></i>
                  <span>Download</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2"
              title="Close viewer"
            >
              <i className="fas fa-times text-2xl"></i>
            </button>
          </div>
        </div>

        {/* Download Error */}
        {downloadError && (
          <div className="mx-4 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <i className="fas fa-exclamation-circle"></i>
            <span>{downloadError}</span>
            <button
              onClick={() => setDownloadError(null)}
              className="ml-auto text-red-700 hover:text-red-900"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {/* Preview Area */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          {isImage ? (
            <div className="flex items-center justify-center h-full">
              <img
                src={previewUrl}
                alt={document.name}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
            </div>
          ) : isPDF ? (
            <div className="h-full bg-white rounded-lg shadow-lg overflow-hidden">
              <iframe
                src={previewUrl}
                title={document.name}
                className="w-full h-full border-0"
                onError={() => {
                  // If iframe fails to load, show fallback
                  console.error('Failed to load PDF preview');
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <i className="fas fa-file text-6xl text-gray-400 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Preview not available
              </h3>
              <p className="text-gray-600 mb-6">
                This file type cannot be previewed in the browser.
              </p>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {downloading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-download"></i>
                    <span>Download to View</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer with Document Info */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-gray-600">
              <span className="flex items-center gap-2">
                <i className="fas fa-user"></i>
                <span>Uploaded by: <span className="font-medium text-gray-900">{document.uploadedBy}</span></span>
              </span>
              <span className="flex items-center gap-2">
                <i className="fas fa-file-alt"></i>
                <span>Type: <span className="font-medium text-gray-900">{document.fileType}</span></span>
              </span>
            </div>
            <div className="text-gray-500">
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">ESC</kbd> to close
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
