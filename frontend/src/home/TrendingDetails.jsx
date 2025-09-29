import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Flame, 
  Eye, 
  Heart, 
  MessageCircle, 
  Calendar, 
  Clock, 
  User,
  Share2,
  Bookmark,
  ChevronUp,
  ChevronDown,
  Filter,
  Search,
  Star,
  Award,
  BarChart3
} from 'lucide-react';

const TrendingPage = ({ darkMode = false }) => {
  const [timeFilter, setTimeFilter] = useState('week');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('views');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('posts');

  // Mock trending data
  const trendingPosts = [
    {
      id: 1,
      title: "Building Scalable Microservices with Docker and Kubernetes",
      excerpt: "A comprehensive guide to architecting and deploying microservices at scale using containerization technologies.",
      author: {
        name: "Alex Chen",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?",
        verified: true
      },
      category: "DevOps",
      publishedAt: "2024-01-20",
      readTime: 15,
      image: "https://assets-v2.lottiefiles.com/a/edd9e57c-1175-11ee-923c-97d89504acf4/l26hXkGwri.gif",
      stats: {
        views: 45230,
        likes: 2341,
        comments: 187,
        shares: 456,
        bookmarks: 891,
        growth: "+234%"
      },
      trending: {
        rank: 1,
        peakRank: 1,
        daysOnChart: 5,
        velocity: "hot"
      },
      tags: ["Docker", "Kubernetes", "Microservices", "DevOps"]
    },
    {
      id: 2,
      title: "The Complete Guide to React 18 Concurrent Features",
      excerpt: "Explore React 18's new concurrent features including Suspense, useTransition, and automatic batching for better performance.",
      author: {
        name: "Sarah Rodriguez",
        avatar: "https://static.vecteezy.com/system/resources/thumbnails/035/997/315/small_2x/ai-generated-cheerful-business-woman-standing-isolated-free-photo.jpg",
        verified: true
      },
      category: "Frontend",
      publishedAt: "2024-01-19",
      readTime: 12,
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop",
      stats: {
        views: 38940,
        likes: 1987,
        comments: 143,
        shares: 324,
        bookmarks: 756,
        growth: "+187%"
      },
      trending: {
        rank: 2,
        peakRank: 1,
        daysOnChart: 7,
        velocity: "rising"
      },
      tags: ["React", "JavaScript", "Frontend", "Performance"]
    },
    {
      id: 3,
      title: "Machine Learning in Production: Best Practices and Pitfalls",
      excerpt: "Learn from real-world experiences deploying ML models at scale, including monitoring, versioning, and maintaining model performance.",
      author: {
        name: "Dr. Michael Kumar",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
        verified: top
      },
      category: "AI/ML",
      publishedAt: "2024-01-18",
      readTime: 18,
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
      stats: {
        views: 29874,
        likes: 1654,
        comments: 98,
        shares: 287,
        bookmarks: 623,
        growth: "+156%"
      },
      trending: {
        rank: 3,
        peakRank: 2,
        daysOnChart: 4,
        velocity: "hot"
      },
      tags: ["Machine Learning", "MLOps", "Production", "AI"]
    },
    {
      id: 4,
      title: "Web3 and Blockchain: Beyond the Hype",
      excerpt: "A balanced perspective on Web3 technologies, exploring practical applications and addressing common misconceptions.",
      author: {
        name: "Emma Thompson",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
        verified: true
      },
      category: "Blockchain",
      publishedAt: "2024-01-17",
      readTime: 14,
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop",
      stats: {
        views: 25642,
        likes: 1432,
        comments: 156,
        shares: 234,
        bookmarks: 512,
        growth: "+143%"
      },
      trending: {
        rank: 4,
        peakRank: 3,
        daysOnChart: 6,
        velocity: "steady"
      },
      tags: ["Blockchain", "Web3", "Cryptocurrency", "DeFi"]
    },
    {
      id: 5,
      title: "Advanced Python Patterns for Clean Code",
      excerpt: "Master advanced Python concepts including decorators, context managers, and metaclasses to write more elegant code.",
      author: {
        name: "James Wilson",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
        verified: false
      },
      category: "Python",
      publishedAt: "2024-01-16",
      readTime: 11,
      image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=400&fit=crop",
      stats: {
        views: 22183,
        likes: 1287,
        comments: 89,
        shares: 198,
        bookmarks: 445,
        growth: "+128%"
      },
      trending: {
        rank: 5,
        peakRank: 4,
        daysOnChart: 3,
        velocity: "rising"
      },
      tags: ["Python", "Clean Code", "Programming", "Best Practices"]
    }
  ];

  const trendingAuthors = [
    {
      id: 1,
      name: "Alex Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
      followers: 12400,
      posts: 47,
      totalViews: 892000,
      growth: "+45%",
      verified: true,
      specialty: "DevOps & Cloud Architecture"
    },
    {
      id: 2,
      name: "Sarah Rodriguez",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b977?w=60&h=60&fit=crop&crop=face",
      followers: 9800,
      posts: 34,
      totalViews: 634000,
      growth: "+38%",
      verified: true,
      specialty: "Frontend Development"
    },
    {
      id: 3,
      name: "Dr. Michael Kumar",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face",
      followers: 15600,
      posts: 29,
      totalViews: 1240000,
      growth: "+52%",
      verified: true,
      specialty: "AI & Machine Learning"
    }
  ];

  const trendingTopics = [
    { name: "React", posts: 234, growth: "+23%", trend: "up" },
    { name: "AI", posts: 189, growth: "+45%", trend: "up" },
    { name: "Python", posts: 156, growth: "+12%", trend: "up" },
    { name: "DevOps", posts: 143, growth: "+34%", trend: "up" },
    { name: "Blockchain", posts: 128, growth: "+67%", trend: "up" },
    { name: "JavaScript", posts: 298, growth: "+8%", trend: "steady" },
    { name: "CSS", posts: 87, growth: "-5%", trend: "down" },
    { name: "Node.js", posts: 167, growth: "+19%", trend: "up" }
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getVelocityIcon = (velocity) => {
    switch (velocity) {
      case 'hot': return <Flame className="w-4 h-4 text-red-500" />;
      case 'rising': return <TrendingUp className="w-4 h-4 text-green-500" />;
      default: return <BarChart3 className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <ChevronUp className="w-4 h-4 text-green-500" />;
      case 'down': return <ChevronDown className="w-4 h-4 text-red-500" />;
      default: return <BarChart3 className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredPosts = trendingPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-800 dark:to-gray-900 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Flame className="w-8 h-8 text-red-500 mr-3" />
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                Trending Now
              </h1>
            </div>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8">
              Discover the hottest articles, fastest-growing authors, and most discussed topics in our community.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search trending content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'posts', label: 'Trending Posts', icon: TrendingUp },
              { id: 'authors', label: 'Top Authors', icon: User },
              { id: 'topics', label: 'Hot Topics', icon: Award }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  selectedTab === tab.id
                    ? 'border-red-500 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Filters */}
        {selectedTab === 'posts' && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-red-500"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Categories</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="DevOps">DevOps</option>
                <option value="AI/ML">AI/ML</option>
                <option value="Blockchain">Blockchain</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredPosts.length} trending articles
              </span>
            </div>
          </div>
        )}

        {/* Content based on selected tab */}
        {selectedTab === 'posts' && (
          <div className="space-y-6">
            {filteredPosts.map((post, index) => (
              <div key={post.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  {/* Rank Badge */}
                  <div className="lg:w-16 flex lg:flex-col items-center justify-center bg-gradient-to-br from-red-500 to-orange-500 text-white p-4">
                    <span className="text-2xl lg:text-3xl font-bold">#{post.trending.rank}</span>
                    <div className="flex lg:flex-col items-center space-x-1 lg:space-x-0 mt-2">
                      {getVelocityIcon(post.trending.velocity)}
                      <span className="text-xs lg:hidden ml-1">{post.trending.velocity}</span>
                    </div>
                  </div>

                  {/* Image */}
                  <div className="lg:w-80 h-48 lg:h-auto">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6 lg:p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 text-sm font-medium rounded-full">
                          {post.category}
                        </span>
                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                          <Clock className="w-4 h-4 mr-1" />
                          {post.readTime} min read
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 text-xs font-medium rounded">
                          {post.stats.growth}
                        </span>
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <Bookmark className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <a href={`/blog/${post.id}`} className="group block">
                      <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                    </a>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Author and Stats */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="flex items-center">
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              {post.author.name}
                            </p>
                            {post.author.verified && (
                              <Star className="w-4 h-4 text-blue-500 ml-1" />
                            )}
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">
                            {formatDate(post.publishedAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                          <Eye className="w-4 h-4 mr-1" />
                          {formatNumber(post.stats.views)}
                        </div>
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                          <Heart className="w-4 h-4 mr-1" />
                          {formatNumber(post.stats.likes)}
                        </div>
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {post.stats.comments}
                        </div>
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                          <Share2 className="w-4 h-4 mr-1" />
                          {post.stats.shares}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTab === 'authors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingAuthors.map((author, index) => (
              <div key={author.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={author.avatar}
                        alt={author.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {author.name}
                        </h3>
                        {author.verified && (
                          <Star className="w-4 h-4 text-blue-500 ml-1" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {author.specialty}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 text-xs font-medium rounded">
                    {author.growth}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center py-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatNumber(author.followers)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Followers</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {author.posts}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Posts</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatNumber(author.totalViews)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Views</p>
                  </div>
                </div>

                <button className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                  Follow
                </button>
              </div>
            ))}
          </div>
        )}

        {selectedTab === 'topics' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendingTopics.map((topic, index) => (
              <div key={topic.name} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    #{topic.name}
                  </h3>
                  {getTrendIcon(topic.trend)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Posts</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {topic.posts}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Growth</span>
                    <span className={`font-semibold ${
                      topic.trend === 'up' ? 'text-green-600 dark:text-green-400' :
                      topic.trend === 'down' ? 'text-red-600 dark:text-red-400' :
                      'text-gray-600 dark:text-gray-400'
                    }`}>
                      {topic.growth}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-red-500">#{index + 1}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Trending Rank</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingPage;