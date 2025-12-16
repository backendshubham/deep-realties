const db = require('../config/database');

const submitContact = async (req, res, next) => {
  try {
    const { full_name, email, phone, subject, message } = req.body;

    await db('contact_submissions').insert({
      full_name,
      email,
      phone,
      subject,
      message
    });

    res.status(201).json({
      message: 'Contact form submitted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getAllSubmissions = async (req, res, next) => {
  try {
    const { is_read, page = 1, limit = 50 } = req.query;

    let query = db('contact_submissions');

    if (is_read !== undefined) {
      query.where('is_read', is_read === 'true');
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build base query function for reuse
    const buildBaseQuery = () => {
      let baseQuery = db('contact_submissions');
      if (is_read !== undefined) {
        baseQuery = baseQuery.where('is_read', is_read === 'true');
      }
      return baseQuery;
    };

    // Get submissions with pagination
    const submissions = await buildBaseQuery()
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

const getSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const submission = await db('contact_submissions').where({ id }).first();

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json({ submission });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db('contact_submissions')
      .where({ id })
      .update({ is_read: true });

    res.json({ message: 'Submission marked as read' });
  } catch (error) {
    next(error);
  }
};

const markAsResponded = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db('contact_submissions')
      .where({ id })
      .update({ is_responded: true, is_read: true });

    res.json({ message: 'Submission marked as responded' });
  } catch (error) {
    next(error);
  }
};

const deleteSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db('contact_submissions').where({ id }).del();

    res.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContact,
  getAllSubmissions,
  getSubmission,
  markAsRead,
  markAsResponded,
  deleteSubmission
};

