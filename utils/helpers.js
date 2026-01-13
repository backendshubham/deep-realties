const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const formatProperty = (property) => {
  if (!property) return null;
  
  return {
    ...property,
    amenities: property.amenities || [],
    images: property.images || [],
    price: parseFloat(property.price),
    area_sqft: parseFloat(property.area_sqft),
    views: parseInt(property.views) || 0
  };
};

const formatRental = (rental) => {
  if (!rental) return null;
  
  return {
    ...rental,
    amenities: rental.amenities || [],
    images: rental.images || [],
    monthly_rent: parseFloat(rental.monthly_rent),
    security_deposit: rental.security_deposit ? parseFloat(rental.security_deposit) : null,
    area_sqft: parseFloat(rental.area_sqft)
  };
};

const buildPropertyQuery = (query, filters) => {
  if (filters.city) {
    query.where('city', 'ilike', `%${filters.city}%`);
  }
  if (filters.state) {
    query.where('state', 'ilike', `%${filters.state}%`);
  }
  if (filters.property_type) {
    query.where('property_type', filters.property_type);
  }
  if (filters.min_price) {
    query.where('price', '>=', filters.min_price);
  }
  if (filters.max_price) {
    query.where('price', '<=', filters.max_price);
  }
  if (filters.min_area) {
    query.where('area_sqft', '>=', filters.min_area);
  }
  if (filters.max_area) {
    query.where('area_sqft', '<=', filters.max_area);
  }
  if (filters.bedrooms) {
    query.where('bedrooms', '>=', filters.bedrooms);
  }
  if (filters.status) {
    query.where('status', filters.status);
  } else {
    query.where('status', 'approved');
  }
  // Only filter by is_active if explicitly provided
  // This allows approved properties to show even if is_active is not set
  if (filters.is_active !== undefined) {
    query.where('is_active', filters.is_active);
  }
  
  return query;
};

// SEO Helper Functions
const getBaseUrl = () => {
  return process.env.BASE_URL || 'https://deeprealties.com';
};

const getDefaultSEO = () => {
  const baseUrl = getBaseUrl();
  return {
    title: 'DeepRealties - Premium Real Estate | Buy, Sell, Rent Properties',
    description: 'Find your dream property with DeepRealties. Premium real estate services for buying, selling, and renting properties. Trusted by 50+ happy families. Expert guidance, verified properties, and best market prices.',
    keywords: 'real estate, buy property, sell property, rent property, property investment, real estate agent, property listings, homes for sale, apartments for rent, commercial property',
    image: `${baseUrl}/images/og-image.jpg`,
    url: baseUrl,
    type: 'website',
    siteName: 'DeepRealties',
    locale: 'en_US'
  };
};

const generateSEO = (pageData = {}) => {
  const baseUrl = getBaseUrl();
  const defaultSEO = getDefaultSEO();
  
  const seo = {
    title: pageData.title || defaultSEO.title,
    description: pageData.description || defaultSEO.description,
    keywords: pageData.keywords || defaultSEO.keywords,
    image: pageData.image || defaultSEO.image,
    url: pageData.url || defaultSEO.url,
    type: pageData.type || defaultSEO.type,
    siteName: defaultSEO.siteName,
    locale: defaultSEO.locale,
    author: pageData.author || 'DeepRealties',
    publishedTime: pageData.publishedTime || null,
    modifiedTime: pageData.modifiedTime || null,
    canonical: pageData.canonical || null,
    robots: pageData.robots || 'index, follow',
    noindex: pageData.noindex || false,
    nofollow: pageData.nofollow || false
  };
  
  // Ensure image is absolute URL
  if (seo.image && !seo.image.startsWith('http')) {
    seo.image = `${baseUrl}${seo.image.startsWith('/') ? '' : '/'}${seo.image}`;
  }
  
  // Ensure URL is absolute
  if (seo.url && !seo.url.startsWith('http')) {
    seo.url = `${baseUrl}${seo.url.startsWith('/') ? '' : '/'}${seo.url}`;
  }
  
  return seo;
};

const generateStructuredData = (seo, pageType = 'WebSite') => {
  const baseUrl = getBaseUrl();
  
  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: 'DeepRealties',
        url: baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/images/logo.png`
        },
        sameAs: [
          'https://www.instagram.com/deeprealties'
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+91-8305551215',
          contactType: 'Customer Service',
          areaServed: 'IN',
          availableLanguage: 'English'
        }
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: 'DeepRealties',
        description: seo.description,
        publisher: {
          '@id': `${baseUrl}/#organization`
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${baseUrl}/properties?search={search_term_string}`
          },
          'query-input': 'required name=search_term_string'
        }
      }
    ]
  };
  
  // Add page-specific structured data
  if (pageType === 'RealEstateAgent') {
    baseStructuredData['@graph'].push({
      '@type': 'RealEstateAgent',
      '@id': `${baseUrl}/#agent`,
      name: 'DeepRealties',
      description: seo.description,
      url: baseUrl,
      image: seo.image,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Indore',
        addressRegion: 'Madhya Pradesh',
        addressCountry: 'IN'
      }
    });
  }
  
  return baseStructuredData;
};

module.exports = {
  generateToken,
  formatProperty,
  formatRental,
  buildPropertyQuery,
  generateSEO,
  generateStructuredData,
  getBaseUrl
};

