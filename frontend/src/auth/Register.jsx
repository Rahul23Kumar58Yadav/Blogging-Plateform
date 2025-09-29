import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import "./Register.css"

// Icon Components
const FaUserPlus = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/>
  </svg>
);

const FaUser = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
  </svg>
);

const FaUserShield = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h4a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zM8 5a1 1 0 011-1h4a1 1 0 011 1v1H8V5z" clipRule="evenodd"/>
  </svg>
);

const FaEnvelope = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
  </svg>
);

const FaLock = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
  </svg>
);

const FaEye = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
  </svg>
);

const FaEyeSlash = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/>
    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
  </svg>
);

const FaSun = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/>
  </svg>
);

const FaMoon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
  </svg>
);

const Register = () => {
  const { register: authRegister, isAuthenticated, user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 3) return 'Name must be at least 3 characters';
        if (!/^[a-zA-Z0-9_\s-]+$/.test(value.trim())) return 'Name can only contain letters, numbers, hyphens, underscores, and spaces';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      case 'role':
        if (!value) return 'Please select an account type';
        return '';
      default:
        return '';
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.match(/[A-Z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^A-Za-z0-9]/)) strength += 1;
    return strength;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError('');
    }

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));

      if (formData.confirmPassword && touched.confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: validateField('confirmPassword', formData.confirmPassword),
        }));
      }
    }

    if (name === 'confirmPassword' && touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateField(name, value),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const validate = () => {
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      newErrors[field] = validateField(field, formData[field]);
    });

    setErrors(newErrors);
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    return !Object.values(newErrors).some(error => error);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) {
    toast.error('Please fix the form errors before submitting.');
    return;
  }
  setIsSubmitting(true);
  setError('');
  try {
    console.log('Register.jsx: Attempting registration with endpoint:', 'http://localhost:5000/api/v1/auth/register');
    console.log('Register.jsx: Sending data:', {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: '[REDACTED]',
      confirmPassword: '[REDACTED]',
      role: formData.role,
    });
    const result = await authRegister(
      formData.name.trim(),
      formData.email.trim(),
      formData.password,
      formData.confirmPassword,
      formData.role
    );
    console.log('Register.jsx: Registration successful:', result);
    if (!result.success) {
      throw new Error(result.error || 'Registration failed');
    }
    toast.success('Registration successful! Welcome aboard!');
    // Use the role from the backend response
    const userRole = result.data?.user?.role || formData.role;
    navigate(userRole === 'admin' ? '/admin' : '/profile', { replace: true });
  } catch (err) {
    console.error('Register.jsx: Registration error details:', err.message, err.response?.status);
    let errorMessage = err.message;
    if (err.message.includes('Network Error') || err.message.includes('ECONNREFUSED')) {
      errorMessage = 'Cannot connect to server. Please ensure the backend is running on port 5000.';
    } else if (err.message.includes('404')) {
      errorMessage = 'Registration endpoint not found. Please verify backend configuration at http://localhost:5000/api/v1/auth/register.';
    } else if (err.response?.status === 409) {
      errorMessage = 'An account with this email already exists.';
    } else if (err.response?.status) {
      errorMessage = `Server error (${err.response.status}): ${err.response.data?.message || 'Unknown error'}`;
    }
    setError(errorMessage);
    toast.error(errorMessage);
  } finally {
    setIsSubmitting(false);
  }
};

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0: return formData.password ? 'Very Weak' : '';
      case 1: return 'Weak';
      case 2: return 'Moderate';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return '';
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return 'bg-red-500';
      case 1: return 'bg-red-400';
      case 2: return 'bg-yellow-400';
      case 3: return 'bg-blue-400';
      case 4: return 'bg-green-500';
      default: return 'bg-transparent';
    }
  };

  const getPasswordStrengthTextColor = () => {
    switch (passwordStrength) {
      case 0: return 'text-red-500';
      case 1: return 'text-red-400';
      case 2: return 'text-yellow-500';
      case 3: return 'text-blue-500';
      case 4: return 'text-green-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <>
     

      <div className="min-h-screen bg-gradient-to-br from-green-500 via-teal-600 to-blue-500 dark:from-green-800 dark:via-teal-900 dark:to-blue-800 transition-colors duration-300">
        
        {/* Dark Mode Toggle - Fixed Position */}
        <div className="fixed top-6 right-6 z-50">
          <button
            onClick={toggleDarkMode}
            className="p-3 bg-white/20 dark:bg-gray-900/40 backdrop-blur-lg rounded-full border border-white/30 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <FaSun className="w-6 h-6 text-yellow-400" />
            ) : (
              <FaMoon className="w-6 h-6 text-slate-700" />
            )}
          </button>
        </div>

        {/* Main Container */}
        <div className="flex min-h-screen">
          {/* Left Panel - Info/Branding */}
         

          {/* Right Panel - Form with Enhanced Scrolling */}
          <div className="w-full lg:w-full flex items-start justify-center min-h-screen">
            <div className="w-full max-w-md p-6 scroll-container">
              <div className="py-4">
                {/* Main Card with Enhanced Border Radius */}
                <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl p-3 border border-white/20 dark:border-gray-700/50 transition-all duration-300">
                  
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
                      <FaUserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      Create Account
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Join our blogging community today
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* General Error */}
                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-2xl text-sm animate-fadeIn">
                        {error}
                      </div>
                    )}

                    {/* Name Field */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUser className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full pl-12 pr-4 py-4 border rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                            errors.name ? 'border-red-500 shake' : 'border-gray-300 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-600'
                          }`}
                          placeholder="Enter your full name"
                        />
                      </div>
                      {errors.name && (
                        <p className="text-red-600 dark:text-red-400 text-sm animate-bounce">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaEnvelope className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full pl-12 pr-4 py-4 border rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                            errors.email ? 'border-red-500 shake' : 'border-gray-300 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-600'
                          }`}
                          placeholder="Enter your email"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-600 dark:text-red-400 text-sm animate-bounce">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaLock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full pl-12 pr-12 py-4 border rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                            errors.password ? 'border-red-500 shake' : 'border-gray-300 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-600'
                          }`}
                          placeholder="Create a password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-2xl transition-colors duration-200"
                        >
                          {showPassword ? (
                            <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                          ) : (
                            <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-600 dark:text-red-400 text-sm animate-bounce">
                          {errors.password}
                        </p>
                      )}
                      
                      {/* Password Strength Indicator */}
                      {formData.password && (
                        <div className="space-y-2 animate-fadeIn">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ease-out ${getPasswordStrengthColor()}`}
                                style={{ width: `${(passwordStrength / 4) * 100}%` }}
                              />
                            </div>
                            <span className={`text-sm font-medium ${getPasswordStrengthTextColor()}`}>
                              {getPasswordStrengthText()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaLock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full pl-12 pr-12 py-4 border rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                            errors.confirmPassword ? 'border-red-500 shake' : 'border-gray-300 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-600'
                          }`}
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-2xl transition-colors duration-200"
                        >
                          {showConfirmPassword ? (
                            <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                          ) : (
                            <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-600 dark:text-red-400 text-sm animate-bounce">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Account Type
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        
                        {/* User Role */}
                        <div className="relative">
                          <input
                            type="radio"
                            id="user"
                            name="role"
                            value="user"
                            checked={formData.role === 'user'}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <label
                            htmlFor="user"
                            className={`flex flex-col items-center justify-center p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 space-y-2 transform hover:scale-105 ${
                              formData.role === 'user'
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500 ring-opacity-50 shadow-lg'
                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md'
                            }`}
                          >
                            <FaUser className={`w-6 h-6 ${
                              formData.role === 'user' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                            }`} />
                            <div className="text-center">
                              <div className="font-semibold text-gray-900 dark:text-white text-sm">
                                User
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Regular account
                              </div>
                            </div>
                          </label>
                        </div>

                        {/* Admin Role */}
                        <div className="relative">
                          <input
                            type="radio"
                            id="admin"
                            name="role"
                            value="admin"
                            checked={formData.role === 'admin'}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <label
                            htmlFor="admin"
                            className={`flex flex-col items-center justify-center p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 space-y-2 transform hover:scale-105 ${
                              formData.role === 'admin'
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500 ring-opacity-50 shadow-lg'
                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md'
                            }`}
                          >
                            <FaUserShield className={`w-6 h-6 ${
                              formData.role === 'admin' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                            }`} />
                            <div className="text-center">
                              <div className="font-semibold text-gray-900 dark:text-white text-sm">
                                Admin
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Management access
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>
                      {errors.role && (
                        <p className="text-red-600 dark:text-red-400 text-sm animate-bounce">
                          {errors.role}
                        </p>
                      )}
                    </div>

                    {/* Terms and Privacy */}
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="terms"
                        className="mt-1 w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        required
                      />
                      <label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300">
                        I agree to the{' '}
                        <button
                          type="button"
                          className="text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 underline underline-offset-2"
                          onClick={() => alert('Terms of Service')}
                        >
                          Terms of Service
                        </button>{' '}
                        and{' '}
                        <button
                          type="button"
                          className="text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 underline underline-offset-2"
                          onClick={() => alert('Privacy Policy')}
                        >
                          Privacy Policy
                        </button>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Creating Account...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <FaUserPlus className="w-5 h-5" />
                          <span>Create Account</span>
                        </div>
                      )}
                    </button>
                  </form>

                  {/* Footer */}
                  <div className="mt-8 text-center space-y-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Already have an account?{' '}
                      <button
                        onClick={() => alert('Navigate to login page')}
                        className="font-semibold text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 transition-colors duration-200 focus:outline-none focus:underline underline-offset-2 hover:underline"
                      >
                        Sign in instead
                      </button>
                    </p>
                    
                    {/* Social Login Options */}
                    <div className="space-y-3">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                            Or continue with
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => alert('Google Sign Up')}
                          className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Google
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => alert('GitHub Sign Up')}
                          className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                          GitHub
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

          
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;


