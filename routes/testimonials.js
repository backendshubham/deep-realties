const express = require('express');
const router = express.Router();
const {
  listTestimonials,
  createTestimonial,
  archiveTestimonial,
  unarchiveTestimonial,
  deleteTestimonial
} = require('../controllers/testimonialController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

// Public list (non-archived, active)
router.get('/', listTestimonials);

// Admin CRUD
router.post('/', authenticateToken, requireAdmin, createTestimonial);
router.post('/:id/archive', authenticateToken, requireAdmin, archiveTestimonial);
router.post('/:id/unarchive', authenticateToken, requireAdmin, unarchiveTestimonial);
router.delete('/:id', authenticateToken, requireAdmin, deleteTestimonial);

module.exports = router;

