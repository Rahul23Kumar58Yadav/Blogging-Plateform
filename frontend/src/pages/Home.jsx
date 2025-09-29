import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchBlogs } from '../slice/blogSlice';
import { 
  Search, Filter, X, Calendar, Eye, Heart, User, BookOpen, ChevronLeft, ChevronRight,
  TrendingUp, Award, Clock, Globe, Users, FileText, Bookmark, Share2, 
  BarChart3, Zap, Star, MessageCircle, ThumbsUp
} from 'lucide-react';

const Home = () => {
  const dispatch = useDispatch();
  const { blogs, loading, error, totalCount, currentPage: reduxCurrentPage, totalPages, hasMore } = useSelector((state) => state.blog);
  const { user, isAuthenticated, token } = useSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [localCurrentPage, setLocalCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());

  const blogsPerPage = 12;

  // Stats data
  const stats = [
    { icon: Users, label: 'Active Users', value: '50K+', color: 'from-cyan-500 to-blue-500' },
    { icon: FileText, label: 'Blog Posts', value: '1M+', color: 'from-purple-500 to-pink-500' },
    { icon: Globe, label: 'Countries', value: '120+', color: 'from-teal-500 to-emerald-500' },
    { icon: Award, label: 'Uptime', value: '99.9%', color: 'from-orange-500 to-red-500' }
  ];

  const categories = [
    { name: 'all', label: 'All Categories', icon: BookOpen },
    { name: 'Technology', label: 'Technology', icon: Zap },
    { name: 'Science', label: 'Science', icon: BarChart3 },
    { name: 'Business', label: 'Business', icon: TrendingUp },
    { name: 'Health', label: 'Health', icon: Heart },
    { name: 'Lifestyle', label: 'Lifestyle', icon: Star },
    { name: 'Travel', label: 'Travel', icon: Globe }
  ];

  useEffect(() => {
    console.log('Fetching blogs with params:', {
      page: localCurrentPage,
      limit: blogsPerPage,
      status: 'published',
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      sort: sortBy,
      query: searchQuery || undefined,
      token: token ? 'Present' : 'Missing',
    });
    dispatch(
      fetchBlogs({
        page: localCurrentPage,
        limit: blogsPerPage,
        status: 'published',
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        sort: sortBy,
        query: searchQuery || undefined,
        token,
      })
    )
      .unwrap()
      .then((result) => console.log('Fetch blogs success:', result))
      .catch((err) => console.error('Fetch blogs error:', err));
  }, [dispatch, localCurrentPage, selectedCategory, sortBy, searchQuery, token]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('newest');
    setLocalCurrentPage(1);
  };

  const handleBookmark = (blogId) => {
    setBookmarkedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blogId)) {
        newSet.delete(blogId);
      } else {
        newSet.add(blogId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getReadingTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content?.split(' ').length || 0;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime > 0 ? `${readingTime} min read` : '1 min read';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent mx-auto mb-4"></div>
            <div className="animate-pulse absolute inset-0 rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto opacity-50"></div>
          </div>
          <p className="text-lg text-slate-300">Loading amazing blogs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          <div className="text-red-400 mb-6">
            <X className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
          <p className="text-slate-400 mb-8">{error}</p>
          <button
            onClick={() =>
              dispatch(
                fetchBlogs({ page: 1, limit: blogsPerPage, status: 'published', token })
              )
            }
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Hero Section with Stats */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Content */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-2xl mr-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  BlogCraft
                </span>
              </h1>
              <span className="ml-3 bg-emerald-500 text-white text-sm px-3 py-1 rounded-full font-semibold">
                LIVE
              </span>
            </div>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Craft. Share. Inspire. Empowering creators worldwide with AI-powered blogging tools 
              that transform ideas into compelling stories.
            </p>
            {isAuthenticated && (
              <Link
                to="/blog/edit/new"
                className="inline-flex items-center bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Writing
                <span className="ml-2 bg-white/20 text-xs px-2 py-1 rounded-full">NEW</span>
              </Link>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for stories, topics, or authors..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setLocalCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-400"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => {
                    setSelectedCategory(category.name);
                    setLocalCurrentPage(1);
                  }}
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category.name
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <category.icon className="w-4 h-4 mr-2" />
                  {category.label}
                </button>
              ))}
            </div>

            {/* Advanced Filters */}
            <div className="flex justify-center items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center text-slate-400 hover:text-cyan-400 font-medium transition-colors duration-200"
              >
                <Filter className="w-4 h-4 mr-2" />
                Advanced Filters
              </button>
              
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <span>View:</span>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-slate-700 text-white' : 'hover:bg-slate-700'
                  }`}
                >
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-slate-700 text-white' : 'hover:bg-slate-700'
                  }`}
                >
                  <div className="w-4 h-4 flex flex-col gap-1">
                    <div className="bg-current h-0.5 rounded"></div>
                    <div className="bg-current h-0.5 rounded"></div>
                    <div className="bg-current h-0.5 rounded"></div>
                  </div>
                </button>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setLocalCurrentPage(1);
                      }}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="popular">Most Liked</option>
                      <option value="mostViewed">Most Viewed</option>
                      <option value="alphabetical">A-Z</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">Reading Time</label>
                    <select className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white">
                      <option value="all">All Lengths</option>
                      <option value="short">Quick Read (1-3 min)</option>
                      <option value="medium">Medium (4-10 min)</option>
                      <option value="long">Long Read (10+ min)</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleClearFilters}
                      className="w-full bg-slate-600 hover:bg-slate-500 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Results Header */}
        {!loading && totalCount > 0 && (
          <div className="flex justify-between items-center mb-8">
            <div className="text-slate-400">
              Showing <span className="text-white font-semibold">{blogs.length}</span> of{' '}
              <span className="text-white font-semibold">{totalCount}</span> stories
              {selectedCategory !== 'all' && (
                <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  {selectedCategory}
                </span>
              )}
            </div>
            <div className="text-sm text-slate-400">
              Page {reduxCurrentPage} of {totalPages}
            </div>
          </div>
        )}

        {blogs.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-slate-800 rounded-3xl p-12 max-w-md mx-auto border border-slate-700">
              <BookOpen className="w-20 h-20 text-slate-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">No stories found</h3>
              <p className="text-slate-400 mb-8">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filters to discover more content.'
                  : 'Be the first to share your thoughts and experiences with the community.'
                }
              </p>
              {isAuthenticated && (
                <Link
                  to="/blog/edit/new"
                  className="inline-flex items-center bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Create Your First Story
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'}>
            {blogs.map((blog) => (
              <article
                key={blog._id}
                className={`group cursor-pointer transition-all duration-300 ${
                  viewMode === 'grid'
                    ? 'bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-slate-600 hover:shadow-2xl hover:shadow-cyan-500/10'
                    : 'bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 flex items-center space-x-6'
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Blog Image */}
                    <div className="h-48 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300"></div>
                      <div className="absolute top-4 left-4 flex space-x-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-sm text-white border border-white/20">
                          {blog.category}
                        </span>
                        {blog.featured && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-500 to-red-500 text-white">
                            Featured
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleBookmark(blog._id);
                        }}
                        className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                          bookmarkedPosts.has(blog._id)
                            ? 'bg-yellow-500 text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                        }`}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-cyan-400 transition-colors duration-200">
                        {blog.title}
                      </h3>
                      
                      <p className="text-slate-400 mb-4 line-clamp-3 text-sm">
                        {blog.excerpt || (blog.content ? blog.content.substring(0, 120) + '...' : 'No excerpt available.')}
                      </p>

                      <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            <span>{blog.author?.name || 'Anonymous'}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{getReadingTime(blog.content)}</span>
                          </div>
                        </div>
                        {blog.createdAt && (
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>{formatDate(blog.createdAt)}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center text-red-400">
                            <Heart className="w-4 h-4 mr-1" />
                            <span>{blog.likes || 0}</span>
                          </div>
                          <div className="flex items-center text-blue-400">
                            <Eye className="w-4 h-4 mr-1" />
                            <span>{blog.views || 0}</span>
                          </div>
                          <div className="flex items-center text-emerald-400">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            <span>{blog.comments || 0}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200">
                            <Share2 className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/blog/${blog._id}`}
                            className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium text-sm transition-colors duration-200 group/link"
                          >
                            Read More
                            <ChevronRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform duration-200" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* List View */}
                    <div className="w-32 h-20 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 rounded-xl flex-shrink-0 relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/20"></div>
                      <span className="absolute bottom-1 left-1 px-2 py-0.5 rounded text-xs font-medium bg-white/20 text-white">
                        {blog.category}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors duration-200 line-clamp-1">
                          {blog.title}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleBookmark(blog._id);
                          }}
                          className={`p-1.5 rounded-lg transition-all duration-200 ${
                            bookmarkedPosts.has(blog._id)
                              ? 'bg-yellow-500 text-white'
                              : 'text-slate-400 hover:text-white hover:bg-slate-700'
                          }`}
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                        {blog.excerpt || (blog.content ? blog.content.substring(0, 100) + '...' : 'No excerpt available.')}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                          <span>{blog.author?.name}</span>
                          <span>{getReadingTime(blog.content)}</span>
                          <span>{formatDate(blog.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-xs">
                          <div className="flex items-center text-red-400">
                            <Heart className="w-3 h-3 mr-1" />
                            <span>{blog.likes || 0}</span>
                          </div>
                          <div className="flex items-center text-blue-400">
                            <Eye className="w-3 h-3 mr-1" />
                            <span>{blog.views || 0}</span>
                          </div>
                          <Link
                            to={`/blog/${blog._id}`}
                            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-200"
                          >
                            Read →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-16 space-x-2">
            <button
              onClick={() => setLocalCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={reduxCurrentPage === 1}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                reduxCurrentPage === 1
                  ? 'text-slate-500 bg-slate-800 cursor-not-allowed border border-slate-700'
                  : 'text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-500'
              }`}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>

            <div className="flex items-center px-6 py-2 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-600 rounded-lg">
              <span className="text-cyan-400">{reduxCurrentPage}</span>
              <span className="mx-2 text-slate-500">/</span>
              <span>{totalPages}</span>
            </div>

            <button
              onClick={() => setLocalCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={reduxCurrentPage === totalPages || !hasMore}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                reduxCurrentPage === totalPages || !hasMore
                  ? 'text-slate-500 bg-slate-800 cursor-not-allowed border border-slate-700'
                  : 'text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-500'
              }`}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;