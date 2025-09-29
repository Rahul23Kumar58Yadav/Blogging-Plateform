import React, { useState, useEffect } from 'react';
import { FaSignInAlt, FaEye, FaEyeSlash, FaMoon, FaSun } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [formData, setFormData] = useState(() => ({
    email: localStorage.getItem('rememberedEmail') || '',
    password: '',
  }));
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('rememberMe') === 'true');
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loginAttempts, setLoginAttempts] = useState(() => parseInt(localStorage.getItem('loginAttempts')) || 0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const checkLockStatus = () => {
      const storedLock = localStorage.getItem('accountLock');
      if (storedLock) {
        try {
          const { timestamp, attempts } = JSON.parse(storedLock);
          const lockDuration = 5 * 60 * 1000;
          const currentTime = Date.now();

          if (currentTime - timestamp < lockDuration) {
            setIsLocked(true);
            setLockTime(Math.ceil((lockDuration - (currentTime - timestamp)) / 1000));
            setLoginAttempts(attempts);
          } else {
            localStorage.removeItem('accountLock');
            localStorage.removeItem('loginAttempts');
            setLoginAttempts(0);
          }
        } catch {
          localStorage.removeItem('accountLock');
          localStorage.removeItem('loginAttempts');
        }
      }
    };

    checkLockStatus();
  }, []);

  useEffect(() => {
    if (lockTime > 0) {
      const timer = setInterval(() => {
        setLockTime((prev) => (prev <= 1 ? (clearInterval(timer), setIsLocked(false), resetLoginAttempts(), 0) : prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockTime]);

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        return !value.trim() ? 'Email is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email format' : '';
      case 'password':
        return !value ? 'Password is required' : value.length < 6 ? 'Password must be at least 6 characters' : '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    if (error) setError(null);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const validateForm = () => {
    const newErrors = { email: validateField('email', formData.email), password: validateField('password', formData.password) };
    setFieldErrors(newErrors);
    return !Object.values(newErrors).some((err) => err);
  };

  const handleAccountLock = () => {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    localStorage.setItem('loginAttempts', newAttempts);
    if (newAttempts >= 5) {
      localStorage.setItem('accountLock', JSON.stringify({ timestamp: Date.now(), attempts: newAttempts }));
      setIsLocked(true);
      setLockTime(300);
      setError('Account locked for 5 minutes due to multiple failed attempts.');
    }
  };

  const resetLoginAttempts = () => {
    setLoginAttempts(0);
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('accountLock');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) {
      toast.error(`Account locked. Try again in ${Math.ceil(lockTime / 60)} minute${lockTime > 60 ? 's' : ''}.`);
      return;
    }
    if (!validateForm()) return;
    setLoading(true);
    setError(null);
    try {
      const { success, user, error: loginError } = await login(formData.email, formData.password);
      if (!success) throw new Error(loginError || 'Login failed');
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
      }
      resetLoginAttempts();
      toast.success('Login successful!');
      navigate(user.role === 'admin' ? '/admin' : '/profile', { replace: true });
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      let errorMessage = 'Login failed. Please try again.';
      if (err.response?.data?.message) {
        errorMessage = {
          'Invalid email or password': 'Invalid email or password.',
          'Account deactivated. Contact support.': 'Your account is deactivated. Please contact support.',
          'Too many attempts. Try again later.': 'Too many login attempts. Please try again later.',
        }[err.response.data.message] || err.response.data.message;
        if (['Invalid credentials', 'User not found'].includes(err.response.data.message)) handleAccountLock();
      } else if (err.message.includes('network') || err.message.includes('timeout')) {
        errorMessage = 'Connection issue. Check your network and try again.';
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatLockTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTheme = () => setDarkMode((prev) => !prev);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 transition-colors duration-200">
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 p-2 bg-white/20 dark:bg-gray-800/50 backdrop-blur-md rounded-full border border-white/30 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Toggle theme"
      >
        {darkMode ? <FaSun className="h-6 w-6 text-yellow-400" /> : <FaMoon className="h-6 w-6 text-gray-700" />}
      </button>

      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-700">
            <FaSignInAlt className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Sign in to continue</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 border border-red-200 dark:border-red-700 text-sm text-red-700 dark:text-red-200">
                {error}
              </div>
            )}
            {isLocked && lockTime > 0 && (
              <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-3 border border-yellow-200 dark:border-yellow-700 text-sm text-yellow-700 dark:text-yellow-200">
                Locked. Time left: <span className="font-mono">{formatLockTime(lockTime)}</span>
              </div>
            )}
            {loginAttempts > 0 && loginAttempts < 5 && (
              <div className="rounded-md bg-orange-50 dark:bg-orange-900/20 p-3 border border-orange-200 dark:border-orange-700 text-sm text-orange-700 dark:text-orange-200">
                {5 - loginAttempts} attempt{5 - loginAttempts === 1 ? '' : 's'} left before lock.
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLocked || loading}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 ${fieldErrors.email && touched.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white`}
                placeholder="you@example.com"
              />
              {fieldErrors.email && touched.email && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLocked || loading}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 ${fieldErrors.password && touched.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isLocked || loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
              {fieldErrors.password && touched.password && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.password}</p>}
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLocked || loading}
                className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:bg-gray-700"
              />
              <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700 dark:text-gray-300">Remember me</label>
            </div>

            <button
              type="submit"
              disabled={isLocked || loading}
              className={`w-full py-2 px-4 rounded-md text-white font-medium focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${isLocked || loading ? 'bg-gray-400 dark:bg-gray-600' : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'}`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin h-5 w-5 border-t-2 border-white rounded-full mr-2"></span>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <Link to="/forgot-password" className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline">Forgot Password?</Link>
            <p>
              Don’t have an account?{' '}
              <Link to="/register" className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;