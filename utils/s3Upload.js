const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const crypto = require('crypto');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-south-1' // Default to Mumbai region
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'deeprealties-storage';

// Generate unique filename
const generateFileName = (req, file) => {
  const randomName = crypto.randomBytes(16).toString('hex');
  const extension = path.extname(file.originalname);
  return `${Date.now()}-${randomName}${extension}`;
};

// File filter - only allow images and videos
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'application/pdf'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, and PDFs are allowed.'), false);
  }
};

// Configure multer for S3 upload
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: BUCKET_NAME,
    acl: 'public-read', // Make files publicly accessible
    key: (req, file, cb) => {
      // Organize files by type
      let folder = 'uploads';
      if (file.mimetype.startsWith('image/')) {
        folder = 'images';
      } else if (file.mimetype.startsWith('video/')) {
        folder = 'videos';
      } else if (file.mimetype === 'application/pdf') {
        folder = 'documents';
      }
      
      const fileName = generateFileName(req, file);
      cb(null, `${folder}/${fileName}`);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, {
        originalName: file.originalname,
        uploadedAt: new Date().toISOString()
      });
    }
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Single file upload middleware
const uploadSingle = (fieldName = 'file') => {
  return upload.single(fieldName);
};

// Multiple files upload middleware
const uploadMultiple = (fieldName = 'files', maxCount = 10) => {
  return upload.array(fieldName, maxCount);
};

// Fields upload middleware (for multiple different fields)
const uploadFields = (fields) => {
  return upload.fields(fields);
};

// Delete file from S3
const deleteFile = async (fileUrl) => {
  try {
    // Extract key from S3 URL
    // URL format: https://bucket-name.s3.region.amazonaws.com/key
    const urlParts = fileUrl.split('.com/');
    if (urlParts.length < 2) {
      throw new Error('Invalid S3 URL');
    }
    
    const key = urlParts[1].split('?')[0]; // Remove query params if any
    
    const params = {
      Bucket: BUCKET_NAME,
      Key: key
    };

    await s3.deleteObject(params).promise();
    return { success: true, message: 'File deleted successfully' };
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
};

// Delete multiple files from S3
const deleteFiles = async (fileUrls) => {
  try {
    const keys = fileUrls.map(url => {
      const urlParts = url.split('.com/');
      if (urlParts.length < 2) return null;
      return urlParts[1].split('?')[0];
    }).filter(key => key !== null);

    if (keys.length === 0) {
      return { success: true, message: 'No valid files to delete' };
    }

    const params = {
      Bucket: BUCKET_NAME,
      Delete: {
        Objects: keys.map(key => ({ Key: key })),
        Quiet: false
      }
    };

    const result = await s3.deleteObjects(params).promise();
    return { 
      success: true, 
      message: `${result.Deleted.length} file(s) deleted successfully`,
      deleted: result.Deleted
    };
  } catch (error) {
    console.error('Error deleting files from S3:', error);
    throw error;
  }
};

// Get file URL (helper function)
const getFileUrl = (key) => {
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`;
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  deleteFile,
  deleteFiles,
  getFileUrl,
  s3,
  BUCKET_NAME
};

