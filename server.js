require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');
const { generateSEO, generateStructuredData, getBaseUrl } = require('./utils/helpers');

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
const uploadRoutes = require('./routes/upload');

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

// SEO Routes
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

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
app.use('/api/upload', uploadRoutes);

// Frontend Routes (will be added)
app.get('/', (req, res) => {
  const seo = generateSEO({
    title: 'DeepRealties - Premium Real Estate | Buy, Sell, Rent Properties',
    description: 'Find your dream property with DeepRealties. Premium real estate services for buying, selling, and renting properties. Trusted by 50+ happy families. Expert guidance, verified properties, and best market prices.',
    keywords: 'real estate, buy property, sell property, rent property, property investment, real estate agent, property listings, homes for sale, apartments for rent, commercial property, Indore real estate',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl
  });
  const structuredData = generateStructuredData(seo, 'RealEstateAgent');
  res.render('pages/home', { 
    title: seo.title,
    seo: seo,
    structuredData: structuredData,
    req: req
  });
});

app.get('/buy', (req, res) => {
  const seo = generateSEO({
    title: 'Buy Property - Find Your Dream Home | DeepRealties',
    description: 'Browse verified properties for sale. Find houses, apartments, villas, and commercial spaces. Expert guidance, best prices, and complete legal support.',
    keywords: 'buy property, houses for sale, apartments for sale, villas for sale, property for sale, real estate buying, home buying, property purchase',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl
  });
  const structuredData = generateStructuredData(seo);
  res.render('pages/buy-property', { 
    title: seo.title,
    seo: seo,
    structuredData: structuredData,
    req: req
  });
});

app.get('/properties', (req, res) => {
  const seo = generateSEO({
    title: 'Properties for Sale - Browse All Listings | DeepRealties',
    description: 'Browse our complete collection of verified properties for sale. Filter by location, price, type, and more. Find your perfect property today.',
    keywords: 'properties for sale, property listings, real estate listings, homes for sale, property search, buy property online',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl
  });
  const structuredData = generateStructuredData(seo);
  res.render('pages/properties', { 
    title: seo.title,
    seo: seo,
    structuredData: structuredData,
    req: req
  });
});

app.get('/properties/:id', (req, res) => {
  const seo = generateSEO({
    title: 'Property Details - View Full Information | DeepRealties',
    description: 'View detailed information about this property including photos, amenities, location, and pricing. Contact us for more details.',
    keywords: 'property details, property information, property photos, property amenities, property location',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl
  });
  const structuredData = generateStructuredData(seo);
  res.render('pages/property-details', { 
    title: seo.title,
    seo: seo,
    structuredData: structuredData,
    propertyId: req.params.id,
    req: req
  });
});

app.get('/rent', (req, res) => {
  const seo = generateSEO({
    title: 'Rent Properties - Find Your Perfect Rental | DeepRealties',
    description: 'Find the perfect rental property. Browse apartments, houses, and commercial spaces for rent. Flexible options and professional property management.',
    keywords: 'rent property, rental properties, apartments for rent, houses for rent, property rental, lease property',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl
  });
  const structuredData = generateStructuredData(seo);
  res.render('pages/rent', { 
    title: seo.title,
    seo: seo,
    structuredData: structuredData,
    req: req
  });
});

app.get('/sell', (req, res) => {
  const seo = generateSEO({
    title: 'Sell Property - Get Best Value for Your Property | DeepRealties',
    description: 'Sell your property fast and get the best price. We use smart marketing and accurate pricing to attract the right buyers. Complete legal support included.',
    keywords: 'sell property, list property, property sale, sell house, sell apartment, property valuation, real estate selling',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl
  });
  const structuredData = generateStructuredData(seo);
  res.render('pages/sell', { 
    title: seo.title,
    seo: seo,
    structuredData: structuredData,
    req: req
  });
});

