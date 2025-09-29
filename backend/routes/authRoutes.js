const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const User = require('../models/User');

router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password').lean();
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user.avatar) {
    user.avatar = `/images/${user.avatar}`;
  }
  res.status(200).json({
    success: true,
    data: { user }
  });
});

module.exports = router;