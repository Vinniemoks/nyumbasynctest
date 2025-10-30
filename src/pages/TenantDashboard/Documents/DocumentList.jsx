import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../../api/api';
import DocumentUpload from './DocumentUpload';
import DocumentViewer from './DocumentViewer';

const DocumentList = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  const categories = [
    { value: 'all', label: 'All Documents', icon: 'fa-folder' },
    { value: 'lease', label: 'Lease', icon: 'fa-file-contract' },
    { value: 'inspection', label: 'Inspection', icon: 'fa-clipboard-check' },
    { value: 'insurance', label: 'Insurance', icon: 'fa-shield-alt' },
    { value: 'utilities', label: 'Utilities', icon: 'fa-bolt' },
    { value: 'personal', label: 'Personal', icon: 'fa-user' },
    { value: 'other', label: 'Other', icon: 'fa-file' }
  ];

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterAndSortDocuments();
  }, [documents, searchQuery, selectedCategory, sortBy]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getDocuments();
      setDocuments(data);
    } catch (err) {
      setError(err.message || 'Failed to load documents');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortDocuments = () => {
    let filtered = [...documents];

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(query) ||
        doc.category.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.uploadedAt) - new Date(a.uploadedAt);
        case 'date_asc':
          return new Date(a.uploadedAt) - new Date(b.uploadedAt);
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'size_desc':
          return b.fileSize - a.fileSize;
        case 'size_asc':
          return a.fileSize - b.fileSize;
        default:
          return 0;
      }
    });

    setFilteredDocuments(filtered);
  };

  const handleDocumentUploaded = (newDocument) => {
    setDocuments([newDocument, ...documents]);
    setShowUploadModal(false);
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await apiService.deleteDocument(documentId);
      setDocuments(documents.filter(doc => doc.id !== documentId));
    } catch (err) {
      alert('Failed to delete document: ' + err.message);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return 'fa-file-pdf text-red-600';
    if (fileType.includes('image')) return 'fa-file-image text-blue-600';
    if (fileType.includes('word') || fileType.includes('document')) return 'fa-file-word text-blue-700';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'fa-file-excel text-green-600';
    return 'fa-file text-gray-600';
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
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryStats = () => {
    return categories.map(cat => ({
      ...cat,
      count: cat.value === 'all' 
        ? documents.length 
        : documents.filter(doc => doc.category === cat.value).length
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-upload"></i>
            <span>Upload Document</span>
          </button>
        </div>
        <p className="text-gray-600">Manage your property documents and files</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="mb-6 bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          {getCategoryStats().map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <i className={`fas ${category.icon}`}></i>
              <span>{category.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                selectedCategory === category.value
                  ? 'bg-blue-500'
                  : 'bg-gray-300'
              }`}>
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Sort Bar */}
      <div className="mb-6 bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search documents by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <i className="fas fa-sort text-gray-400"></i>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="size_desc">Largest First</option>
              <option value="size_asc">Smallest First</option>
            </select>
          </div>
        </div>

        {/* Active Filters Info */}
        {(searchQuery || selectedCategory !== 'all') && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <span>Showing {filteredDocuments.length} of {documents.length} documents</span>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
          <i className="fas fa-folder-open text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery || selectedCategory !== 'all' ? 'No documents found' : 'No documents yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || selectedCategory !== 'all'
              ? 'Try adjusting your filters or search query'
              : 'Upload your first document to get started'}
          </p>
          {!searchQuery && selectedCategory === 'all' && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <i className="fas fa-upload mr-2"></i>
              Upload Document
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => (
            <div
              key={document.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
            >
              {/* Document Preview/Icon */}
              <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center justify-center h-32">
                <i className={`fas ${getFileIcon(document.fileType)} text-5xl`}></i>
              </div>

              {/* Document Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-2">
                    {document.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    document.category === 'lease' ? 'bg-purple-100 text-purple-800' :
                    document.category === 'inspection' ? 'bg-blue-100 text-blue-800' :
                    document.category === 'insurance' ? 'bg-green-100 text-green-800' :
                    document.category === 'utilities' ? 'bg-yellow-100 text-yellow-800' :
                    document.category === 'personal' ? 'bg-pink-100 text-pink-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {document.category}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-calendar text-gray-400"></i>
                    <span>{formatDate(document.uploadedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-hdd text-gray-400"></i>
                    <span>{formatFileSize(document.fileSize)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-user text-gray-400"></i>
                    <span className="truncate">{document.uploadedBy}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedDocument(document)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <i className="fas fa-eye mr-2"></i>
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteDocument(document.id)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <DocumentUpload
          onClose={() => setShowUploadModal(false)}
          onDocumentUploaded={handleDocumentUploaded}
        />
      )}

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
};

export default DocumentList;
