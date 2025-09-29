import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Search,
  User,
  Sun,
  Moon,
  ChevronRight,
  Menu,
  X,
  ChevronDown,
  LogOut,
  LogIn,
  Settings,
  Edit,
  BookOpen,
  Users,
  BarChart3,
  Bell,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { Link } from 'react-router-dom';

const UserProfileDropdown = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 animate-slide-down"
      role="menu"
      aria-label="User profile menu"
    >
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face'}
            alt={`${user?.name || 'User'}'s avatar`}
            className="w-10 h-10 rounded-full"
            loading="lazy"
          />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{user?.name || 'Guest'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || 'No email'}</p>
            {isAdmin() && (
              <span className="inline-block px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 text-xs rounded-full mt-1">
                Admin
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="py-2">
        <Link
          to="/profile"
          className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 transition-colors focus:outline-none"
          role="menuitem"
          tabIndex={0}
        >
          <User className="w-4 h-4 mr-3" />
          Profile
        </Link>
        <Link
          to="/my-posts"
          className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 transition-colors focus:outline-none"
          role="menuitem"
          tabIndex={0}
        >
          <BookOpen className="w-4 h-4 mr-3" />
          My Posts
        </Link>
        <Link
          to="/settings"
          className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 transition-colors focus:outline-none"
          role="menuitem"
          tabIndex={0}
        >
          <Settings className="w-4 h-4 mr-3" />
          Settings
        </Link>
        {isAdmin() && (
          <>
            <hr className="my-2 border-gray-200 dark:border-gray-700" />
            <Link
              to="/admin/dashboard"
              className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 transition-colors focus:outline-none"
              role="menuitem"
              tabIndex={0}
            >
              <BarChart3 className="w-4 h-4 mr-3" />
              Dashboard
            </Link>
            <Link
              to="/admin/users"
              className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 transition-colors focus:outline-none"
              role="menuitem"
              tabIndex={0}
            >
              <Users className="w-4 h-4 mr-3" />
              Manage Users
            </Link>
          </>
        )}
        <hr className="my-2 border-gray-200 dark:border-gray-700" />
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 focus:bg-red-50 dark:focus:bg-red-900 transition-colors focus:outline-none"
          role="menuitem"
          tabIndex={0}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

UserProfileDropdown.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

const NotificationDropdown = ({ isOpen, onClose, notifications }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 animate-slide-down"
      role="menu"
      aria-label="Notifications menu"
    >
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
      </div>
      <div className="py-2 max-h-64 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">No notifications</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-center px-4 py-2 text-sm ${
                notification.unread
                  ? 'bg-blue-50 dark:bg-blue-900 text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300'
              } hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none`}
              role="menuitem"
              tabIndex={0}
            >
              <Bell className="w-4 h-4 mr-3" />
              <span className="flex-1">{notification.text}</span>
              {notification.unread && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </div>
          ))
        )}
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
        <Link
          to="/notifications"
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm focus:outline-none"
          role="menuitem"
          tabIndex={0}
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
};

NotificationDropdown.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      text: PropTypes.string.isRequired,
      unread: PropTypes.bool.isRequired,
    })
  ).isRequired,
};

const Navbar = () => {
  const { user, loading, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [notifications] = useState([
    { id: 1, text: 'New comment on your post', unread: true },
    { id: 2, text: 'Someone liked your article', unread: true },
    { id: 3, text: 'Welcome to BlogSpace!', unread: false },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Leftmost */}
            <div className="flex items-center">
              <Link 
                to="/" 
                className="flex items-center space-x-2 group" 
                aria-label="BlogSpace Home"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                  BlogSpace
                </span>
              </Link>
            </div>

            {/* Desktop Navigation - Center */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link
                to="/blogs"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium focus:outline-none relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-blue-600 after:transition-all after:duration-300"
                tabIndex={0}
              >
                Explore
              </Link>
              <Link
                to="/categories"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium focus:outline-none relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-blue-600 after:transition-all after:duration-300"
                tabIndex={0}
              >
                Categories
              </Link>
              <Link
                to="/trending"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium focus:outline-none relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-blue-600 after:transition-all after:duration-300"
                tabIndex={0}
              >
                Trending
              </Link>
              <Link
                to="/about"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium focus:outline-none relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-blue-600 after:transition-all after:duration-300"
                tabIndex={0}
              >
                About
              </Link>
            </nav>

            {/* Right side actions - Rightmost */}
            <div className="flex items-center space-x-2 sm:space-x-4">
             

              {loading ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400 rounded-full animate-spin" aria-label="Loading user data" />
              ) : user ? (
                <>
                  <div className="relative">
                    <button
                      onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                      className="p-2 rounded-lg bg-gray-100/70 dark:bg-gray-800/70 text-gray-600 dark:text-gray-400 hover:bg-gray-200/70 dark:hover:bg-gray-700/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      aria-label={`Notifications, ${unreadCount} unread`}
                      tabIndex={0}
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    <NotificationDropdown
                      isOpen={notificationDropdownOpen}
                      onClose={() => setNotificationDropdownOpen(false)}
                      notifications={notifications}
                    />
                  </div>
                  
                  <Link
                    to="/my-posts"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium hidden sm:block focus:outline-none relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-blue-600 after:transition-all after:duration-300"
                    tabIndex={0}
                  >
                    My Posts
                  </Link>
                  
                  <Link
                    to="/create-blog"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-md hover:shadow-lg"
                    aria-label="Write a new post"
                    tabIndex={0}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Write
                  </Link>
                  
                  <div className="relative">
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100/70 dark:hover:bg-gray-800/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      aria-label={`User profile menu for ${user.name || 'Guest'}`}
                      tabIndex={0}
                    >
                      <img
                        src={
                          user.avatar ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face'
                        }
                        alt={`${user.name || 'Guest'}'s avatar`}
                        className="w-8 h-8 rounded-full ring-2 ring-blue-600/50 hover:ring-blue-600 transition-all duration-200"
                        loading="lazy"
                      />
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name || 'Guest'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.role || 'User'}</p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-200 group-hover:rotate-180" />
                    </button>
                    <UserProfileDropdown
                      isOpen={userDropdownOpen}
                      onClose={() => setUserDropdownOpen(false)}
                    />
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    aria-label="Sign in to BlogSpace"
                    tabIndex={0}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-md hover:shadow-lg"
                    aria-label="Sign up for BlogSpace"
                    tabIndex={0}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up
                  </Link>
                </div>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg bg-gray-100/70 dark:bg-gray-800/70 text-gray-600 dark:text-gray-400 hover:bg-gray-200/70 dark:hover:bg-gray-700/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                tabIndex={0}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            className={`lg:hidden border-t border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 ease-in-out ${
              mobileMenuOpen 
                ? 'max-h-screen opacity-100 py-4' 
                : 'max-h-0 opacity-0 overflow-hidden'
            }`}
          >
            <nav className="flex flex-col space-y-4">
              <Link
                to="/blogs"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium focus:outline-none"
                onClick={handleMobileMenuClose}
                tabIndex={0}
              >
                Explore
              </Link>
              <Link
                to="/categories"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium focus:outline-none"
                onClick={handleMobileMenuClose}
                tabIndex={0}
              >
                Categories
              </Link>
              <Link
                to="/trending"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium focus:outline-none"
                onClick={handleMobileMenuClose}
                tabIndex={0}
              >
                Trending
              </Link>
              <Link
                to="/about"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium focus:outline-none"
                onClick={handleMobileMenuClose}
                tabIndex={0}
              >
                About
              </Link>
              
              {user ? (
                <>
                  <Link
                    to="/my-posts"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium focus:outline-none"
                    onClick={handleMobileMenuClose}
                    tabIndex={0}
                  >
                    My Posts
                  </Link>
                  <Link
                    to="/create-blog"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 font-medium focus:outline-none shadow-md"
                    aria-label="Write a new post"
                    onClick={handleMobileMenuClose}
                    tabIndex={0}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Write
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      handleMobileMenuClose();
                    }}
                    className="inline-flex items-center px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-all duration-200 font-medium focus:outline-none"
                    tabIndex={0}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-200 font-medium focus:outline-none"
                    aria-label="Sign in to BlogSpace"
                    onClick={handleMobileMenuClose}
                    tabIndex={0}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 font-medium text-center focus:outline-none shadow-md"
                    aria-label="Sign up for BlogSpace"
                    onClick={handleMobileMenuClose}
                    tabIndex={0}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;