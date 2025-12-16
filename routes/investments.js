const express = require('express');
const router = express.Router();
const {
  listOpportunities,
  getOpportunity,
  createOpportunity,
  registerInvestor,
  getStatistics,
  deleteOpportunity,
  markContacted
} = require('../controllers/investmentController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

router.get('/', optionalAuth, listOpportunities);
router.get('/statistics', optionalAuth, getStatistics);
router.get('/:id', optionalAuth, getOpportunity);
router.post('/', authenticateToken, requireAdmin, createOpportunity);
router.post('/register', optionalAuth, registerInvestor);
router.delete('/:id', authenticateToken, requireAdmin, deleteOpportunity);
router.post('/registrations/:id/contact', authenticateToken, requireAdmin, markContacted);

module.exports = router;

