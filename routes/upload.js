const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { uploadSingle, uploadMultiple, uploadFields, deleteFile, deleteFiles } = require('../utils/s3Upload');

// Single file upload
router.post('/single', authenticateToken, uploadSingle('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      message: 'File uploaded successfully',
      file: {
        url: req.file.location,
        key: req.file.key,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'File upload failed', details: error.message });
  }
});

// Multiple files upload
router.post('/multiple', authenticateToken, uploadMultiple('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = req.files.map(file => ({
      url: file.location,
      key: file.key,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    }));

    res.json({
      message: `${files.length} file(s) uploaded successfully`,
      files
    });
  } catch (error) {
    res.status(500).json({ error: 'File upload failed', details: error.message });
  }
});

// Property images upload (specific endpoint)
router.post('/property-images', authenticateToken, uploadMultiple('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    // Check if files were uploaded to S3 (have location property) or are in memory
    const imageUrls = req.files.map(file => {
      if (file.location) {
        // File uploaded to S3
        return file.location;
      } else if (file.buffer) {
        // File is in memory (AWS not configured) - return error
        throw new Error('AWS S3 is not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env file.');
      }
      return null;
    }).filter(url => url !== null);

    if (imageUrls.length === 0) {
      return res.status(500).json({ 
        error: 'AWS S3 is not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env file.' 
      });
    }

    res.json({
      message: `${imageUrls.length} image(s) uploaded successfully`,
      images: imageUrls
    });
  } catch (error) {
    res.status(500).json({ error: 'Image upload failed', details: error.message });
  }
});

// Project files upload (images, gallery, videos)
router.post('/project-files', authenticateToken, uploadFields([
  { name: 'images', maxCount: 10 },
  { name: 'gallery', maxCount: 20 },
  { name: 'videos', maxCount: 5 }
]), (req, res) => {
  try {
    const result = {
      images: [],
      gallery: [],
      videos: []
    };

    if (req.files.images) {
      result.images = req.files.images.map(file => file.location);
    }
    if (req.files.gallery) {
      result.gallery = req.files.gallery.map(file => file.location);
    }
    if (req.files.videos) {
      result.videos = req.files.videos.map(file => file.location);
    }

    res.json({
      message: 'Files uploaded successfully',
      files: result
    });
  } catch (error) {
    res.status(500).json({ error: 'File upload failed', details: error.message });
  }
});

// Delete single file
router.delete('/file', authenticateToken, async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'File URL is required' });
    }

    await deleteFile(url);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'File deletion failed', details: error.message });
  }
});

// Delete multiple files
router.delete('/files', authenticateToken, async (req, res) => {
  try {
    const { urls } = req.body;
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'File URLs array is required' });
    }

    const result = await deleteFiles(urls);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'File deletion failed', details: error.message });
  }
});

module.exports = router;

