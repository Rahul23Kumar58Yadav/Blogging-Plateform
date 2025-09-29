import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Sun,
  Moon,
  Settings,
  Shield,
  Bell,
  Eye,
  EyeOff,
  Upload,
  Trash2,
  Check,
  AlertCircle,
  Heart,
  MessageCircle,
  BookOpen,
  Award,
  TrendingUp,
  Link,
  Clock,
  Globe,
  Activity,
  Star,
  Users,
  Zap,
  ChevronRight,
  Menu,
  MoreVertical
} from 'lucide-react';

const Profile = () => {
  const { user, loading: authLoading, error: authError, updateProfile } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    avatar: null,
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    twoFactorAuth: false
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setDarkMode(mediaQuery.matches);
    
    if (user) {
      setFormData({
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName: user.lastName || (user.name?.split(' ').length > 1 ? user.name.split(' ')[1] : ''),
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        avatar: user.avatar || null,
      });
      setAvatarPreview(user.avatar || null);
    }

    // Apply dark mode to document
    document.documentElement.classList.toggle('dark', darkMode);
  }, [user, darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
        setFormData(prev => ({
          ...prev,
          avatar: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    setFormData(prev => ({
      ...prev,
      avatar: null
    }));
  };

  const handleSaveProfile = async () => {
    setSaveLoading(true);
    setError(null);
    try {
      const updatedData = {
        ...formData,
        avatar: avatarPreview ? formData.avatar : null,
      };
      const { success } = await updateProfile(updatedData);
      if (success) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Profile update failed');
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaveLoading(false);
      setIsEditing(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setSaveLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Password updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update password. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaveLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Settings updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update settings. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const cancelEdit = () => {
    setFormData({
      firstName: user?.firstName || user?.name?.split(' ')[0] || '',
      lastName: user?.lastName || (user?.name?.split(' ').length > 1 ? user.name.split(' ')[1] : ''),
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      location: user?.location || '',
      website: user?.website || '',
      avatar: user?.avatar || null,
    });
    setAvatarPreview(user?.avatar || null);
    setIsEditing(false);
    setError(null);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, color: 'text-blue-500' },
    { id: 'security', label: 'Security', icon: Shield, color: 'text-green-500' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-purple-500' },
    { id: 'activity', label: 'Activity', icon: TrendingUp, color: 'text-orange-500' }
  ];

  const activityData = [
    { 
      id: '1', 
      type: 'post', 
      icon: BookOpen, 
      message: 'Published a new post: "React Best Practices"', 
      date: '2025-09-01',
      color: 'bg-blue-500'
    },
    { 
      id: '2', 
      type: 'like', 
      icon: Heart, 
      message: 'Received 50 likes on your post', 
      date: '2025-08-30',
      color: 'bg-red-500'
    },
    { 
      id: '3', 
      type: 'comment', 
      icon: MessageCircle, 
      message: 'Received a comment on "JavaScript Tips"', 
      date: '2025-08-29',
      color: 'bg-green-500'
    },
    { 
      id: '4', 
      type: 'achievement', 
      icon: Award, 
      message: 'Earned "Top Blogger" badge', 
      date: '2025-08-25',
      color: 'bg-yellow-500'
    },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white mb-2">Loading Profile</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Please wait while we fetch your data...</div>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="text-center max-w-md mx-auto p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-red-200 dark:border-red-800">
          <div className="text-red-600 dark:text-red-400 mb-6">
            <AlertCircle className="w-16 h-16 mx-auto mb-4" />
            <div className="text-lg font-semibold">Authentication Error</div>
            <div className="text-sm mt-2">{authError}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="text-center max-w-md mx-auto p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-2xl">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Please Log In</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">You need to be logged in to view your profile.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${darkMode ? 'dark bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-blue-50'}`}>
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
        </div>
      )}

      {/* Enhanced Header */}
      <header className={`sticky top-0 z-30 backdrop-blur-xl border-b transition-all duration-200
        ${darkMode ? 'bg-gray-800/95 border-gray-700/50' : 'bg-white/95 border-gray-200/50'}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-20 items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Profile Settings
                </h1>
                <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Manage your account and preferences
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className={`p-2 sm:p-3 rounded-xl transition-all duration-200 hover:scale-110
                ${darkMode ? 'bg-gray-700/50 hover:bg-gray-600/50' : 'bg-gray-100 hover:bg-gray-200'}`}>
                <Bell className={`h-4 w-4 sm:h-5 sm:w-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
              <button
                onClick={toggleDarkMode}
                className={`p-2 sm:p-3 rounded-xl transition-all duration-200 hover:scale-110
                  ${darkMode ? 'bg-gray-700/50 hover:bg-gray-600/50' : 'bg-gray-100 hover:bg-gray-200'}`}
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
                {darkMode ? 
                  <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" /> : 
                  <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                }
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Enhanced Success/Error Messages */}
        {success && (
          <div className={`mb-6 flex items-center gap-3 rounded-2xl p-4 shadow-lg backdrop-blur-sm
            ${darkMode ? 'bg-green-900/30 border border-green-700/50 text-green-400' : 'bg-green-50 border border-green-200 text-green-600'}`}>
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <Check className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium">{success}</span>
          </div>
        )}
        {error && (
          <div className={`mb-6 flex items-center gap-3 rounded-2xl p-4 shadow-lg backdrop-blur-sm
            ${darkMode ? 'bg-red-900/30 border border-red-700/50 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}>
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:gap-8 xl:grid-cols-4">
          {/* Enhanced Sidebar */}
          <div className={`xl:col-span-1 ${sidebarOpen ? 'fixed inset-y-0 left-0 z-50 w-80 transform translate-x-0 lg:relative lg:inset-auto lg:w-auto lg:transform-none' : 'hidden xl:block'}`}>
            <div className={`h-full ${sidebarOpen ? 'overflow-y-auto' : ''}`}>
              {/* Enhanced Profile Card */}
              <div className={`mb-6 rounded-2xl border backdrop-blur-sm shadow-2xl overflow-hidden
                ${darkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/80 border-gray-200/50'}`}>
                <div className="relative">
                  {/* Cover Background */}
                  <div className="h-24 sm:h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                  
                  {/* Close button for mobile */}
                  {sidebarOpen && (
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="absolute top-4 right-4 lg:hidden p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  
                  {/* Profile Avatar */}
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 p-1 shadow-2xl">
                        <div className="w-full h-full rounded-xl overflow-hidden bg-white dark:bg-gray-800 flex items-center justify-center">
                          {avatarPreview || user.avatar ? (
                            <img
                              src={avatarPreview || user.avatar}
                              alt="Profile"
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <span className="text-xl font-bold text-gray-600 dark:text-gray-300">
                              {`${user.name?.split(' ')[0]?.[0] || ''}${user.name?.split(' ')[1]?.[0] || ''}`}
                            </span>
                          )}
                        </div>
                      </div>
                      {user.isVerified && (
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-16 px-6 pb-6 text-center">
                  <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user.name || `${formData.firstName} ${formData.lastName}`}
                  </h3>
                  <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Member since {new Date(user.createdAt || user.joinDate).getFullYear()}
                  </p>
                  
                  {/* Enhanced Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{user.stats?.posts || 12}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Posts</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">{user.stats?.followers || 234}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Followers</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                        <Heart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{user.stats?.likes || 1.2}k</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Likes</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                        <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{user.stats?.rating || 4.9}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rating</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Navigation */}
              <nav className={`rounded-2xl border backdrop-blur-sm shadow-xl overflow-hidden
                ${darkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/80 border-gray-200/50'}`}>
                {tabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setSidebarOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-6 py-4 text-left text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg
                        ${index === 0 ? 'rounded-t-2xl' : ''}
                        ${index === tabs.length - 1 ? 'rounded-b-2xl' : ''}
                        ${isActive 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-[1.02]' 
                          : darkMode 
                            ? 'text-gray-200 hover:bg-gray-700/50' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                          ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                          <Icon className={`h-5 w-5 ${isActive ? 'text-white' : tab.color}`} />
                        </div>
                        <span className="font-semibold">{tab.label}</span>
                      </div>
                      <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? 'rotate-90' : ''}`} />
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Enhanced Main Content */}
          <div className="xl:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className={`rounded-2xl border backdrop-blur-sm shadow-2xl overflow-hidden
                ${darkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/80 border-gray-200/50'}`}>
                <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b p-6
                  ${darkMode ? 'border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/30' : 'border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-blue-50/30'}`}>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      Profile Information
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Update your personal details and preferences
                    </p>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105">
                      <Edit3 className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={cancelEdit}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 border-2
                          ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700/50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={saveLoading}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl
                          ${saveLoading 
                            ? 'bg-gradient-to-r from-blue-400 to-purple-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105'
                          } text-white`}>
                        <Save className="h-4 w-4" />
                        <span>{saveLoading ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-8 p-6">
                  {/* Avatar Upload Section */}
                  {isEditing && (
                    <div className={`p-6 rounded-2xl border-2 border-dashed transition-all duration-200
                      ${darkMode ? 'border-gray-600 bg-gray-700/30' : 'border-gray-300 bg-gray-50/50'}`}>
                      <label className={`block text-sm font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Profile Picture
                      </label>
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative group">
                          <div className="w-24 h-24 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 p-1 shadow-xl">
                            <div className="w-full h-full rounded-xl overflow-hidden bg-white dark:bg-gray-800 flex items-center justify-center">
                              {avatarPreview || user.avatar ? (
                                <img
                                  src={avatarPreview || user.avatar}
                                  alt="Profile"
                                  className="w-full h-full object-cover rounded-xl"
                                />
                              ) : (
                                <span className="text-lg font-bold text-gray-600 dark:text-gray-300">
                                  {`${formData.firstName[0] || 'U'}${formData.lastName[0] || 'U'}`}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <label className="flex cursor-pointer items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105">
                            <Upload className="h-4 w-4" />
                            <span>Upload New</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarUpload}
                              className="hidden"
                            />
                          </label>
                          {(avatarPreview || user.avatar) && (
                            <button
                              onClick={removeAvatar}
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 border-2 hover:scale-105
                                ${darkMode ? 'border-red-600/50 bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100'}`}>
                              <Trash2 className="h-4 w-4" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Form Fields */}
                  <div className="space-y-6">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          <User className="h-4 w-4" />
                          First Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-xl border-2 text-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500
                              ${darkMode ? 'border-gray-600 bg-gray-700/50 text-white placeholder-gray-400' : 'border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-500'}`}
                            placeholder="Enter your first name"
                          />
                        ) : (
                          <div className={`px-4 py-3 rounded-xl border-2 text-sm min-h-[48px] flex items-center
                            ${darkMode ? 'border-gray-700 bg-gray-800/50 text-gray-200' : 'border-gray-200 bg-gray-100/50 text-gray-700'}`}>
                            {user.name?.split(' ')[0] || formData.firstName || 'Not provided'}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          <User className="h-4 w-4" />
                          Last Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-xl border-2 text-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500
                              ${darkMode ? 'border-gray-600 bg-gray-700/50 text-white placeholder-gray-400' : 'border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-500'}`}
                            placeholder="Enter your last name"
                          />
                        ) : (
                          <div className={`px-4 py-3 rounded-xl border-2 text-sm min-h-[48px] flex items-center
                            ${darkMode ? 'border-gray-700 bg-gray-800/50 text-gray-200' : 'border-gray-200 bg-gray-100/50 text-gray-700'}`}>
                            {user.name?.split(' ')[1] || formData.lastName || 'Not provided'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          <Mail className="h-4 w-4" />
                          Email Address
                        </label>
                        {isEditing ? (
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-xl border-2 text-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500
                              ${darkMode ? 'border-gray-600 bg-gray-700/50 text-white placeholder-gray-400' : 'border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-500'}`}
                            placeholder="Enter your email"
                          />
                        ) : (
                          <div className={`px-4 py-3 rounded-xl border-2 text-sm min-h-[48px] flex items-center
                            ${darkMode ? 'border-gray-700 bg-gray-800/50 text-gray-200' : 'border-gray-200 bg-gray-100/50 text-gray-700'}`}>
                            {user.email || formData.email || 'Not provided'}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          <Phone className="h-4 w-4" />
                          Phone Number
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-xl border-2 text-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500
                              ${darkMode ? 'border-gray-600 bg-gray-700/50 text-white placeholder-gray-400' : 'border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-500'}`}
                            placeholder="Enter your phone number"
                          />
                        ) : (
                          <div className={`px-4 py-3 rounded-xl border-2 text-sm min-h-[48px] flex items-center
                            ${darkMode ? 'border-gray-700 bg-gray-800/50 text-gray-200' : 'border-gray-200 bg-gray-100/50 text-gray-700'}`}>
                            {user.phone || formData.phone || 'Not provided'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Location and Website */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          <MapPin className="h-4 w-4" />
                          Location
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-xl border-2 text-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500
                              ${darkMode ? 'border-gray-600 bg-gray-700/50 text-white placeholder-gray-400' : 'border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-500'}`}
                            placeholder="Enter your location"
                          />
                        ) : (
                          <div className={`px-4 py-3 rounded-xl border-2 text-sm min-h-[48px] flex items-center
                            ${darkMode ? 'border-gray-700 bg-gray-800/50 text-gray-200' : 'border-gray-200 bg-gray-100/50 text-gray-700'}`}>
                            {user.location || formData.location || 'Not provided'}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          <Globe className="h-4 w-4" />
                          Website
                        </label>
                        {isEditing ? (
                          <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-xl border-2 text-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500
                              ${darkMode ? 'border-gray-600 bg-gray-700/50 text-white placeholder-gray-400' : 'border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-500'}`}
                            placeholder="https://your-website.com"
                          />
                        ) : (
                          <div className={`px-4 py-3 rounded-xl border-2 text-sm min-h-[48px] flex items-center
                            ${darkMode ? 'border-gray-700 bg-gray-800/50 text-gray-200' : 'border-gray-200 bg-gray-100/50 text-gray-700'}`}>
                            {(user.website || formData.website) ? (
                              <a
                                href={user.website || formData.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                                <Link className="h-4 w-4" />
                                {user.website || formData.website}
                              </a>
                            ) : (
                              'Not provided'
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        <MessageCircle className="h-4 w-4" />
                        Bio
                      </label>
                      {isEditing ? (
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows={4}
                          className={`w-full px-4 py-3 rounded-xl border-2 text-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 resize-none
                            ${darkMode ? 'border-gray-600 bg-gray-700/50 text-white placeholder-gray-400' : 'border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-500'}`}
                          placeholder="Tell us about yourself..."
                        />
                      ) : (
                        <div className={`px-4 py-3 rounded-xl border-2 text-sm min-h-[100px] flex items-start
                          ${darkMode ? 'border-gray-700 bg-gray-800/50 text-gray-200' : 'border-gray-200 bg-gray-100/50 text-gray-700'}`}>
                          <p className="leading-relaxed">
                            {user.bio || formData.bio || 'No bio provided yet. Share something about yourself!'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className={`rounded-2xl border backdrop-blur-sm shadow-2xl overflow-hidden
                ${darkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/80 border-gray-200/50'}`}>
                <div className={`border-b p-6
                  ${darkMode ? 'border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/30' : 'border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-green-50/30'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                      <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      Security Settings
                    </h2>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Keep your account secure with these security options
                  </p>
                </div>

                <div className="space-y-8 p-6">
                  {/* Password Change Section */}
                  <div className={`p-6 rounded-2xl border-2
                    ${darkMode ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-gray-50/50'}`}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold">Change Password</h3>
                    </div>
                    <div className="space-y-6">
                      {/* Current Password */}
                      <div>
                        <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          <Shield className="h-4 w-4" />
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className={`w-full px-4 py-3 pr-12 rounded-xl border-2 text-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500
                              ${darkMode ? 'border-gray-600 bg-gray-700/50 text-white placeholder-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'}`}
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('current')}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors
                              ${darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                            aria-label={showPasswords.current ? 'Hide password' : 'Show password'}>
                            {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            <Shield className="h-4 w-4" />
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.new ? 'text' : 'password'}
                              name="newPassword"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                              className={`w-full px-4 py-3 pr-12 rounded-xl border-2 text-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500
                                ${darkMode ? 'border-gray-600 bg-gray-700/50 text-white placeholder-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'}`}
                              placeholder="Enter new password"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('new')}
                              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors
                                ${darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
                              {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            <Shield className="h-4 w-4" />
                            Confirm Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.confirm ? 'text' : 'password'}
                              name="confirmPassword"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                              className={`w-full px-4 py-3 pr-12 rounded-xl border-2 text-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500
                                ${darkMode ? 'border-gray-600 bg-gray-700/50 text-white placeholder-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'}`}
                              placeholder="Confirm new password"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('confirm')}
                              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors
                                ${darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
                              {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={handlePasswordUpdate}
                          disabled={saveLoading}
                          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl
                            ${saveLoading 
                              ? 'bg-gradient-to-r from-green-400 to-blue-400 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 hover:scale-105'
                            } text-white`}>
                          <Save className="h-4 w-4" />
                          <span>{saveLoading ? 'Updating...' : 'Update Password'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className={`p-6 rounded-2xl border-2
                    ${darkMode ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-gray-50/50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                          <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-1">Two-Factor Authentication</h3>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Add an extra layer of security to your account
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.twoFactorAuth}
                          onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className={`rounded-2xl border backdrop-blur-sm shadow-2xl overflow-hidden
                ${darkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/80 border-gray-200/50'}`}>
                <div className={`border-b p-6
                  ${darkMode ? 'border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/30' : 'border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-purple-50/30'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                      <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Account Settings
                    </h2>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Customize your account preferences and privacy settings
                  </p>
                </div>

                <div className="space-y-8 p-6">
                  {/* Notifications Section */}
                  <div className={`p-6 rounded-2xl border-2
                    ${darkMode ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-gray-50/50'}`}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold">Notifications</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                              Email Notifications
                            </p>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Receive email updates about your account
                            </p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.emailNotifications}
                            onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <Bell className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                              Push Notifications
                            </p>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Receive push notifications on your device
                            </p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.pushNotifications}
                            onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Privacy Section */}
                  <div className={`p-6 rounded-2xl border-2
                    ${darkMode ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-gray-50/50'}`}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-lg font-semibold">Privacy Settings</h3>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          <Users className="h-4 w-4" />
                          Profile Visibility
                        </label>
                        <select
                          value={settings.profileVisibility}
                          onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border-2 text-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500
                            ${darkMode ? 'border-gray-600 bg-gray-700/50 text-white' : 'border-gray-200 bg-white text-gray-900'}`}>
                          <option value="public">🌍 Public - Everyone can see your profile</option>
                          <option value="private">🔒 Private - Only you can see your profile</option>
                          <option value="followers">👥 Followers Only - Only followers can see</option>
                        </select>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                Show Email Address
                              </p>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Display your email on your public profile
                              </p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.showEmail}
                              onChange={(e) => handleSettingChange('showEmail', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                Show Phone Number
                              </p>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Display your phone number on your profile
                              </p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.showPhone}
                              onChange={(e) => handleSettingChange('showPhone', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveSettings}
                      disabled={saveLoading}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl
                        ${saveLoading 
                          ? 'bg-gradient-to-r from-purple-400 to-pink-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105'
                        } text-white`}>
                      <Save className="h-4 w-4" />
                      <span>{saveLoading ? 'Saving...' : 'Save Settings'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className={`rounded-2xl border backdrop-blur-sm shadow-2xl overflow-hidden
                ${darkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/80 border-gray-200/50'}`}>
                <div className={`border-b p-6
                  ${darkMode ? 'border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/30' : 'border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-orange-50/30'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                      <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      Recent Activity
                    </h2>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Track your recent interactions and achievements
                  </p>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {activityData.length > 0 ? (
                      activityData.map((activity, index) => {
                        const Icon = activity.icon;
                        return (
                          <div
                            key={activity.id}
                            className={`group p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
                              ${darkMode ? 'bg-gray-700/50 border-gray-600/50 hover:bg-gray-700/80' : 'bg-gray-50/80 border-gray-200/50 hover:bg-white/80'}`}>
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 rounded-xl ${activity.color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                                <Icon className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                      {activity.message}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-3 w-3 text-gray-500" />
                                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {new Date(activity.date).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                  <button className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity
                                    ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}>
                                    <MoreVertical className="h-4 w-4 text-gray-500" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12">
                        <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center
                          ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                          <Activity className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          No Activity Yet
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Your recent activities will appear here once you start using the platform.
                        </p>
                      </div>
                    )}
                  </div>

                  {activityData.length > 0 && (
                    <div className="mt-8 text-center">
                      <button className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105
                        ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                        Load More Activity
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;