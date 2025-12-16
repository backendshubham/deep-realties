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

    res.json({
      properties: properties.map(formatProperty),
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

    // Increment views
    await db('properties')
      .where({ id })
      .increment('views', 1);

    res.json({ property: formatProperty(property) });
  } catch (error) {
    next(error);
  }
};

const createProperty = async (req, res, next) => {
  try {
    const propertyData = {
      ...req.body,
      seller_id: req.user?.id || null,
      amenities: Array.isArray(req.body.amenities) ? req.body.amenities : [],
      images: Array.isArray(req.body.images) ? req.body.images : []
    };

    // Map parking_available to parking (database column name)
    if (propertyData.parking_available !== undefined) {
      propertyData.parking = propertyData.parking_available;
      delete propertyData.parking_available;
    }

    const [property] = await db('properties')
      .insert(propertyData)
      .returning('*');

    res.status(201).json({
      message: 'Property created successfully',
      property: formatProperty(property)
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

