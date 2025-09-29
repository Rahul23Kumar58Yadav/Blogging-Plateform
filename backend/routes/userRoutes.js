// userRoutes.js (corrected)
const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getUserBlogs,
  toggleFollowUser,
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose');

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed'), false);
  }
};

const storage = new GridFsStorage({
  db: mongoose.connection,
  file: (req, file) => {
    return {
      bucketName: 'images',
      filename: `${Date.now()}-${file.originalname}`
    };
  }
});

const upload = multer({ storage, fileFilter });

// Routes
router.get('/:id', getUserProfile);
router.put('/:id', protect, upload.single('avatar'), updateUserProfile);
router.get('/:id/blogs', getUserBlogs);
router.post('/:id/follow', protect, toggleFollowUser);

module.exports = router;