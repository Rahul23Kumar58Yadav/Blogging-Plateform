import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Plus, Edit, Trash2, Sun, Moon, Users, UserCheck, Calendar, FileText, Menu, X, Shield, TrendingUp, Filter, Download, ChevronDown, Bell, Settings } from 'lucide-react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Custom debounce function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Token validation (copied from AuthContext for consistency)
const isValidJWT = (token) => {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(atob(parts[1]));
    return payload.exp ? payload.exp > Date.now() / 1000 : false;
  } catch {
    return false;
  }
};

const userPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  role: PropTypes.oneOf(['admin', 'user']).isRequired,
  status: PropTypes.oneOf(['active', 'inactive']).isRequired,
  joined: PropTypes.string.isRequired,
  blogs: PropTypes.number,
  avatar: PropTypes.string.isRequired,
  permissions: PropTypes.arrayOf(PropTypes.string),
});

const AdminDashboard = () => {
  const { user, isAdmin, isAuthenticated, logout, loading: authLoading, error: authError } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'user', password: '', confirmPassword: '' });
  const [formError, setFormError] = useState('');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    totalBlogs: 0,
    adminUsers: 0,
    inactiveUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, pages: 1, total: 0 });
  const [filterRole, setFilterRole] = useState('all');
  const [sortBy, setSortBy] = useState('joined');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const getCurrentToken = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token || !isValidJWT(token)) {
      console.error('No valid token found in localStorage');
      return null;
    }
    return token;
  }, []);

  const createAxiosConfig = useCallback(() => {
    const token = getCurrentToken();
    if (!token) return null;
    return {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    };
  }, [getCurrentToken]);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || !isAdmin()) {
      console.log('Fetch blocked:', { isAuthenticated, isAdmin: isAdmin() });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const config = createAxiosConfig();
      if (!config) {
        setError('Authentication required. Please log in again.');
        logout();
        return;
      }

      const usersResponse = await axios.get('http://localhost:5000/api/v1/admin/users', {
        ...config,
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchQuery || undefined,
        },
      });

      let usersData, paginationData;
      if (usersResponse.data.success && usersResponse.data.data) {
        usersData = usersResponse.data.data.users || [];
        paginationData = usersResponse.data.data.pagination || {};
      } else if (usersResponse.data.users) {
        usersData = usersResponse.data.users;
        paginationData = usersResponse.data.pagination || {};
      } else if (Array.isArray(usersResponse.data)) {
        usersData = usersResponse.data;
        paginationData = {};
      } else {
        usersData = [];
        paginationData = {};
      }

      const normalizedUsers = usersData.map((user) => ({
        id: user.id || user._id || '',
        name: user.name || 'Unknown',
        email: user.email || '',
        role: user.role || 'user',
        status: user.status || 'active',
        joined: user.joined || user.createdAt || new Date().toISOString(),
        blogs: user.blogs || 0,
        avatar: user.avatar || user.name?.charAt(0).toUpperCase() || 'U',
        permissions: user.permissions || [],
      }));

      setUsers(normalizedUsers);
      setPagination({
        page: paginationData.page || pagination.page,
        limit: paginationData.limit || pagination.limit,
        pages: paginationData.pages || Math.ceil((paginationData.total || normalizedUsers.length) / (paginationData.limit || 10)),
        total: paginationData.total || normalizedUsers.length,
      });

      const statsResponse = await axios.get('http://localhost:5000/api/v1/admin/stats', config);
      let statsData;
      if (statsResponse.data.success && statsResponse.data.data && statsResponse.data.data.stats) {
        statsData = statsResponse.data.data.stats;
      } else if (statsResponse.data.stats) {
        statsData = statsResponse.data.stats;
      } else {
        statsData = {
          totalUsers: normalizedUsers.length,
          activeUsers: normalizedUsers.filter((u) => u.status === 'active').length,
          newUsersThisMonth: 0,
          totalBlogs: normalizedUsers.reduce((sum, u) => sum + (u.blogs || 0), 0),
          adminUsers: normalizedUsers.filter((u) => u.role === 'admin').length,
          inactiveUsers: normalizedUsers.filter((u) => u.status === 'inactive').length,
        };
      }

      setStats(statsData);
    } catch (err) {
      console.error('Fetch data error:', err);
      if (err.response) {
        const { status, data } = err.response;
        if (status === 429) {
          const retryAfter = err.response.headers['retry-after'] ? parseInt(err.response.headers['retry-after'], 10) * 1000 : 5000;
          setError('Too many requests. Retrying after a short delay...');
          setTimeout(fetchData, retryAfter);
          return;
        } else if (status === 401) {
          const message = data?.message || '';
          const code = data?.code || '';
          if (code === 'TOKEN_EXPIRED' || message.toLowerCase().includes('expired')) {
            setError('Session expired. Please log in again.');
            logout();
            window.location.href = '/login';
            return;
          }
        } else if (status === 403) {
          setError('Access denied. Admin privileges required.');
        } else if (status === 404) {
          setError('API endpoint not found. Please check your backend configuration.');
        } else {
          setError(data?.message || `HTTP ${status}: Failed to fetch data`);
        }
      } else if (err.request) {
        setError('Cannot connect to server. Please check if the backend is running.');
      } else {
        setError('An unexpected error occurred: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin, pagination.page, pagination.limit, searchQuery, logout, createAxiosConfig]);

  const debouncedFetchData = useMemo(() => debounce(fetchData, 500), [fetchData]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !isAdmin()) {
      return;
    }
    debouncedFetchData();
  }, [authLoading, isAuthenticated, isAdmin, pagination.page, pagination.limit, searchQuery, debouncedFetchData]);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin())) {
      window.location.href = '/login';
    }
  }, [authLoading, isAuthenticated, isAdmin]);

  const filteredUsers = useMemo(() => {
    let filtered = users;
    
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.role.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterRole !== 'all') {
      filtered = filtered.filter((user) => user.role === filterRole);
    }

    // Sort users
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'email':
          return a.email.localeCompare(b.email);
        case 'role':
          return a.role.localeCompare(b.role);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'joined':
        default:
          return new Date(b.joined) - new Date(a.joined);
      }
    });

    return filtered;
  }, [users, searchQuery, filterRole, sortBy]);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setFormError('');

      if (!formData.name.trim()) {
        setFormError('Name is required');
        return;
      }
      if (!formData.email.trim() || !validateEmail(formData.email)) {
        setFormError('Valid email is required');
        return;
      }
      if (!editingUser && (!formData.password.trim() || formData.password !== formData.confirmPassword)) {
        setFormError('Password and confirmation must match and cannot be empty');
        return;
      }
      if (!isAdmin() && formData.role === 'admin') {
        setFormError('Only admins can create or update admin users');
        return;
      }

      try {
        const config = createAxiosConfig();
        if (!config) {
          setFormError('Authentication required. Please log in again.');
          return;
        }

        if (editingUser) {
          const updateData = {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            role: formData.role,
          };

          await axios.put(`http://localhost:5000/api/v1/admin/users/${editingUser.id}`, updateData, config);
          setUsers((prev) =>
            prev.map((user) => (user.id === editingUser.id ? { ...user, ...updateData } : user))
          );
        } else {
          const createData = {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            role: formData.role,
            password: formData.password,
          };

          const response = await axios.post('http://localhost:5000/api/v1/admin/users', createData, config);
          let newUser = response.data.data?.user || response.data.user || response.data;

          const normalizedUser = {
            id: newUser.id || newUser._id,
            name: newUser.name || createData.name,
            email: newUser.email || createData.email,
            role: newUser.role || createData.role,
            status: newUser.status || 'active',
            joined: newUser.joined || newUser.createdAt || new Date().toISOString(),
            blogs: newUser.blogs || 0,
            avatar: newUser.avatar || newUser.name?.charAt(0).toUpperCase() || createData.name.charAt(0).toUpperCase(),
            permissions: newUser.permissions || [],
          };

          setUsers((prev) => [normalizedUser, ...prev]);
        }

        closeModal();
      } catch (err) {
        console.error('Save user error:', err);
        setFormError(
          err.response?.data?.message || `HTTP ${err.response?.status || 'Unknown'}: Failed to save user`
        );
      }
    },
    [editingUser, formData, isAdmin, createAxiosConfig]
  );

  const editUser = useCallback((user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role, password: '', confirmPassword: '' });
    setModalOpen(true);
  }, []);

  const addUser = useCallback(() => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'user', password: '', confirmPassword: '' });
    setModalOpen(true);
  }, []);

  const deleteUser = useCallback(
    async (userId) => {
      if (!isAdmin()) {
        setError('Only admins can delete users');
        return;
      }
      if (window.confirm('Are you sure you want to delete this user?')) {
        try {
          const config = createAxiosConfig();
          if (!config) {
            setError('Authentication required. Please log in again.');
            return;
          }

          await axios.delete(`http://localhost:5000/api/v1/admin/users/${userId}`, config);
          setUsers((prev) => prev.filter((u) => u.id !== userId));
        } catch (err) {
          console.error('Delete user error:', err);
          setError(err.response?.data?.message || `Failed to delete user: HTTP ${err.response?.status || 'Unknown'}`);
        }
      }
    },
    [isAdmin, createAxiosConfig]
  );

  const toggleUserStatus = useCallback(
    async (userId) => {
      try {
        const config = createAxiosConfig();
        if (!config) {
          setError('Authentication required. Please log in again.');
          return;
        }

        await axios.patch(`http://localhost:5000/api/v1/admin/users/${userId}/toggle-status`, {}, config);
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' } : user
          )
        );
      } catch (err) {
        console.error('Toggle status error:', err);
        setError(err.response?.data?.message || `Failed to update status: HTTP ${err.response?.status || 'Unknown'}`);
      }
    },
    [createAxiosConfig]
  );

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  }, [pagination.pages]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'user', password: '', confirmPassword: '' });
    setFormError('');
  }, []);

  const StatCard = ({ icon: Icon, title, value, color, trend, percentage }) => (
    <div className={`relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl group
      ${darkMode ? 'bg-gray-800/80 border-gray-700/50 shadow-lg' : 'bg-white/80 border-gray-200/50 shadow-lg'}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/5"></div>
      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <p className={`text-sm font-semibold uppercase tracking-wider
                ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {title}
              </p>
              {trend && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                  ${trend === 'up' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                  <TrendingUp className="w-3 h-3" />
                  {percentage}%
                </div>
              )}
            </div>
            <p className={`text-3xl font-bold mb-1
              ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {value?.toLocaleString() || 0}
            </p>
            <p className={`text-sm
              ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total registered
            </p>
          </div>
          <div className={`${color} p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6 text-white drop-shadow-sm" />
          </div>
        </div>
      </div>
      <div className={`h-1 w-full ${color} opacity-20`}></div>
    </div>
  );

  StatCard.propTypes = {
    icon: PropTypes.elementType.isRequired,
    title: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired,
    trend: PropTypes.string,
    percentage: PropTypes.number,
  };

  const UserRow = ({ user }) => (
    <tr className={`border-b transition-all duration-200 hover:shadow-md
      ${darkMode ? 'hover:bg-gray-700/50 border-gray-700/50' : 'hover:bg-gray-50/80 border-gray-200/50'}`}>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 
              flex items-center justify-center text-white font-bold text-sm shadow-lg">
              {user.avatar}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white
              ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          <div className="hidden sm:block min-w-0">
            <p className={`text-sm font-semibold truncate
              ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {user.name}
            </p>
            <p className={`text-xs truncate
              ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              ID: {user.id.slice(-8)}
            </p>
          </div>
        </div>
      </td>
      <td className={`px-6 py-4 text-sm
        ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        <div className="sm:hidden font-semibold text-gray-900 dark:text-white mb-1">
          {user.name}
        </div>
        <div className="truncate">{user.email}</div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold capitalize
            ${user.role === 'admin'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
              : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'}`}>
            {user.role === 'admin' && <Shield className="w-3 h-3" />}
            {user.role}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <button
          onClick={() => toggleUserStatus(user.id)}
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200
            ${user.status === 'active'
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:scale-105'
              : 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:shadow-lg hover:scale-105'}`}>
          <div className={`w-2 h-2 rounded-full mr-2
            ${user.status === 'active' ? 'bg-green-200' : 'bg-red-200'}`}></div>
          {user.status}
        </button>
      </td>
      <td className={`px-6 py-4 text-sm hidden md:table-cell
        ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        <div className="flex flex-col">
          <span>{new Date(user.joined).toLocaleDateString()}</span>
          <span className="text-xs text-gray-500">
            {new Date(user.joined).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => editUser(user)}
            className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 dark:text-blue-400 
              rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-lg"
            aria-label={`Edit ${user.name}`}>
            <Edit className="w-4 h-4" />
          </button>
          {isAdmin() && (
            <button
              onClick={() => deleteUser(user.id)}
              className="p-2 text-red-600 hover:text-white hover:bg-red-600 dark:text-red-400 
                rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-lg"
              aria-label={`Delete ${user.name}`}>
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  UserRow.propTypes = {
    user: userPropType.isRequired,
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white mb-2">Loading Dashboard</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Please wait while we prepare your data...</div>
          {authLoading && <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">Authenticating...</div>}
        </div>
      </div>
    );
  }

  if (authError || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="text-center max-w-md mx-auto p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-red-200 dark:border-red-800">
          <div className="text-red-600 dark:text-red-400 mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="text-xl font-bold mb-3">
              {authError ? 'Authentication Error' : error.includes('Too many requests') ? 'Rate Limited' : 'Connection Error'}
            </div>
            <div className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{authError || error}</div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl">
            Reload Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-300
      ${darkMode ? 'dark bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-blue-50'}`}>
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-all duration-300 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className={`flex flex-col h-full backdrop-blur-xl border-r
          ${darkMode ? 'bg-gray-800/95 border-gray-700/50' : 'bg-white/95 border-gray-200/50'}`}>
          
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Admin Hub
                </h1>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Control Center
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
              <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-6 py-6 space-y-3">
            <a href="/admin" className={`flex items-center px-4 py-3 rounded-xl font-semibold transition-all duration-200
              ${darkMode ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 shadow-sm'}`}>
              <Users className="w-5 h-5 mr-3" />
              User Management
            </a>
            <a href="#" className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105
              ${darkMode ? 'text-gray-300 hover:bg-gray-700/50' : 'text-gray-700 hover:bg-gray-100'}`}>
              <Bell className="w-5 h-5 mr-3" />
              Notifications
            </a>
            <a href="#" className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105
              ${darkMode ? 'text-gray-300 hover:bg-gray-700/50' : 'text-gray-700 hover:bg-gray-100'}`}>
              <Settings className="w-5 h-5 mr-3" />
              Settings
            </a>
          </nav>

          {/* User Profile Section */}
          <div className="p-6 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user?.name || 'Admin'}
                </p>
                <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {user?.email || 'admin@example.com'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full mt-3 flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-all duration-200 bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl hover:scale-105">
              <X className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Top Header */}
        <header className={`sticky top-0 z-30 backdrop-blur-xl border-b px-4 sm:px-6 py-4
          ${darkMode ? 'bg-gray-800/95 border-gray-700/50' : 'bg-white/95 border-gray-200/50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                <Menu className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
              <div>
                <h2 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Dashboard Overview
                </h2>
                <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Manage users and monitor system statistics
                </p>
              </div>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button className={`p-2 sm:p-3 rounded-xl transition-all duration-200 hover:scale-110
                ${darkMode ? 'bg-gray-700/50 hover:bg-gray-600/50' : 'bg-gray-100 hover:bg-gray-200'}`}>
                <Bell className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 sm:p-3 rounded-xl transition-all duration-200 hover:scale-110
                  ${darkMode ? 'bg-gray-700/50 hover:bg-gray-600/50' : 'bg-gray-100 hover:bg-gray-200'}`}>
                {darkMode ? 
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" /> : 
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                }
              </button>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
          {/* Stats Grid - Fully Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            <StatCard
              icon={Users}
              title="Total Users"
              value={stats.totalUsers}
              color="bg-gradient-to-r from-blue-500 to-blue-600"
              trend="up"
              percentage={12}
            />
            <StatCard
              icon={UserCheck}
              title="Active Users"
              value={stats.activeUsers}
              color="bg-gradient-to-r from-green-500 to-green-600"
              trend="up"
              percentage={8}
            />
            <StatCard
              icon={Calendar}
              title="New This Month"
              value={stats.newUsersThisMonth}
              color="bg-gradient-to-r from-purple-500 to-purple-600"
              trend="up"
              percentage={24}
            />
            <StatCard
              icon={FileText}
              title="Total Blogs"
              value={stats.totalBlogs}
              color="bg-gradient-to-r from-orange-500 to-red-600"
            />
            <StatCard
              icon={Shield}
              title="Admin Users"
              value={stats.adminUsers}
              color="bg-gradient-to-r from-yellow-500 to-orange-600"
            />
            <StatCard
              icon={Users}
              title="Inactive Users"
              value={stats.inactiveUsers}
              color="bg-gradient-to-r from-gray-500 to-gray-600"
            />
          </div>

          {/* Controls Section - Mobile First */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              <h3 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                User Management
              </h3>
              {isAdmin() && (
                <button
                  onClick={addUser}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add New User</span>
                  <span className="sm:hidden">Add User</span>
                </button>
              )}
            </div>

            {/* Search and Filters - Responsive */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 lg:max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users by name, email, or role..."
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200
                    ${darkMode ? 'bg-gray-800/50 border-gray-700 text-gray-200 placeholder-gray-400' : 'bg-white/80 border-gray-200 text-gray-900 placeholder-gray-500'}`}
                />
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5
                  ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>

              {/* Filter and Sort Controls */}
              <div className="flex gap-3">
                {/* Role Filter */}
                <div className="relative">
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className={`appearance-none px-4 py-3 pr-8 rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200
                      ${darkMode ? 'bg-gray-800/50 border-gray-700 text-gray-200' : 'bg-white/80 border-gray-200 text-gray-900'}`}>
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-500" />
                </div>

                {/* Sort By */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`appearance-none px-4 py-3 pr-8 rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200
                      ${darkMode ? 'bg-gray-800/50 border-gray-700 text-gray-200' : 'bg-white/80 border-gray-200 text-gray-900'}`}>
                    <option value="joined">Sort by Join Date</option>
                    <option value="name">Sort by Name</option>
                    <option value="email">Sort by Email</option>
                    <option value="role">Sort by Role</option>
                    <option value="status">Sort by Status</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-500" />
                </div>

                {/* Export Button */}
                <button className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 hover:scale-105
                  ${darkMode ? 'border-gray-700 hover:bg-gray-700/50 text-gray-300' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Users Table - Mobile Responsive */}
          <div className="overflow-hidden rounded-2xl border shadow-2xl
            ${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80 border-gray-200/50'}">
            
            {/* Mobile Cards View - Hidden on Desktop */}
            <div className="block lg:hidden">
              {filteredUsers.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className={`p-4 transition-colors duration-200
                      ${darkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50/80'}`}>
                      
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 
                              flex items-center justify-center text-white font-bold text-sm shadow-lg">
                              {user.avatar}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white
                              ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {user.name}
                            </p>
                            <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {user.email}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold capitalize
                                ${user.role === 'admin'
                                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'}`}>
                                {user.role === 'admin' && <Shield className="w-3 h-3" />}
                                {user.role}
                              </span>
                              <button
                                onClick={() => toggleUserStatus(user.id)}
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold
                                  ${user.status === 'active'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                {user.status}
                              </button>
                            </div>
                            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                              Joined {new Date(user.joined).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 ml-2">
                          <button
                            onClick={() => editUser(user)}
                            className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200">
                            <Edit className="w-4 h-4" />
                          </button>
                          {isAdmin() && (
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className={`text-6xl mb-4 ${darkMode ? 'text-gray-700' : 'text-gray-300'}`}>
                    <Users className="w-16 h-16 mx-auto opacity-50" />
                  </div>
                  <p className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    No users found
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className={`border-b-2 ${darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50/80 border-gray-200'}`}>
                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider
                      ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      User
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider
                      ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Email
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider
                      ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Role
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider
                      ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Status
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider
                      ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Joined
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider
                      ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700/50">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => <UserRow key={user.id} user={user} />)
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className={`text-6xl mb-4 ${darkMode ? 'text-gray-700' : 'text-gray-300'}`}>
                          <Users className="w-16 h-16 mx-auto opacity-50" />
                        </div>
                        <p className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          No users found
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          Try adjusting your search or filters
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination - Responsive */}
          {pagination.pages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
              <div className={`text-sm order-2 sm:order-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Showing <span className="font-semibold">{filteredUsers.length}</span> of{' '}
                <span className="font-semibold">{pagination.total}</span> users
              </div>
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 font-medium
                    ${pagination.page === 1
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl hover:scale-105'}`}>
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </button>
                
                <div className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium
                  ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                  <span className="hidden sm:inline">Page </span>
                  {pagination.page} of {pagination.pages}
                </div>
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 font-medium
                    ${pagination.page === pagination.pages
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl hover:scale-105'}`}>
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">Next</span>
                </button>
              </div>
            </div>
          )}

          {/* Add/Edit User Modal - Responsive */}
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className={`relative w-full max-w-md mx-auto rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto
                ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                  {formError && (
                    <div className="mb-4 p-4 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800">
                      {formError}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200
                          ${darkMode ? 'bg-gray-700/50 border-gray-600 text-gray-200 placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'}`}
                        placeholder="Enter full name"
                        required
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200
                          ${darkMode ? 'bg-gray-700/50 border-gray-600 text-gray-200 placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'}`}
                        placeholder="Enter email address"
                        required
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        User Role *
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200
                          ${darkMode ? 'bg-gray-700/50 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-900'}
                          ${!isAdmin() ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!isAdmin()}
                        required>
                        <option value="user">User</option>
                        {isAdmin() && <option value="admin">Administrator</option>}
                      </select>
                      {!isAdmin() && (
                        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                          Admin role requires administrator privileges
                        </p>
                      )}
                    </div>

                    {!editingUser && (
                      <>
                        <div>
                          <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Password *
                          </label>
                          <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200
                              ${darkMode ? 'bg-gray-700/50 border-gray-600 text-gray-200 placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'}`}
                            placeholder="Enter secure password"
                            required
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Confirm Password *
                          </label>
                          <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200
                              ${darkMode ? 'bg-gray-700/50 border-gray-600 text-gray-200 placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'}`}
                            placeholder="Confirm password"
                            required
                          />
                        </div>
                      </>
                    )}

                    {/* Modal Actions */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6">
                      <button
                        type="button"
                        onClick={closeModal}
                        className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 border-2
                          ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700/50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105">
                        {editingUser ? 'Update User' : 'Create User'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

AdminDashboard.propTypes = {};

export default AdminDashboard;