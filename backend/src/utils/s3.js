const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const REGION = process.env.AWS_REGION || process.env.AWS_REGION || 'us-east-1';
const BUCKET = process.env.S3_BUCKET;
const ENDPOINT = process.env.S3_ENDPOINT || undefined;
const FORCE_PATH_STYLE = (process.env.S3_FORCE_PATH_STYLE || 'false').toLowerCase() === 'true';

if (!BUCKET) {
  console.warn('S3_BUCKET not configured. S3 image operations will fail until configured.');
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

async function uploadObject(key, buffer, contentType) {
  if (!BUCKET) throw new Error('S3_BUCKET not configured');
  const cmd = new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: contentType });
  return await s3client.send(cmd);
}

async function deleteObject(key) {
  if (!BUCKET) throw new Error('S3_BUCKET not configured');
  try {
    const cmd = new DeleteObjectCommand({ Bucket: BUCKET, Key: key });
    await s3client.send(cmd);
    return true;
  } catch (err) {
    // If the object doesn't exist, we consider the deletion successful (idempotent)
    if (err.name === 'NoSuchKey' || errCode(err) === 'NoSuchKey') {
      console.warn(`S3 Delete: Object ${key} not found, ignoring.`);
      return true;
    }
    console.error(`S3 Delete Error for ${key}:`, err);
    throw err;
  }
}

function errCode(err) {
  return err.Code || (err.$metadata && err.$metadata.httpStatusCode === 404 ? 'NoSuchKey' : null);
}

async function getPresignedUrl(key, expiresInSeconds = 60 * 60) {
  if (!BUCKET) throw new Error('S3_BUCKET not configured');
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return await getSignedUrl(s3client, cmd, { expiresIn: expiresInSeconds });
}

module.exports = {
  uploadObject,
  deleteObject,
  getPresignedUrl,
};
