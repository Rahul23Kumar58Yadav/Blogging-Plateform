const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');
const { ipKeyGenerator } = require('express-rate-limit'); // Import ipKeyGenerator

// Import middlewares
const { protect, requireAdmin } = require('../middlewares/authMiddleware');

// Import controller
const {
  getAdminStats,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser
} = require('../controllers/adminController');

const router = express.Router();

// Structured logger (consistent with other route files)
const logger = {
  info: (msg, meta) => console.log(`[${new Date().toISOString()}] INFO: ${msg}`, meta || ''),
  warn: (msg, meta) => console.warn(`[${new Date().toISOString()}] WARN: ${msg}`, meta || ''),
  error: (msg, meta) => console.error(`[${new Date().toISOString()}] ERROR: ${msg}`, meta || ''),
};

// Rate limiting for admin operations
const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Allow more requests for admin operations
  message: {
    success: false,
    message: 'Too many admin requests. Please try again later.',
    code: 'ADMIN_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const safeIp = ipKeyGenerator(req); // Use ipKeyGenerator for IPv6 compatibility
    return `admin_${safeIp}_${req.user?.userId || 'anonymous'}`;
  },
  skip: (req) => {
    // Skip rate limiting for GET requests (viewing data)
    return req.method === 'GET';
  }
});

// More restrictive rate limiting for destructive operations
const destructiveOperationsLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Only 20 destructive operations per hour
  message: {
    success: false,
    message: 'Too many destructive operations. Please try again later.',
    code: 'DESTRUCTIVE_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const safeIp = ipKeyGenerator(req); // Use ipKeyGenerator for IPv6 compatibility
    return `destructive_${safeIp}_${req.user?.userId || 'anonymous'}`;
  }
});

// Apply protection and admin requirement to all routes
router.use(protect);
router.use(requireAdmin);

// Apply general admin rate limiting
router.use(adminRateLimit);

// Validation middleware for user creation
const validateUserCreation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be 2-50 characters')
    .matches(/^[a-zA-Z0-9_\s-]+$/)
    .withMessage('Name can only contain letters, numbers, spaces, hyphens, and underscores')
    .customSanitizer((value) => sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail()
    .customSanitizer((value) => sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be 8-128 characters')
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least 1 lowercase, 1 uppercase, and 1 number'),
  
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be user or admin'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive')
];

// Validation middleware for user updates
const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be 2-50 characters')
    .matches(/^[a-zA-Z0-9_\s-]+$/)
    .withMessage('Name can only contain letters, numbers, spaces, hyphens, and underscores')
    .customSanitizer((value) => value ? sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }) : value),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail()
    .customSanitizer((value) => value ? sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }) : value),
  
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be user or admin'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive')
];

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation failed', { 
      errors: errors.array(), 
      endpoint: req.originalUrl,
      adminId: req.user?.userId 
    });
    return res.status(400).json({
      success: false,
      data: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg,
          value: err.value
        }))
      }
    });
  }
  next();
};

// Health check for admin routes
router.get('/health', (req, res) => {
  logger.info('Admin health check accessed', { adminId: req.user.userId });
  res.json({
    success: true,
    data: {
      message: 'Admin routes are healthy',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      admin: {
        id: req.user.userId,
        email: req.user.email,
        role: req.user.role
      }
    }
  });
});

// GET /api/v1/admin/stats - Get dashboard statistics
router.get('/stats', getAdminStats);

// GET /api/v1/admin/users - Get all users with pagination and filtering
router.get('/users', getAllUsers);

// GET /api/v1/admin/users/:id - Get single user by ID
router.get('/users/:id', getUserById);

// POST /api/v1/admin/users - Create new user
router.post('/users', 
  destructiveOperationsLimit,
  validateUserCreation, 
  handleValidationErrors, 
  createUser
);

// PUT /api/v1/admin/users/:id - Update user
router.put('/users/:id', 
  destructiveOperationsLimit,
  validateUserUpdate, 
  handleValidationErrors, 
  updateUser
);

// PATCH /api/v1/admin/users/:id/toggle-status - Toggle user status
router.patch('/users/:id/toggle-status', 
  destructiveOperationsLimit,
  toggleUserStatus
);

// DELETE /api/v1/admin/users/:id - Delete user
router.delete('/users/:id', 
  destructiveOperationsLimit,
  deleteUser
);

// Middleware to log admin actions
router.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    // Log successful admin actions
    if (res.statusCode < 400 && req.method !== 'GET') {
      logger.info('Admin action completed', {
        method: req.method,
        url: req.originalUrl,
        adminId: req.user?.userId,
        adminEmail: req.user?.email,
        statusCode: res.statusCode,
        timestamp: new Date().toISOString()
      });
    }
    originalSend.call(this, data);
  };
  next();
});

// Error handling middleware specific to admin routes
router.use((error, req, res, next) => {
  logger.error('Admin route error', {
    error: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    adminId: req.user?.userId,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Don't expose internal error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(error.status || 500).json({
    success: false,
    data: {
      message: error.message || 'Internal server error',
      code: error.code || 'INTERNAL_ERROR',
      ...(isDevelopment && { 
        stack: error.stack,
        details: error.details 
      })
    }
  });
});

module.exports = router;