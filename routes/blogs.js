const express = require('express');
const router = express.Router();

const {
  listBlogsPublic,
  listBlogsAdmin,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog
} = require('../controllers/blogController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

// Public
router.get('/', optionalAuth, listBlogsPublic);
router.get('/:slug', optionalAuth, getBlogBySlug);

// Admin
router.get('/admin/list-all', authenticateToken, requireAdmin, listBlogsAdmin);
router.post('/', authenticateToken, requireAdmin, createBlog);
router.put('/:id', authenticateToken, requireAdmin, updateBlog);
router.delete('/:id', authenticateToken, requireAdmin, deleteBlog);

module.exports = router;

