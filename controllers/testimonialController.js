const db = require('../config/database');

const listTestimonials = async (req, res, next) => {
  try {
    const includeArchived = req.query.include_archived === 'true';
    let query = db('testimonials')
      .where('is_active', true)
      .orderBy([{ column: 'display_order', order: 'asc' }, { column: 'created_at', order: 'desc' }]);

    if (!includeArchived) {
      query = query.where('is_archived', false);
    }

    const testimonials = await query.select('*');
    res.json({ testimonials });
  } catch (error) {
    next(error);
  }
};

const createTestimonial = async (req, res, next) => {
  try {
    const { name, role, initials, tag, location, quote } = req.body;

    if (!name || !role || !initials || !quote) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [created] = await db('testimonials')
      .insert({
        name,
        role,
        initials,
        tag: tag || null,
        location: location || null,
        quote,
        is_active: true,
        is_archived: false
      })
      .returning('*');

    res.status(201).json({ message: 'Testimonial created successfully', testimonial: created });
  } catch (error) {
    next(error);
  }
};

const archiveTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [updated] = await db('testimonials')
      .where({ id })
      .update({ is_archived: true })
      .returning('*');

    if (!updated) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    res.json({ message: 'Testimonial archived successfully', testimonial: updated });
  } catch (error) {
    next(error);
  }
};

const unarchiveTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [updated] = await db('testimonials')
      .where({ id })
      .update({ is_archived: false })
      .returning('*');

    if (!updated) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    res.json({ message: 'Testimonial unarchived successfully', testimonial: updated });
  } catch (error) {
    next(error);
  }
};

const deleteTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedCount = await db('testimonials').where({ id }).del();

    if (!deletedCount) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listTestimonials,
  createTestimonial,
  archiveTestimonial,
  unarchiveTestimonial,
  deleteTestimonial
};

