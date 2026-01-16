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
    title: 'DeepRealties - Premium Real Estate | Buy, Sell, Rent Properties in Indore',
    description: 'Find your dream property with DeepRealties. Premium real estate services for buying, selling, and renting properties in Indore, Madhya Pradesh. Trusted real estate platform with verified listings, expert guidance, and best market prices.',
    keywords: 'real estate Indore, buy property Indore, sell property Indore, rent property Indore, property investment, real estate agent Indore, property listings, homes for sale Indore, apartments for rent Indore, commercial property Indore, real estate MP, property dealer Indore',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl,
    image: 'https://storage.googleapis.com/supersourcing-doc-dev/8d866c52-57fe-4a85-9f41-f64c074bd6ee.jpeg'
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
    title: 'Buy Property in Indore - Find Your Dream Home | DeepRealties',
    description: 'Browse verified properties for sale in Indore, Madhya Pradesh. Find houses, apartments, villas, plots, and commercial spaces. Expert guidance, best prices, verified listings, and complete legal support. Start your property search today.',
    keywords: 'buy property Indore, houses for sale Indore, apartments for sale Indore, villas for sale Indore, property for sale Indore, real estate buying Indore, home buying Indore, property purchase Indore, buy house Indore, buy flat Indore, property dealer Indore',
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
    title: 'Properties for Sale in Indore - Browse All Listings | DeepRealties',
    description: 'Browse our complete collection of verified properties for sale in Indore, MP. Filter by location, price, type, and more. Find houses, apartments, villas, plots, and commercial properties. Search and compare properties easily.',
    keywords: 'properties for sale Indore, property listings Indore, real estate listings Indore, homes for sale Indore, property search Indore, buy property online Indore, property listings MP, real estate Indore, property search Indore',
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
    title: 'Rent Properties in Indore - Find Your Perfect Rental | DeepRealties',
    description: 'Find the perfect rental property in Indore, Madhya Pradesh. Browse apartments, houses, villas, and commercial spaces for rent. Flexible lease options, verified listings, and professional property management. Start your rental search today.',
    keywords: 'rent property Indore, rental properties Indore, apartments for rent Indore, houses for rent Indore, property rental Indore, lease property Indore, rent house Indore, rent flat Indore, rental property Indore',
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
    title: 'Sell Property in Indore - Get Best Value for Your Property | DeepRealties',
    description: 'Sell your property fast in Indore and get the best market price. We use smart marketing, accurate property valuation, and wide reach to attract the right buyers. Complete legal support, documentation help, and hassle-free selling process included.',
    keywords: 'sell property Indore, list property Indore, property sale Indore, sell house Indore, sell apartment Indore, property valuation Indore, real estate selling Indore, property dealer Indore, sell land Indore',
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
    title: 'Real Estate Projects in Indore - Explore Our Developments | DeepRealties',
    description: 'Explore our premium real estate projects and developments in Indore, Madhya Pradesh. Modern amenities, prime locations, excellent investment opportunities, and RERA approved projects. Find your perfect home or investment property.',
    keywords: 'real estate projects Indore, property developments Indore, new projects Indore, residential projects Indore, commercial projects Indore, real estate investment Indore, RERA approved projects Indore, new construction Indore',
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
    title: 'Real Estate Investment in Indore - Grow Your Wealth | DeepRealties',
    description: 'Invest in real estate in Indore - the safest way to build long-term wealth. Your money grows steadily and delivers high returns over the years. Expert guidance, verified investment opportunities, and complete support for property investors.',
    keywords: 'real estate investment Indore, property investment Indore, investment opportunities Indore, real estate ROI Indore, property investment returns Indore, real estate investment MP, property investment advice Indore',
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
    title: 'Real Estate Events in Indore - Property Exhibitions & Seminars | DeepRealties',
    description: 'Stay updated with our latest real estate events, property exhibitions, and investment seminars in Indore. Join us to learn about property investment opportunities, market trends, and get expert advice from industry professionals.',
    keywords: 'real estate events Indore, property exhibitions Indore, real estate seminars Indore, property investment events Indore, real estate workshops Indore, property events MP',
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
    title: 'About Us - Trusted Real Estate Experts in Indore | DeepRealties',
    description: 'Learn about DeepRealties - your trusted real estate partner in Indore, Madhya Pradesh. Experienced team, verified properties, and expert guidance for buying, selling, and renting properties. Your trusted partner for all real estate needs.',
    keywords: 'about deeprealties, real estate company Indore, property experts Indore, real estate agents Indore, property consultants Indore, real estate company MP, property dealer Indore',
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
    title: 'Contact Us - Get in Touch | DeepRealties Indore',
    description: 'Contact DeepRealties in Indore for all your real estate needs. Our expert team is ready to help you buy, sell, or rent properties. Call us at +91-8305551215 or visit our office. Get in touch today for free consultation!',
    keywords: 'contact deeprealties, real estate contact Indore, property consultation Indore, real estate inquiry Indore, deeprealties contact number, property dealer contact Indore',
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

app.get('/admin/properties/:id', (req, res) => {
  const seo = generateSEO({
    title: 'Admin - Property Details | DeepRealties',
    description: 'View and manage property details',
    keywords: 'admin, property management',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl
  });
  const structuredData = generateStructuredData(seo);
  res.render('pages/admin/property-details', { 
    title: seo.title,
    seo: seo,
    structuredData: structuredData,
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

