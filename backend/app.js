require('dotenv').config({ path: './config.env', debug: true }); // Load config.env explicitly
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');

// Routes with better error handling
let authRoutes, blogRoutes, userRoutes, adminRoutes;
try {
  authRoutes = require('./routes/authRoutes');
  console.log('✅ Auth routes loaded');
} catch (err) {
  console.error('❌ Failed to load authRoutes:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
}
try {
  blogRoutes = require('./routes/blogRoutes');
  console.log('✅ Blog routes loaded');
} catch (err) {
  console.error('❌ Failed to load blogRoutes:', err.message);
  process.exit(1);
}
try {
  userRoutes = require('./routes/userRoutes');
  console.log('✅ User routes loaded');
} catch (err) {
  console.error('❌ Failed to load userRoutes:', err.message);
  process.exit(1);
}
try {
  adminRoutes = require('./routes/adminRoutes');
  console.log('✅ Admin routes loaded');
} catch (err) {
  console.error('❌ Failed to load adminRoutes:', err.message);
  process.exit(1);
}

// Load config and DB
const config = require('./config/config');
const connectDB = require('./config/db');

// Middleware
const errorHandler = require('./middlewares/errorHandler');
const { protect } = require('./middlewares/authMiddleware');

// Debug env vars
console.log('Environment variables:', {
  MONGO_URI: process.env.MONGO_URI ? 'Set' : 'NOT SET - Check config.env!',
  JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'NOT SET - JWT will fail!',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ? 'Set' : 'NOT SET - Refresh tokens will fail!',
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 5000,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
});

// Validate critical env vars
if (!process.env.MONGO_URI || !process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.error('CRITICAL: MONGO_URI, JWT_SECRET, and JWT_REFRESH_SECRET must be set in config.env');
  process.exit(1);
}


// Initialize app
const app = express();

// CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      console.log('CORS check for origin:', origin);
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error('CORS blocked for origin:', origin);
        callback(new Error(`CORS policy: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret'],
  })
);

// Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net', 'accounts.google.com', 'www.gstatic.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net', 'fonts.googleapis.com'],
        fontSrc: ["'self'", 'fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'blob:', 'lh3.googleusercontent.com'],
        connectSrc: ["'self'", ...allowedOrigins, 'http://localhost:5000', 'https://localhost:5000', 'accounts.google.com', 'www.googleapis.com'],
      },
    },
    crossOriginOpenerPolicy: process.env.NODE_ENV === 'production' ? { policy: 'same-origin' } : false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  max: 500,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
  skip: (req) => {
    const isAuthenticated = !!req.headers.authorization?.startsWith('Bearer ');
    const isExcludedPath =
      req.path.startsWith('/api/v1/files') ||
      req.path.startsWith('/api/v1/charts') ||
      req.path === '/api/v1/health' ||
      req.path === '/api/v1/auth/google';
    return isAuthenticated || isExcludedPath;
  },
});
app.use('/api', limiter);

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);

// Health
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    routesLoaded: !!authRoutes && !!blogRoutes && !!userRoutes && !!adminRoutes,
  });
});

// Production static
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// Error handler
app.use(errorHandler); // Use the custom error handler middleware

// Start server
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`
      ################################################
      🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}
      MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}
      CORS origins: ${allowedOrigins.join(', ')}
      ################################################
      `);
    });

    process.on('unhandledRejection', (err) => {
      console.error('UNHANDLED REJECTION! 💥 Shutting down...');
      console.error(err.name, err.message, err.stack);
      server.close(() => process.exit(1));
    });

    process.on('uncaughtException', (err) => {
      console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
      console.error(err.name, err.message, err.stack);
      server.close(() => process.exit(1));
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Closing server...');
      server.close(() => {
        mongoose.connection.close(false, () => {
          console.log('MongoDB disconnected.');
          process.exit(0);
        });
      });
    });
  } catch (err) {
    console.error('Failed to start server:', {
      message: err.message,
      stack: err.stack,
      mongoConnection: mongoose.connection.readyState,
    });
    process.exit(1);
  }
};

startServer();

module.exports = app;