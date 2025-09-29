import { createContext, useContext, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, logout, verifyToken } from '../slice/authSlice';

// Enhanced token validation
const isValidJWT = (token) => {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  try {
    const payload = JSON.parse(atob(parts[1]));
    const now = Date.now() / 1000;
    if (payload.exp && payload.exp < now) {
      console.warn('Token is expired');
      return false;
    }
    return true;
  } catch (e) {
    console.warn('Invalid token payload:', e.message);
    return false;
  }
};

// Clear all auth data
const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  delete axios.defaults.headers.common['Authorization'];
};

// Axios interceptors for token management
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && !config.headers.Authorization) {
      if (!isValidJWT(token)) {
        console.warn('Invalid or expired token in localStorage - clearing');
        clearAuthData();
        return config;
      }
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Sending token (first 20 chars):', token.substring(0, 20) + '...');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const msg = error.response.data?.message?.toLowerCase() || '';
      const code = error.response.data?.code?.toUpperCase() || '';
      console.log('401 Response Details:', { message: msg, code, fullError: error.response.data });

      const shouldClearToken =
        code === 'TOKEN_EXPIRED' ||
        code === 'INVALID_TOKEN' ||
        code === 'INVALID_PAYLOAD' ||
        code === 'JWT_MALFORMED' ||
        msg.includes('expired') ||
        msg.includes('invalid') ||
        msg.includes('malformed');

      if (shouldClearToken) {
        console.log('Attempting token refresh before clearing...');
        const authContext = window.__authContext;
        if (authContext && authContext.refreshToken) {
          const success = await authContext.refreshToken();
          if (success && error.config && !error.config.__isRetry) {
            error.config.__isRetry = true;
            const newToken = localStorage.getItem('token');
            error.config.headers.Authorization = `Bearer ${newToken}`;
            return axios(error.config);
          }
        }
        console.log('Clearing authentication due to token issue');
        clearAuthData();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

const AuthContext = createContext({
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  login: () => {},
  register: () => {},
  logout: () => {},
  updateProfile: () => {},
  hasPermission: () => {},
  isAdmin: () => {},
  isUser: () => {},
  setError: () => {},
  refreshToken: () => {},
});

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isAuthLoading, error } = useSelector((state) => state.auth);

  const initializeAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found in localStorage');
        dispatch(logout());
        return;
      }

      console.log('Initializing auth with token (first 20 chars):', token.substring(0, 20) + '...');

      if (!isValidJWT(token)) {
        console.error('Invalid or expired stored token - removing');
        dispatch(logout());
        return;
      }

      // Verify token with backend
      const result = await dispatch(verifyToken(token)).unwrap();
      console.log('verifyToken result:', result);
      dispatch(setCredentials({
        user: {
          id: result.user.id || result.user._id,
          name: result.user.name || 'Unknown',
          email: result.user.email || '',
          role: result.user.role || 'user',
          avatar: result.user.avatar || result.user.name?.charAt(0).toUpperCase() || 'U',
          permissions: result.user.permissions || [],
        },
        token,
      }));
    } catch (authError) {
      console.error('Auth initialization error:', {
        message: authError.message || 'Unknown error',
        status: authError.response?.status,
        data: authError.response?.data,
        code: authError.response?.data?.code,
        stack: authError.stack,
      });
      if (authError.response?.status === 401) {
        const refreshSuccess = await refreshToken();
        if (!refreshSuccess) {
          dispatch(logout());
        }
      } else {
        dispatch(logout());
      }
    }
  }, [dispatch]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    window.__authContext = { refreshToken };
    return () => {
      delete window.__authContext;
    };
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.log('No refresh token found');
        return false;
      }

      console.log('Attempting token refresh...');
      const response = await axios.post(
        'http://localhost:5000/api/v1/auth/refresh',
        { refreshToken },
        { timeout: 10000 }
      );

      console.log('Refresh token response:', response.data);
      const responseData = response.data.data || response.data;
      const { accessToken, token: altToken, user: updatedUser } = responseData;

      const newToken = accessToken || altToken;
      if (!newToken) {
        throw new Error('No access token in refresh response');
      }

      if (!isValidJWT(newToken)) {
        throw new Error('Received invalid token from refresh endpoint');
      }

      localStorage.setItem('token', newToken);
      const newRefreshToken = responseData.refreshToken;
      if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      if (updatedUser) {
        dispatch(setCredentials({
          user: {
            id: updatedUser.id || updatedUser._id,
            name: updatedUser.name || 'Unknown',
            email: updatedUser.email || '',
            role: updatedUser.role || 'user',
            avatar: updatedUser.avatar || updatedUser.name?.charAt(0).toUpperCase() || 'U',
            permissions: updatedUser.permissions || [],
          },
          token: newToken,
        }));
      }

      console.log('Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('Token refresh failed:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      dispatch(logout());
      return false;
    }
  }, [dispatch]);

  const login = useCallback(async (email, password) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/v1/auth/login',
        { email, password },
        {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' },
        }
      );

      console.log('Login response received:', response.data);
      const responseData = response.data.data || response.data;
      const token = responseData.token || responseData.accessToken || responseData.jwt;

      if (!token) {
        throw new Error(`No token found in response. Available keys: ${Object.keys(response.data).join(', ')}`);
      }

      if (!isValidJWT(token)) {
        throw new Error('Received invalid token format from server');
      }

      const refreshToken = responseData.refreshToken || response.data.refreshToken;
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      const loginUser = responseData.user || responseData.profile || {};

      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      dispatch(setCredentials({
        user: {
          id: loginUser.id || loginUser._id,
          name: loginUser.name || 'Unknown',
          email: loginUser.email || email,
          role: loginUser.role || 'user',
          avatar: loginUser.avatar || loginUser.name?.charAt(0).toUpperCase() || email.charAt(0).toUpperCase(),
          permissions: loginUser.permissions || [],
        },
        token,
      }));

      console.log('Login successful - token stored (first 20 chars):', token.substring(0, 20) + '...');
      return { success: true, user: { ...loginUser, token } };
    } catch (error) {
      console.error('Login error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      const errorMessage =
        error.response?.data?.message || error.response?.data?.data?.message || error.message || 'Login failed';
      dispatch(setCredentials({ user: null, token: null }));
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  const register = useCallback(async (name, email, password, confirmPassword, role) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/v1/auth/register',
        { name, email, password, confirmPassword, role },
        {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' },
        }
      );

      console.log('Register response:', response.data);
      const responseData = response.data.data || response.data;
      const token = responseData.token || responseData.accessToken || responseData.jwt;
      const refreshToken = responseData.refreshToken;
      const regUser = responseData.user || responseData.profile || {};

      if (token) {
        if (!isValidJWT(token)) {
          throw new Error('Received invalid token format from server');
        }
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        dispatch(setCredentials({
          user: {
            id: regUser.id || regUser._id,
            name: regUser.name || name,
            email: regUser.email || email,
            role: regUser.role || role || 'user',
            avatar: regUser.avatar || name?.charAt(0).toUpperCase() || 'U',
            permissions: regUser.permissions || [],
          },
          token,
        }));
      }

      return { success: true, user: regUser };
    } catch (error) {
      console.error('Register error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      const errorMessage =
        error.response?.data?.message || error.response?.data?.data?.message || 'Registration failed';
      dispatch(setCredentials({ user: null, token: null }));
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post('http://localhost:5000/api/v1/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
      dispatch(logout());
      console.log('User logged out - auth data cleared');
    }
  }, [dispatch]);

  const updateProfile = useCallback(async (updatedData) => {
    try {
      const token = localStorage.getItem('token');
      if (!isValidJWT(token)) {
        throw new Error('No valid token found');
      }

      const response = await axios.put(
        'http://localhost:5000/api/v1/users/profile',
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );

      const updatedUser = response.data.data?.user || response.data.user || response.data;
      dispatch(setCredentials({
        user: {
          id: updatedUser.id || updatedUser._id,
          name: updatedUser.name || user?.name || 'Unknown',
          email: updatedUser.email || user?.email || '',
          role: updatedUser.role || user?.role || 'user',
          avatar: updatedUser.avatar || updatedUser.name?.charAt(0).toUpperCase() || user?.avatar || 'U',
          permissions: updatedUser.permissions || user?.permissions || [],
        },
        token,
      }));

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Update profile error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      return { success: false, error: errorMessage };
    }
  }, [dispatch, user]);

  const hasPermission = useCallback((permission) => {
    return user?.permissions?.includes(permission) || false;
  }, [user]);

  const isAdmin = useCallback(() => user?.role === 'admin', [user]);
  const isUser = useCallback(() => user?.role === 'user', [user]);

  const setError = useCallback((errorMessage) => {
    dispatch(setCredentials({ user: null, token: null }));
  }, [dispatch]);

  const value = {
    user,
    loading: isAuthLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    hasPermission,
    isAdmin,
    isUser,
    setError,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;