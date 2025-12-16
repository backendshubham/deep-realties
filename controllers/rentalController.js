const db = require('../config/database');
const { formatRental } = require('../utils/helpers');

const listRentals = async (req, res, next) => {
  try {
    const {
      city,
      state,
      property_type,
      min_rent,
      max_rent,
      bedrooms,
      rent_type,
      tenant_type,
      status,
      page = 1,
      limit = 20
    } = req.query;

    let query = db('rental_properties');

    if (city) query.where('city', 'ilike', `%${city}%`);
    if (state) query.where('state', 'ilike', `%${state}%`);
    if (property_type) query.where('property_type', property_type);
    if (min_rent) query.where('monthly_rent', '>=', min_rent);
    if (max_rent) query.where('monthly_rent', '<=', max_rent);
    if (bedrooms) query.where('bedrooms', '>=', bedrooms);
    if (rent_type) query.where('rent_type', rent_type);
    if (tenant_type) query.where('tenant_type', tenant_type);
    if (status) {
      query.where('status', status);
    } else {
      query.where('status', 'approved');
    }
    query.where('is_active', true);

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build base query function for reuse
    const buildBaseQuery = () => {
      let baseQuery = db('rental_properties');
      if (city) baseQuery = baseQuery.where('city', 'ilike', `%${city}%`);
      if (state) baseQuery = baseQuery.where('state', 'ilike', `%${state}%`);
      if (property_type) baseQuery = baseQuery.where('property_type', property_type);
      if (min_rent) baseQuery = baseQuery.where('monthly_rent', '>=', min_rent);
      if (max_rent) baseQuery = baseQuery.where('monthly_rent', '<=', max_rent);
      if (bedrooms) baseQuery = baseQuery.where('bedrooms', '>=', bedrooms);
      if (rent_type) baseQuery = baseQuery.where('rent_type', rent_type);
      if (tenant_type) baseQuery = baseQuery.where('tenant_type', tenant_type);
      if (status) {
        baseQuery = baseQuery.where('status', status);
      } else {
        baseQuery = baseQuery.where('status', 'approved');
      }
      baseQuery = baseQuery.where('is_active', true);
      return baseQuery;
    };

    // Get rentals with pagination
    const rentals = await buildBaseQuery()
      .select('*')
      .orderBy('created_at', 'desc')
      .limit(parseInt(limit))
      .offset(offset);

    // Get total count separately (without select *)
    const totalResult = await buildBaseQuery()
      .count('* as count')
      .first();
    
    const total = parseInt(totalResult.count);

    res.json({
      rentals: rentals.map(formatRental),
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

const getRental = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rental = await db('rental_properties').where({ id }).first();

    if (!rental) {
      return res.status(404).json({ error: 'Rental property not found' });
    }

    res.json({ rental: formatRental(rental) });
  } catch (error) {
    next(error);
  }
};

const createRental = async (req, res, next) => {
  try {
    const rentalData = {
      ...req.body,
      owner_id: req.user?.id || null,
      amenities: Array.isArray(req.body.amenities) ? req.body.amenities : [],
      images: Array.isArray(req.body.images) ? req.body.images : []
    };

    const [rental] = await db('rental_properties')
      .insert(rentalData)
      .returning('*');

    res.status(201).json({
      message: 'Rental property created successfully',
      rental: formatRental(rental)
    });
  } catch (error) {
    next(error);
  }
};

const getPendingRentals = async (req, res, next) => {
  try {
    const rentals = await db('rental_properties')
      .where({ status: 'pending' })
      .orderBy('created_at', 'desc');

    res.json({ rentals: rentals.map(formatRental) });
  } catch (error) {
    next(error);
  }
};

const approveRental = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rental] = await db('rental_properties')
      .where({ id })
      .update({ status: 'approved' })
      .returning('*');

    if (!rental) {
      return res.status(404).json({ error: 'Rental property not found' });
    }

    res.json({
      message: 'Rental property approved',
      rental: formatRental(rental)
    });
  } catch (error) {
    next(error);
  }
};

const rejectRental = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rental] = await db('rental_properties')
      .where({ id })
      .update({ status: 'rejected' })
      .returning('*');

    if (!rental) {
      return res.status(404).json({ error: 'Rental property not found' });
    }

    res.json({
      message: 'Rental property rejected',
      rental: formatRental(rental)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listRentals,
  getRental,
  createRental,
  getPendingRentals,
  approveRental,
  rejectRental
};

