const express = require('express');
const router = express.Router();
const {
  createEnquiry,
  getSentEnquiries,
  getReceivedEnquiries,
  markAsRead
} = require('../controllers/enquiryController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, createEnquiry);
router.get('/sent', authenticateToken, getSentEnquiries);
router.get('/received', authenticateToken, getReceivedEnquiries);
router.put('/:id/read', authenticateToken, markAsRead);

module.exports = router;

