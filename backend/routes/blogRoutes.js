// blogRoutes.js (corrected)
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  createBlog,
  updateBlog,
  getBlogs,
  getBlogById,
  deleteBlog,
  likeBlog,
  addComment
} = require('../controllers/blogController');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose');
const path = require('path');

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

// Route to serve images from GridFS
router.get('/images/:filename', (req, res) => {
  const gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'images' });
  gfs.find({ filename: req.params.filename }).toArray((err, files) => {
    if (err || !files || files.length === 0) {
      return res.status(404).json({ success: false, message: 'No file found' });
    }
    res.set('Content-Type', files[0].contentType);
    gfs.openDownloadStreamByName(req.params.filename).pipe(res);
  });
});

router.get('/', getBlogs);
router.get('/:id', getBlogById);
router.post('/', protect, upload.single('featuredImage'), createBlog);
router.put('/:id', protect, upload.single('featuredImage'), updateBlog);
router.delete('/:id', protect, deleteBlog);
router.post('/:id/like', protect, likeBlog);
router.post('/:id/comments', protect, addComment);

module.exports = router;