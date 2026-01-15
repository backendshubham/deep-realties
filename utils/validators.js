const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Auth validators
const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('full_name').trim().notEmpty(),
  body('phone').optional().isMobilePhone(),
  handleValidationErrors
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  handleValidationErrors
];

// Property validators
const validateProperty = [
  body('title').trim().notEmpty(),
  body('locality').trim().notEmpty(),
  body('city').trim().notEmpty(),
  body('state').trim().notEmpty(),
  body('property_type').isIn(['land', 'plot', 'flat', 'house', 'villa', 'apartment', 'commercial', 'farmland']),
  // Price: required for all except farmland (farmland uses price_per_bigha)
  body('price').custom((value, { req }) => {
    if (req.body.property_type === 'farmland') {
      // Price is optional for farmland
      if (value !== undefined && value !== null && value !== '') {
        const price = parseFloat(value);
        if (isNaN(price) || price < 0) {
          throw new Error('Price must be a valid positive number if provided');
        }
      }
      return true;
    } else {
      // Price is required for all other property types
      if (value === undefined || value === null || value === '') {
        throw new Error('Price is required');
      }
      const price = parseFloat(value);
      if (isNaN(price) || price <= 0) {
        throw new Error('Price must be a valid positive number');
      }
      return true;
    }
  }),
  // Area: required for all except plot and farmland
  body('area_sqft').custom((value, { req }) => {
    if (req.body.property_type === 'plot' || req.body.property_type === 'farmland') {
      // Area is optional for plot (uses plot_total_area) and farmland (uses bigha/acre)
      if (value !== undefined && value !== null && value !== '') {
        const area = parseFloat(value);
        if (isNaN(area) || area < 0) {
          throw new Error('Area must be a valid positive number if provided');
        }
      }
      return true;
    } else {
      // Area is required for all other property types
      if (value === undefined || value === null || value === '') {
        throw new Error('Area is required');
      }
      const area = parseFloat(value);
      if (isNaN(area) || area <= 0) {
        throw new Error('Area must be a valid positive number');
      }
      return true;
    }
  }),
  body('listing_type').optional().isIn(['sale', 'rent']),
  handleValidationErrors
];

// Contact validators
const validateContact = [
  body('full_name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('subject').trim().notEmpty(),
  body('message').trim().notEmpty(),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProperty,
  validateContact,
  handleValidationErrors
};

