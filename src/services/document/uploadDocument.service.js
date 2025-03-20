import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import { deleteFile, uploadFile } from '@src/libs/s3'
import ServiceBase from '@src/libs/serviceBase'
import { S3FolderHierarchy } from '@src/utils/constants/app.constants'
import { DOCUMENT_STATUS_TYPES } from '@src/utils/constants/public.constants.utils'
import path from 'path'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    userId: { type: 'string' },
    labelId: { type: 'string' },
    file: { type: 'object' }
  },
  required: ['userId', 'labelId', 'file']
})

export class UploadDocumentService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    /** @type {Express.Multer.File} */
    const file = this.args.file
    const userId = this.args.userId
    const documentModel = this.context.sequelize.models.document
    const transaction = this.context.sequelizeTransaction

    try {
      const documentLabel = await this.context.sequelize.models.documentLabel.findOne({ attributes: ['id', 'name'], where: { id: this.args.labelId }, transaction })
      if (!documentLabel) return this.addError('InvalidDocumentLabelIdErrorType')

      const filePathOnS3 = path.join(S3FolderHierarchy.user.documents, userId)

      // If document already exists delet old one and upload new one (replace)
      let userDocument = await documentModel.findOne({ where: { userId, documentLabelId: documentLabel.id }, transaction })
      if (userDocument) {
        if (userDocument.status === DOCUMENT_STATUS_TYPES.APPROVED) return this.addError('DocumentIsApprovedErrorType')
        await deleteFile(userDocument.url.split('/').slice(-1)[0], filePathOnS3)
      } else {
        userDocument = await documentModel.create({ userId, documentLabelId: documentLabel.id }, { transaction })
      }

      const uploadedFilePath = await uploadFile(file.buffer, {
        name: documentLabel.name,
        mimetype: file.mimetype,
        filePathInS3Bucket: filePathOnS3
      })

      userDocument.url = uploadedFilePath
      userDocument.status = DOCUMENT_STATUS_TYPES.PENDING
      await userDocument.save({ transaction })

      return { path: uploadedFilePath }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
