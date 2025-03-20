import { APIError } from '@src/errors/api.error';
import ajv from '@src/libs/ajv';
import { uploadFile } from '@src/libs/s3';
import ServiceBase from '@src/libs/serviceBase';
import { S3FolderHierarchy } from '@src/utils/constants/app.constants';
import filetype from 'magic-bytes.js';
import { logger } from "@src/utils/logger";

const constraints = ajv.compile({
  type: 'object',
  properties: {
    file: { type: 'object' },
    userId: { type: 'string' }
  },
  required: ['userId', 'file']
});

export class UploadProfileImageService extends ServiceBase {
  get constraints() {
    return constraints;
  }

  async run() {
    logger.info('Start(UploadProfileImageService)');

    /* Extract the file from the request arguments */
    /** @type {Express.Multer.File} */
    const file = this.args.file;
    const transaction = this.context.sequelizeTransaction;

    /* Read the first 100 bytes of the file for validation */
    const fileBytes = Array.from(file.buffer.subarray(0, 100));

    /* Define the allowed MIME types */
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/webp'];

    /* Detect the file type using magic-bytes.js */
    const detectedTypes = filetype(fileBytes); // Returns an array of type objects
    logger.info('Detected file types:', {detectedTypes});

    /* Extract the MIME type from the first detected type (if any) */
    const detectedMimeType = detectedTypes.length > 0 ? detectedTypes[0].mime : null;

    /* Validate the detected MIME type against the allowed list */
    if (!detectedMimeType || !allowedMimeTypes.includes(detectedMimeType)) {
      logger.info('InvalidFileType(UploadProfileImageService):', {detectedMimeType: detectedMimeType || 'unknown'});
      return this.addError('InvalidFileTypeError', 'The uploaded file type is not allowed.');
    }

    try {
      /* Check if the user exists in the database */
      const user = await this.context.sequelize.models.user.findOne({
        attributes: ['id'],
        where: { id: this.args.userId },
        transaction
      });
      if (!user) {
        logger.info('UserDoesNotExists(UploadProfileImageService)');
        return this.addError('UserDoesNotExistsErrorType');
      }

      /* Upload the file to S3 with the detected MIME type */
      const fileLocation = await uploadFile(file.buffer, {
        name: String(user.id),
        mimetype: detectedMimeType,
        filePathInS3Bucket: S3FolderHierarchy.user.profileImages
      });

      /* Update the user's profile image URL in the database */
      user.imageUrl = fileLocation;
      await user.save({ transaction });

      logger.info('Return(UploadProfileImageService):', {fileLocation});
      return { path: fileLocation };
    } catch (error) {
      /* Log and handle unknown errors during execution */
      logger.error('UnknownError(UploadProfileImageService):',  { message: error.message, stack: error.stack });
      throw new APIError(error);
    }
  }
}
