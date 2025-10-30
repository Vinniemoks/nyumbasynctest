import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../../api/api';

const CreatePost = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Other'
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    { value: 'Services', label: 'Services', icon: 'fas fa-hands-helping', description: 'Offer or request services' },
    { value: 'For Sale', label: 'For Sale', icon: 'fas fa-tag', description: 'Sell items to neighbors' },
    { value: 'Lost & Found', label: 'Lost & Found', icon: 'fas fa-search', description: 'Report lost or found items' },
    { value: 'Carpool', label: 'Carpool', icon: 'fas fa-car', description: 'Find carpool partners' },
    { value: 'Activities', label: 'Activities', icon: 'fas fa-calendar-alt', description: 'Organize community activities' },
    { value: 'Other', label: 'Other', icon: 'fas fa-ellipsis-h', description: 'General posts' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Please enter a title for your post');
      return false;
    }
    if (formData.title.trim().length < 5) {
      setError('Title must be at least 5 characters long');
      return false;
    }
    if (!formData.content.trim()) {
      setError('Please enter content for your post');
      return false;
    }
    if (formData.content.trim().length < 10) {
      setError('Content must be at least 10 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const postData = {
        ...formData,
        image: image
      };

      await apiService.createBulletinPost(postData);
      
      // Navigate back to bulletin board
      navigate('/tenant-dashboard/community/bulletin');
    } catch (err) {
      setError(err.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/tenant-dashboard/community/bulletin')}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Bulletin Board
        </button>
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <i className="fas fa-plus-circle text-blue-600 mr-3"></i>
          Create New Post
        </h1>
        <p className="text-gray-600 mt-2">
          Share information, services, or items with your community
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <i className="fas fa-exclamation-circle text-red-600 mt-0.5 mr-3"></i>
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
        {/* Category Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Category <span className="text-red-600">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  formData.category === category.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <i className={`${category.icon} text-2xl ${
                    formData.category === category.value ? 'text-blue-600' : 'text-gray-400'
                  }`}></i>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      formData.category === category.value ? 'text-blue-800' : 'text-gray-700'
                    }`}>
                      {category.label}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{category.description}</p>
                  </div>
                  {formData.category === category.value && (
                    <i className="fas fa-check-circle text-blue-600"></i>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Post Title <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter a clear, descriptive title..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={100}
          />
          <p className="text-sm text-gray-500 mt-1">
            {formData.title.length}/100 characters
          </p>
        </div>

        {/* Content */}
        <div className="mb-6">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Post Content <span className="text-red-600">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            rows={8}
            placeholder="Describe your post in detail. Include relevant information like pricing, availability, contact details, etc..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={1000}
          />
          <p className="text-sm text-gray-500 mt-1">
            {formData.content.length}/1000 characters
          </p>
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Image (Optional)
          </label>
          <p className="text-sm text-gray-600 mb-3">
            Upload an image to make your post more engaging. Maximum size: 5MB
          </p>
          
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="image"
                className="cursor-pointer"
              >
                <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-3"></i>
                <p className="text-gray-600 font-medium">Click to upload image</p>
                <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
              </label>
            </div>
          )}
        </div>

        {/* Guidelines */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <i className="fas fa-info-circle text-blue-600 mt-0.5 mr-3"></i>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Community Guidelines</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Be respectful and courteous to all community members</li>
                <li>Keep posts relevant to the selected category</li>
                <li>Do not share personal contact information publicly</li>
                <li>No spam, advertising, or promotional content</li>
                <li>Report inappropriate content to property management</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/tenant-dashboard/community/bulletin')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Publishing...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane mr-2"></i>
                Publish Post
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