app.get('/admin/list-property', (req, res) => {
  const seo = generateSEO({
    title: 'List Property - Admin Panel | DeepRealties',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl,
    robots: 'noindex, nofollow'
  });
  res.render('pages/admin/list-property', { 
    title: seo.title,
    seo: seo,
    req: req
  });
});

app.get('/projects', (req, res) => {
  const seo = generateSEO({
    title: 'Real Estate Projects - Explore Our Developments | DeepRealties',
    description: 'Explore our premium real estate projects and developments. Modern amenities, prime locations, and excellent investment opportunities.',
    keywords: 'real estate projects, property developments, new projects, residential projects, commercial projects, real estate investment',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl
  });
  const structuredData = generateStructuredData(seo);
  res.render('pages/projects', { 
    title: seo.title,
    seo: seo,
    structuredData: structuredData,
    req: req
  });
});

app.get('/projects/:id', (req, res) => {
  const seo = generateSEO({
    title: 'Project Details - View Full Information | DeepRealties',
    description: 'View detailed information about this real estate project including amenities, location, pricing, and investment opportunities.',
    keywords: 'project details, real estate project, property development, project amenities, project location',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl
  });
  const structuredData = generateStructuredData(seo);
  res.render('pages/project-details', { 
    title: seo.title,
    seo: seo,
    structuredData: structuredData,
    req: req
  });
});

app.get('/invest', (req, res) => {
  const seo = generateSEO({
    title: 'Real Estate Investment - Grow Your Wealth | DeepRealties',
    description: 'Invest in real estate - the safest way to build long-term wealth. Your money grows steadily and delivers high returns over the years.',
    keywords: 'real estate investment, property investment, investment opportunities, real estate ROI, property investment returns',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl
  });
  const structuredData = generateStructuredData(seo);
  res.render('pages/invest', { 
    title: seo.title,
    seo: seo,
    structuredData: structuredData,
    req: req
  });
});

app.get('/events', (req, res) => {
  const seo = generateSEO({
    title: 'Real Estate Events - Property Exhibitions & Seminars | DeepRealties',
    description: 'Stay updated with our latest real estate events, property exhibitions, and investment seminars. Join us to learn about property investment opportunities.',
    keywords: 'real estate events, property exhibitions, real estate seminars, property investment events, real estate workshops',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl
  });
  const structuredData = generateStructuredData(seo);
  res.render('pages/events', { 
    title: seo.title,
    seo: seo,
    structuredData: structuredData,
    req: req
  });
});

app.get('/about', (req, res) => {
  const seo = generateSEO({
    title: 'About Us - Trusted Real Estate Experts | DeepRealties',
    description: 'Learn about DeepRealties - your trusted real estate partner. 5+ years of experience, 50+ happy families, and 100+ verified properties. Expert guidance for all your property needs.',
    keywords: 'about deeprealties, real estate company, property experts, real estate agents, property consultants',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl
  });
  const structuredData = generateStructuredData(seo);
  res.render('pages/about', { 
    title: seo.title,
    seo: seo,
    structuredData: structuredData,
    req: req
  });
});

app.get('/contact', (req, res) => {
  const seo = generateSEO({
    title: 'Contact Us - Get in Touch | DeepRealties',
    description: 'Contact DeepRealties for all your real estate needs. Our expert team is ready to help you buy, sell, or rent properties. Get in touch today!',
    keywords: 'contact deeprealties, real estate contact, property consultation, real estate inquiry',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl
  });
  const structuredData = generateStructuredData(seo);
  res.render('pages/contact', { 
    title: seo.title,
    seo: seo,
    structuredData: structuredData,
    req: req
  });
});

app.get('/login', (req, res) => {
  const seo = generateSEO({
    title: 'Login - Access Your Account | DeepRealties',
    description: 'Login to your DeepRealties account to manage your properties, view saved listings, and access exclusive features.',
    keywords: 'login, account login, user login, property account',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl,
    robots: 'noindex, follow'
  });
  res.render('pages/login', { 
    title: seo.title,
    seo: seo,
    req: req
  });
});

