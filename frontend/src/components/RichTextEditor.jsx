
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, FileText, MessageSquare, TrendingUp, Settings, Search, Filter, 
  MoreVertical, Edit, Trash2, Eye, Moon, Sun, Menu, X, ChevronDown, 
  Activity, BarChart3, PieChart, Calendar, Bell, Download, RefreshCw, 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  ListOrdered, List, Image, Video, Link, Table, Save
} from 'lucide-react';

// Theme context (for integration with App.jsx)
const ThemeContext = React.createContext();

const RichTextEditor = ({ 
  value = '', 
  onChange, 
  placeholder = 'Start writing your blog post...', 
  className = '',
  minHeight = '400px',
  maxHeight = '800px',
  disabled = false,
  showWordCount = true,
  showCharCount = true,
  maxWords = null,
  maxChars = null,
  autoSave = false,
  autoSaveInterval = 30000, // 30 seconds
  onAutoSave = null,
  readOnly = false,
  theme = 'light', // light, dark
  fontSize = 'medium', // small, medium, large
  spellCheck = true,
  enableKeyboardShortcuts = true,
  enableMarkdown = true,
  showToolbar = true,
  customToolbarItems = null
}) => {
  // State management
  const [content, setContent] = useState(value);
  const [isActive, setIsActive] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [lastSaved, setLastSaved] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  
  // Refs
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const colorPickerRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);

  // Common emojis for quick access
  const commonEmojis = ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰'];

  // Color palette for text/background
  const colorPalette = [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
    '#FF0000', '#FF6600', '#FFCC00', '#00FF00', '#0066FF', '#6600FF'
  ];

  // Font size classes
  const fontSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  // Theme classes
  const themeClasses = {
    light: {
      editor: 'bg-white text-gray-900',
      toolbar: 'bg-gray-50 border-gray-200',
      button: 'text-gray-600 hover:bg-gray-100',
      footer: 'bg-gray-50 text-gray-500'
    },
    dark: {
      editor: 'bg-gray-900 text-gray-100',
      toolbar: 'bg-gray-800 border-gray-700',
      button: 'text-gray-300 hover:bg-gray-700',
      footer: 'bg-gray-800 text-gray-400'
    }
  };

  // Update content when value prop changes
  useEffect(() => {
    if (value !== content) {
      setContent(value);
      updateCounts(value);
      setIsDirty(false);
    }
  }, [value]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && onAutoSave && isDirty) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        try {
          onAutoSave(content);
          setLastSaved(new Date());
          setIsDirty(false);
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }, autoSaveInterval);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [content, autoSave, onAutoSave, isDirty, autoSaveInterval]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardShortcuts || disabled || readOnly) return;

    const handleKeyDown = (e) => {
      if (e.target !== editorRef.current && !editorRef.current?.contains(e.target)) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (onAutoSave) {
          try {
            onAutoSave(content);
            setLastSaved(new Date());
            setIsDirty(false);
          } catch (error) {
            console.error('Save failed:', error);
          }
        }
      }

      if (e.key === 'F11' || (e.ctrlKey && e.key === 'Enter')) {
        e.preventDefault();
        setIsFullscreen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts, content, onAutoSave, disabled, readOnly]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target)) {
        setShowColorPicker(false);
      }
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update word and character counts
  const updateCounts = useCallback((text) => {
    const plainText = text.replace(/<[^>]*>/g, '').trim();
    const words = plainText ? plainText.split(/\s+/).filter(word => word.length > 0).length : 0;
    const chars = plainText.length;
    setWordCount(words);
    setCharCount(chars);
  }, []);

  // Handle content change with history
  const handleContentChange = useCallback((e) => {
    if (disabled || readOnly) return;
    const newContent = e.target.innerHTML;
    
    if (Math.abs(newContent.length - content.length) > 10 || newContent !== content) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(content);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }

    setContent(newContent);
    updateCounts(newContent);
    setIsDirty(true);
    
    if (onChange) {
      try {
        onChange(newContent);
      } catch (error) {
        console.error('onChange callback failed:', error);
      }
    }
  }, [content, history, historyIndex, onChange, updateCounts, disabled, readOnly]);

  // Execute formatting commands
  const execCommand = useCallback((command, value = null) => {
    if (disabled || readOnly) return;
    try {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
      
      setTimeout(() => {
        const newContent = editorRef.current?.innerHTML || '';
        setContent(newContent);
        updateCounts(newContent);
        setIsDirty(true);
        if (onChange) onChange(newContent);
      }, 10);
    } catch (error) {
      console.error(`Failed to execute command ${command}:`, error);
    }
  }, [disabled, readOnly, onChange, updateCounts]);

  // Undo/redo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const previousContent = history[historyIndex - 1];
      setContent(previousContent);
      setHistoryIndex(historyIndex - 1);
      if (editorRef.current) editorRef.current.innerHTML = previousContent;
      updateCounts(previousContent);
      if (onChange) onChange(previousContent);
    }
  }, [history, historyIndex, onChange, updateCounts]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextContent = history[historyIndex + 1];
      setContent(nextContent);
      setHistoryIndex(historyIndex + 1);
      if (editorRef.current) editorRef.current.innerHTML = nextContent;
      updateCounts(nextContent);
      if (onChange) onChange(nextContent);
    }
  }, [history, historyIndex, onChange, updateCounts]);

  // File upload
  const handleFileUpload = useCallback((e, type = 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      let insertHtml = '';
      const result = e.target.result;
      if (typeof result !== 'string') return;

      switch (type) {
        case 'image':
          if (file.type.startsWith('image/')) {
            insertHtml = `<img src="${result}" alt="${file.name}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px;" />`;
          }
          break;
        case 'video':
          if (file.type.startsWith('video/')) {
            insertHtml = `<video controls style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px;"><source src="${result}" type="${file.type}">Your browser does not support the video tag.</video>`;
          }
          break;
        default:
          return;
      }
      
      if (insertHtml) execCommand('insertHTML', insertHtml);
    };
    
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [execCommand]);

  // Insert link
  const insertLink = useCallback(() => {
    const selection = window.getSelection();
    const selectedText = selection.toString();
    
    const url = prompt('Enter the URL:', 'https://');
    if (!url) return;

    const linkText = prompt('Enter link text:', selectedText || 'Link') || 'Link';
    const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #3B82F6; text-decoration: underline;">${linkText}</a>`;
    execCommand('insertHTML', linkHtml);
  }, [execCommand]);

  // Insert table
  const insertTable = useCallback(() => {
    const rows = parseInt(prompt('Number of rows:', '3')) || 3;
    const cols = parseInt(prompt('Number of columns:', '3')) || 3;
    
    let tableHtml = '<table style="border-collapse: collapse; width: 100%; margin: 16px 0;"><tbody>';
    for (let i = 0; i < rows; i++) {
      tableHtml += '<tr>';
      for (let j = 0; j < cols; j++) {
        tableHtml += '<td style="border: 1px solid #e5e7eb; padding: 8px; min-width: 50px;">&nbsp;</td>';
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table>';
    execCommand('insertHTML', tableHtml);
  }, [execCommand]);

  // Insert emoji
  const insertEmoji = useCallback((emoji) => {
    execCommand('insertHTML', emoji);
    setShowEmojiPicker(false);
  }, [execCommand]);

  // Apply color
  const applyColor = useCallback((color, type = 'text') => {
    if (type === 'text') {
      execCommand('foreColor', color);
    } else {
      execCommand('backColor', color);
    }
    setSelectedColor(color);
    setShowColorPicker(false);
  }, [execCommand]);

  // Markdown shortcuts
  const handleMarkdownShortcuts = useCallback((e) => {
    if (!enableMarkdown || disabled || readOnly) return;
    
    if (e.key === ' ') {
      const text = editorRef.current?.innerText || '';
      const lines = text.split('\n');
      const currentLine = lines[lines.length - 1];
      
      if (currentLine.match(/^#{1,6}\s/)) {
        e.preventDefault();
        const level = currentLine.match(/^(#{1,6})/)[1].length;
        const headerText = currentLine.replace(/^#{1,6}\s/, '');
        execCommand('formatBlock', `h${level}`);
        execCommand('insertText', headerText);
      } else if (currentLine === '- ' || currentLine === '* ') {
        e.preventDefault();
        execCommand('insertUnorderedList');
      } else if (currentLine.match(/^\d+\.\s/)) {
        e.preventDefault();
        execCommand('insertOrderedList');
      }
    }
  }, [enableMarkdown, disabled, readOnly, execCommand]);

  // Smart paste
  const handleSmartPaste = useCallback((e) => {
    if (disabled || readOnly) return;
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData('text/html') || 
                  (e.clipboardData || window.clipboardData).getData('text/plain');
    
    const cleanPaste = paste
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/style="[^"]*"/gi, '');
    
    execCommand('insertHTML', cleanPaste);
  }, [disabled, readOnly, execCommand]);

  // Toolbar button component
  const ToolbarButton = ({ onClick, children, title, isActive = false, disabled: btnDisabled = false, badge }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={btnDisabled || disabled || readOnly}
      title={title}
      className={`relative p-2 rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
        isActive ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-300' : themeClasses[theme].button
      }`}
      aria-label={title}
    >
      {children}
      {badge && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );

  // Toolbar separator
  const ToolbarSeparator = () => (
    <div className={`w-px h-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} mx-1`} />
  );

  // Word/character count status
  const countStatus = useMemo(() => ({
    wordExceeded: maxWords && wordCount > maxWords,
    charExceeded: maxChars && charCount > maxChars,
    wordWarning: maxWords && (wordCount / maxWords) * 100 > 80,
    charWarning: maxChars && (charCount / maxChars) * 100 > 80
  }), [maxWords, maxChars, wordCount, charCount]);

  // Toolbar
  const toolbar = useMemo(() => {
    if (!showToolbar) return null;

    return (
      <div className={`border-b ${themeClasses[theme].toolbar} px-3 py-2 sticky top-0 z-10`}>
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          {/* File Operations */}
          <div className="flex items-center gap-1">
            <ToolbarButton onClick={() => window.print()} title="Print (Ctrl+P)">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zM5 14H4v-3h1v3zm2 0v2h6v-2H7zm8 0v-3h1v3h-1z" clipRule="evenodd" />
              </svg>
            </ToolbarButton>
            <ToolbarButton 
              onClick={() => setIsFullscreen(!isFullscreen)} 
              title="Toggle Fullscreen (F11)"
              isActive={isFullscreen}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </ToolbarButton>
            <ToolbarButton 
              onClick={() => onAutoSave && onAutoSave(content)} 
              title="Save (Ctrl+S)"
              disabled={!onAutoSave}
            >
              <Save className="w-4 h-4" />
            </ToolbarButton>
          </div>

          <ToolbarSeparator />

          {/* History */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={handleUndo}
              title="Undo (Ctrl+Z)"
              disabled={historyIndex <= 0}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={handleRedo}
              title="Redo (Ctrl+Y)"
              disabled={historyIndex >= history.length - 1}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </ToolbarButton>
          </div>

          <ToolbarSeparator />

          {/* Text Formatting */}
          <div className="flex items-center gap-1">
            <ToolbarButton onClick={() => execCommand('bold')} title="Bold (Ctrl+B)">
              <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand('italic')} title="Italic (Ctrl+I)">
              <Italic className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand('underline')} title="Underline (Ctrl+U)">
              <Underline className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand('strikeThrough')} title="Strikethrough">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 10h8v2H6v-2zM4 6V4h12v2H4zM16 14v2H4v-2h12z"/>
              </svg>
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand('subscript')} title="Subscript">
              <span className="text-xs font-mono">X<sub>2</sub></span>
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand('superscript')} title="Superscript">
              <span className="text-xs font-mono">X<sup>2</sup></span>
            </ToolbarButton>
          </div>

          <ToolbarSeparator />

          {/* Colors and Emojis */}
          <div className="relative flex items-center gap-1">
            <ToolbarButton
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Text Color"
              isActive={showColorPicker}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 2h12v11H4V4z" clipRule="evenodd" />
                <rect x="0" y="16" width="20" height="4" fill={selectedColor} />
              </svg>
            </ToolbarButton>
            {showColorPicker && (
              <div ref={colorPickerRef} className={`absolute top-full left-0 mt-2 p-3 border rounded-lg shadow-xl z-50 ${themeClasses[theme].editor}`}>
                <div className="grid grid-cols-6 gap-1 mb-2">
                  {colorPalette.map((color) => (
                    <button
                      key={color}
                      onClick={() => applyColor(color, 'text')}
                      className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-500"
                      style={{ backgroundColor: color }}
                      title={color}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => applyColor(e.target.value, 'text')}
                  className="w-full h-8 rounded cursor-pointer"
                  aria-label="Custom color picker"
                />
              </div>
            )}
            <ToolbarButton
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Insert Emoji"
              isActive={showEmojiPicker}
            >
              <span className="text-base">😊</span>
            </ToolbarButton>
            {showEmojiPicker && (
              <div ref={emojiPickerRef} className={`absolute top-full left-0 mt-2 p-3 border rounded-lg shadow-xl z-50 ${themeClasses[theme].editor}`}>
                <div className="grid grid-cols-8 gap-1">
                  {commonEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => insertEmoji(emoji)}
                      className="text-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      aria-label={`Insert emoji ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <ToolbarSeparator />

          {/* Text Alignment */}
          <div className="flex items-center gap-1">
            <ToolbarButton onClick={() => execCommand('justifyLeft')} title="Align Left">
              <AlignLeft className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand('justifyCenter')} title="Align Center">
              <AlignCenter className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand('justifyRight')} title="Align Right">
              <AlignRight className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand('justifyFull')} title="Justify">
              <AlignJustify className="w-4 h-4" />
            </ToolbarButton>
          </div>

          <ToolbarSeparator />

          {/* Lists and Indentation */}
          <div className="flex items-center gap-1">
            <ToolbarButton onClick={() => execCommand('insertOrderedList')} title="Numbered List">
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand('insertUnorderedList')} title="Bulleted List">
              <List className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand('indent')} title="Indent">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2 4a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zm7 4a1 1 0 011-1h7a1 1 0 110 2h-7a1 1 0 01-1-1zm0 4a1 1 0 011-1h7a1 1 0 110 2h-7a1 1 0 01-1-1zm0 4a1 1 0 011-1h7a1 1 0 110 2h-7a1 1 0 01-1-1zM2 8v4h4l-2-2 2-2H2z" clipRule="evenodd" />
              </svg>
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand('outdent')} title="Outdent">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2 4a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zm7 4a1 1 0 011-1h7a1 1 0 110 2h-7a1 1 0 01-1-1zm0 4a1 1 0 011-1h7a1 1 0 110 2h-7a1 1 0 01-1-1zm0 4a1 1 0 011-1h7a1 1 0 110 2h-7a1 1 0 01-1-1zM6 8H2v4h4l2-2-2-2z" clipRule="evenodd" />
              </svg>
            </ToolbarButton>
          </div>

          <ToolbarSeparator />

          {/* Media and Links */}
          <div className="flex items-center gap-1">
            <ToolbarButton onClick={() => fileInputRef.current?.click()} title="Insert Image">
              <Image className="w-4 h-4" />
            </ToolbarButton>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e, 'image')}
              accept="image/*"
              className="hidden"
              aria-label="Upload image"
            />
            <ToolbarButton onClick={() => fileInputRef.current?.click()} title="Insert Video">
              <Video className="w-4 h-4" />
            </ToolbarButton>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e, 'video')}
              accept="video/*"
              className="hidden"
              aria-label="Upload video"
            />
            <ToolbarButton onClick={insertLink} title="Insert Link">
              <Link className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={insertTable} title="Insert Table">
              <Table className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {customToolbarItems && (
            <>
              <ToolbarSeparator />
              <div className="flex items-center gap-1">
                {customToolbarItems.map((item, index) => (
                  <ToolbarButton
                    key={index}
                    onClick={item.onClick}
                    title={item.title}
                    isActive={item.isActive}
                  >
                    {item.icon || item.label}
                  </ToolbarButton>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }, [showToolbar, theme, isFullscreen, showColorPicker, showEmojiPicker, historyIndex, history.length, disabled, readOnly, onAutoSave, content, customToolbarItems, handleUndo, handleRedo, execCommand, handleFileUpload, insertLink, insertTable, applyColor, insertEmoji]);

  return (
    <div
      className={`border rounded-lg shadow-sm overflow-hidden ${themeClasses[theme].editor} ${className} ${isFullscreen ? 'fixed inset-0 z-50 flex flex-col' : ''}`}
      aria-label="Rich Text Editor"
    >
      {toolbar}
      <div
        ref={editorRef}
        contentEditable={!disabled && !readOnly}
        onInput={handleContentChange}
        onPaste={handleSmartPaste}
        onKeyDown={handleMarkdownShortcuts}
        onFocus={() => setIsActive(true)}
        onBlur={() => setIsActive(false)}
        className={`p-4 outline-none overflow-y-auto ${fontSizeClasses[fontSize]} ${themeClasses[theme].editor} ${isActive ? 'ring-2 ring-blue-500' : ''}`}
        style={{ minHeight, maxHeight: isFullscreen ? 'none' : maxHeight }}
        dangerouslySetInnerHTML={{ __html: content }}
        placeholder={placeholder}
        spellCheck={spellCheck}
        aria-label="Content editor"
        role="textbox"
      />
      {(showWordCount || showCharCount || lastSaved) && (
        <div className={`border-t ${themeClasses[theme].footer} px-4 py-2 flex items-center justify-between text-sm`}>
          <div className="flex items-center gap-4">
            {showWordCount && (
              <span className={countStatus.wordExceeded ? 'text-red-500' : countStatus.wordWarning ? 'text-yellow-500' : ''}>
                Words: {wordCount}{maxWords ? `/${maxWords}` : ''}
              </span>
            )}
            {showCharCount && (
              <span className={countStatus.charExceeded ? 'text-red-500' : countStatus.charWarning ? 'text-yellow-500' : ''}>
                Characters: {charCount}{maxChars ? `/${maxChars}` : ''}
              </span>
            )}
          </div>
          {lastSaved && (
            <span>
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Export with context consumer for App.jsx integration
const RichTextEditorWithTheme = (props) => {
  return (
    <ThemeContext.Consumer>
      {({ theme }) => <RichTextEditor {...props} theme={theme} />}
    </ThemeContext.Consumer>
  );
};

export default RichTextEditorWithTheme;
