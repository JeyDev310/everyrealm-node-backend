import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    id: { type: 'number' }
  }
})

export class GetAllCmsPageService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    let query
    const { id } = this.args

    try {
      let cmsPages
      query = { isActive: true }
      if (id) {
        cmsPages = await this.context.models.page.findAndCountAll({
          order: [['createdAt', 'DESC']],
          where: { ...query, id },
          attributes: {
            exclude: ['updatedAt', 'createdAt']
          }
        })
      } else {
        cmsPages = await this.context.models.page.findAndCountAll({
          order: [['createdAt', 'DESC']],
          where: query,
          attributes: ['title', 'id']
        })
      }
      if (!cmsPages) return this.addError('CmsNotFoundErrorType')

      return { cmsPages }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
