# AWS S3 File Upload Setup Guide

This guide explains how to set up AWS S3 for file uploads in the DeepRealties platform.

## Prerequisites

1. AWS Account
2. S3 Bucket created: `deeprealties-storage`
3. AWS Access Key ID and Secret Access Key

## Installation

Install the required dependencies:

```bash
npm install aws-sdk multer-s3
```

## Environment Variables

Add the following to your `.env` file:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=bNzUbC1jcLl+zQfQ0/D80YlVkl+KLMgzPt5tymb/
AWS_REGION=ap-south-1
S3_BUCKET_NAME=deeprealties-storage
```

**Note:** Replace `your_aws_access_key_id` with your actual AWS Access Key ID. The secret access key provided should be kept secure and never committed to version control.

## S3 Bucket Configuration

### 1. Create S3 Bucket

1. Log in to AWS Console
2. Navigate to S3 service
3. Create a new bucket named `deeprealties-storage`
4. Choose region: `ap-south-1` (Mumbai) or your preferred region
5. Configure bucket settings:
   - **Block Public Access**: Uncheck "Block all public access" (or configure bucket policy)
   - **Versioning**: Optional (enable if needed)
   - **Encryption**: Enable server-side encryption

### 2. Bucket Policy

Add the following bucket policy to allow public read access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::deeprealties-storage/*"
    }
  ]
}
```

### 3. CORS Configuration

Add CORS configuration to allow uploads from your domain:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["https://deeprealties.in", "http://localhost:3000"],
    "ExposeHeaders": ["ETag"]
  }
]
```

## API Endpoints

### 1. Single File Upload

**POST** `/api/upload/single`

- **Authentication**: Required (Bearer token)
- **Content-Type**: `multipart/form-data`
- **Field Name**: `file`

**Response:**
```json
{
  "message": "File uploaded successfully",
  "file": {
    "url": "https://deeprealties-storage.s3.ap-south-1.amazonaws.com/images/1234567890-abc123.jpg",
    "key": "images/1234567890-abc123.jpg",
    "originalName": "property.jpg",
    "mimetype": "image/jpeg",
    "size": 245678
  }
}
```

### 2. Multiple Files Upload

**POST** `/api/upload/multiple`

- **Authentication**: Required (Bearer token)
- **Content-Type**: `multipart/form-data`
- **Field Name**: `files`
- **Max Files**: 10

**Response:**
```json
{
  "message": "3 file(s) uploaded successfully",
  "files": [
    {
      "url": "https://deeprealties-storage.s3.ap-south-1.amazonaws.com/images/file1.jpg",
      "key": "images/file1.jpg",
      "originalName": "image1.jpg",
      "mimetype": "image/jpeg",
      "size": 245678
    }
  ]
}
```

### 3. Property Images Upload

**POST** `/api/upload/property-images`

- **Authentication**: Required (Bearer token)
- **Content-Type**: `multipart/form-data`
- **Field Name**: `images`
- **Max Files**: 10

**Response:**
```json
{
  "message": "5 image(s) uploaded successfully",
  "images": [
    "https://deeprealties-storage.s3.ap-south-1.amazonaws.com/images/img1.jpg",
    "https://deeprealties-storage.s3.ap-south-1.amazonaws.com/images/img2.jpg"
  ]
}
```

### 4. Project Files Upload

**POST** `/api/upload/project-files`

- **Authentication**: Required (Bearer token)
- **Content-Type**: `multipart/form-data`
- **Fields**: 
  - `images` (max 10)
  - `gallery` (max 20)
  - `videos` (max 5)

**Response:**
```json
{
  "message": "Files uploaded successfully",
  "files": {
    "images": ["https://..."],
    "gallery": ["https://..."],
    "videos": ["https://..."]
  }
}
```

### 5. Delete File

**DELETE** `/api/upload/file`

- **Authentication**: Required (Bearer token)
- **Body**: 
```json
{
  "url": "https://deeprealties-storage.s3.ap-south-1.amazonaws.com/images/file.jpg"
}
```

### 6. Delete Multiple Files

**DELETE** `/api/upload/files`

- **Authentication**: Required (Bearer token)
- **Body**: 
```json
{
  "urls": [
    "https://deeprealties-storage.s3.ap-south-1.amazonaws.com/images/file1.jpg",
    "https://deeprealties-storage.s3.ap-south-1.amazonaws.com/images/file2.jpg"
  ]
}
```

## File Organization

Files are automatically organized in S3 by type:

- **Images**: `images/` folder
- **Videos**: `videos/` folder
- **Documents**: `documents/` folder
- **Other**: `uploads/` folder

## File Limits

- **Max File Size**: 10MB per file
- **Allowed Types**: 
  - Images: JPEG, JPG, PNG, GIF, WEBP
  - Videos: MP4, MPEG, QuickTime
  - Documents: PDF

## Usage Example (Frontend)

### Using Fetch API

```javascript
// Single file upload
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/upload/single', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const data = await response.json();
console.log('File URL:', data.file.url);
```

### Using Axios

```javascript
import axios from 'axios';

const formData = new FormData();
formData.append('file', file);

const response = await axios.post('/api/upload/single', formData, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  }
});

console.log('File URL:', response.data.file.url);
```

## Security Considerations

1. **Access Keys**: Never commit AWS credentials to version control
2. **Bucket Policy**: Configure appropriate permissions
3. **File Validation**: Files are validated on upload (type and size)
4. **Authentication**: All upload endpoints require authentication
5. **CORS**: Configure CORS properly for your domain

## Troubleshooting

### Common Issues

1. **Access Denied Error**
   - Check AWS credentials in `.env`
   - Verify bucket policy allows uploads
   - Check IAM user permissions

2. **CORS Error**
   - Update CORS configuration in S3 bucket
   - Verify allowed origins include your domain

3. **File Size Error**
   - Check file size (max 10MB)
   - Verify file type is allowed

4. **Upload Timeout**
   - Increase timeout settings
   - Check network connectivity
   - Verify S3 bucket region matches configuration

## Migration from Local Storage

If you're migrating from local file storage:

1. Upload existing files to S3
2. Update database records with S3 URLs
3. Remove local upload directory (optional)
4. Update frontend to use new upload endpoints

## Cost Optimization

- Use S3 lifecycle policies to move old files to cheaper storage
- Enable S3 Intelligent-Tiering for automatic cost optimization
- Set up CloudFront CDN for faster file delivery (optional)

