import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../../../api/api';

const BulletinBoard = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');


  const categories = [
    { value: 'all', label: 'All Posts', icon: 'fas fa-th' },
    { value: 'Services', label: 'Services', icon: 'fas fa-hands-helping' },
    { value: 'For Sale', label: 'For Sale', icon: 'fas fa-tag' },
    { value: 'Lost & Found', label: 'Lost & Found', icon: 'fas fa-search' },
    { value: 'Carpool', label: 'Carpool', icon: 'fas fa-car' },
    { value: 'Activities', label: 'Activities', icon: 'fas fa-calendar-alt' },
    { value: 'Other', label: 'Other', icon: 'fas fa-ellipsis-h' }
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getBulletinPosts();
      setPosts(data);
    } catch (err) {
      setError(err.message || 'Failed to load bulletin posts');
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    return post.category === filter;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Services':
        return 'bg-blue-100 text-blue-800';
      case 'For Sale':
        return 'bg-green-100 text-green-800';
      case 'Lost & Found':
        return 'bg-red-100 text-red-800';
      case 'Carpool':
        return 'bg-purple-100 text-purple-800';
      case 'Activities':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Loading bulletin board...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <i className="fas fa-exclamation-circle text-red-600 text-4xl mb-4"></i>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Posts</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchPosts}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <i className="fas fa-redo mr-2"></i>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <i className="fas fa-comments text-blue-600 mr-3"></i>
              Community Bulletin Board
            </h1>
            <p className="text-gray-600 mt-2">Connect with your neighbors and share information</p>
          </div>
          <div className="flex space-x-3">
            <Link
              to="/tenant-dashboard/community"
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              <i className="fas fa-bullhorn mr-2"></i>
              Announcements
            </Link>
            <button
              onClick={() => navigate('/tenant-dashboard/community/bulletin/create')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <i className="fas fa-plus mr-2"></i>
              Create Post
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setFilter(category.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                filter === category.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <i className={`${category.icon} mr-2`}></i>
              {category.label}
              {category.value !== 'all' && (
                <span className="ml-2 text-xs">
                  ({posts.filter(p => p.category === category.value).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <i className="fas fa-inbox text-gray-400 text-5xl mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Posts Yet</h3>
          <p className="text-gray-600 mb-4">
            {filter === 'all'
              ? 'Be the first to post on the community bulletin board!'
              : `No posts in the ${filter} category yet.`}
          </p>
          <button
            onClick={() => navigate('/tenant-dashboard/community/bulletin/create')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-plus mr-2"></i>
            Create First Post
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Post Image */}
              {post.image && (
                <div className="h-48 overflow-hidden bg-gray-100">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Post Content */}
              <div className="p-5">
                {/* Category Badge */}
                <div className="mb-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                    {post.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{post.title}</h3>

                {/* Content */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 whitespace-pre-line">
                  {post.content}
                </p>

                {/* Author and Date */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-blue-600 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{post.author}</p>
                      <p className="text-xs text-gray-500">{post.authorUnit}</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <i className="fas fa-clock mr-1"></i>
                    {formatDate(post.postedAt)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}


    </div>
  );
};

export default BulletinBoard;
