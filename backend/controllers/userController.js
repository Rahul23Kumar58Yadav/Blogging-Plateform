// userController.js (corrected)
const User = require('../models/User');
const Blog = require('../models/Blog');
const asyncHandler = require('express-async-handler');

// Get user profile
exports.getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('followers', 'name avatar')
    .populate('following', 'name avatar');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Transform avatar to full path
  if (user.avatar) {
    user.avatar = `/images/${user.avatar}`;
  }

  res.status(200).json(user);
});

// Update user profile
exports.updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Update fields
  user.name = req.body.name || user.name;
  user.bio = req.body.bio || user.bio;

  // Handle avatar upload
  if (req.file) {
    user.avatar = req.file.filename;
  }

  await user.save();

  // Transform avatar to full path
  const responseUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar ? `/images/${user.avatar}` : null,
    bio: user.bio,
    followers: user.followers,
    following: user.following,
    role: user.role,
  };

  res.status(200).json(responseUser);
});

// Get user's blogs
exports.getUserBlogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const blogs = await Blog.find({ author: req.params.id })
    .populate('author', 'name avatar')
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  // Transform featuredImage for each blog
  const transformedBlogs = blogs.map(blog => {
    const b = blog.toObject();
    if (b.featuredImage) {
      b.featuredImage = `/images/${b.featuredImage}`;
    }
    return b;
  });

  const totalBlogs = await Blog.countDocuments({ author: req.params.id });

  res.status(200).json({
    blogs: transformedBlogs,
    currentPage: page,
    totalPages: Math.ceil(totalBlogs / limit),
  });
});

// Follow/unfollow a user
exports.toggleFollowUser = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user.id);
  const targetUser = await User.findById(req.body.userId);

  if (!targetUser) {
    res.status(404);
    throw new Error('Target user not found');
  }

  if (req.user.id === req.body.userId) {
    res.status(400);
    throw new Error('Cannot follow yourself');
  }

  const isFollowing = currentUser.following.includes(req.body.userId);

  if (isFollowing) {
    // Unfollow
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== req.body.userId
    );
    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== req.user.id
    );
  } else {
    // Follow
    currentUser.following.push(req.body.userId);
    targetUser.followers.push(req.user.id);
  }

  await currentUser.save();
  await targetUser.save();

  res.status(200).json({
    followers: targetUser.followers,
    isFollowing: !isFollowing,
  });
});