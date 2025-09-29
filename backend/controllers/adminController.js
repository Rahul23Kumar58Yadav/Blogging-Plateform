const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Structured logger (consistent with auth routes)
const logger = {
  info: (msg, meta) => console.log(`[${new Date().toISOString()}] INFO: ${msg}`, meta || ''),
  warn: (msg, meta) => console.warn(`[${new Date().toISOString()}] WARN: ${msg}`, meta || ''),
  error: (msg, meta) => console.error(`[${new Date().toISOString()}] ERROR: ${msg}`, meta || ''),
};

const BCRYPT_SALT_ROUNDS = 12;
const VALID_ROLES = ['user', 'admin'];

// Helper function to normalize user data
const normalizeUserData = (user) => {
  if (!user) return null;
  
  const userObj = user.toObject ? user.toObject() : user;
  return {
    id: userObj._id?.toString() || userObj.id,
    _id: userObj._id?.toString() || userObj.id,
    name: userObj.name || 'Unknown',
    email: userObj.email || '',
    role: userObj.role || 'user',
    status: userObj.status || 'active',
    createdAt: userObj.createdAt || userObj.joined || new Date(),
    joined: userObj.createdAt || userObj.joined || new Date(),
    lastLogin: userObj.lastLogin || null,
    updatedAt: userObj.updatedAt || userObj.createdAt || new Date(),
    blogs: userObj.blogs || 0,
    avatar: userObj.avatar || userObj.name?.charAt(0).toUpperCase() || 'U',
    permissions: userObj.permissions || [],
  };
};

// Get admin dashboard statistics
const getAdminStats = asyncHandler(async (req, res) => {
  try {
    logger.info('Fetching admin stats', { adminId: req.user.userId });

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      userUsers,
      newUsersThisMonth
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'inactive' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'user' }),
      User.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      })
    ]);

    const stats = {
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      userUsers,
      newUsersThisMonth,
      totalBlogs: 0, // You can implement this when you have blog model
    };

    logger.info('Admin stats fetched successfully', { stats });

    res.json({
      success: true,
      data: {
        stats,
        message: 'Admin statistics retrieved successfully'
      }
    });
  } catch (error) {
    logger.error('Get admin stats error', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      data: { 
        message: `Failed to fetch statistics: ${error.message}`, 
        code: 'STATS_FETCH_ERROR' 
      }
    });
  }
});

// Get all users with pagination and search
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    logger.info('Fetching users', { 
      adminId: req.user.userId, 
      page, 
      limit, 
      search, 
      role, 
      status 
    });

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role && VALID_ROLES.includes(role)) {
      query.role = role;
    }
    
    if (status && ['active', 'inactive'].includes(status)) {
      query.status = status;
    }

    // Build sort
    const sort = {};
    const validSortFields = ['name', 'email', 'role', 'status', 'createdAt', 'lastLogin'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = ['asc', 'desc'].includes(sortOrder) ? sortOrder : 'desc';
    sort[sortField] = order === 'asc' ? 1 : -1;

    // Execute queries
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Cap at 100
    const skip = (pageNum - 1) * limitNum;

    // FIXED: Use explicit field selection to avoid password projection issues
    const userFields = '_id name email role status createdAt updatedAt lastLogin permissions avatar profilePicture';

    const [users, total] = await Promise.all([
      User.find(query)
        .select(userFields) // Explicit field selection
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query)
    ]);

    const normalizedUsers = users.map(normalizeUserData);
    const totalPages = Math.ceil(total / limitNum);

    const pagination = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1
    };

    logger.info('Users fetched successfully', { 
      count: normalizedUsers.length, 
      total, 
      page: pageNum 
    });

    res.json({
      success: true,
      data: {
        users: normalizedUsers,
        pagination,
        message: 'Users retrieved successfully'
      }
    });
  } catch (error) {
    logger.error('Get all users error', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      data: { 
        message: `Failed to fetch users: ${error.message}`, 
        code: 'USERS_FETCH_ERROR' 
      }
    });
  }
});

