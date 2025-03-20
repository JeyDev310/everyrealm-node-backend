import { S3 } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { appConfig } from '@src/configs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * @typedef {object} FileOpts
 * @property {string} name
 * @property {string} mimetype
 * @property {string} filePathInS3Bucket
 */

const bucket = new S3({
  region: appConfig.aws.region
});

/**
 * @param {string} fileName
 * @param {string} filePath
 */
export async function deleteFile(fileName, filePath) {
  try {
    await bucket.deleteObject({
      Bucket: appConfig.aws.bucket,
      Key: path.join(filePath, fileName)
    });

    return true;
  } catch (error) {
    throw new Error(error.message || error);
  }
}

/**
 * @param {Buffer} file
 * @param {FileOpts} fileOpts
 */
export async function uploadFile(file, fileOpts) {
  try {
    const [extension1, extension2] = fileOpts.mimetype.split('/');
    const uniqueId = uuidv4(); //  unique identifier
    fileOpts.name = `${fileOpts.name.toLowerCase().replaceAll(' ', '_')}_${uniqueId}.${extension2 ?? extension1}`; // append the identifier to prevent caching issues

    const parallelUpload = new Upload({
      client: bucket,
      params: {
        Bucket: appConfig.aws.bucket,
        Key: path.join(fileOpts.filePathInS3Bucket, fileOpts.name),
        Body: file,
      }
    });

    const data = await parallelUpload.done();

    /* Replace direct S3 URL with CDN URL as per bucket policy requirements */
    const cdnBaseUrl = process.env.AWS_S3_CDN_BASE_URL;
    const cdnUrl = data.Location.replace(`https://${appConfig.aws.bucket}.s3.${appConfig.aws.region}.amazonaws.com`, cdnBaseUrl);

    return cdnUrl;
  } catch (error) {
    throw new Error(error.message || error);
  }
}