app.get('/register', (req, res) => {
  const seo = generateSEO({
    title: 'Register - Create Your Account | DeepRealties',
    description: 'Create your free DeepRealties account to list properties, save favorites, and get personalized property recommendations.',
    keywords: 'register, create account, sign up, property account registration',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl,
    robots: 'noindex, follow'
  });
  res.render('pages/register', { 
    title: seo.title,
    seo: seo,
    req: req
  });
});

app.get('/dashboard', (req, res) => {
  const seo = generateSEO({
    title: 'Dashboard - Manage Your Account | DeepRealties',
    description: 'Access your personal dashboard to manage properties, view inquiries, and track your real estate activities.',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl,
    robots: 'noindex, follow'
  });
  res.render('pages/dashboard', { 
    title: seo.title,
    seo: seo,
    req: req
  });
});

app.get('/my-properties', (req, res) => {
  const seo = generateSEO({
    title: 'My Properties - Manage Your Listings | DeepRealties',
    description: 'View and manage all your property listings in one place. Update details, track views, and manage inquiries.',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl,
    robots: 'noindex, follow'
  });
  res.render('pages/my-properties', { 
    title: seo.title,
    seo: seo,
    req: req
  });
});

app.get('/admin/dashboard', (req, res) => {
  const seo = generateSEO({
    title: 'Admin Dashboard - DeepRealties',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl,
    robots: 'noindex, nofollow'
  });
  res.render('pages/admin/dashboard', { 
    title: seo.title,
    seo: seo,
    req: req
  });
});

app.get('/admin/properties', (req, res) => {
  const seo = generateSEO({
    title: 'Manage Properties - Admin Panel | DeepRealties',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl,
    robots: 'noindex, nofollow'
  });
  res.render('pages/admin/properties', { 
    title: seo.title,
    seo: seo,
    req: req
  });
});

app.get('/admin/users', (req, res) => {
  const seo = generateSEO({
    title: 'Manage Users - Admin Panel | DeepRealties',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl,
    robots: 'noindex, nofollow'
  });
  res.render('pages/admin/users', { 
    title: seo.title,
    seo: seo,
    req: req
  });
});

app.get('/admin/contact', (req, res) => {
  const seo = generateSEO({
    title: 'Contact Submissions - Admin Panel | DeepRealties',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl,
    robots: 'noindex, nofollow'
  });
  res.render('pages/admin/contact', { 
    title: seo.title,
    seo: seo,
    req: req
  });
});

app.get('/admin/rentals', (req, res) => {
  const seo = generateSEO({
    title: 'Manage Rentals - Admin Panel | DeepRealties',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl,
    robots: 'noindex, nofollow'
  });
  res.render('pages/admin/rentals', { 
    title: seo.title,
    seo: seo,
    req: req
  });
});

app.get('/admin/projects', (req, res) => {
  const seo = generateSEO({
    title: 'Manage Projects - Admin Panel | DeepRealties',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl,
    robots: 'noindex, nofollow'
  });
  res.render('pages/admin/projects', { 
    title: seo.title,
    seo: seo,
    req: req
  });
});

app.get('/admin/events', (req, res) => {
  const seo = generateSEO({
    title: 'Manage Events - Admin Panel | DeepRealties',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl,
    robots: 'noindex, nofollow'
  });
  res.render('pages/admin/events', { 
    title: seo.title,
    seo: seo,
    req: req
  });
});

app.get('/admin', (req, res) => {
  res.redirect('/admin/dashboard');
});

// 404 handler
app.use((req, res) => {
  const seo = generateSEO({
    title: '404 - Page Not Found | DeepRealties',
    description: 'The page you are looking for could not be found. Return to our homepage to browse properties.',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl,
    robots: 'noindex, follow'
  });
  res.status(404).render('pages/404', { 
    title: seo.title,
    seo: seo,
    req: req
  });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;

