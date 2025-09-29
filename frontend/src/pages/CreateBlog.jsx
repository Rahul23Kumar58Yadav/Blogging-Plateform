import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Save, Eye, X, Plus, ChevronDown, Bold, Italic, Underline,
  List, ListOrdered, Quote, Code, Heading1, Heading2, Heading3,
  Type, Upload, FileText, Globe, Lock, CheckCircle, AlertCircle, Loader
} from 'lucide-react';

const DRAFT_KEY = 'blog_draft';

const CreateBlog = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAuthenticated, refreshToken } = useAuth();
  const contentRef = useRef(null);
  const fileInputRef = useRef(null);

  // Consolidated state
  const [formData, setFormData] = useState({
    title: '', content: '', excerpt: '', category: '', tags: [],
    featuredImage: null, seoTitle: '', seoDescription: '', slug: '', status: 'draft'
  });

  const [uiState, setUiState] = useState({
    currentTag: '', showPreview: false, showAdvanced: false,
    imagePreview: null, isSubmitting: false, lastSaved: null, imageLoading: false
  });

  const [metrics, setMetrics] = useState({ wordCount: 0, readingTime: 0 });
  const [errors, setErrors] = useState({});

  const categories = [
    'Technology', 'Lifestyle', 'Travel', 'Food', 'Health',
    'Business', 'Education', 'Entertainment', 'Sports', 'Other'
  ];

  useEffect(() => {
    console.log('Auth State:', {
      user: user?.name || 'No user',
      isAuthenticated,
      authLoading,
      token: localStorage.getItem('token') ? 'exists' : 'missing'
    });
  }, [user, isAuthenticated, authLoading]);

  // Load draft from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed, featuredImage: null }));
        setUiState(prev => ({ ...prev, imagePreview: null }));
        setErrors(prev => ({ ...prev, submit: 'success:Loaded local draft!' }));
        setTimeout(() => setErrors(prev => ({ ...prev, submit: '' })), 3000);
      } catch (e) {
        console.error('Failed to load draft', e);
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, []);

  // Auto-calculate metrics
  useEffect(() => {
    const text = formData.content.replace(/<[^>]*>/g, '');
    const words = text.trim() ? text.split(/\s+/).length : 0;
    setMetrics({
      wordCount: words,
      readingTime: Math.max(1, Math.ceil(words / 200))
    });
  }, [formData.content]);

  // Auto-generate slug
  useEffect(() => {
    if (formData.title && !formData.slug) {
      const slug = formData.title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, formData.slug]);

  // Optimized API call with token validation
  const makeAPICall = async (data, isDraft = false) => {
    const token = localStorage.getItem('token');
    if (!token || !user) {
      console.log('Token or user missing:', { tokenExists: !!token, userExists: !!user });
      setErrors(prev => ({ ...prev, submit: 'Session expired. Please log in again.' }));
      return { success: false };
    }

    if (typeof token !== 'string' || token.split('.').length !== 3) {
      console.warn('Invalid token format detected - clearing token');
      localStorage.removeItem('token');
      setErrors(prev => ({ ...prev, submit: 'Invalid session. Please log in again.' }));
      return { success: false };
    }

    console.log('API Token (first 20 chars):', token.substring(0, 20) + '...');
    console.log('Making API call to:', 'http://localhost:5000/api/v1/blogs');

    if (!user) {
      setErrors(prev => ({ ...prev, submit: 'Please wait for authentication to complete.' }));
      return { success: false };
    }

    const formDataToSend = new FormData();

    const title = data.title?.trim() || (isDraft ? `Draft-${Date.now()}` : 'Untitled Post');
    const content = data.content?.trim() || (isDraft ? '<p>Draft content...</p>' : '<p>Content...</p>');
    const category = data.category?.trim() || 'Other';

    if (!isDraft) {
      if (!data.title?.trim()) {
        setErrors(prev => ({ ...prev, title: 'Title is required for publishing' }));
        return { success: false };
      }
      if (!data.content?.trim() || data.content === '<p><br></p>') {
        setErrors(prev => ({ ...prev, content: 'Content is required for publishing' }));
        return { success: false };
      }
      if (!data.category) {
        setErrors(prev => ({ ...prev, category: 'Category is required for publishing' }));
        return { success: false };
      }
    }

    formDataToSend.append('title', title);
    formDataToSend.append('content', content);
    formDataToSend.append('category', category);
    formDataToSend.append('excerpt', data.excerpt?.trim() || '');
    formDataToSend.append('status', isDraft ? 'draft' : 'published');
    formDataToSend.append('tags', JSON.stringify(Array.isArray(data.tags) ? data.tags : []));
    formDataToSend.append('seoTitle', data.seoTitle?.trim() || '');
    formDataToSend.append('seoDescription', data.seoDescription?.trim() || '');
    formDataToSend.append('slug', data.slug?.trim() || `${title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').substring(0, 50)}-${Date.now()}`);

    if (data.featuredImage instanceof File) {
      formDataToSend.append('featuredImage', data.featuredImage);
    }

    try {
      const response = await axios.post('http://localhost:5000/api/v1/blogs', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      console.log('API Response:', response.data);
      const { blog } = response.data.data;
      if (blog.featuredImage) {
        setUiState(prev => ({
          ...prev,
          imagePreview: `http://localhost:5000${blog.featuredImage}`
        }));
      }
      return { success: true, data: blog };
    } catch (error) {
      console.error('API Error:', error);
      let errorMessage = 'Operation failed. Please try again.';
      if (error.response?.status === 401) {
        if (error.response.data?.message?.toLowerCase().includes('invalid token format')) {
          localStorage.removeItem('token');
          errorMessage = 'Invalid session. Please log in again.';
        } else {
          const refreshed = await refreshToken();
          if (refreshed) return makeAPICall(data, isDraft);
          errorMessage = 'Authentication failed. Please log in again.';
        }
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid data provided';
        if (error.response.data?.errors?.featuredImage) {
          setErrors(prev => ({ ...prev, featuredImage: error.response.data.errors.featuredImage }));
        }
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Check your connection.';
      }

      setErrors(prev => ({ ...prev, submit: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUiState(prev => ({ ...prev, imageLoading: true }));
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, featuredImage: 'Image must be less than 5MB' }));
      setUiState(prev => ({ ...prev, imageLoading: false }));
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, featuredImage: 'Only JPEG, PNG, and WebP images are allowed' }));
      setUiState(prev => ({ ...prev, imageLoading: false }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setUiState(prev => ({ ...prev, imagePreview: e.target.result, imageLoading: false }));
    reader.onerror = () => {
      setErrors(prev => ({ ...prev, featuredImage: 'Failed to read image file' }));
      setUiState(prev => ({ ...prev, imageLoading: false }));
    };
    reader.readAsDataURL(file);
    updateFormData('featuredImage', file);
    setErrors(prev => ({ ...prev, featuredImage: '' }));
  };

  const removeImage = () => {
    setUiState(prev => ({ ...prev, imagePreview: null }));
    updateFormData('featuredImage', null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addTag = () => {
    const tag = uiState.currentTag.trim();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      updateFormData('tags', [...formData.tags, tag]);
      setUiState(prev => ({ ...prev, currentTag: '' }));
    }
  };

  const removeTag = (tagToRemove) => {
    updateFormData('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const insertFormatting = (format) => {
    try {
      const selection = window.getSelection();
      if (!selection.rangeCount || !contentRef.current?.contains(selection.anchorNode)) return;

      const range = selection.getRangeAt(0);
      const text = range.toString() || 'Sample Text';

      const formatMap = {
        bold: `<strong>${text}</strong>`,
        italic: `<em>${text}</em>`,
        underline: `<u>${text}</u>`,
        h1: `<h1>${text}</h1>`,
        h2: `<h2>${text}</h2>`,
        h3: `<h3>${text}</h3>`,
        ul: `<ul><li>${text}</li></ul>`,
        ol: `<ol><li>${text}</li></ol>`,
        quote: `<blockquote>${text}</blockquote>`,
        code: `<code>${text}</code>`
      };

      const formatted = formatMap[format] || text;
      range.deleteContents();

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = formatted;
      const fragment = document.createDocumentFragment();
      while (tempDiv.firstChild) fragment.appendChild(tempDiv.firstChild);

      range.insertNode(fragment);
      updateFormData('content', contentRef.current.innerHTML);
    } catch (error) {
      console.error('Formatting error:', error);
    }
  };

  const validateForm = (isDraft = false) => {
    const newErrors = {};

    if (!isDraft) {
      if (!formData.title?.trim()) newErrors.title = 'Title is required for publishing';
      else if (formData.title.length > 100) newErrors.title = 'Title cannot exceed 100 characters';

      if (!formData.content?.trim() || formData.content === '<p><br></p>')
        newErrors.content = 'Content is required for publishing';
      else if (formData.content.length < 10) newErrors.content = 'Content must be at least 10 characters';

      if (!formData.category) newErrors.category = 'Category is required for publishing';

      if (!formData.excerpt?.trim()) newErrors.excerpt = 'Excerpt is required for publishing';
      else if (formData.excerpt.length > 300) newErrors.excerpt = 'Excerpt cannot exceed 300 characters';
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const saveDraft = async () => {
    setErrors(prev => ({ ...prev, submit: '', title: '', content: '' }));

    if (!formData.title?.trim() && !formData.content?.trim()) {
      setErrors(prev => ({ ...prev, submit: 'Add some content before saving draft.' }));
      return;
    }

    setUiState(prev => ({ ...prev, isSubmitting: true }));

    try {
      const isAuth = !authLoading && isAuthenticated && user && localStorage.getItem('token');
      if (!isAuth) {
        const draftData = { ...formData, featuredImage: null }; // Exclude File object
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
        setUiState(prev => ({ ...prev, lastSaved: new Date(), isSubmitting: false }));
        setErrors(prev => ({ ...prev, submit: 'success:Draft saved locally! Note: Images are not saved locally.' }));
        setTimeout(() => setErrors(prev => ({ ...prev, submit: '' })), 3000);
        return;
      }

      const result = await makeAPICall({ ...formData, status: 'draft' }, true);
      if (result.success) {
        localStorage.removeItem(DRAFT_KEY);
        setUiState(prev => ({ ...prev, lastSaved: new Date(), isSubmitting: false }));
        setErrors(prev => ({ ...prev, submit: 'success:Draft saved successfully!' }));
        setTimeout(() => setErrors(prev => ({ ...prev, submit: '' })), 3000);
      }
    } catch (error) {
      console.error('Save draft error:', error);
      setErrors(prev => ({ ...prev, submit: 'Failed to save draft. Please check your connection and try again.' }));
    } finally {
      setUiState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const publishBlog = async () => {
    setErrors({});

    const isAuth = !authLoading && isAuthenticated && user && localStorage.getItem('token');
    if (!isAuth) {
      setErrors(prev => ({ ...prev, submit: 'Please log in to publish.' }));
      return;
    }

    if (!validateForm(false)) return;

    setUiState(prev => ({ ...prev, isSubmitting: true }));

    try {
      const result = await makeAPICall({ ...formData, status: 'published' }, false);
      if (result.success) {
        localStorage.removeItem(DRAFT_KEY);
        setUiState(prev => ({
          ...prev,
          imagePreview: result.data.featuredImage ? result.data.featuredImage : null,
          isSubmitting: false
        }));
        setErrors(prev => ({ ...prev, submit: 'success:Blog published successfully!' }));
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (error) {
      console.error('Publish blog error:', error);
      setErrors(prev => ({ ...prev, submit: 'Failed to publish blog. Please check your connection and try again.' }));
    } finally {
      setUiState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading user data...</p>
          <p className="text-sm text-gray-500">Token: {localStorage.getItem('token') ? 'Found' : 'Missing'}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Authentication Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please log in to create and publish blog posts.
          </p>
          {errors.auth && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-700 text-sm">{errors.auth}</p>
            </div>
          )}
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create New Post
              </h1>
              {uiState.lastSaved && (
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                  Saved {uiState.lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setUiState(prev => ({ ...prev, showPreview: !prev.showPreview }))}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Preview</span>
              </button>
              <button
                onClick={saveDraft}
                disabled={uiState.isSubmitting}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uiState.isSubmitting ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Draft</span>
              </button>
              <button
                onClick={publishBlog}
                disabled={uiState.isSubmitting}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uiState.isSubmitting ? <Loader className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                <span>Publish</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <input
                  type="text"
                  placeholder="Enter your blog title..."
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  className="w-full text-2xl sm:text-3xl font-bold bg-transparent text-gray-900 dark:text-white border-none focus:outline-none placeholder-gray-400"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Featured Image
                </label>
                {uiState.imageLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                ) : uiState.imagePreview ? (
                  <div className="relative">
                    <img
                      src={uiState.imagePreview}
                      alt="Featured"
                      className="w-full h-48 sm:h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 cursor-pointer transition-colors"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Click to upload featured image</p>
                    <p className="text-sm text-gray-500">PNG, JPG, WebP up to 5MB</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {errors.featuredImage && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.featuredImage}
                  </p>
                )}
              </div>

              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    ['bold', Bold, 'Bold'],
                    ['italic', Italic, 'Italic'],
                    ['underline', Underline, 'Underline'],
                    ['h1', Heading1, 'Heading 1'],
                    ['h2', Heading2, 'Heading 2'],
                    ['h3', Heading3, 'Heading 3'],
                    ['ul', List, 'Bullet List'],
                    ['ol', ListOrdered, 'Numbered List'],
                    ['quote', Quote, 'Quote'],
                    ['code', Code, 'Code']
                  ].map(([format, Icon, title]) => (
                    <button
                      key={format}
                      onClick={() => insertFormatting(format)}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                      title={title}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                <div
                  ref={contentRef}
                  contentEditable
                  suppressContentEditableWarning={true}
                  placeholder="Start writing your blog content..."
                  dangerouslySetInnerHTML={{ __html: formData.content }}
                  onInput={(e) => updateFormData('content', e.currentTarget.innerHTML)}
                  onBlur={(e) => updateFormData('content', e.currentTarget.innerHTML)}
                  className="w-full min-h-96 bg-transparent text-gray-900 dark:text-white border-none focus:outline-none leading-relaxed text-lg prose prose-lg max-w-none"
                  style={{ minHeight: '24rem' }}
                />
                {formData.content === '' && (
                  <div className="absolute pointer-events-none text-gray-400 text-lg mt-[-24rem] p-0">
                    Start writing your blog content...
                  </div>
                )}
                {errors.content && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.content}
                  </p>
                )}
              </div>

              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span>{metrics.wordCount} words</span>
                    <span>{metrics.readingTime} min read</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Type className="w-4 h-4" />
                    <span>Rich text editor</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => updateFormData('category', e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags {formData.tags.length > 0 && `(${formData.tags.length}/10)`}
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add tag"
                      value={uiState.currentTag}
                      onChange={(e) => setUiState(prev => ({ ...prev, currentTag: e.target.value }))}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      className="flex-1 p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={addTag}
                      disabled={formData.tags.length >= 10}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                      >
                        #{tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Excerpt * <span className="text-xs text-gray-500">({formData.excerpt.length}/300)</span>
                  </label>
                  <textarea
                    placeholder="Brief description of your blog post..."
                    value={formData.excerpt}
                    onChange={(e) => updateFormData('excerpt', e.target.value)}
                    rows="3"
                    maxLength="300"
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  {errors.excerpt && (
                    <p className="text-red-500 text-sm mt-1">{errors.excerpt}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setUiState(prev => ({ ...prev, showAdvanced: !prev.showAdvanced }))}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SEO Settings</h3>
                <ChevronDown className={`w-5 h-5 text-gray-400 transform transition-transform ${uiState.showAdvanced ? 'rotate-180' : ''}`} />
              </button>
              {uiState.showAdvanced && (
                <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SEO Title <span className="text-xs text-gray-500">({formData.seoTitle.length}/70)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="SEO optimized title"
                      value={formData.seoTitle}
                      onChange={(e) => updateFormData('seoTitle', e.target.value)}
                      maxLength="70"
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meta Description <span className="text-xs text-gray-500">({formData.seoDescription.length}/160)</span>
                    </label>
                    <textarea
                      placeholder="SEO meta description"
                      value={formData.seoDescription}
                      onChange={(e) => updateFormData('seoDescription', e.target.value)}
                      rows="3"
                      maxLength="160"
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      placeholder="url-friendly-slug"
                      value={formData.slug}
                      onChange={(e) => updateFormData('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'))}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Content Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Words</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{metrics.wordCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Reading Time</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{metrics.readingTime} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tags</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{formData.tags.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Characters</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{formData.content.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {uiState.showPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setUiState(prev => ({ ...prev, showPreview: false }))}
            />
            <div className="relative inline-block w-full max-w-4xl p-6 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Preview</h3>
                <button
                  onClick={() => setUiState(prev => ({ ...prev, showPreview: false }))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <article className="prose prose-lg dark:prose-invert max-w-none">
                  {uiState.imagePreview && (
                    <div className="mb-6">
                      <img
                        src={uiState.imagePreview}
                        alt="Featured"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {formData.title || 'Untitled Post'}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
                    <span>By {user?.name || 'Anonymous'}</span>
                    <span>•</span>
                    <span>{metrics.readingTime} min read</span>
                    <span>•</span>
                    <span>{formData.category || 'Uncategorized'}</span>
                  </div>
                  {formData.excerpt && (
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 italic">
                      {formData.excerpt}
                    </p>
                  )}
                  <div
                    className="text-gray-900 dark:text-white"
                    dangerouslySetInnerHTML={{
                      __html: formData.content || '<p>Start writing to see preview...</p>'
                    }}
                  />
                  {formData.tags.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              </div>
            </div>
          </div>
        </div>
      )}

      {errors.submit && (
        <div className={`fixed bottom-4 right-4 z-50 max-w-sm ${errors.submit.includes('success') ?
            'bg-green-50 border-green-200' :
            'bg-red-50 border-red-200'
          }`}>
          <div className="border rounded-lg p-4">
            <div className="flex items-center">
              {errors.submit.includes('success') ? (
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              )}
              <div className="flex-1">
                <p className={`text-sm font-medium ${errors.submit.includes('success') ? 'text-green-800' : 'text-red-800'}`}>
                  {errors.submit.includes('success') ? 'Success' : 'Error'}
                </p>
                <p className={`text-sm ${errors.submit.includes('success') ? 'text-green-700' : 'text-red-700'}`}>
                  {errors.submit.replace('success:', '')}
                </p>
              </div>
              <button
                onClick={() => setErrors(prev => ({ ...prev, submit: '' }))}
                className="ml-3"
              >
                <X className={`w-4 h-4 ${errors.submit.includes('success') ? 'text-green-500' : 'text-red-500'}`} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateBlog;