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
const blogRoutes = require('./routes/blogs');
const testimonialRoutes = require('./routes/testimonials');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 3000;

// Helper to convert plain text blog content into HTML paragraphs
function plainTextToHtml(text) {
  if (!text) return '';
  const normalized = text.replace(/\r\n/g, '\n');
  const paragraphs = normalized
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (!paragraphs.length) return '';

  return paragraphs
    .map((p) => {
      const withLineBreaks = p.replace(/\n/g, '<br>');
      // Detect headings (short lines without punctuation at end, or lines that look like titles)
      const isHeading = p.length < 80 && !p.endsWith('.') && !p.endsWith(',') && !p.endsWith(':');
      if (isHeading) {
        return `<h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">${withLineBreaks}</h2>`;
      }
      return `<p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">${withLineBreaks}</p>`;
    })
    .join('\n');
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": [
        "'self'", 
        "'unsafe-inline'", 
        "https://cdn.tailwindcss.com", 
        "https://maps.googleapis.com",
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
        "https://cdn.quilljs.com",
        "https://cdn.jsdelivr.net"
      ],
      "style-src": [
        "'self'", 
        "'unsafe-inline'", 
        "https://fonts.googleapis.com", 
        "https://cdn.tailwindcss.com",
        "https://cdn.quilljs.com",
        "https://cdn.jsdelivr.net"
      ],
      "img-src": [
        "'self'", 
        "data:", 
        "https://storage.googleapis.com", 
        "https://maps.gstatic.com", 
        "https://maps.googleapis.com", 
        "https://images.unsplash.com",
        "https://ui-avatars.com",
        "https://picsum.photos",
        "https://*.picsum.photos",
        "https://*.amazonaws.com",
        "https://www.transparenttextures.com"
      ],
      "font-src": [
        "'self'", 
        "data:", 
        "https://fonts.gstatic.com"
      ],
      "connect-src": [
        "'self'", 
        "https://maps.googleapis.com",
        "https://www.google-analytics.com",
        "https://www.googletagmanager.com",
        "https://*.amazonaws.com",
        "https://www.google.com"
      ],
      "frame-src": ["'self'", "https://www.google.com"],
      "script-src-attr": ["'unsafe-inline'"]
    },
  },
  crossOriginEmbedderPolicy: false
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
app.use('/api/blogs', blogRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Frontend Routes (will be added)
app.get('/', (req, res) => {
  const seo = generateSEO({
    title: 'DeepRealties | Buy, Sell & Rent Property in Indore',
    description: 'Find your dream property with DeepRealties. Premium real estate services for buying, selling, and renting in Indore, MP. Verified listings at best prices.',
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
    title: 'Buy Property in Indore | DeepRealties',
    description: 'Browse verified properties for sale in Indore, MP. Find houses, apartments, farming land, plots & commercial spaces. Expert guidance & complete legal support.',
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
    title: 'Properties for Sale in Indore | DeepRealties',
    description: 'Browse verified properties for sale in Indore, MP. Filter by location, price & type to find houses, apartments, plots & commercial spaces easily.',
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
    title: 'Property Details | DeepRealties',
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
    title: 'Rent Properties in Indore | DeepRealties',
    description: 'Find the perfect rental property in Indore, MP. Browse apartments, houses & commercial spaces for rent with flexible lease options and verified listings.',
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
    title: 'Sell Property in Indore | DeepRealties',
    description: 'Sell your property fast in Indore for the best market price. Get accurate valuation, smart marketing to attract buyers, and complete documentation support.',
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
    title: 'Real Estate Projects in Indore | DeepRealties',
    description: 'Explore premium RERA approved real estate projects in Indore, MP. Find modern developments in prime locations for your next home or investment.',
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
    title: 'Project Details | DeepRealties',
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
    title: 'Real Estate Investment in Indore | DeepRealties',
    description: 'Build long-term wealth by investing in Indore real estate. We provide expert guidance, verified high-return opportunities, and complete investor support.',
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
    title: 'Real Estate Events in Indore | DeepRealties',
    description: 'Join our real estate events, property exhibitions, and investment seminars in Indore. Learn about market trends and get expert advice from professionals.',
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

app.get('/blogs', (req, res) => {
  const seo = generateSEO({
    title: 'Real Estate Blog & Guides | DeepRealties',
    description: 'Read expert real estate blogs, guides and tips from DeepRealties. Learn how to buy, sell, rent and invest in property with confidence.',
    keywords: 'real estate blog, property blog, real estate tips, property investment tips, home buying guide, selling property guide, real estate news Indore',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl
  });
  const structuredData = generateStructuredData(seo, 'Blog');
  res.render('pages/blogs', {
    title: seo.title,
    seo,
    structuredData,
    req
  });
});

app.get('/blogs/:slug', async (req, res, next) => {
  try {
    const db = require('./config/database');
    const slug = req.params.slug;
    const blog = await db('blogs')
      .where({ slug, is_published: true })
      .first();

    if (!blog) {
      return next();
    }

    const seo = generateSEO({
      title: blog.seo_title || blog.title,
      description: blog.seo_description || (blog.excerpt || 'Read this real estate article from DeepRealties.'),
      keywords: blog.seo_keywords || 'real estate blog, property blog, real estate tips, DeepRealties',
      url: getBaseUrl() + req.originalUrl,
      canonical: getBaseUrl() + req.originalUrl
    });

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: seo.title,
      description: seo.description,
      datePublished: blog.published_at || blog.created_at,
      dateModified: blog.updated_at || blog.published_at || blog.created_at,
      author: {
        '@type': 'Organization',
        name: 'DeepRealties'
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': seo.url
      }
    };

    // Detect if content is already HTML (from Quill) or plain text
    const isHtml = /<[a-z][\s\S]*>/i.test(blog.content || '');
    const blogHtml = isHtml ? blog.content : plainTextToHtml(blog.content || '');

    res.render('pages/blog-details', {
      title: seo.title,
      seo,
      structuredData,
      blog,
      blogHtml,
      req
    });
  } catch (error) {
    next(error);
  }
});

app.get('/about', (req, res) => {
  const seo = generateSEO({
    title: 'About Us | DeepRealties Indore',
    description: 'DeepRealties is your trusted real estate partner in Indore, MP. Benefit from our experienced team\'s expert guidance for buying, selling, and renting.',
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
    title: 'Contact Us | DeepRealties Indore',
    description: 'Contact DeepRealties in Indore for expert help with buying, selling, or renting properties. Call us at +91-8305551215 today for a free consultation!',
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

app.get('/forgot-password', (req, res) => {
  const seo = generateSEO({
    title: 'Forgot Password - Reset Your Access | DeepRealties',
    description: 'Recover your DeepRealties account access. Enter your email to receive a password reset code.',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl,
    robots: 'noindex, follow'
  });
  res.render('pages/forgot-password', {
    title: seo.title,
    seo: seo,
    req: req
  });
});

app.get('/reset-password', (req, res) => {
  const seo = generateSEO({
    title: 'Reset Password - Secure Your Account | DeepRealties',
    description: 'Create a new secure password for your DeepRealties account.',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl,
    robots: 'noindex, follow'
  });
  res.render('pages/reset-password', {
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

app.get('/admin/properties/edit/:id', (req, res) => {
  const seo = generateSEO({
    title: 'Edit Property - Admin Panel | DeepRealties',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl,
    robots: 'noindex, nofollow'
  });
  res.render('pages/admin/edit-property', {
    title: seo.title,
    seo: seo,
    propertyId: req.params.id,
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

app.get('/admin/testimonials', (req, res) => {
  const seo = generateSEO({
    title: 'Manage Testimonials - Admin Panel | DeepRealties',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl,
    robots: 'noindex, nofollow'
  });
  res.render('pages/admin/testimonials', {
    title: seo.title,
    seo: seo,
    req: req
  });
});

app.get('/admin/blogs', (req, res) => {
  const seo = generateSEO({
    title: 'Manage Blogs - Admin Panel | DeepRealties',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl,
    robots: 'noindex, nofollow'
  });
  res.render('pages/admin/blogs', {
    title: seo.title,
    seo: seo,
    req: req
  });
});

app.get('/admin/blogs/add', (req, res) => {
  const seo = generateSEO({
    title: 'Add Blog Post - Admin Panel | DeepRealties',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl,
    robots: 'noindex, nofollow'
  });
  res.render('pages/admin/add-blog', {
    title: seo.title,
    seo: seo,
    req: req
  });
});

app.get('/admin/blogs/edit/:id', (req, res) => {
  const seo = generateSEO({
    title: 'Edit Blog Post - Admin Panel | DeepRealties',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl,
    robots: 'noindex, nofollow'
  });
  res.render('pages/admin/edit-blog', {
    title: seo.title,
    seo: seo,
    blogId: req.params.id,
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

