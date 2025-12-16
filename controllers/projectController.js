const db = require('../config/database');

const listProjects = async (req, res, next) => {
  try {
    const { city, state, status, page = 1, limit = 20 } = req.query;

    // Build base query conditions for filtering
    const buildBaseQuery = () => {
      let query = db('projects').where('is_active', true);
      if (city) query = query.where('city', 'ilike', `%${city}%`);
      if (state) query = query.where('state', 'ilike', `%${state}%`);
      if (status) query = query.where('status', status);
      return query;
    };

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get projects with pagination
    const projects = await buildBaseQuery()
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
      projects,
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

const getProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await db('projects').where({ id }).first();

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ project });
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const projectData = {
      ...req.body,
      amenities: Array.isArray(req.body.amenities) ? req.body.amenities : [],
      highlights: Array.isArray(req.body.highlights) ? req.body.highlights : [],
      images: Array.isArray(req.body.images) ? req.body.images : [],
      gallery: Array.isArray(req.body.gallery) ? req.body.gallery : [],
      videos: Array.isArray(req.body.videos) ? req.body.videos : []
    };

    const [project] = await db('projects')
      .insert(projectData)
      .returning('*');

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await db('projects').where({ id }).first();

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updateData = {
      ...req.body,
      updated_at: db.fn.now()
    };

    if (req.body.amenities) updateData.amenities = Array.isArray(req.body.amenities) ? req.body.amenities : [];
    if (req.body.highlights) updateData.highlights = Array.isArray(req.body.highlights) ? req.body.highlights : [];
    if (req.body.images) updateData.images = Array.isArray(req.body.images) ? req.body.images : [];
    if (req.body.gallery) updateData.gallery = Array.isArray(req.body.gallery) ? req.body.gallery : [];
    if (req.body.videos) updateData.videos = Array.isArray(req.body.videos) ? req.body.videos : [];

    const [updated] = await db('projects')
      .where({ id })
      .update(updateData)
      .returning('*');

    res.json({
      message: 'Project updated successfully',
      project: updated
    });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db('projects').where({ id }).update({ is_active: false });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
};

