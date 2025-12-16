const db = require('../config/database');

const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalProperties,
      totalRentals,
      totalProjects,
      totalEvents,
      totalInvestments,
      pendingProperties,
      pendingRentals,
      unreadEnquiries,
      unreadContacts
    ] = await Promise.all([
      db('users').count('* as count').first(),
      db('properties').where('is_active', true).count('* as count').first(),
      db('rental_properties').where('is_active', true).count('* as count').first(),
      db('projects').where('is_active', true).count('* as count').first(),
      db('events').where('is_active', true).count('* as count').first(),
      db('investment_opportunities').where('is_active', true).count('* as count').first(),
      db('properties').where('status', 'pending').count('* as count').first(),
      db('rental_properties').where('status', 'pending').count('* as count').first(),
      db('enquiries').where('is_read', false).count('* as count').first(),
      db('contact_submissions').where('is_read', false).count('* as count').first()
    ]);

    res.json({
      stats: {
        totalUsers: parseInt(totalUsers.count),
        totalProperties: parseInt(totalProperties.count),
        totalRentals: parseInt(totalRentals.count),
        totalProjects: parseInt(totalProjects.count),
        totalEvents: parseInt(totalEvents.count),
        totalInvestments: parseInt(totalInvestments.count),
        pendingProperties: parseInt(pendingProperties.count),
        pendingRentals: parseInt(pendingRentals.count),
        unreadEnquiries: parseInt(unreadEnquiries.count),
        unreadContacts: parseInt(unreadContacts.count)
      }
    });
  } catch (error) {
    next(error);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const { role, is_active, page = 1, limit = 50 } = req.query;

    // Build base query function for reuse
    const buildBaseQuery = () => {
      let baseQuery = db('users');
      if (role) baseQuery = baseQuery.where('role', role);
      if (is_active !== undefined) baseQuery = baseQuery.where('is_active', is_active === 'true');
      return baseQuery;
    };

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get users with pagination
    const users = await buildBaseQuery()
      .select('id', 'email', 'full_name', 'phone', 'role', 'is_active', 'created_at')
      .orderBy('created_at', 'desc')
      .limit(parseInt(limit))
      .offset(offset);

    // Get total count separately (without select *)
    const totalResult = await buildBaseQuery()
      .count('* as count')
      .first();
    
    const total = parseInt(totalResult.count);

    res.json({
      users,
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

const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await db('users').where({ id }).first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [updated] = await db('users')
      .where({ id })
      .update({ is_active: !user.is_active })
      .returning(['id', 'email', 'is_active']);

    res.json({
      message: `User ${updated.is_active ? 'activated' : 'deactivated'}`,
      user: updated
    });
  } catch (error) {
    next(error);
  }
};

const listAllProperties = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    // Build base query function for reuse
    const buildBaseQuery = () => {
      let baseQuery = db('properties');
      if (status) baseQuery = baseQuery.where('status', status);
      return baseQuery;
    };

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get properties with pagination
    const properties = await buildBaseQuery()
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
      properties,
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

const listAllRentals = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    // Build base query function for reuse
    const buildBaseQuery = () => {
      let baseQuery = db('rental_properties');
      if (status) baseQuery = baseQuery.where('status', status);
      return baseQuery;
    };

    const offset = (parseInt(page) - 1) * parseInt(limit);

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
      rentals,
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

const listAllProjects = async (req, res, next) => {
  try {
    const projects = await db('projects')
      .select('*')
      .orderBy('created_at', 'desc');

    res.json({ projects });
  } catch (error) {
    next(error);
  }
};

const listAllEvents = async (req, res, next) => {
  try {
    const events = await db('events')
      .select('*')
      .orderBy('event_date', 'desc');

    res.json({ events });
  } catch (error) {
    next(error);
  }
};

const listAllInvestments = async (req, res, next) => {
  try {
    const opportunities = await db('investment_opportunities')
      .select('*')
      .orderBy('created_at', 'desc');

    res.json({ opportunities });
  } catch (error) {
    next(error);
  }
};

const listInvestorRegistrations = async (req, res, next) => {
  try {
    const registrations = await db('investor_registrations')
      .leftJoin('investment_opportunities', 'investor_registrations.opportunity_id', 'investment_opportunities.id')
      .select(
        'investor_registrations.*',
        'investment_opportunities.title as opportunity_title'
      )
      .orderBy('investor_registrations.created_at', 'desc');

    res.json({ registrations });
  } catch (error) {
    next(error);
  }
};

const listContactSubmissions = async (req, res, next) => {
  try {
    const { is_read, page = 1, limit = 50 } = req.query;

    // Build base query function for reuse
    const buildBaseQuery = () => {
      let baseQuery = db('contact_submissions');
      if (is_read !== undefined) baseQuery = baseQuery.where('is_read', is_read === 'true');
      return baseQuery;
    };

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get submissions with pagination
    const submissions = await buildBaseQuery()
      .select('*')
      .orderBy('created_at', 'desc')
      .limit(parseInt(limit))
      .offset(offset);

    // Get total count separately
    const totalResult = await buildBaseQuery()
      .count('* as count')
      .first();
    
    const total = parseInt(totalResult.count);

    res.json({
      submissions,
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

const getPropertyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const property = await db('properties').where({ id }).first();

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({ property });
  } catch (error) {
    next(error);
  }
};

const updatePropertyStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, is_active } = req.body;

    const property = await db('properties').where({ id }).first();

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (is_active !== undefined) updateData.is_active = is_active;
    updateData.updated_at = db.fn.now();

    const [updated] = await db('properties')
      .where({ id })
      .update(updateData)
      .returning('*');

    res.json({
      message: 'Property status updated successfully',
      property: updated
    });
  } catch (error) {
    next(error);
  }
};

const deletePropertyAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const property = await db('properties').where({ id }).first();

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    await db('properties').where({ id }).del();

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await db('users')
      .where({ id })
      .select('id', 'email', 'full_name', 'phone', 'role', 'is_active', 'created_at')
      .first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, is_active, full_name, phone } = req.body;

    const user = await db('users').where({ id }).first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData = {};
    if (role !== undefined) updateData.role = role;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (full_name !== undefined) updateData.full_name = full_name;
    if (phone !== undefined) updateData.phone = phone;

    const [updated] = await db('users')
      .where({ id })
      .update(updateData)
      .returning(['id', 'email', 'full_name', 'phone', 'role', 'is_active', 'created_at']);

    res.json({
      message: 'User updated successfully',
      user: updated
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await db('users').where({ id }).first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin users' });
    }

    // Soft delete by deactivating
    await db('users').where({ id }).update({ is_active: false });

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

const getContactSubmissionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const submission = await db('contact_submissions').where({ id }).first();

    if (!submission) {
      return res.status(404).json({ error: 'Contact submission not found' });
    }

    res.json({ submission });
  } catch (error) {
    next(error);
  }
};

const deleteContactSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const submission = await db('contact_submissions').where({ id }).first();

    if (!submission) {
      return res.status(404).json({ error: 'Contact submission not found' });
    }

    await db('contact_submissions').where({ id }).del();

    res.json({ message: 'Contact submission deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  listUsers,
  getUserById,
  toggleUserStatus,
  updateUser,
  deleteUser,
  listAllProperties,
  getPropertyById,
  updatePropertyStatus,
  deletePropertyAdmin,
  listAllRentals,
  listAllProjects,
  listAllEvents,
  listAllInvestments,
  listInvestorRegistrations,
  listContactSubmissions,
  getContactSubmissionById,
  deleteContactSubmission
};

