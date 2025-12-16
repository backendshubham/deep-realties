const db = require('../config/database');

const listEvents = async (req, res, next) => {
  try {
    const { city, is_past, page = 1, limit = 20 } = req.query;

    // Build base query conditions for filtering
    const buildBaseQuery = () => {
      let query = db('events').where('is_active', true);
      if (city) query = query.where('city', 'ilike', `%${city}%`);
      if (is_past !== undefined) {
        query = query.where('is_past', is_past === 'true');
      }
      return query;
    };

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get events with pagination
    const events = await buildBaseQuery()
      .select('*')
      .orderBy('event_date', 'desc')
      .limit(parseInt(limit))
      .offset(offset);

    // Get total count separately (without select *)
    const totalResult = await buildBaseQuery()
      .count('* as count')
      .first();
    
    const total = parseInt(totalResult.count);

    res.json({
      events,
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

const getEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await db('events').where({ id }).first();

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event });
  } catch (error) {
    next(error);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const eventData = {
      ...req.body,
      images: Array.isArray(req.body.images) ? req.body.images : [],
      videos: Array.isArray(req.body.videos) ? req.body.videos : []
    };

    const [event] = await db('events')
      .insert(eventData)
      .returning('*');

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    next(error);
  }
};

const registerForEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone } = req.body;

    const event = await db('events').where({ id }).first();
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if max attendees reached
    if (event.max_attendees && event.registered_count >= event.max_attendees) {
      return res.status(400).json({ error: 'Event is full' });
    }

    await db('event_registrations').insert({
      event_id: id,
      full_name,
      email,
      phone
    });

    await db('events')
      .where({ id })
      .increment('registered_count', 1);

    res.status(201).json({
      message: 'Successfully registered for event'
    });
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await db('events').where({ id }).first();

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const updateData = req.body;
    if (req.body.images) updateData.images = Array.isArray(req.body.images) ? req.body.images : [];
    if (req.body.videos) updateData.videos = Array.isArray(req.body.videos) ? req.body.videos : [];

    const [updated] = await db('events')
      .where({ id })
      .update(updateData)
      .returning('*');

    res.json({
      message: 'Event updated successfully',
      event: updated
    });
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db('events').where({ id }).update({ is_active: false });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listEvents,
  getEvent,
  createEvent,
  registerForEvent,
  updateEvent,
  deleteEvent
};

