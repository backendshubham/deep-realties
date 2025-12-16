const express = require('express');
const router = express.Router();
const {
  listRentals,
  getRental,
  createRental,
  getPendingRentals,
  approveRental,
  rejectRental
} = require('../controllers/rentalController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

router.get('/', optionalAuth, listRentals);
router.get('/:id', optionalAuth, getRental);
router.post('/', optionalAuth, createRental);
router.get('/pending/list', authenticateToken, requireAdmin, getPendingRentals);
router.post('/:id/approve', authenticateToken, requireAdmin, approveRental);
router.post('/:id/reject', authenticateToken, requireAdmin, rejectRental);

module.exports = router;

