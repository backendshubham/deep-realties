const db = require('../config/database');
const { formatProperty, buildPropertyQuery } = require('../utils/helpers');

const listProperties = async (req, res, next) => {
  try {
    const {
      city,
      state,
      property_type,
      min_price,
      max_price,
      min_area,
      max_area,
      bedrooms,
      status,
      page = 1,
      limit = 20
    } = req.query;

    const filters = {
      city,
      state,
      property_type,
      min_price,
      max_price,
      min_area,
      max_area,
      bedrooms,
      status
    };

    let query = db('properties');
    query = buildPropertyQuery(query, filters);

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const properties = await query
      .select('*')
      .orderBy('created_at', 'desc')
      .limit(parseInt(limit))
      .offset(offset);

    const total = await buildPropertyQuery(db('properties'), filters).count('* as count').first();

    // Fetch images for all properties
    const propertyIds = properties.map(p => p.id);
    const allImages = propertyIds.length > 0 
      ? await db('property_images')
          .whereIn('property_id', propertyIds)
          .orderBy('display_order', 'asc')
          .select('property_id', 'image_url')
      : [];

    // Group images by property_id
    const imagesByProperty = {};
    allImages.forEach(img => {
      if (!imagesByProperty[img.property_id]) {
        imagesByProperty[img.property_id] = [];
      }
      imagesByProperty[img.property_id].push(img.image_url);
    });

    // Add images to each property
    const propertiesWithImages = properties.map(property => {
      const formatted = formatProperty(property);
      formatted.images = imagesByProperty[property.id] || [];
      return formatted;
    });

    res.json({
      properties: propertiesWithImages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.count),
        pages: Math.ceil(total.count / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

const getProperty = async (req, res, next) => {
  try {
    const { id } = req.params;

    const property = await db('properties')
      .where({ id })
      .first();

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Fetch images from property_images table
    const propertyImages = await db('property_images')
      .where({ property_id: id })
      .orderBy('display_order', 'asc')
      .select('image_url');

    // Increment views
    await db('properties')
      .where({ id })
      .increment('views', 1);

    const formattedProperty = formatProperty(property);
    formattedProperty.images = propertyImages.map(img => img.image_url);

    res.json({ property: formattedProperty });
  } catch (error) {
    next(error);
  }
};

const createProperty = async (req, res, next) => {
  try {
    const propertyType = req.body.property_type;
    
    // Validate and parse numeric fields based on property type
    let price, areaSqft;
    
    // Price validation: required for all except farmland
    if (propertyType === 'farmland') {
      // Price is optional for farmland (uses price_per_bigha)
      // But database requires a price, so calculate from price_per_bigha * farmland_bigha if available
      if (req.body.price !== undefined && req.body.price !== null && req.body.price !== '') {
        price = parseFloat(req.body.price);
        if (isNaN(price) || price < 0) {
          return res.status(400).json({ error: 'Invalid price. Please enter a valid positive number if provided.' });
        }
        const MAX_PRICE = 999999999999999.99;
        if (price > MAX_PRICE) {
          return res.status(400).json({ error: `Price exceeds maximum allowed value (₹${MAX_PRICE.toLocaleString()}).` });
        }
      } else {
        // Calculate price from price_per_bigha * farmland_bigha if both are provided
        const pricePerBigha = req.body.price_per_bigha ? parseFloat(req.body.price_per_bigha) : null;
        const farmlandBigha = req.body.farmland_bigha ? parseFloat(req.body.farmland_bigha) : null;
        if (pricePerBigha && farmlandBigha && !isNaN(pricePerBigha) && !isNaN(farmlandBigha) && pricePerBigha > 0 && farmlandBigha > 0) {
          price = pricePerBigha * farmlandBigha;
        } else {
          // Default to 0 if price cannot be calculated (database requires NOT NULL)
          price = 0;
        }
      }
    } else {
      // Price is required for all other property types
      price = parseFloat(req.body.price);
      if (isNaN(price) || price <= 0) {
        return res.status(400).json({ error: 'Invalid price. Please enter a valid positive number.' });
      }
      const MAX_PRICE = 999999999999999.99;
      if (price > MAX_PRICE) {
        return res.status(400).json({ error: `Price exceeds maximum allowed value (₹${MAX_PRICE.toLocaleString()}).` });
      }
    }
    
    // Area validation: required for all except plot and farmland
    if (propertyType === 'plot' || propertyType === 'farmland') {
      // Area is optional for plot (uses plot_total_area) and farmland (uses bigha/acre)
      if (req.body.area_sqft !== undefined && req.body.area_sqft !== null && req.body.area_sqft !== '') {
        areaSqft = parseFloat(req.body.area_sqft);
        if (isNaN(areaSqft) || areaSqft < 0) {
          return res.status(400).json({ error: 'Invalid area. Please enter a valid positive number if provided.' });
        }
        const MAX_AREA = 99999999.99;
        if (areaSqft > MAX_AREA) {
          return res.status(400).json({ error: `Area exceeds maximum allowed value (${MAX_AREA.toLocaleString()} sqft).` });
        }
      }
    } else {
      // Area is required for all other property types
      areaSqft = parseFloat(req.body.area_sqft);
      if (isNaN(areaSqft) || areaSqft <= 0) {
        return res.status(400).json({ error: 'Invalid area. Please enter a valid positive number.' });
      }
      const MAX_AREA = 99999999.99;
      if (areaSqft > MAX_AREA) {
        return res.status(400).json({ error: `Area exceeds maximum allowed value (${MAX_AREA.toLocaleString()} sqft).` });
      }
    }
    
    const propertyData = {
      ...req.body,
      seller_id: req.user?.id || null,
      amenities: Array.isArray(req.body.amenities) ? req.body.amenities : [],
      images: Array.isArray(req.body.images) ? req.body.images : []
    };
    
    // Always set price and area_sqft (database requires NOT NULL)
    // Price is already calculated/validated above
    propertyData.price = price !== undefined && !isNaN(price) ? price : 0;
    
    // For area_sqft, set default if not provided for plot/farmland
    if (areaSqft !== undefined && !isNaN(areaSqft)) {
      propertyData.area_sqft = areaSqft;
    } else if (propertyType === 'plot' || propertyType === 'farmland') {
      // Set default area_sqft for plot/farmland if not provided (database requires NOT NULL)
      propertyData.area_sqft = 0;
    }
    
    // Remove undefined/null/empty farmland and plot fields if not applicable
    if (propertyType !== 'farmland') {
      delete propertyData.farmland_bigha;
      delete propertyData.farmland_acre;
      delete propertyData.price_per_bigha;
    } else {
      // For farmland, only include if they have values
      if (!propertyData.farmland_bigha || propertyData.farmland_bigha === '') delete propertyData.farmland_bigha;
      if (!propertyData.farmland_acre || propertyData.farmland_acre === '') delete propertyData.farmland_acre;
      if (!propertyData.price_per_bigha || propertyData.price_per_bigha === '') delete propertyData.price_per_bigha;
    }
    
    if (propertyType !== 'plot') {
      delete propertyData.plot_total_area;
      delete propertyData.plot_length;
      delete propertyData.plot_width;
      delete propertyData.number_of_plots;
    } else {
      // For plot, only include if they have values
      if (!propertyData.plot_total_area || propertyData.plot_total_area === '') delete propertyData.plot_total_area;
      if (!propertyData.plot_length || propertyData.plot_length === '') delete propertyData.plot_length;
      if (!propertyData.plot_width || propertyData.plot_width === '') delete propertyData.plot_width;
      if (!propertyData.number_of_plots || propertyData.number_of_plots === '') delete propertyData.number_of_plots;
    }

    // Map parking_available to parking (database column name)
    if (propertyData.parking_available !== undefined) {
      propertyData.parking = propertyData.parking_available;
      delete propertyData.parking_available;
    }
    
    // Validate optional integer fields
    if (req.body.bedrooms !== undefined && req.body.bedrooms !== null && req.body.bedrooms !== '') {
      const bedrooms = parseInt(req.body.bedrooms);
      if (!isNaN(bedrooms) && bedrooms >= 0) {
        propertyData.bedrooms = bedrooms;
      }
    }
    if (req.body.bathrooms !== undefined && req.body.bathrooms !== null && req.body.bathrooms !== '') {
      const bathrooms = parseInt(req.body.bathrooms);
      if (!isNaN(bathrooms) && bathrooms >= 0) {
        propertyData.bathrooms = bathrooms;
      }
    }
    if (req.body.floors !== undefined && req.body.floors !== null && req.body.floors !== '') {
      const floors = parseInt(req.body.floors);
      if (!isNaN(floors) && floors >= 0) {
        propertyData.floors = floors;
      }
    }

    // Auto-approve properties created by admin
    if (req.user && req.user.role === 'admin') {
      propertyData.status = 'approved';
      propertyData.is_active = true;
    } else {
      // Regular users: default to pending
      propertyData.status = propertyData.status || 'pending';
    }

    // Remove undefined, null, and empty string values to avoid database errors
    Object.keys(propertyData).forEach(key => {
      if (propertyData[key] === undefined || propertyData[key] === null || propertyData[key] === '') {
        delete propertyData[key];
      }
    });

    const [property] = await db('properties')
      .insert(propertyData)
      .returning('*');

    // Save images to property_images table
    if (propertyData.images && Array.isArray(propertyData.images) && propertyData.images.length > 0) {
      const imageRecords = propertyData.images.map((imageUrl, index) => ({
        property_id: property.id,
        image_url: imageUrl,
        display_order: index
      }));
      
      await db('property_images').insert(imageRecords);
    }

    // Fetch property with images
    const propertyWithImages = await db('properties')
      .where({ id: property.id })
      .first();
    
    const propertyImages = await db('property_images')
      .where({ property_id: property.id })
      .orderBy('display_order', 'asc')
      .select('image_url');
    
    const formattedProperty = formatProperty(propertyWithImages);
    formattedProperty.images = propertyImages.map(img => img.image_url);

    res.status(201).json({
      message: req.user && req.user.role === 'admin' 
        ? 'Property listed successfully and approved automatically' 
        : 'Property created successfully',
      property: formattedProperty,
      autoApproved: req.user && req.user.role === 'admin'
    });
  } catch (error) {
    next(error);
  }
};

const updateProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const property = await db('properties').where({ id }).first();

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Check ownership or admin
    if (req.user.role !== 'admin' && property.seller_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this property' });
    }

    const updateData = {
      ...req.body,
      updated_at: db.fn.now()
    };

    // Map parking_available to parking (database column name)
    if (updateData.parking_available !== undefined) {
      updateData.parking = updateData.parking_available;
      delete updateData.parking_available;
    }

    if (req.body.amenities) {
      updateData.amenities = Array.isArray(req.body.amenities) ? req.body.amenities : [];
    }
    if (req.body.images) {
      updateData.images = Array.isArray(req.body.images) ? req.body.images : [];
    }

    const [updated] = await db('properties')
      .where({ id })
      .update(updateData)
      .returning('*');

    res.json({
      message: 'Property updated successfully',
      property: formatProperty(updated)
    });
  } catch (error) {
    next(error);
  }
};

const deleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const property = await db('properties').where({ id }).first();

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (req.user.role !== 'admin' && property.seller_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await db('properties').where({ id }).update({ is_active: false });

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getPendingProperties = async (req, res, next) => {
  try {
    const properties = await db('properties')
      .where({ status: 'pending' })
      .orderBy('created_at', 'desc');

    res.json({ properties: properties.map(formatProperty) });
  } catch (error) {
    next(error);
  }
};

const approveProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [property] = await db('properties')
      .where({ id })
      .update({ 
        status: 'approved',
        is_active: true
      })
      .returning('*');

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({
      message: 'Property approved successfully',
      property: formatProperty(property)
    });
  } catch (error) {
    next(error);
  }
};

const rejectProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [property] = await db('properties')
      .where({ id })
      .update({ 
        status: 'rejected',
        is_active: false
      })
      .returning('*');

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({
      message: 'Property rejected successfully',
      property: formatProperty(property)
    });
  } catch (error) {
    next(error);
  }
};

const getMyProperties = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, property_type, search } = req.query;
    
    // Build base query
    let query = db('properties').where({ seller_id: req.user.id });
    
    // Apply filters
    if (status) {
      query = query.where('status', status);
    }
    if (property_type) {
      query = query.where('property_type', property_type);
    }
    if (search) {
      query = query.where(function() {
        this.where('title', 'ilike', `%${search}%`)
            .orWhere('locality', 'ilike', `%${search}%`)
            .orWhere('city', 'ilike', `%${search}%`)
            .orWhere('property_type', 'ilike', `%${search}%`);
      });
    }
    
    // Get total count
    const totalResult = await query.clone().count('* as count').first();
    const total = parseInt(totalResult.count);
    
    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const properties = await query
      .select('*')
      .orderBy('created_at', 'desc')
      .limit(parseInt(limit))
      .offset(offset);

    res.json({
      properties: properties.map(formatProperty),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getPendingProperties,
  approveProperty,
  rejectProperty,
  getMyProperties
};

