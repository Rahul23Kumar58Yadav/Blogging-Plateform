const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  category: { type: String, required: true },
  tags: [{ type: String }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  featuredImage: { type: String },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  featured: { type: Boolean, default: false }
});

blogSchema.virtual('likesCount').get(function () {
  return this.likes.length;
});

blogSchema.virtual('commentsCount').get(function () {
  return this.comments.length;
});

blogSchema.index({ title: 'text', content: 'text', tags: 'text' });

blogSchema.set('toObject', { virtuals: true });
blogSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Blog', blogSchema);