// Get single user by ID
const getUserById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        data: { message: 'Invalid user ID format', code: 'INVALID_ID' }
      });
    }

    // FIXED: Use explicit field selection
    const user = await User.findById(id)
      .select('_id name email role status createdAt updatedAt lastLogin permissions avatar profilePicture')
      .lean();

    if (!user) {
      logger.warn('User not found', { userId: id, adminId: req.user.userId });
      return res.status(404).json({
        success: false,
        data: { message: 'User not found', code: 'USER_NOT_FOUND' }
      });
    }

    logger.info('User retrieved by admin', { userId: id, adminId: req.user.userId });

    res.json({
      success: true,
      data: {
        user: normalizeUserData(user),
        message: 'User retrieved successfully'
      }
    });
  } catch (error) {
    logger.error('Get user by ID error', { error: error.message, userId: req.params.id });
    res.status(500).json({
      success: false,
      data: { 
        message: `Failed to fetch user: ${error.message}`, 
        code: 'USER_FETCH_ERROR' 
      }
    });
  }
});

// Create new user (admin only)
const createUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, role = 'user', status = 'active' } = req.body;

    logger.info('Creating user', { 
      email, 
      role, 
      adminId: req.user.userId 
    });

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        data: { 
          message: 'Name, email, and password are required', 
          code: 'MISSING_FIELDS' 
        }
      });
    }

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        data: { 
          message: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`, 
          code: 'INVALID_ROLE' 
        }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      logger.warn('Attempt to create duplicate user', { email });
      return res.status(409).json({
        success: false,
        data: { message: 'User with this email already exists', code: 'DUPLICATE_EMAIL' }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      status,
      createdAt: new Date()
    });

    // Get user without password for response
    const createdUser = await User.findById(user._id)
      .select('_id name email role status createdAt updatedAt permissions avatar profilePicture')
      .lean();

    const normalizedUser = normalizeUserData(createdUser);

    logger.info('User created successfully', { 
      userId: user._id, 
      email: user.email, 
      adminId: req.user.userId 
    });

    res.status(201).json({
      success: true,
      data: {
        user: normalizedUser,
        message: 'User created successfully'
      }
    });
  } catch (error) {
    logger.error('Create user error', { error: error.message, stack: error.stack });
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        data: { message: 'User with this email already exists', code: 'DUPLICATE_EMAIL' }
      });
    }

    res.status(500).json({
      success: false,
      data: { 
        message: `Failed to create user: ${error.message}`, 
        code: 'USER_CREATE_ERROR' 
      }
    });
  }
});

// Update user
const updateUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        data: { message: 'Invalid user ID format', code: 'INVALID_ID' }
      });
    }

    logger.info('Updating user', { 
      userId: id, 
      adminId: req.user.userId,
      updates: { name, email, role, status }
    });

    // Validation
    if (role && !VALID_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        data: { 
          message: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`, 
          code: 'INVALID_ROLE' 
        }
      });
    }

    if (status && !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        data: { 
          message: 'Invalid status. Must be active or inactive', 
          code: 'INVALID_STATUS' 
        }
      });
    }

    // Check if user exists
    const existingUser = await User.findById(id).select('_id email role');
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        data: { message: 'User not found', code: 'USER_NOT_FOUND' }
      });
    }

    // Prevent admin from demoting themselves
    if (id === req.user.userId && role && role !== 'admin') {
      return res.status(400).json({
        success: false,
        data: { 
          message: 'You cannot change your own admin role', 
          code: 'CANNOT_DEMOTE_SELF' 
        }
      });
    }

    // Check for email conflicts (if email is being changed)
    if (email && email.toLowerCase() !== existingUser.email) {
      const emailExists = await User.findOne({ 
        email: email.toLowerCase(), 
        _id: { $ne: id } 
      });
      if (emailExists) {
        return res.status(409).json({
          success: false,
          data: { message: 'Email already in use by another user', code: 'DUPLICATE_EMAIL' }
        });
      }
    }

    // Build update object
    const updateFields = {};
    if (name !== undefined) updateFields.name = name.trim();
    if (email !== undefined) updateFields.email = email.toLowerCase().trim();
    if (role !== undefined) updateFields.role = role;
    if (status !== undefined) updateFields.status = status;
    updateFields.updatedAt = new Date();

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id, 
      updateFields, 
      { new: true, runValidators: true }
    ).select('_id name email role status createdAt updatedAt permissions avatar profilePicture');

    logger.info('User updated successfully', { 
      userId: id, 
      adminId: req.user.userId 
    });

    res.json({
      success: true,
      data: {
        user: normalizeUserData(updatedUser),
        message: 'User updated successfully'
      }
    });
  } catch (error) {
    logger.error('Update user error', { error: error.message, userId: req.params.id });
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        data: { message: 'Email already in use', code: 'DUPLICATE_EMAIL' }
      });
    }

    res.status(500).json({
      success: false,
      data: { 
        message: `Failed to update user: ${error.message}`, 
        code: 'USER_UPDATE_ERROR' 
      }
    });
  }
});

