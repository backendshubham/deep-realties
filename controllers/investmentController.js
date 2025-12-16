const db = require('../config/database');

const listOpportunities = async (req, res, next) => {
  try {
    const { city, investment_type, page = 1, limit = 20 } = req.query;

    // Build base query conditions for filtering
    const buildBaseQuery = () => {
      let query = db('investment_opportunities').where('is_active', true);
      if (city) query = query.where('city', 'ilike', `%${city}%`);
      if (investment_type) query = query.where('investment_type', investment_type);
      return query;
    };

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get opportunities with pagination
    const opportunities = await buildBaseQuery()
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
      opportunities,
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

const getOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const opportunity = await db('investment_opportunities').where({ id }).first();

    if (!opportunity) {
      return res.status(404).json({ error: 'Investment opportunity not found' });
    }

    res.json({ opportunity });
  } catch (error) {
    next(error);
  }
};

const createOpportunity = async (req, res, next) => {
  try {
    const opportunityData = {
      ...req.body,
      highlights: Array.isArray(req.body.highlights) ? req.body.highlights : [],
      images: Array.isArray(req.body.images) ? req.body.images : [],
      documents: Array.isArray(req.body.documents) ? req.body.documents : []
    };

    const [opportunity] = await db('investment_opportunities')
      .insert(opportunityData)
      .returning('*');

    res.status(201).json({
      message: 'Investment opportunity created successfully',
      opportunity
    });
  } catch (error) {
    next(error);
  }
};

const registerInvestor = async (req, res, next) => {
  try {
    const {
      opportunity_id,
      full_name,
      email,
      phone,
      investment_budget,
      preferred_investment_type,
      message
    } = req.body;

    const registrationData = {
      opportunity_id: opportunity_id || null,
      user_id: req.user?.id || null,
      full_name,
      email,
      phone,
      investment_budget,
      preferred_investment_type,
      message
    };

    await db('investor_registrations').insert(registrationData);

    if (opportunity_id) {
      await db('investment_opportunities')
        .where({ id: opportunity_id })
        .increment('investors_count', 1);
    }

    res.status(201).json({
      message: 'Investor registration submitted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getStatistics = async (req, res, next) => {
  try {
    const totalOpportunities = await db('investment_opportunities')
      .where('is_active', true)
      .count('* as count')
      .first();

    const totalInvestors = await db('investor_registrations')
      .count('* as count')
      .first();

    const totalInvestment = await db('investment_opportunities')
      .where('is_active', true)
      .sum('min_investment as total')
      .first();

    res.json({
      totalOpportunities: parseInt(totalOpportunities.count),
      totalInvestors: parseInt(totalInvestors.count),
      totalInvestment: parseFloat(totalInvestment.total) || 0
    });
  } catch (error) {
    next(error);
  }
};

const deleteOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db('investment_opportunities').where({ id }).update({ is_active: false });

    res.json({ message: 'Investment opportunity deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const markContacted = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db('investor_registrations')
      .where({ id })
      .update({ is_contacted: true });

    res.json({ message: 'Investor marked as contacted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listOpportunities,
  getOpportunity,
  createOpportunity,
  registerInvestor,
  getStatistics,
  deleteOpportunity,
  markContacted
};

