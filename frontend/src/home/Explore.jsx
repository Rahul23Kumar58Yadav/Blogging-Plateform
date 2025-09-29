import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Heart, 
  MessageCircle, 
  Eye, 
  Clock, 
  TrendingUp,
  Star,
  ChevronDown,
  Grid3X3,
  List,
  SlidersHorizontal,
  X,
  ArrowUp,
  Bookmark,
  Share2,
  User
} from 'lucide-react';

const ExplorePage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('latest');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState('all');

  // Mock data
  const blogs = [
    {
      id: 1,
      title: "Advanced React Patterns and Performance Optimization",
      excerpt: "Learn how to optimize your React applications using advanced patterns like compound components, render props, and custom hooks for better performance.",
      author: {
        name: "John Doe",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
        verified: true
      },
      category: "Web Development",
      tags: ["React", "Performance", "JavaScript"],
      readTime: 12,
      publishedAt: "2024-01-15T10:30:00Z",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop",
      likes: 456,
      comments: 78,
      views: 3247,
      bookmarks: 234,
      featured: true,
      difficulty: "Advanced"
    },
    {
      id: 2,
      title: "Building Scalable Microservices with Node.js and Docker",
      excerpt: "A comprehensive guide to building and deploying microservices architecture using Node.js, Docker, and Kubernetes in production environments.",
      author: {
        name: "Sarah Johnson",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
        verified: false
      },
      category: "Backend",
      tags: ["Node.js", "Docker", "Microservices", "DevOps"],
      readTime: 18,
      publishedAt: "2024-01-14T14:20:00Z",
      image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=400&fit=crop",
      likes: 321,
      comments: 45,
      views: 2156,
      bookmarks: 187,
      featured: false,
      difficulty: "Intermediate"
    },
    {
      id: 3,
      title: "Machine Learning Fundamentals: From Theory to Practice",
      excerpt: "Understanding the core concepts of machine learning and implementing your first ML models using Python, scikit-learn, and TensorFlow.",
      author: {
        name: "Dr. Emily Chen",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b977?w=40&h=40&fit=crop&crop=face",
        verified: true
      },
      category: "AI & ML",
      tags: ["Python", "Machine Learning", "Data Science"],
      readTime: 25,
      publishedAt: "2024-01-13T09:15:00Z",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
      likes: 789,
      comments: 156,
      views: 4521,
      bookmarks: 567,
      featured: true,
      difficulty: "Beginner"
    },
    {
      id: 4,
      title: "Modern CSS Grid and Flexbox: Complete Layout Guide",
      excerpt: "Master modern CSS layout techniques with Grid and Flexbox. Learn responsive design patterns and create beautiful, flexible layouts.",
      author: {
        name: "Alex Rivera",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
        verified: false
      },
      category: "Web Design",
      tags: ["CSS", "Grid", "Flexbox", "Responsive"],
      readTime: 15,
      publishedAt: "2024-01-12T16:45:00Z",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=400&fit=crop",
      likes: 234,
      comments: 32,
      views: 1876,
      bookmarks: 145,
      featured: false,
      difficulty: "Intermediate"
    },
    {
      id: 5,
      title: "Cybersecurity Best Practices for Web Developers",
      excerpt: "Essential security practices every web developer should know to protect applications from common vulnerabilities and attacks.",
      author: {
        name: "Mike Thompson",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face",
        verified: true
      },
      category: "Security",
      tags: ["Security", "Web Development", "Best Practices"],
      readTime: 20,
      publishedAt: "2024-01-11T11:30:00Z",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop",
      likes: 445,
      comments: 89,
      views: 2934,
      bookmarks: 298,
      featured: false,
      difficulty: "Intermediate"
    },
    {
      id: 6,
      title: "Introduction to Progressive Web Apps (PWAs)",
      excerpt: "Learn how to build Progressive Web Apps that work offline, send push notifications, and provide native app-like experiences.",
      author: {
        name: "Lisa Wang",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=40&h=40&fit=crop&crop=face",
        verified: false
      },
      category: "Mobile Development",
      tags: ["PWA", "JavaScript", "Service Workers"],
      readTime: 16,
      publishedAt: "2024-01-10T13:20:00Z",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop",
      likes: 356,
      comments: 67,
      views: 2145,
      bookmarks: 189,
      featured: false,
      difficulty: "Intermediate"
    }
  ];

  const categories = [
    'all', 'Web Development', 'Backend', 'AI & ML', 'Web Design', 
    'Security', 'Mobile Development', 'DevOps', 'Data Science'
  ];

  const allTags = [
    'React', 'JavaScript', 'Node.js', 'Python', 'CSS', 'Docker', 
    'Machine Learning', 'Security', 'PWA', 'Performance', 'DevOps'
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'trending', label: 'Trending' },
    { value: 'most_liked', label: 'Most Liked' },
    { value: 'most_viewed', label: 'Most Viewed' }
  ];

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const filteredBlogs = blogs
    .filter(blog => {
      const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           blog.author.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || blog.category === selectedCategory;
      const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => blog.tags.includes(tag));
      return matchesSearch && matchesCategory && matchesTags;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular': return b.views - a.views;
        case 'trending': return (b.views + b.likes + b.comments) - (a.views + a.likes + a.comments);
        case 'most_liked': return b.likes - a.likes;
        case 'most_viewed': return b.views - a.views;
        case 'latest':
        default: return new Date(b.publishedAt) - new Date(a.publishedAt);
      }
    });

  const BlogCard = ({ blog, isListView = false }) => (
    <article className={`group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700 ${isListView ? 'flex' : ''}`}>
      <div className={`${isListView ? 'w-64 flex-shrink-0' : 'aspect-w-16 aspect-h-9'}`}>
        <img
          src={blog.image}
          alt={blog.title}
          className={`${isListView ? 'w-full h-full' : 'w-full h-48'} object-cover group-hover:scale-105 transition-transform duration-300`}
        />
        {blog.featured && (
          <div className="absolute top-3 left-3">
            <div className="flex items-center px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </div>
          </div>
        )}
      </div>
      
      <div className={`${isListView ? 'flex-1' : ''} p-6`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-medium rounded-full">
              {blog.category}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(blog.difficulty)}`}>
              {blog.difficulty}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
              <Bookmark className="w-4 h-4 text-gray-400 hover:text-blue-500" />
            </button>
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
              <Share2 className="w-4 h-4 text-gray-400 hover:text-blue-500" />
            </button>
          </div>
        </div>
        
        <h3 className={`font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 ${isListView ? 'text-lg' : 'text-xl'}`}>
          {blog.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 text-sm">
          {blog.excerpt}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {blog.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-300 cursor-pointer transition-colors">
              #{tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={blog.author.avatar}
              alt={blog.author.name}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <div className="flex items-center">
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {blog.author.name}
                </p>
                {blog.author.verified && (
                  <div className="w-4 h-4 ml-1 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
              <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs space-x-2">
                <span>{formatDate(blog.publishedAt)}</span>
                <span>•</span>
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {blog.readTime}m
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400 text-sm">
            <div className="flex items-center hover:text-red-500 transition-colors cursor-pointer">
              <Heart className="w-4 h-4 mr-1" />
              {formatNumber(blog.likes)}
            </div>
            <div className="flex items-center hover:text-blue-500 transition-colors cursor-pointer">
              <MessageCircle className="w-4 h-4 mr-1" />
              {blog.comments}
            </div>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {formatNumber(blog.views)}
            </div>
          </div>
        </div>
      </div>
    </article>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                Explore Articles
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Discover {filteredBlogs.length} articles across various topics
              </p>
            </div>
            
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? '🌞' : '🌙'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles, authors, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-wrap items-center gap-3">
              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 6).map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category === 'all' ? 'All' : category}
                  </button>
                ))}
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                    showFilters ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </button>
              </div>
            </div>

            {/* View Controls */}
            <div className="flex items-center space-x-4">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>

              {/* View Mode */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' ? 'bg-white dark:bg-gray-600 text-blue-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' ? 'bg-white dark:bg-gray-600 text-blue-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tags */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          selectedTags.includes(tag)
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Date Range</h4>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    {dateOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedTags([]);
                      setDateRange('all');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors text-sm font-medium"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 dark:text-gray-300">
            Showing {filteredBlogs.length} articles
            {selectedCategory !== 'all' && ` in ${selectedCategory}`}
            {selectedTags.length > 0 && ` tagged with ${selectedTags.join(', ')}`}
          </p>
          
          {filteredBlogs.length > 0 && (
            <button className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              <ArrowUp className="w-4 h-4 mr-1" />
              Back to top
            </button>
          )}
        </div>

        {/* Articles Grid/List */}
        {filteredBlogs.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
            : 'space-y-6'
          }>
            {filteredBlogs.map(blog => (
              <BlogCard key={blog.id} blog={blog} isListView={viewMode === 'list'} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No articles found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedTags([]);
                setDateRange('all');
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Load More */}
        {filteredBlogs.length > 0 && (
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium">
              Load More Articles
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;