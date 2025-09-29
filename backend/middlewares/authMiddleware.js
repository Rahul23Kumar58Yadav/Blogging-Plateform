const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const { nanoid } = require('nanoid');

const ERROR_CODES = {
  NO_TOKEN: { message: 'Access denied. No valid token provided.', status: 401, code: 'NO_TOKEN' },
  CONFIG_ERROR: { message: 'Server configuration error', status: 500, code: 'CONFIG_ERROR' },
  INVALID_PAYLOAD: { message: 'Invalid token payload', status: 401, code: 'INVALID_PAYLOAD' },
  USER_NOT_FOUND: { message: 'Token is invalid. User not found.', status: 401, code: 'USER_NOT_FOUND' },
  ACCOUNT_INACTIVE: { message: 'Account deactivated. Contact support.', status: 403, code: 'ACCOUNT_INACTIVE' },
  TOKEN_EXPIRED: { message: 'Token has expired. Please log in again.', status: 401, code: 'TOKEN_EXPIRED' },
  INVALID_TOKEN: { message: 'Invalid token format', status: 401, code: 'INVALID_TOKEN' },
  TOKEN_NOT_ACTIVE: { message: 'Token not active yet.', status: 401, code: 'TOKEN_NOT_ACTIVE' },
  AUTH_FAILED: { message: 'Authentication failed.', status: 401, code: 'AUTH_FAILED' },
  AUTH_REQUIRED: { message: 'Authentication required', status: 401, code: 'AUTH_REQUIRED' },
  INSUFFICIENT_PERMISSIONS: { message: 'Access denied.', status: 403, code: 'INSUFFICIENT_PERMISSIONS' },
  RESOURCE_NOT_FOUND: { message: 'Resource not found', status: 404, code: 'RESOURCE_NOT_FOUND' },
};

const createErrorResponse = ({ message, status, code }, details = '') => {
  return new ErrorResponse(details ? `${message}: ${details}` : message, status, code);
};

const sanitizeToken = (token) => {
  return token?.trim().replace(/[^A-Za-z0-9._-]/g, '') || '';
};

const protect = asyncHandler(async (req, res, next) => {
  const requestId = nanoid(8);
  console.log(`=== AUTH MIDDLEWARE [${requestId}] ===`);
  console.log(`Request: ${req.method} ${req.originalUrl}`);
  
  let token;
  const authHeader = req.headers.authorization;

  console.log(`Authorization header present: ${!!authHeader}`);
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
    console.log(`Token extracted (first 20 chars): ${token.substring(0, 20)}...`);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(`✅ Token decoded. User ID: ${decoded.id}`);
      
      const user = await User.findById(decoded.id).select('-password');
      console.log(`User query result: ${user ? 'Found' : 'Not found'}`);
      
      if (!user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }
      
      if (user.status !== 'active') {
        res.status(401);
        throw new Error('Not authorized, user account is not active');
      }
      
      req.user = user;
      console.log(`✅ User attached with role: ${user.role} and status: ${user.status}`);
      console.log(`=== AUTH SUCCESS [${requestId}] ===`);
      next();
    } catch (error) {
      console.error(`❌ Token verification failed: ${error.message}`);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    console.log('No authorization header or invalid format');
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const authorize = (...roles) => asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next(createErrorResponse(ERROR_CODES.AUTH_REQUIRED));
  }
  if (!roles.includes(req.user.role)) {
    console.log(`❌ Access denied for user ${req.user.email}. Role: ${req.user.role}, Required: ${roles.join(' or ')}`);
    return next(createErrorResponse(ERROR_CODES.INSUFFICIENT_PERMISSIONS, `${roles.join(' or ')} access required`));
  }
  console.log(`✅ Role access granted for user ${req.user.email}. Role: ${req.user.role}`);
  next();
});

const requireAdmin = authorize('admin');

const requireOwnership = (resourceField = 'author') => asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next(createErrorResponse(ERROR_CODES.AUTH_REQUIRED));
  }
  const resource = req.blog || req.post || req.resource || req[resourceField];
  if (!resource) {
    console.log(`❌ Resource not found for ${resourceField}`);
    return next(createErrorResponse(ERROR_CODES.RESOURCE_NOT_FOUND));
  }
  const resourceOwner = resource[resourceField] || resource._id;
  if (!resourceOwner) {
    console.log(`❌ Resource ${resourceField} field missing`);
    return next(createErrorResponse(ERROR_CODES.RESOURCE_NOT_FOUND, 'Invalid resource structure'));
  }
  if (resourceOwner.toString() !== req.user._id && req.user.role !== 'admin') {
    console.log(`❌ Access denied for user ${req.user.email}. Resource owner: ${resourceOwner}, User: ${req.user._id}`);
    return next(createErrorResponse(ERROR_CODES.INSUFFICIENT_PERMISSIONS, 'You can only modify your own resources'));
  }
  console.log(`✅ Ownership verified for user ${req.user.email} on resource ${resource._id || resourceOwner}`);
  next();
});

const rateLimit = require('express-rate-limit');
const rateLimitFailedAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: createErrorResponse({
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many failed authentication attempts. Please try again later.',
    status: 429,
  }),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    console.log(`❌ Rate limit exceeded for IP ${req.ip}`);
    return next(options.message);
  },
});

const protectWithRateLimit = asyncHandler(async (req, res, next) => {
  rateLimitFailedAuth(req, res, (err) => {
    if (err) return next(err);
    protect(req, res, next);
  });
});

const refreshToken = asyncHandler(async (req, res, next) => {
  const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'];
  if (!refreshToken) {
    return next(createErrorResponse(ERROR_CODES.NO_TOKEN, 'No refresh token provided'));
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId)
      .select('_id name email role status avatar')
      .lean();
    if (!user) {
      return next(createErrorResponse(ERROR_CODES.USER_NOT_FOUND));
    }
    const newAccessToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    const newRefreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    if (user.avatar) {
      user.avatar = `/images/${user.avatar}`;
    }
    res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user,
    });
  } catch (error) {
    console.log('❌ Refresh token verification failed:', error.message);
    return next(createErrorResponse(ERROR_CODES.INVALID_TOKEN, error.message));
  }
});

module.exports = {
  protect,
  protectWithRateLimit,
  authorize,
  requireAdmin,
  requireOwnership,
  refreshToken,
};