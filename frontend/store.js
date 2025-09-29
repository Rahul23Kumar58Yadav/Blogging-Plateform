import { configureStore } from '@reduxjs/toolkit';
import blogReducer from './slice/blogSlice';
import authReducer from './slice/authSlice'; // Assume auth slice exists

export const store = configureStore({
  reducer: {
    blog: blogReducer,
    auth: authReducer,
  },
});