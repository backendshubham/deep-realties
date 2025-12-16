const express = require('express');
const router = express.Router();
const {
  listProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getPendingProperties,
  approveProperty,
  rejectProperty,
  getMyProperties
} = require('../controllers/propertyController');
const { validateProperty } = require('../utils/validators');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

router.get('/', optionalAuth, listProperties);
// Specific routes must come before parameterized routes
router.get('/my-properties/list', authenticateToken, getMyProperties);
router.get('/pending/list', authenticateToken, requireAdmin, getPendingProperties);
router.post('/:id/approve', authenticateToken, requireAdmin, approveProperty);
router.post('/:id/reject', authenticateToken, requireAdmin, rejectProperty);
router.get('/:id', optionalAuth, getProperty);
router.post('/', optionalAuth, validateProperty, createProperty);
router.put('/:id', authenticateToken, validateProperty, updateProperty);
router.delete('/:id', authenticateToken, deleteProperty);

module.exports = router;

