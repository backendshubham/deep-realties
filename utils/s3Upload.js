const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const crypto = require('crypto');

// Check for AWS credentials
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION || 'ap-south-1';
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'deeprealties-storage';

// Validate AWS credentials
if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
  console.warn('⚠️  AWS credentials not found in environment variables.');
  console.warn('Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env file.');
  console.warn('File uploads will not work until AWS credentials are configured.');
}

// Configure AWS S3
const s3Config = {
  region: AWS_REGION
};

// Only add credentials if they are provided
if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
  // Trim any whitespace and remove quotes if present
  s3Config.accessKeyId = AWS_ACCESS_KEY_ID.trim().replace(/^["']|["']$/g, '');
  s3Config.secretAccessKey = AWS_SECRET_ACCESS_KEY.trim().replace(/^["']|["']$/g, '');
  
  // Debug: Log credential info (without exposing full secret)
  console.log('✅ AWS S3 configured with Access Key:', s3Config.accessKeyId.substring(0, 8) + '...');
  console.log('✅ AWS Region:', AWS_REGION);
  console.log('✅ S3 Bucket:', BUCKET_NAME);
} else {
  console.warn('⚠️  AWS credentials missing - S3 uploads will not work');
}

const s3 = new AWS.S3(s3Config);

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
// Note: ACL is removed because the bucket has ACLs disabled
// Make sure your bucket policy allows public read access if needed
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: BUCKET_NAME,
    // acl: 'public-read', // Removed - bucket has ACLs disabled
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
    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS credentials not configured. Cannot delete file from S3.');
    }
    
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
    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS credentials not configured. Cannot delete files from S3.');
    }
    
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

// Test S3 connection (optional helper function)
const testS3Connection = async () => {
  try {
    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS credentials not configured');
    }
    
    // Try to list buckets to verify credentials
    const result = await s3.listBuckets().promise();
    console.log('✅ AWS S3 connection successful!');
    console.log('✅ Available buckets:', result.Buckets.map(b => b.Name).join(', '));
    return true;
  } catch (error) {
    console.error('❌ AWS S3 connection failed:', error.message);
    if (error.code === 'SignatureDoesNotMatch') {
      console.error('💡 This usually means:');
      console.error('   1. The AWS Access Key ID or Secret Access Key is incorrect');
      console.error('   2. The credentials do not have S3 permissions');
      console.error('   3. The region might be incorrect');
      console.error('   4. Check if the secret key has special characters that need proper quoting');
    }
    return false;
  }
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
  BUCKET_NAME,
  testS3Connection
};

