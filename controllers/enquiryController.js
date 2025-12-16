const db = require('../config/database');

const createEnquiry = async (req, res, next) => {
  try {
    const { property_id, message } = req.body;

    const property = await db('properties').where({ id: property_id }).first();
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (!property.seller_id) {
      return res.status(400).json({ error: 'Property has no seller' });
    }

    await db('enquiries').insert({
      property_id,
      buyer_id: req.user.id,
      seller_id: property.seller_id,
      message
    });

    res.status(201).json({
      message: 'Enquiry submitted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getSentEnquiries = async (req, res, next) => {
  try {
    const enquiries = await db('enquiries')
      .where({ buyer_id: req.user.id })
      .join('properties', 'enquiries.property_id', 'properties.id')
      .select(
        'enquiries.*',
        'properties.title as property_title',
        'properties.locality',
        'properties.city'
      )
      .orderBy('enquiries.created_at', 'desc');

    res.json({ enquiries });
  } catch (error) {
    next(error);
  }
};

const getReceivedEnquiries = async (req, res, next) => {
  try {
    const enquiries = await db('enquiries')
      .where('enquiries.seller_id', req.user.id)
      .join('properties', 'enquiries.property_id', 'properties.id')
      .join('users', 'enquiries.buyer_id', 'users.id')
      .select(
        'enquiries.*',
        'properties.title as property_title',
        'properties.locality',
        'properties.city',
        'users.full_name as buyer_name',
        'users.email as buyer_email',
        'users.phone as buyer_phone'
      )
      .orderBy('enquiries.created_at', 'desc');

    res.json({ enquiries });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const enquiry = await db('enquiries').where({ id }).first();

    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    if (req.user.role !== 'admin' && enquiry.seller_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await db('enquiries')
      .where({ id })
      .update({ is_read: true });

    res.json({ message: 'Enquiry marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEnquiry,
  getSentEnquiries,
  getReceivedEnquiries,
  markAsRead
};

