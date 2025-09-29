// blogController.js (corrected)
const Blog = require('../models/Blog');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

exports.createBlog = asyncHandler(async (req, res) => {
  const { title, content, category, tags, excerpt, seoTitle, seoDescription, slug, status } = req.body;
  console.log('Create blog request:', { title, category, tags, hasFile: !!req.file });

  let featuredImage = null;
  if (req.file) {
    featuredImage = req.file.filename;
  }

  const blog = await Blog.create({
    title,
    content,
    excerpt,
    category,
    tags: tags ? JSON.parse(tags) : [],
    author: req.user.id,
    featuredImage,
    seoTitle,
    seoDescription,
    slug: slug || `${title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')}-${Date.now()}`,
    status: status || 'published'
  });

  const populatedBlog = await Blog.findById(blog._id).populate('author', 'name avatar');

  // Transform featuredImage to full path
  if (populatedBlog.featuredImage) {
    populatedBlog.featuredImage = `/images/${populatedBlog.featuredImage}`;
  }

  res.status(201).json({
    success: true,
    data: { blog: populatedBlog }
  });
});

exports.updateBlog = asyncHandler(async (req, res) => {
  let blog = await Blog.findById(req.params.id);
  if (!blog) {
    res.status(404);
    throw new Error('Blog not found');
  }

  if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  const { title, content, category, tags, excerpt, seoTitle, seoDescription, slug, status } = req.body;

  blog.title = title || blog.title;
  blog.content = content || blog.content;
  blog.excerpt = excerpt || blog.excerpt;
  blog.category = category || blog.category;
  blog.tags = tags ? JSON.parse(tags) : blog.tags;
  blog.seoTitle = seoTitle || blog.seoTitle;
  blog.seoDescription = seoDescription || blog.seoDescription;
  blog.slug = slug || blog.slug;
  blog.status = status || blog.status;

  if (req.file) {
    blog.featuredImage = req.file.filename;
  }

  await blog.save();

  const updatedBlog = await Blog.findById(blog._id).populate('author', 'name avatar');

  // Transform featuredImage to full path
  if (updatedBlog.featuredImage) {
    updatedBlog.featuredImage = `/images/${updatedBlog.featuredImage}`;
  }

  res.status(200).json({
    success: true,
    data: { blog: updatedBlog }
  });
});

exports.getBlogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const status = req.query.status || 'published';
  const category = req.query.category;
  const sort = req.query.sort || 'newest';
  const query = req.query.query || req.query.q;

  console.log('Get blogs query:', { page, limit, status, category, sort, query });

  const filter = { status };
  if (category && category !== 'all') filter.category = category;
  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: 'i' } },
      { content: { $regex: query, $options: 'i' } },
      { tags: { $regex: query, $options: 'i' } }
    ];
  }

  let blogs;
  let totalCount;

  if (sort === 'popular') {
    const aggregate = [
      { $match: filter },
      { $addFields: { likesCount: { $size: '$likes' } } },
      { $sort: { likesCount: -1, createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author',
          pipeline: [{ $project: { name: 1, avatar: 1 } }]
        }
      },
      { $unwind: '$author' }
    ];
    blogs = await Blog.aggregate(aggregate);
    totalCount = await Blog.countDocuments(filter);
  } else {
    let sortOption = { createdAt: -1 };
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'mostViewed':
        sortOption = { views: -1 };
        break;
      case 'alphabetical':
        sortOption = { title: 1 };
        break;
    }

    blogs = await Blog.find(filter)
      .populate('author', 'name avatar')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);

    totalCount = await Blog.countDocuments(filter);
  }

  // Transform featuredImage for each blog
  blogs = blogs.map(blog => {
    const b = blog.toObject ? blog.toObject() : blog;
    if (b.featuredImage) {
      b.featuredImage = `/images/${b.featuredImage}`;
    }
    return b;
  });

  console.log('Blogs fetched:', { count: blogs.length, totalCount });

  res.set('Cache-Control', 'no-store');
  res.status(200).json({
    success: true,
    data: {
      blogs,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: page * limit < totalCount
    }
  });
});

exports.getBlogById = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate('author', 'name avatar');
  if (!blog) {
    res.status(404);
    throw new Error('Blog not found');
  }

  // Transform featuredImage
  if (blog.featuredImage) {
    blog.featuredImage = `/images/${blog.featuredImage}`;
  }

  res.status(200).json({
    success: true,
    data: { blog }
  });
});

exports.deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    res.status(404);
    throw new Error('Blog not found');
  }
  if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }
  await blog.remove();
  res.status(200).json({
    success: true,
    data: {}
  });
});

exports.likeBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    res.status(404);
    throw new Error('Blog not found');
  }
  const userId = req.user.id;
  const isLiked = blog.likes.includes(userId);
  if (isLiked) {
    blog.likes = blog.likes.filter(id => id.toString() !== userId);
  } else {
    blog.likes.push(userId);
  }
  await blog.save();
  res.status(200).json({
    success: true,
    data: { likes: blog.likes }
  });
});

exports.addComment = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    res.status(404);
    throw new Error('Blog not found');
  }
  const comment = {
    user: req.user.id,
    content: req.body.content,
    createdAt: new Date()
  };
  blog.comments.push(comment);
  await blog.save();
  res.status(201).json({
    success: true,
    data: { comment }
  });
});