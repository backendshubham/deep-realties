const db = require('../config/database');

// Helper function to automatically update event status based on date
const updateEventStatus = async () => {
  try {
    const now = new Date();
    
    // Update past events
    await db('events')
      .where('is_active', true)
      .where('event_date', '<', now)
      .update({ is_past: true });
    
    // Update upcoming events
    await db('events')
      .where('is_active', true)
      .where('event_date', '>=', now)
      .update({ is_past: false });
  } catch (error) {
    console.error('Error updating event status:', error);
  }
};

const listEvents = async (req, res, next) => {
  try {
    // Auto-update event status before fetching
    await updateEventStatus();
    
    const { city, is_past, event_type, page = 1, limit = 20 } = req.query;

    // Build base query conditions for filtering
    const buildBaseQuery = () => {
      let query = db('events').where('is_active', true);
      if (city) query = query.where('city', 'ilike', `%${city}%`);
      if (event_type) query = query.where('event_type', event_type);
      if (is_past !== undefined) {
        // If is_past is explicitly set, use it
        query = query.where('is_past', is_past === 'true');
      } else {
        // Otherwise, determine based on date
        const now = new Date();
        query = query.where('event_date', is_past === 'true' ? '<' : '>=', now);
      }
      return query;
    };

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get events with pagination
    const events = await buildBaseQuery()
      .select('*')
      .orderBy('event_date', is_past === 'true' ? 'desc' : 'asc')
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
    const {
      title,
      event_type,
      related_project_id,
      description,
      location,
      city,
      event_date,
      event_time,
      agenda,
      contact_person,
      contact_email,
      contact_phone,
      rsvp_info,
      map_location,
      latitude,
      longitude,
      banner_image,
      registration_link,
      max_attendees,
      images,
      videos
    } = req.body;

    // Validate required fields
    if (!title || !event_type || !location || !city || !event_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Combine event_date and event_time if provided
    let eventDateTime = new Date(event_date);
    if (event_time) {
      const [hours, minutes] = event_time.split(':');
      eventDateTime.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0, 0);
    }

    // Determine if event is past
    const now = new Date();
    const is_past = eventDateTime < now;

    const eventData = {
      title,
      event_type: event_type || 'builder_meetup',
      related_project_id: related_project_id || null,
      description: description || null,
      location,
      city,
      event_date: eventDateTime,
      event_time: event_time || null,
      agenda: agenda || null,
      contact_person: contact_person || null,
      contact_email: contact_email || null,
      contact_phone: contact_phone || null,
      rsvp_info: rsvp_info || null,
      map_location: map_location || null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      banner_image: banner_image || null,
      registration_link: registration_link || null,
      max_attendees: max_attendees || null,
      images: Array.isArray(images) ? images : (images ? [images] : []),
      videos: Array.isArray(videos) ? videos : (videos ? [videos] : []),
      is_past,
      is_active: true,
      registered_count: 0
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

    const updateData = { ...req.body };
    
    // Handle images and videos arrays
    if (req.body.images !== undefined) {
      updateData.images = Array.isArray(req.body.images) ? req.body.images : (req.body.images ? [req.body.images] : []);
    }
    if (req.body.videos !== undefined) {
      updateData.videos = Array.isArray(req.body.videos) ? req.body.videos : (req.body.videos ? [req.body.videos] : []);
    }

    // If event_date is being updated, recalculate is_past
    if (req.body.event_date) {
      let eventDateTime = new Date(req.body.event_date);
      if (req.body.event_time) {
        const [hours, minutes] = req.body.event_time.split(':');
        eventDateTime.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0, 0);
      } else if (event.event_time) {
        const [hours, minutes] = event.event_time.split(':');
        eventDateTime.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0, 0);
      }
      updateData.event_date = eventDateTime;
      const now = new Date();
      updateData.is_past = eventDateTime < now;
    }

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
  deleteEvent,
  updateEventStatus
};

