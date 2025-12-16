const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  listUsers,
  getUserById,
  toggleUserStatus,
  updateUser,
  deleteUser,
  listAllProperties,
  getPropertyById,
  updatePropertyStatus,
  deletePropertyAdmin,
  listAllRentals,
  listAllProjects,
  listAllEvents,
  listAllInvestments,
  listInvestorRegistrations,
  listContactSubmissions,
  getContactSubmissionById,
  deleteContactSubmission
} = require('../controllers/adminController');
const { approveProperty, rejectProperty } = require('../controllers/propertyController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

// Dashboard
router.get('/dashboard', authenticateToken, requireAdmin, getDashboardStats);

// Users Management
router.get('/users', authenticateToken, requireAdmin, listUsers);
router.get('/users/:id', authenticateToken, requireAdmin, getUserById);
router.put('/users/:id/toggle', authenticateToken, requireAdmin, toggleUserStatus);
router.put('/users/:id', authenticateToken, requireAdmin, updateUser);
router.delete('/users/:id', authenticateToken, requireAdmin, deleteUser);

// Properties Management
router.get('/properties', authenticateToken, requireAdmin, listAllProperties);
router.get('/properties/:id', authenticateToken, requireAdmin, getPropertyById);
router.put('/properties/:id/status', authenticateToken, requireAdmin, updatePropertyStatus);
router.post('/properties/:id/approve', authenticateToken, requireAdmin, approveProperty);
router.post('/properties/:id/reject', authenticateToken, requireAdmin, rejectProperty);
router.delete('/properties/:id', authenticateToken, requireAdmin, deletePropertyAdmin);

// Rentals Management
router.get('/rentals', authenticateToken, requireAdmin, listAllRentals);

// Projects Management
router.get('/projects', authenticateToken, requireAdmin, listAllProjects);

// Events Management
router.get('/events', authenticateToken, requireAdmin, listAllEvents);

// Investments Management
router.get('/investments', authenticateToken, requireAdmin, listAllInvestments);
router.get('/investor-registrations', authenticateToken, requireAdmin, listInvestorRegistrations);

// Contact Submissions Management
router.get('/contact-submissions', authenticateToken, requireAdmin, listContactSubmissions);
router.get('/contact-submissions/:id', authenticateToken, requireAdmin, getContactSubmissionById);
router.delete('/contact-submissions/:id', authenticateToken, requireAdmin, deleteContactSubmission);

module.exports = router;

