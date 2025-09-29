import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

const API_BASE_URL = 'http://localhost:5000';

export const fetchBlogs = createAsyncThunk(
  'blog/fetchBlogs',
  async ({ page, limit, status, category, sort, query, token }, { rejectWithValue }) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      console.log('Fetching blogs with headers:', { headers, params: { page, limit, status, category, sort, query } });
      const response = await api.get(`${API_BASE_URL}/api/v1/blogs`, {
        params: { page, limit, status, category, sort, query },
        headers,
      });
      const blogs = response.data.data.blogs.map(blog => ({
        ...blog,
        featuredImage: blog.featuredImage ? `${API_BASE_URL}${blog.featuredImage}` : null,
      }));
      return { ...response.data.data, blogs };
    } catch (error) {
      console.error('Fetch blogs error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch blogs');
    }
  }
);

export const fetchBlogById = createAsyncThunk(
  'blog/fetchBlogById',
  async (identifier, { rejectWithValue }) => {
    try {
      const response = await api.get(`${API_BASE_URL}/api/v1/blogs/${identifier}`);
      const blog = {
        ...response.data.data.blog,
        featuredImage: response.data.data.blog.featuredImage ? `${API_BASE_URL}${response.data.data.blog.featuredImage}` : null,
      };
      return blog;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch blog');
    }
  }
);

export const fetchBlogsByCategory = createAsyncThunk(
  'blog/fetchBlogsByCategory',
  async ({ category, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`${API_BASE_URL}/api/v1/blogs?category=${category}&page=${page}&limit=${limit}`);
      const blogs = response.data.data.blogs.map(blog => ({
        ...blog,
        featuredImage: blog.featuredImage ? `${API_BASE_URL}${blog.featuredImage}` : null,
      }));
      return {
        blogs,
        totalCount: response.data.data.totalCount || 0,
        currentPage: response.data.data.currentPage || 1,
        totalPages: response.data.data.totalPages || 1,
        category,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch blogs by category');
    }
  }
);

export const fetchBlogsByUser = createAsyncThunk(
  'blog/fetchBlogsByUser',
  async ({ userId, status = 'all', page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (status !== 'all') params.append('status', status);

      const response = await api.get(`${API_BASE_URL}/api/v1/users/${userId}/blogs?${params.toString()}`);
      const blogs = response.data.data.blogs.map(blog => ({
        ...blog,
        featuredImage: blog.featuredImage ? `${API_BASE_URL}${blog.featuredImage}` : null,
      }));
      return {
        blogs,
        totalCount: response.data.data.totalCount || 0,
        currentPage: response.data.data.currentPage || 1,
        totalPages: response.data.data.totalPages || 1,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user blogs');
    }
  }
);

export const saveBlog = createAsyncThunk(
  'blog/saveBlog',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        if (key === 'tags' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'featuredImage' && value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'boolean') {
          formData.append(key, value.toString());
        } else {
          formData.append(key, value);
        }
      });

      const response = id
        ? await api.put(`${API_BASE_URL}/api/v1/blogs/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        : await api.post(`${API_BASE_URL}/api/v1/blogs`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
      const blog = {
        ...response.data.data.blog,
        featuredImage: response.data.data.blog.featuredImage ? `${API_BASE_URL}${response.data.data.blog.featuredImage}` : null,
      };
      return {
        blog,
        isUpdate: !!id,
        message: response.data.message || (id ? 'Blog updated successfully' : 'Blog created successfully'),
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to save blog';
      const validationErrors = error.response?.data?.errors || {};
      return rejectWithValue({
        message: errorMessage,
        validationErrors,
        status: error.response?.status,
      });
    }
  }
);

export const deleteBlog = createAsyncThunk(
  'blog/deleteBlog',
  async (blogId, { rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/api/v1/blogs/${blogId}`);
      return { blogId, message: 'Blog deleted successfully' };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete blog');
    }
  }
);

