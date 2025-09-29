import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, 
  Eye, 
  Upload, 
  X, 
  Bold, 
  Italic, 
  Link, 
  List, 
  Code, 
  Hash,
  Sun,
  Moon,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchBlogById, saveBlog } from '../slice/blogSlice';

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const contentEditorRef = useRef(null);

  const { currentBlog, loading, error } = useSelector(state => state.blog);
  const { user } = useSelector(state => state.auth);

  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [],
    category: '',
    featuredImage: null,
    status: 'draft'
  });
  const [newTag, setNewTag] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const categories = [
    'Technology', 'Lifestyle', 'Travel', 'Food', 'Health', 
    'Business', 'Education', 'Entertainment', 'Sports', 'Other'
  ];

  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);
    if (id) {
      dispatch(fetchBlogById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentBlog) {
      setFormData({
        title: currentBlog.title || '',
        content: currentBlog.content || '',
        tags: currentBlog.tags || [],
        category: currentBlog.category || '',
        featuredImage: null,
        status: currentBlog.status || 'draft'
      });
      setImagePreview(currentBlog.featuredImage || null);
    }
  }, [currentBlog]);

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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload a valid image file');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setFormData(prev => ({
          ...prev,
          featuredImage: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      featuredImage: null
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSave = async (status = 'draft') => {
    if (!user) {
      toast.error('You must be logged in to save a blog');
      navigate('/login');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.content.trim()) {
      toast.error('Content is required');
      return;
    }
    if (!formData.category) {
      toast.error('Category is required');
      return;
    }
    setSaving(true);
    try {
      const blogData = {
        ...formData,
        status,
        authorId: user.id,
      };
      await dispatch(saveBlog({ id, data: blogData })).unwrap();
      toast.success(`Blog ${status === 'published' ? 'published' : 'saved'} successfully!`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Error saving blog');
    } finally {
      setSaving(false);
    }
  };

  const applyFormatting = (format) => {
    const textarea = contentEditorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end) || 'Text';
    let formattedText = selectedText;

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'link':
        formattedText = `[${selectedText}](https://example.com)`;
        break;
      case 'list':
        formattedText = `\n- ${selectedText}`;
        break;
      case 'heading':
        formattedText = `## ${selectedText}`;
        break;
      case 'code':
        formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
        break;
      default:
        return;
    }

    const newContent = 
      textarea.value.substring(0, start) + 
      formattedText + 
      textarea.value.substring(end);
    
    setFormData(prev => ({ ...prev, content: newContent }));

    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        const newCursorPos = start + formattedText.length - (selectedText.length || 0);
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <header className={`sticky top-0 z-50 border-b transition-colors duration-200 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  darkMode 
                    ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold hidden sm:block">Edit Blog Post</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  showPreview
                    ? 'bg-blue-600 text-white'
                    : darkMode 
                      ? 'hover:bg-gray-700 text-gray-300' 
                      : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Eye className="h-5 w-5" />
              </button>
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  darkMode 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSave('draft')}
                  disabled={saving}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    darkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {saving ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  onClick={() => handleSave('published')}
                  disabled={saving}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    saving ? 'opacity-50 cursor-not-allowed' : ''
                  } bg-blue-600 hover:bg-blue-700 text-white`}
                >
                  {saving ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
            darkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'
          }`}>
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div className={`grid ${showPreview ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-6`}>
          <div className={`${showPreview ? 'lg:col-span-1' : 'lg:col-span-2'} space-y-6`}>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter your blog title..."
                className={`w-full px-4 py-3 text-xl font-semibold border rounded-lg transition-colors duration-200 ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Featured Image
              </label>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Featured"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                  darkMode 
                    ? 'border-gray-600 hover:border-gray-500' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className={`h-8 w-8 mx-auto mb-2 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Click to upload featured image
                  </p>
                </div>
              )}
            </div>
            <div className={`flex flex-wrap gap-2 p-3 rounded-lg border ${
              darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              {[
                { icon: Bold, action: 'bold', tooltip: 'Bold' },
                { icon: Italic, action: 'italic', tooltip: 'Italic' },
                { icon: Hash, action: 'heading', tooltip: 'Heading' },
                { icon: Link, action: 'link', tooltip: 'Link' },
                { icon: List, action: 'list', tooltip: 'List' },
                { icon: Code, action: 'code', tooltip: 'Code Block' },
              ].map(({ icon: Icon, action, tooltip }) => (
                <button
                  key={action}
                  onClick={() => applyFormatting(action)}
                  title={tooltip}
                  className={`p-2 rounded transition-colors duration-200 ${
                    darkMode 
                      ? 'hover:bg-gray-700 text-gray-300' 
                      : 'hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Content
              </label>
              <textarea
                id="content-editor"
                ref={contentEditorRef}
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={20}
                placeholder="Start writing your blog content..."
                className={`w-full px-4 py-3 border rounded-lg font-mono text-sm transition-colors duration-200 ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 resize-none`}
              />
            </div>
          </div>
          {showPreview && (
            <div className={`lg:col-span-1 ${
              darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
            } border rounded-lg p-6`}>
              <h3 className="text-lg font-semibold mb-4">Preview</h3>
              <div className="prose prose-sm max-w-none">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Featured"
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                )}
                <h1 className="text-2xl font-bold mb-4">{formData.title || 'Untitled'}</h1>
                <div className="whitespace-pre-wrap">{formData.content || 'Start writing to see preview...'}</div>
              </div>
            </div>
          )}
          {!showPreview && (
            <div className="lg:col-span-1 space-y-6">
              <div className={`p-6 rounded-lg border ${
                darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-lg font-semibold mb-4">Category</h3>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors duration-200 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className={`p-6 rounded-lg border ${
                darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-lg font-semibold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-600 text-white"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-gray-300"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add tag"
                    className={`flex-1 px-3 py-2 border rounded-lg text-sm transition-colors duration-200 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Add
                  </button>
                </div>
              </div>
              <div className={`p-6 rounded-lg border ${
                darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-lg font-semibold mb-4">Status</h3>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors duration-200 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditBlog;