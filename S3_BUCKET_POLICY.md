# S3 Bucket Policy Configuration

## Issue
The S3 bucket has ACLs disabled, which means we cannot use ACLs to make files publicly accessible. Instead, we need to configure a bucket policy.

## Solution
Add the following bucket policy to your S3 bucket to allow public read access to uploaded files:

### Steps:
1. Go to AWS S3 Console
2. Select your bucket: `deeprealties-storage`
3. Go to **Permissions** tab
4. Scroll down to **Bucket policy**
5. Click **Edit** and paste the following policy:

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

6. Click **Save changes**

### Block Public Access Settings
Make sure your bucket's **Block Public Access** settings allow public read access:
1. In the **Permissions** tab, click **Edit** under **Block public access (bucket settings)**
2. Uncheck **Block all public access** OR
3. Keep it checked but ensure the bucket policy above is in place (AWS will allow it)

### Alternative: Use Presigned URLs
If you don't want to make files publicly accessible, you can use presigned URLs instead. This requires updating the code to generate presigned URLs when serving files.

## Current Configuration
- **Bucket Name**: `deeprealties-storage`
- **Region**: `ap-south-1`
- **ACL**: Disabled (using bucket policy instead)

