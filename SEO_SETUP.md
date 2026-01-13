# SEO Setup Guide for DeepRealties

This document outlines the SEO implementation for the DeepRealties website.

## Overview

The website has been fully optimized for search engines with:
- Comprehensive meta tags (title, description, keywords)
- Open Graph (OG) tags for social media sharing
- Twitter Card tags
- Structured data (JSON-LD) for rich snippets
- Canonical URLs
- Robots meta tags
- Sitemap.xml
- Robots.txt

## Environment Variables

Add the following to your `.env` file:

```env
BASE_URL=https://deeprealties.com
```

If not set, it defaults to `https://deeprealties.com`. Update this to match your actual domain.

## SEO Features Implemented

### 1. Meta Tags
- **Title**: Unique, descriptive titles for each page
- **Description**: Compelling meta descriptions (150-160 characters)
- **Keywords**: Relevant keywords for each page
- **Robots**: Proper indexing directives
- **Author**: Site author information
- **Canonical URLs**: Prevent duplicate content issues

### 2. Open Graph Tags
- `og:title` - Page title for social sharing
- `og:description` - Page description
- `og:image` - Social sharing image (1200x630px recommended)
- `og:url` - Canonical URL
- `og:type` - Content type (website/article)
- `og:site_name` - Site name
- `og:locale` - Language/locale

### 3. Twitter Card Tags
- `twitter:card` - Card type (summary_large_image)
- `twitter:title` - Page title
- `twitter:description` - Page description
- `twitter:image` - Sharing image
- `twitter:creator` - Twitter handle
- `twitter:site` - Site Twitter handle

### 4. Structured Data (JSON-LD)
- Organization schema
- WebSite schema with search action
- RealEstateAgent schema (on relevant pages)

### 5. Additional SEO Elements
- Geographic meta tags (location: Indore, MP, India)
- Mobile web app capabilities
- Theme color for mobile browsers
- Favicon and Apple touch icons

## Page-Specific SEO

Each page has been optimized with:
- Unique titles and descriptions
- Relevant keywords
- Proper canonical URLs
- Appropriate robots directives

### Public Pages (Indexed)
- Homepage
- Properties listing
- Buy/Sell/Rent pages
- Projects
- Events
- About
- Contact
- Invest

### Private Pages (Noindex)
- Login/Register
- Dashboard
- My Properties
- All Admin pages

## Files Created/Modified

### Created Files
- `public/robots.txt` - Search engine crawler instructions
- `public/sitemap.xml` - XML sitemap for search engines
- `SEO_SETUP.md` - This documentation file

### Modified Files
- `views/layouts/main.ejs` - Added comprehensive SEO meta tags
- `server.js` - Added SEO data to all routes
- `utils/helpers.js` - Added SEO helper functions

## SEO Helper Functions

The `utils/helpers.js` file includes:

- `generateSEO(pageData)` - Generates SEO object for a page
- `generateStructuredData(seo, pageType)` - Creates JSON-LD structured data
- `getBaseUrl()` - Returns the base URL from environment

## Usage Example

```javascript
const { generateSEO, generateStructuredData } = require('./utils/helpers');

app.get('/example', (req, res) => {
  const seo = generateSEO({
    title: 'Example Page - DeepRealties',
    description: 'This is an example page description',
    keywords: 'example, keywords',
    url: getBaseUrl() + req.originalUrl,
    canonical: getBaseUrl() + req.originalUrl
  });
  const structuredData = generateStructuredData(seo);
  
  res.render('pages/example', {
    title: seo.title,
    seo: seo,
    structuredData: structuredData,
    req: req
  });
});
```

## Image Requirements

For optimal social media sharing:
- **OG Image**: 1200x630px (recommended)
- **Twitter Image**: 1200x675px (recommended)
- **Favicon**: 32x32px or 16x16px
- **Apple Touch Icon**: 180x180px

Place images in `/public/images/`:
- `og-image.jpg` - Default Open Graph image
- `favicon.png` - Site favicon
- `apple-touch-icon.png` - Apple touch icon
- `logo.png` - Site logo for structured data

## Testing SEO

1. **Google Search Console**: Submit sitemap and monitor indexing
2. **Facebook Sharing Debugger**: Test OG tags
3. **Twitter Card Validator**: Test Twitter cards
4. **Google Rich Results Test**: Test structured data
5. **PageSpeed Insights**: Check page performance

## Next Steps

1. Create and upload the OG image (`/public/images/og-image.jpg`)
2. Create and upload favicon and touch icons
3. Update `BASE_URL` in `.env` to your actual domain
4. Submit sitemap to Google Search Console
5. Monitor SEO performance regularly

## Notes

- All admin and private pages are set to `noindex, nofollow`
- The sitemap.xml can be made dynamic to include actual property/project URLs
- Consider adding breadcrumb structured data for better navigation
- Add FAQ schema if you have FAQ sections
- Consider adding review/rating schema for testimonials