export const toggleLikeBlog = createAsyncThunk(
  'blog/toggleLikeBlog',
  async (blogId, { rejectWithValue }) => {
    try {
      const response = await api.post(`${API_BASE_URL}/api/v1/blogs/${blogId}/like`);
      return {
        blogId,
        likes: response.data.data.likes,
        userLiked: response.data.data.userLiked,
        message: response.data.message,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle like');
    }
  }
);

export const addComment = createAsyncThunk(
  'blog/addComment',
  async ({ blogId, content, parentId = null }, { rejectWithValue }) => {
    try {
      if (!content?.trim()) {
        return rejectWithValue('Comment content is required');
      }
      const response = await api.post(`${API_BASE_URL}/api/v1/blogs/${blogId}/comments`, {
        content: content.trim(),
        parentId,
      });
      return {
        blogId,
        comment: response.data.data.comment,
        message: response.data.message || 'Comment added successfully',
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

export const deleteComment = createAsyncThunk(
  'blog/deleteComment',
  async ({ blogId, commentId }, { rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/api/v1/blogs/${blogId}/comments/${commentId}`);
      return { blogId, commentId, message: 'Comment deleted successfully' };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete comment');
    }
  }
);

export const toggleBookmarkBlog = createAsyncThunk(
  'blog/toggleBookmarkBlog',
  async (blogId, { rejectWithValue }) => {
    try {
      const response = await api.post(`${API_BASE_URL}/api/v1/blogs/${blogId}/bookmark`);
      return {
        blogId,
        isBookmarked: response.data.data.isBookmarked,
        message: response.data.message || 'Bookmark toggled successfully',
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle bookmark');
    }
  }
);

export const reportComment = createAsyncThunk(
  'blog/reportComment',
  async ({ blogId, commentId }, { rejectWithValue }) => {
    try {
      const response = await api.post(`${API_BASE_URL}/api/v1/blogs/${blogId}/comments/${commentId}/report`);
      return {
        blogId,
        commentId,
        message: response.data.message || 'Comment reported successfully',
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to report comment');
    }
  }
);

export const searchBlogs = createAsyncThunk(
  'blog/searchBlogs',
  async ({ query, filters = {}, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        q: query,
        page,
        limit,
        ...filters,
      });
      const response = await api.get(`${API_BASE_URL}/api/v1/blogs/search?${params.toString()}`);
      const blogs = response.data.data.blogs.map(blog => ({
        ...blog,
        featuredImage: blog.featuredImage ? `${API_BASE_URL}${blog.featuredImage}` : null,
      }));
      return {
        blogs,
        totalCount: response.data.data.totalCount || 0,
        currentPage: response.data.data.currentPage || 1,
        totalPages: response.data.data.totalPages || 1,
        query,
        filters,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search blogs');
    }
  }
);

const blogSlice = createSlice({
  name: 'blog',
  initialState: {
    blogs: [],
    currentBlog: null,
    searchResults: [],
    totalCount: 0,
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    searchLoading: false,
    bookmarkLoading: false,
    reportLoading: false,
    error: null,
    saveError: null,
    validationErrors: {},
    searchQuery: '',
    activeFilters: {},
    selectedCategory: null,
    successMessage: null,
    cache: {},
    lastFetch: null,
  },
  reducers: {
    clearError(state) {
      state.error = null;
      state.saveError = null;
      state.validationErrors = {};
    },
    clearSaveError(state) {
      state.saveError = null;
      state.validationErrors = {};
    },
    clearSuccessMessage(state) {
      state.successMessage = null;
    },
    setCurrentBlog(state, action) {
      state.currentBlog = action.payload;
    },
    clearCurrentBlog(state) {
      state.currentBlog = null;
    },
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
    },
    setActiveFilters(state, action) {
      state.activeFilters = action.payload;
    },
    setSelectedCategory(state, action) {
      state.selectedCategory = action.payload;
    },
    clearSearchResults(state) {
      state.searchResults = [];
      state.searchQuery = '';
    },
    optimisticLikeUpdate(state, action) {
      const { blogId, increment } = action.payload;
      if (state.currentBlog && state.currentBlog.id === blogId) {
        state.currentBlog.likesCount = (state.currentBlog.likesCount || 0) + increment;
        state.currentBlog.userLiked = increment > 0;
      }
      const blog = state.blogs.find((b) => b.id === blogId);
      if (blog) {
        blog.likesCount = (blog.likesCount || 0) + increment;
        blog.userLiked = increment > 0;
      }
    },
    optimisticCommentAdd(state, action) {
      const { blogId, tempComment } = action.payload;
      if (state.currentBlog && state.currentBlog.id === blogId) {
        if (!state.currentBlog.comments) state.currentBlog.comments = [];
        state.currentBlog.comments.push(tempComment);
        state.currentBlog.commentsCount = (state.currentBlog.commentsCount || 0) + 1;
      }
    },
    resetBlogState(state) {
      return {
        ...state,
        blogs: [],
        currentBlog: null,
        searchResults: [],
        error: null,
        saveError: null,
        validationErrors: {},
        successMessage: null,
        loading: false,
        saveLoading: false,
        bookmarkLoading: false,
        reportLoading: false,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = action.payload.blogs;
        state.totalCount = action.payload.totalCount;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.hasMore = action.payload.hasMore;
        state.lastFetch = Date.now();
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.blogs = [];
      })
      .addCase(fetchBlogById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBlog = action.payload;
        state.cache[action.payload.id] = {
          data: action.payload,
          timestamp: Date.now(),
        };
      })
      .addCase(fetchBlogById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentBlog = null;
      })
      .addCase(fetchBlogsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = action.payload.blogs;
        state.totalCount = action.payload.totalCount;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.selectedCategory = action.payload.category;
      })
      .addCase(fetchBlogsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.blogs = [];
      })
      .addCase(fetchBlogsByUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogsByUser.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = action.payload.blogs;
        state.totalCount = action.payload.totalCount;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchBlogsByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.blogs = [];
      })
      .addCase(saveBlog.pending, (state) => {
        state.saveLoading = true;
        state.saveError = null;
        state.validationErrors = {};
      })
      .addCase(saveBlog.fulfilled, (state, action) => {
        state.saveLoading = false;
        const { blog, isUpdate, message } = action.payload;
        if (isUpdate) {
          const index = state.blogs.findIndex((b) => b.id === blog.id);
          if (index !== -1) state.blogs[index] = blog;
        } else {
          state.blogs.unshift(blog);
          state.totalCount += 1;
        }
        state.currentBlog = blog;
        state.successMessage = message;
        state.cache[blog.id] = {
          data: blog,
          timestamp: Date.now(),
        };
      })
      .addCase(saveBlog.rejected, (state, action) => {
        state.saveLoading = false;
        if (typeof action.payload === 'object') {
          state.saveError = action.payload.message;
          state.validationErrors = action.payload.validationErrors || {};
        } else {
          state.saveError = action.payload;
        }
      })
      .addCase(deleteBlog.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.deleteLoading = false;
        const { blogId, message } = action.payload;
        state.blogs = state.blogs.filter((blog) => blog.id !== blogId);
        state.totalCount = Math.max(0, state.totalCount - 1);
        if (state.currentBlog?.id === blogId) state.currentBlog = null;
        delete state.cache[blogId];
        state.successMessage = message;
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      })
      .addCase(toggleLikeBlog.fulfilled, (state, action) => {
        const { blogId, likes, userLiked, message } = action.payload;
        if (state.currentBlog?.id === blogId) {
          state.currentBlog.likesCount = likes.length;
          state.currentBlog.userLiked = userLiked;
        }
        const blog = state.blogs.find((b) => b.id === blogId);
        if (blog) {
          blog.likesCount = likes.length;
          blog.userLiked = userLiked;
        }
        if (state.cache[blogId]) {
          state.cache[blogId].data.likesCount = likes.length;
          state.cache[blogId].data.userLiked = userLiked;
        }
      })
      .addCase(toggleLikeBlog.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const { blogId, comment, message } = action.payload;
        if (state.currentBlog?.id === blogId) {
          if (!state.currentBlog.comments) state.currentBlog.comments = [];
          state.currentBlog.comments = state.currentBlog.comments
            .filter((c) => !c.isTemporary)
            .concat(comment);
          state.currentBlog.commentsCount = (state.currentBlog.commentsCount || 0) + 1;
        }
        state.successMessage = message;
      })
      .addCase(addComment.rejected, (state, action) => {
        state.error = action.payload;
        if (state.currentBlog?.comments) {
          state.currentBlog.comments = state.currentBlog.comments.filter((c) => !c.isTemporary);
        }
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { blogId, commentId, message } = action.payload;
        if (state.currentBlog?.id === blogId && state.currentBlog.comments) {
          state.currentBlog.comments = state.currentBlog.comments.filter((c) => c.id !== commentId);
          state.currentBlog.commentsCount = Math.max(0, (state.currentBlog.commentsCount || 1) - 1);
        }
        state.successMessage = message;
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(toggleBookmarkBlog.pending, (state) => {
        state.bookmarkLoading = true;
        state.error = null;
      })
      .addCase(toggleBookmarkBlog.fulfilled, (state, action) => {
        state.bookmarkLoading = false;
        const { blogId, isBookmarked, message } = action.payload;
        if (state.currentBlog?.id === blogId) {
          state.currentBlog.isBookmarked = isBookmarked;
        }
        const blog = state.blogs.find((b) => b.id === blogId);
        if (blog) blog.isBookmarked = isBookmarked;
        if (state.cache[blogId]) state.cache[blogId].data.isBookmarked = isBookmarked;
        state.successMessage = message;
      })
      .addCase(toggleBookmarkBlog.rejected, (state, action) => {
        state.bookmarkLoading = false;
        state.error = action.payload;
      })
      .addCase(reportComment.pending, (state) => {
        state.reportLoading = true;
        state.error = null;
      })
      .addCase(reportComment.fulfilled, (state, action) => {
        state.reportLoading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(reportComment.rejected, (state, action) => {
        state.reportLoading = false;
        state.error = action.payload;
      })
      .addCase(searchBlogs.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchBlogs.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.blogs;
        state.searchQuery = action.payload.query;
        state.activeFilters = action.payload.filters;
        state.totalCount = action.payload.totalCount;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(searchBlogs.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
        state.searchResults = [];
      });
  },
});

export const {
  clearError,
  clearSaveError,
  clearSuccessMessage,
  setCurrentBlog,
  clearCurrentBlog,
  setSearchQuery,
  setActiveFilters,
  setSelectedCategory,
  clearSearchResults,
  optimisticLikeUpdate,
  optimisticCommentAdd,
  resetBlogState,
} = blogSlice.actions;

export const selectBlogs = (state) => state.blog.blogs;
export const selectCurrentBlog = (state) => state.blog.currentBlog;
export const selectBlogLoading = (state) => state.blog.loading;
export const selectSaveLoading = (state) => state.blog.saveLoading;
export const selectBlogError = (state) => state.blog.error;
export const selectSaveError = (state) => state.blog.saveError;
export const selectValidationErrors = (state) => state.blog.validationErrors;
export const selectSuccessMessage = (state) => state.blog.successMessage;
export const selectSearchResults = (state) => state.blog.searchResults;
export const selectPagination = (state) => ({
  totalCount: state.blog.totalCount,
  currentPage: state.blog.currentPage,
  totalPages: state.blog.totalPages,
  hasMore: state.blog.hasMore,
});

export default blogSlice.reducer;