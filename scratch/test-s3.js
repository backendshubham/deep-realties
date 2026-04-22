require('dotenv').config();
const { testS3Connection } = require('../utils/s3Upload');

async function check() {
    console.log('Testing S3 Connection...');
    const result = await testS3Connection();
    if (result) {
        console.log('S3 Connection Test Passed!');
    } else {
        console.log('S3 Connection Test Failed!');
    }
    process.exit(result ? 0 : 1);
}

check();
