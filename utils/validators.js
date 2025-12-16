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
  body('price').isFloat({ min: 0 }),
  body('property_type').isIn(['land', 'plot', 'flat', 'house', 'villa', 'apartment', 'commercial', 'farmland']),
  body('area_sqft').isFloat({ min: 0 }),
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

