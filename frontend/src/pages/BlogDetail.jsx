import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchBlogById, 
  toggleLikeBlog, 
  addComment, 
  deleteBlog,
  toggleBookmarkBlog,
  reportComment,
  optimisticLikeUpdate,
  optimisticCommentAdd,
  clearError 
} from '../slice/blogSlice';
import DOMPurify from 'dompurify';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  BookmarkPlus, 
  Bookmark,
  Calendar,
  Clock,
  User,
  Edit,
  Trash2,
  ChevronLeft,
  Eye,
  ThumbsUp,
  Send,
  MoreHorizontal,
  Flag,
  AlertCircle,
  CheckCircle,
  Loader,
  Image as ImageIcon
} from 'lucide-react';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { 
    currentBlog, 
    loading, 
    error, 
    deleteLoading,
    bookmarkLoading,
    reportLoading,
    successMessage 
  } = useSelector((state) => state.blog);
  
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(true);
  const [readingTime, setReadingTime] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [replyCommentId, setReplyCommentId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [showReportModal, setShowReportModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [imageLoadError, setImageLoadError] = useState(false);
  const commentsPerPage = 10;

  // Configuration for different environments
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const DEFAULT_FEATURED_IMAGE = 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=600&fit=crop&crop=entropy&auto=format';
  
  // Fallback images for different categories
  const CATEGORY_FALLBACK_IMAGES = {
    technology: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=600&fit=crop&auto=format',
    lifestyle: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop&auto=format',
    travel: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=600&fit=crop&auto=format',
    food: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=1200&h=600&fit=crop&auto=format',
    health: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&h=600&fit=crop&auto=format',
    business: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=600&fit=crop&auto=format',
    default: DEFAULT_FEATURED_IMAGE
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchBlogById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentBlog) {
      const wordCount = currentBlog.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;
      setReadingTime(Math.max(1, Math.ceil(wordCount / 200)));
      setIsBookmarked(currentBlog.isBookmarked || false);
      setImageLoadError(false); // Reset image error state
    }
  }, [currentBlog]);

  // Clear errors after some time
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage, dispatch]);

  // Improved image URL handling
  const getValidImageUrl = (imageData, category = 'default') => {
    // If no image data provided, use category-based fallback
    if (!imageData || imageData === null || imageData === undefined) {
      return CATEGORY_FALLBACK_IMAGES[category?.toLowerCase()] || CATEGORY_FALLBACK_IMAGES.default;
    }

    // Handle different image data formats
    let imageUrl = '';
    
    if (typeof imageData === 'string') {
      imageUrl = imageData;
    } else if (typeof imageData === 'object') {
      // Handle object format (e.g., { url: '...', path: '...', filename: '...' })
      imageUrl = imageData.url || imageData.path || imageData.filename || '';
    }

    // If still no valid URL, use fallback
    if (!imageUrl || imageUrl.trim() === '') {
      return CATEGORY_FALLBACK_IMAGES[category?.toLowerCase()] || CATEGORY_FALLBACK_IMAGES.default;
    }

    // Handle different URL formats
    try {
      // If it's already a full URL (starts with http/https)
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
      }

      // If it's a data URL (base64)
      if (imageUrl.startsWith('data:image/')) {
        return imageUrl;
      }

      // If it's a relative path, construct full URL
      // Remove leading slash if present to avoid double slashes
      const cleanPath = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
      
      // Different possible path formats from database
      if (cleanPath.startsWith('uploads/') || cleanPath.startsWith('images/')) {
        return `${API_BASE_URL}/${cleanPath}`;
      } else {
        // Assume it's in uploads directory
        return `${API_BASE_URL}/uploads/${cleanPath}`;
      }
    } catch (error) {
      console.error('Error processing image URL:', error);
      return CATEGORY_FALLBACK_IMAGES[category?.toLowerCase()] || CATEGORY_FALLBACK_IMAGES.default;
    }
  };

  // Handle image load errors with better fallback
  const handleImageError = (e, category = 'default') => {
    console.error('Image load failed for:', e.target.src);
    
    if (!imageLoadError) {
      setImageLoadError(true);
      // Try category-specific fallback first
      const fallbackUrl = CATEGORY_FALLBACK_IMAGES[category?.toLowerCase()] || CATEGORY_FALLBACK_IMAGES.default;
      
      // Avoid infinite loop by checking if we're already using the fallback
      if (e.target.src !== fallbackUrl) {
        e.target.src = fallbackUrl;
      }
    }
  };

  // Enhanced avatar URL handling
  const getAvatarUrl = (user) => {
    if (!user) return `https://ui-avatars.com/api/?name=User&background=3B82F6&color=fff`;
    
    // If user has avatar
    if (user.avatar) {
      if (typeof user.avatar === 'string') {
        if (user.avatar.startsWith('http')) {
          return user.avatar;
        } else {
          // Construct full URL for relative paths
          const cleanPath = user.avatar.startsWith('/') ? user.avatar.substring(1) : user.avatar;
          return `${API_BASE_URL}/${cleanPath}`;
        }
      }
    }
    
    // Fallback to UI Avatars service
    const name = user.name || user.username || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3B82F6&color=fff&size=128`;
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Optimistic update
    const currentlyLiked = currentBlog.userLiked || currentBlog.likes?.includes(user.id);
    const increment = currentlyLiked ? -1 : 1;
    
    dispatch(optimisticLikeUpdate({ 
      blogId: currentBlog.id || currentBlog._id, 
      increment 
    }));

    try {
      await dispatch(toggleLikeBlog(currentBlog.id || currentBlog._id)).unwrap();
    } catch (err) {
      console.error('Error toggling like:', err);
      // Revert optimistic update on error
      dispatch(optimisticLikeUpdate({ 
        blogId: currentBlog.id || currentBlog._id, 
        increment: -increment 
      }));
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const newBookmarked = !isBookmarked;
    setIsBookmarked(newBookmarked); // Optimistic update

    try {
      await dispatch(toggleBookmarkBlog(currentBlog.id || currentBlog._id)).unwrap();
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      setIsBookmarked(!newBookmarked); // Revert on error
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: currentBlog?.title || 'Blog Post',
      text: currentBlog?.excerpt || 'Check out this blog post!',
      url: window.location.href
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.log('Error sharing:', err);
          fallbackShare();
        }
      }
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch(() => alert('Unable to copy link'));
    } else {
      alert('Sharing not supported on this device');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setCommentLoading(true);

    // Optimistic update
    const tempComment = {
      id: `temp-${Date.now()}`,
      content: comment.trim(),
      author: {
        id: user.id,
        name: user.name,
        avatar: user.avatar
      },
      createdAt: new Date().toISOString(),
      likes: 0,
      isTemporary: true
    };

    dispatch(optimisticCommentAdd({ 
      blogId: currentBlog.id || currentBlog._id, 
      tempComment 
    }));

    try {
      await dispatch(addComment({ 
        blogId: currentBlog.id || currentBlog._id, 
        content: comment.trim() 
      })).unwrap();
      
      setComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleReply = async (e, commentId, content) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const tempReply = {
      id: `temp-${Date.now()}`,
      content: content.trim(),
      author: {
        id: user.id,
        name: user.name,
        avatar: user.avatar
      },
      createdAt: new Date().toISOString(),
      likes: 0,
      parentId: commentId,
      isTemporary: true
    };

    dispatch(optimisticCommentAdd({ 
      blogId: currentBlog.id || currentBlog._id, 
      tempComment: tempReply 
    }));

    try {
      await dispatch(addComment({ 
        blogId: currentBlog.id || currentBlog._id, 
        content: content.trim(),
        parentId: commentId 
      })).unwrap();
      
      setReplyContent('');
      setReplyCommentId(null);
    } catch (err) {
      console.error('Error adding reply:', err);
    }
  };

  const handleReport = async (commentId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await dispatch(reportComment({ 
        blogId: currentBlog.id || currentBlog._id, 
        commentId 
      })).unwrap();
      setShowReportModal(null);
    } catch (err) {
      console.error('Error reporting comment:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteBlog(currentBlog.id || currentBlog._id)).unwrap();
      setShowDeleteModal(false);
      navigate('/dashboard'); // Redirect to dashboard after deletion
    } catch (err) {
      console.error('Error deleting blog:', err);
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isAuthor = currentBlog && user && (
    (currentBlog.author?.id || currentBlog.author?._id) === user.id ||
    user.role === 'admin'
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !currentBlog) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {error || 'Blog not found'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error === 'Blog not found' ? 
              'The blog post you\'re looking for doesn\'t exist or has been removed.' :
              'There was an error loading this blog post.'
            }
          </p>
          <div className="space-x-4">
            <button 
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
            <button 
              onClick={() => navigate('/blogs')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Blogs
            </button>
          </div>
        </div>
      </div>
    );
  }

  const likesCount = currentBlog.likesCount || currentBlog.likes?.length || 0;
  const isLiked = currentBlog.userLiked || currentBlog.likes?.includes(user?.id);
  const commentsCount = currentBlog.commentsCount || currentBlog.comments?.length || 0;

  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = currentBlog.comments
    ?.filter((comment) => !comment.parentId)
    .slice(indexOfFirstComment, indexOfLastComment) || [];

  const totalPages = Math.ceil(
    (currentBlog.comments?.filter((comment) => !comment.parentId).length || 0) / commentsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="flex items-center space-x-3">
              {isAuthor && (
                <>
                  <Link
                    to={`/blog/edit/${currentBlog.id || currentBlog._id}`}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Edit blog"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button 
                    onClick={() => setShowDeleteModal(true)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete blog"
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </>
              )}
              <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Featured Image with better error handling */}
        <div className="relative mb-6 sm:mb-8 rounded-xl sm:rounded-2xl overflow-hidden aspect-video group">
          <img
            src={getValidImageUrl(currentBlog.featuredImage, currentBlog.category)}
            alt={currentBlog.title || 'Blog featured image'}
            onError={(e) => handleImageError(e, currentBlog.category)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            role="img"
            aria-describedby="blog-title"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          
          {/* Image loading indicator */}
          {!currentBlog.featuredImage && (
            <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <ImageIcon className="w-3 h-3 mr-1" />
              Stock Image
            </div>
          )}
        </div>

        {/* Header */}
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full font-medium">
              {currentBlog.category}
            </span>
            <div className="flex flex-wrap gap-2">
              {currentBlog.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-4" id="blog-title">
            {currentBlog.title}
          </h1>

          {currentBlog.excerpt && (
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 italic leading-relaxed">
              {currentBlog.excerpt}
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Link to={`/profile/${currentBlog.author?.id || currentBlog.author?._id}`} className="flex-shrink-0">
                <img
                  src={getAvatarUrl(currentBlog.author)}
                  alt={`${currentBlog.author?.name || 'User'}'s avatar`}
                  onError={(e) => {
                    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentBlog.author?.name || 'User')}&background=3B82F6&color=fff`;
                    if (e.target.src !== fallbackUrl) {
                      e.target.src = fallbackUrl;
                    }
                  }}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
                />
              </Link>
              <div>
                <Link
                  to={`/profile/${currentBlog.author?.id || currentBlog.author?._id}`}
                  className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {currentBlog.author?.name || 'Unknown Author'}
                </Link>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(currentBlog.createdAt)}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {readingTime} min read
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {currentBlog.views || 0} views
              </span>
              <span className="flex items-center">
                <ThumbsUp className="w-4 h-4 mr-1" />
                {likesCount} likes
              </span>
              <span className="flex items-center">
                <MessageCircle className="w-4 h-4 mr-1" />
                {commentsCount} comments
              </span>
            </div>
          </div>
        </header>

        {/* Action Bar */}
        <div className="flex items-center justify-between py-4 border-y border-gray-200 dark:border-gray-700 mb-6 sm:mb-8">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLike}
              disabled={!isAuthenticated}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                isLiked
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label={isLiked ? 'Unlike blog post' : 'Like blog post'}
              aria-pressed={isLiked}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{likesCount}</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label={showComments ? 'Hide comments' : 'Show comments'}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="hidden sm:inline">{commentsCount}</span>
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleBookmark}
              disabled={bookmarkLoading || !isAuthenticated}
              className={`p-2 rounded-lg transition-all ${
                isBookmarked
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              {bookmarkLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : isBookmarked ? (
                <Bookmark className="w-5 h-5 fill-current" />
              ) : (
                <BookmarkPlus className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Share blog post"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <Flag className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert prose-blue max-w-none mb-8 sm:mb-12">
          <div
            className="text-gray-900 dark:text-gray-100 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentBlog.content) }}
          />
        </div>

        {/* Author Card with better avatar handling */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to={`/profile/${currentBlog.author?.id || currentBlog.author?._id}`} className="flex-shrink-0">
              <img
                src={getAvatarUrl(currentBlog.author)}
                alt={`${currentBlog.author?.name || 'User'}'s avatar`}
                onError={(e) => {
                  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentBlog.author?.name || 'User')}&background=3B82F6&color=fff`;
                  if (e.target.src !== fallbackUrl) {
                    e.target.src = fallbackUrl;
                  }
                }}
                className="w-16 h-16 rounded-full object-cover"
              />
            </Link>
            <div className="flex-1">
              <Link
                to={`/profile/${currentBlog.author?.id || currentBlog.author?._id}`}
                className="text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {currentBlog.author?.name || 'Unknown Author'}
              </Link>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {currentBlog.author?.bio || 'No bio available.'}
              </p>
              <button className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
                Follow
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Comments ({commentsCount})
              </h3>
              {isAuthenticated ? (
                <form onSubmit={handleComment} className="space-y-4">
                  <div className="flex space-x-3">
                    <img
                      src={getAvatarUrl(user)}
                      alt="Your avatar"
                      onError={(e) => {
                        const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=3B82F6&color=fff`;
                        if (e.target.src !== fallbackUrl) {
                          e.target.src = fallbackUrl;
                        }
                      }}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your thoughts..."
                        className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                        rows="3"
                        maxLength="500"
                        aria-label="Comment input"
                        id="comment-input"
                      />
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {comment.length}/500
                        </span>
                        <button
                          type="submit"
                          disabled={!comment.trim() || commentLoading}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                        >
                          {commentLoading ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          <span>Comment</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="text-center py-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400 mb-3">Join the conversation!</p>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Sign in to comment
                  </Link>
                </div>
              )}
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {currentComments.length > 0 ? (
                currentComments.map((comment) => (
                  <div key={comment.id || comment._id} className="p-6">
                    <div className="flex space-x-3">
                      <img
                        src={getAvatarUrl(comment.author)}
                        alt={`${comment.author?.name || 'User'}'s avatar`}
                        onError={(e) => {
                          const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author?.name || 'User')}&background=3B82F6&color=fff`;
                          if (e.target.src !== fallbackUrl) {
                            e.target.src = fallbackUrl;
                          }
                        }}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {comment.author?.name}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(comment.createdAt)}
                          </span>
                          {comment.isTemporary && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              Posting...
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-3">
                          {comment.content}
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <button className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{comment.likes || 0}</span>
                          </button>
                          <button
                            onClick={() => setReplyCommentId(replyCommentId === (comment.id || comment._id) ? null : comment.id || comment._id)}
                            className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            aria-label="Reply to comment"
                          >
                            Reply
                          </button>
                          <button
                            onClick={() => setShowReportModal(comment.id || comment._id)}
                            className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            aria-label="Report comment"
                          >
                            <Flag className="w-4 h-4" />
                          </button>
                        </div>
                        {/* Reply Form */}
                        {replyCommentId === (comment.id || comment._id) && (
                          <form
                            onSubmit={(e) => handleReply(e, comment.id || comment._id, replyContent)}
                            className="mt-4 ml-8"
                          >
                            <div className="flex space-x-3">
                              <img
                                src={getAvatarUrl(user)}
                                alt="Your avatar"
                                onError={(e) => {
                                  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=3B82F6&color=fff`;
                                  if (e.target.src !== fallbackUrl) {
                                    e.target.src = fallbackUrl;
                                  }
                                }}
                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                              />
                              <div className="flex-1">
                                <textarea
                                  value={replyContent}
                                  onChange={(e) => setReplyContent(e.target.value)}
                                  placeholder="Write a reply..."
                                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                                  rows="2"
                                  maxLength="500"
                                  aria-label="Reply input"
                                />
                                <div className="flex justify-between items-center mt-2">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {replyContent.length}/500
                                  </span>
                                  <div className="space-x-2">
                                    <button
                                      type="button"
                                      onClick={() => setReplyCommentId(null)}
                                      className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="submit"
                                      disabled={!replyContent.trim()}
                                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                    >
                                      Reply
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </form>
                        )}
                        {/* Nested Replies */}
                        {currentBlog.comments
                          ?.filter((reply) => reply.parentId === (comment.id || comment._id))
                          .map((reply) => (
                            <div key={reply.id || reply._id} className="mt-4 ml-8">
                              <div className="flex space-x-3">
                                <img
                                  src={getAvatarUrl(reply.author)}
                                  alt={`${reply.author?.name || 'User'}'s avatar`}
                                  onError={(e) => {
                                    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.author?.name || 'User')}&background=3B82F6&color=fff`;
                                    if (e.target.src !== fallbackUrl) {
                                      e.target.src = fallbackUrl;
                                    }
                                  }}
                                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                      {reply.author?.name}
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                      {formatDate(reply.createdAt)}
                                    </span>
                                    {reply.isTemporary && (
                                      <span className="text-xs text-gray-400 dark:text-gray-500">
                                        Posting...
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                                    {reply.content}
                                  </p>
                                  <div className="flex items-center space-x-4 text-sm">
                                    <button className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                      <ThumbsUp className="w-4 h-4" />
                                      <span>{reply.likes || 0}</span>
                                    </button>
                                    <button
                                      onClick={() => setShowReportModal(reply.id || reply._id)}
                                      className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                      aria-label="Report reply"
                                    >
                                      <Flag className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-600 dark:text-gray-400">
                  No comments yet. Be the first to comment!
                </div>
              )}
              {totalPages > 1 && (
                <div className="p-6 flex justify-between items-center border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 transition-colors"
                    aria-label="Previous comments page"
                  >
                    Previous
                  </button>
                  <span className="text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 transition-colors"
                    aria-label="Next comments page"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </article>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowDeleteModal(false)}
            />
            <div className="relative inline-block w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-xl">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
                Delete Blog Post
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                Are you sure you want to delete this blog post? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  {deleteLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Confirmation Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowReportModal(null)}
            />
            <div className="relative inline-block w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-xl">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <Flag className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
                Report Comment
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                Are you sure you want to report this comment? Please confirm to proceed.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowReportModal(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReport(showReportModal)}
                  disabled={reportLoading}
                  className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  {reportLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    'Report'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Messages */}
      {(error || successMessage) && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
          <div className={`border rounded-lg p-4 shadow-lg flex items-center justify-between ${
            successMessage 
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
              : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              {successMessage ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
              <p className="text-sm text-gray-900 dark:text-white">
                {successMessage || error}
              </p>
            </div>
            <button
              onClick={() => dispatch(clearError())}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              aria-label="Dismiss notification"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogDetail;