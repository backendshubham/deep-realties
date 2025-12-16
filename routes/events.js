const express = require('express');
const router = express.Router();
const {
  listEvents,
  getEvent,
  createEvent,
  registerForEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

router.get('/', optionalAuth, listEvents);
router.get('/:id', optionalAuth, getEvent);
router.post('/', authenticateToken, requireAdmin, createEvent);
router.post('/:id/register', registerForEvent);
router.put('/:id', authenticateToken, requireAdmin, updateEvent);
router.delete('/:id', authenticateToken, requireAdmin, deleteEvent);

module.exports = router;

