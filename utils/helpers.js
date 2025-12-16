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
  if (filters.is_active !== undefined) {
    query.where('is_active', filters.is_active);
  } else {
    query.where('is_active', true);
  }
  
  return query;
};

module.exports = {
  generateToken,
  formatProperty,
  formatRental,
  buildPropertyQuery
};

