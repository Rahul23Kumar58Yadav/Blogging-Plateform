import PropTypes from 'prop-types';
import { Loader2 } from 'lucide-react';

export const LoadingButton = ({ loading, onClick, className = '', children, ...props }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center justify-center bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg ${className}`}
    disabled={loading}
    aria-label={loading ? 'Loading' : props['aria-label'] || 'Button'}
    {...props}
  >
    {loading ? (
      <div className="flex items-center space-x-2">
        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 animate-pulse-spin" />
        <span>Loading...</span>
      </div>
    ) : (
      children
    )}
  </button>
);

LoadingButton.propTypes = {
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node,
};

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };
  return (
    <div
      className={`border-t-transparent border-current rounded-full animate-spin ${sizes[size]} ${className}`}
    />
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export const PulseLoader = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-1 h-1 space-x-1',
    md: 'w-2 h-2 space-x-2',
    lg: 'w-3 h-3 space-x-3',
  };
  return (
    <div className={`flex items-center ${sizes[size]} ${className}`}>
      <div className="bg-current rounded-full animate-pulse"></div>
      <div className="bg-current rounded-full animate-pulse delay-150"></div>
      <div className="bg-current rounded-full animate-pulse delay-300"></div>
    </div>
  );
};

PulseLoader.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};