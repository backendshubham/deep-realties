const express = require('express');
const router = express.Router();
const {
  submitContact,
  getAllSubmissions,
  getSubmission,
  markAsRead,
  markAsResponded,
  deleteSubmission
} = require('../controllers/contactController');
const { validateContact } = require('../utils/validators');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

router.post('/', validateContact, submitContact);
router.get('/submissions', authenticateToken, requireAdmin, getAllSubmissions);
router.get('/submissions/:id', authenticateToken, requireAdmin, getSubmission);
router.put('/submissions/:id/read', authenticateToken, requireAdmin, markAsRead);
router.put('/submissions/:id/respond', authenticateToken, requireAdmin, markAsResponded);
router.delete('/submissions/:id', authenticateToken, requireAdmin, deleteSubmission);

module.exports = router;

