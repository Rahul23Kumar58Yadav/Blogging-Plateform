import React from 'react';
import { Link } from 'react-router-dom';

const BlogCard = ({ blog }) => {
  // Format date function
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Truncate content for preview
  const truncateContent = (content, maxLength = 120) => {
    if (content.length <= maxLength) return content;
    return content.substr(0, maxLength) + '...';
  };

  // Default values in case blog data is incomplete
  const {
    _id,
    title = 'Untitled Blog',
    content = 'No content available...',
    author = { name: 'Anonymous' },
    featuredImage,
    tags = [],
    createdAt = new Date(),
    readTime = '5 min read',
    likes = [],
    comments = []
  } = blog || {};

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 overflow-hidden border border-gray-100">
      {/* Featured Image */}
      {featuredImage && (
        <div className="relative w-full h-48 sm:h-52 md:h-56 lg:h-60 xl:h-64 overflow-hidden">
          <img
            src={featuredImage}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      {/* Card Content */}
      <div className="p-4 sm:p-5 md:p-6">
        {/* Author and Date Info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
          <div className="flex items-center space-x-2">
            {author.avatar ? (
              <img
                src={author.avatar}
                alt={author.name}
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-xs sm:text-sm font-medium text-gray-600">
                  {author.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
            )}
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              {author.name}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
            <span>{formatDate(createdAt)}</span>
            <span>•</span>
            <span>{readTime}</span>
          </div>
        </div>

        {/* Blog Title */}
        <Link to={`/blog/${_id}`} className="block group">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 leading-tight">
            {title}
          </h3>
        </Link>

        {/* Blog Content Preview */}
        <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-3 leading-relaxed">
          {truncateContent(content)}
        </p>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-blue-100 text-blue-800 text-xs sm:text-sm px-2 py-1 rounded-full font-medium hover:bg-blue-200 transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs sm:text-sm text-gray-500 px-2 py-1">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Card Footer - Engagement Stats and Read More */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-gray-100">
          {/* Engagement Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span>{likes?.length || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{comments?.length || 0}</span>
            </div>
          </div>

          {/* Read More Button */}
          <Link
            to={`/blog/${_id}`}
            className="inline-flex items-center justify-center sm:justify-start text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-200 group"
          >
            Read More
            <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;