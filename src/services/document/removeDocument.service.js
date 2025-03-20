import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import { deleteFile } from '@src/libs/s3'
import ServiceBase from '@src/libs/serviceBase'
import { S3_USER_FILE_PATHS } from '@src/utils/constants/app.constants'
import path from 'path'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    userId: { type: 'string' },
    documentId: { type: 'string' }
  },
  required: ['userId', 'documentId']
})

export class RemoveDocumentService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const userId = this.args.userId
    try {
      const document = await this.context.sequelize.models.document.findOne({ where: { id: this.args.documentId, userId } })
      if (!document) return this.addError('InvalidDocumentIdErrorType')

      await deleteFile(document.url.split('/').slice(-1)[0], path.join(S3_USER_FILE_PATHS.DOCUMENT, userId))
      await document.destroy()
      return { success: true }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
