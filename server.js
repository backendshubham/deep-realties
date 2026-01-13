require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const rentalRoutes = require('./routes/rentals');
const projectRoutes = require('./routes/projects');
const eventRoutes = require('./routes/events');
const investmentRoutes = require('./routes/investments');
const contactRoutes = require('./routes/contact');
const enquiryRoutes = require('./routes/enquiries');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Adjust based on your needs
}));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/admin', adminRoutes);

// Frontend Routes (will be added)
app.get('/', (req, res) => {
  res.render('pages/home', { title: 'DeepRealties - Premium Real Estate' });
});

app.get('/buy', (req, res) => {
  res.render('pages/buy-property', { title: 'Buy Property - DeepRealties' });
});

app.get('/properties', (req, res) => {
  res.render('pages/properties', { title: 'Properties - DeepRealties' });
});

app.get('/properties/:id', (req, res) => {
  res.render('pages/property-details', { 
    title: 'Property Details - DeepRealties',
    propertyId: req.params.id 
  });
});

app.get('/rent', (req, res) => {
  res.render('pages/rent', { title: 'Rent Properties - DeepRealties' });
});

app.get('/sell', (req, res) => {
  res.render('pages/sell', { title: 'Sell Property - DeepRealties' });
});

app.get('/admin/list-property', (req, res) => {
  res.render('pages/admin/list-property', { title: 'List Property - Admin - DeepRealties' });
});

app.get('/projects', (req, res) => {
  res.render('pages/projects', { title: 'Projects - DeepRealties' });
});

app.get('/projects/:id', (req, res) => {
  res.render('pages/project-details', { title: 'Project Details - DeepRealties' });
});

app.get('/invest', (req, res) => {
  res.render('pages/invest', { title: 'Invest - DeepRealties' });
});

app.get('/events', (req, res) => {
  res.render('pages/events', { title: 'Events - DeepRealties' });
});

app.get('/about', (req, res) => {
  res.render('pages/about', { title: 'About Us - DeepRealties' });
});

app.get('/contact', (req, res) => {
  res.render('pages/contact', { title: 'Contact - DeepRealties' });
});

app.get('/login', (req, res) => {
  res.render('pages/login', { title: 'Login - DeepRealties' });
});

app.get('/register', (req, res) => {
  res.render('pages/register', { title: 'Register - DeepRealties' });
});

app.get('/dashboard', (req, res) => {
  res.render('pages/dashboard', { title: 'Dashboard - DeepRealties' });
});

app.get('/my-properties', (req, res) => {
  res.render('pages/my-properties', { title: 'My Properties - DeepRealties' });
});

app.get('/admin/dashboard', (req, res) => {
  res.render('pages/admin/dashboard', { title: 'Admin Dashboard - DeepRealties' });
});

app.get('/admin/properties', (req, res) => {
  res.render('pages/admin/properties', { title: 'Manage Properties - Admin - DeepRealties' });
});

app.get('/admin/users', (req, res) => {
  res.render('pages/admin/users', { title: 'Manage Users - Admin - DeepRealties' });
});

app.get('/admin/contact', (req, res) => {
  res.render('pages/admin/contact', { title: 'Contact Submissions - Admin - DeepRealties' });
});

app.get('/admin/rentals', (req, res) => {
  res.render('pages/admin/rentals', { title: 'Manage Rentals - Admin - DeepRealties' });
});

app.get('/admin/projects', (req, res) => {
  res.render('pages/admin/projects', { title: 'Manage Projects - Admin - DeepRealties' });
});

app.get('/admin/events', (req, res) => {
  res.render('pages/admin/events', { title: 'Manage Events - Admin - DeepRealties' });
});

app.get('/admin', (req, res) => {
  res.redirect('/admin/dashboard');
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('pages/404', { title: '404 - Page Not Found' });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;

