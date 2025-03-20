import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    userId: { type: 'string' }
  },
  required: ['userId']
})

export class GetDocumentsService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    try {
      const documents = await this.context.sequelize.models.document.findAll({
        where: { userId: this.args.userId },
        include: {
          model: this.context.models.documentLabel,
          attributes: ['name']
        }
      })

      return { documents }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