// Toggle user status (active/inactive)
const toggleUserStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        data: { message: 'Invalid user ID format', code: 'INVALID_ID' }
      });
    }

    // Prevent admin from deactivating themselves
    if (id === req.user.userId) {
      return res.status(400).json({
        success: false,
        data: { 
          message: 'You cannot deactivate your own account', 
          code: 'CANNOT_DEACTIVATE_SELF' 
        }
      });
    }

    const user = await User.findById(id).select('_id status');
    if (!user) {
      return res.status(404).json({
        success: false,
        data: { message: 'User not found', code: 'USER_NOT_FOUND' }
      });
    }

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { 
        status: newStatus,
        updatedAt: new Date()
      },
      { new: true }
    ).select('_id name email role status createdAt updatedAt permissions avatar profilePicture');

    logger.info('User status toggled', { 
      userId: id, 
      oldStatus: user.status, 
      newStatus, 
      adminId: req.user.userId 
    });

    res.json({
      success: true,
      data: {
        user: normalizeUserData(updatedUser),
        message: `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`
      }
    });
  } catch (error) {
    logger.error('Toggle user status error', { error: error.message, userId: req.params.id });
    res.status(500).json({
      success: false,
      data: { 
        message: `Failed to toggle user status: ${error.message}`, 
        code: 'STATUS_TOGGLE_ERROR' 
      }
    });
  }
});

// Delete user (soft delete by setting status to inactive)
const deleteUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        data: { message: 'Invalid user ID format', code: 'INVALID_ID' }
      });
    }

    // Prevent admin from deleting themselves
    if (id === req.user.userId) {
      return res.status(400).json({
        success: false,
        data: { 
          message: 'You cannot delete your own account', 
          code: 'CANNOT_DELETE_SELF' 
        }
      });
    }

    const user = await User.findById(id).select('_id email');
    if (!user) {
      return res.status(404).json({
        success: false,
        data: { message: 'User not found', code: 'USER_NOT_FOUND' }
      });
    }

    // Perform hard delete (you could implement soft delete instead)
    await User.findByIdAndDelete(id);

    logger.info('User deleted', { 
      userId: id, 
      deletedUserEmail: user.email,
      adminId: req.user.userId 
    });

    res.json({
      success: true,
      data: {
        message: 'User deleted successfully'
      }
    });
  } catch (error) {
    logger.error('Delete user error', { error: error.message, userId: req.params.id });
    res.status(500).json({
      success: false,
      data: { 
        message: `Failed to delete user: ${error.message}`, 
        code: 'USER_DELETE_ERROR' 
      }
    });
  }
});

module.exports = {
  getAdminStats,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser
};