const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { S3Client, ListObjectsCommand } = require('@aws-sdk/client-s3');

const REGION = process.env.AWS_REGION || 'us-east-1';
const BUCKET = process.env.S3_BUCKET;
const ENDPOINT = process.env.S3_ENDPOINT || undefined;
const FORCE_PATH_STYLE = (process.env.S3_FORCE_PATH_STYLE || 'false').toLowerCase() === 'true';

console.log('--- S3 Config ---');
console.log('REGION:', REGION);
console.log('BUCKET:', BUCKET);
console.log('ENDPOINT:', ENDPOINT);
console.log('FORCE_PATH_STYLE:', FORCE_PATH_STYLE);
console.log('ACCESS_KEY:', process.env.AWS_ACCESS_KEY_ID ? '*****' + process.env.AWS_ACCESS_KEY_ID.slice(-4) : 'MISSING');

if (!BUCKET) {
    console.error('ERROR: S3_BUCKET is not set.');
    process.exit(1);
}

const clientConfig = { region: REGION };
if (ENDPOINT) clientConfig.endpoint = ENDPOINT;
if (FORCE_PATH_STYLE) clientConfig.forcePathStyle = true;
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    clientConfig.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
}

const s3client = new S3Client(clientConfig);

async function test() {
    try {
        const prefix = process.env.S3_KEY_PREFIX || '';
        console.log(`Attempting to list objects in bucket: ${BUCKET} with prefix: '${prefix}'...`);
        const cmd = new ListObjectsCommand({ Bucket: BUCKET, Prefix: prefix, MaxKeys: 10 });
        const res = await s3client.send(cmd);
        console.log('SUCCESS: S3 connection working.');
        console.log('Objects found:', res.Contents ? res.Contents.length : 0);
        if (res.Contents) {
            res.Contents.forEach(obj => console.log(' - ' + obj.Key));
        }
    } catch (err) {
        console.error('FAILURE: S3 Error:');
        console.error(err);
    }
}

test();
