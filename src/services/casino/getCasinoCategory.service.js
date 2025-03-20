import { APIError } from '@src/errors/api.error'
import ServiceBase from '@src/libs/serviceBase'

export class GetCasinoCategoryService extends ServiceBase {
  async run () {
    try {
      const casinoCategories = await this.context.sequelize.models.casinoCategory.findAll({
        where: { isActive: true },
        order: [['orderId']],
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      })

      return {
        casinoCategories
      }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
