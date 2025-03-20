import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'
import { sequelize } from '@src/database' 

const constraints = ajv.compile({
  type: 'object',
  properties: {}
})

export class GetAllRakebackBoostService extends ServiceBase {
  get constraints() {
    return constraints
  }

  async run() {
    try {
      // no need for transactions here for simple get call i believe. but if we add more stuff, we should define a transcation at parent and pass it down.
      const sequelizeInstance = this.context?.sequelize || sequelize

      const allRakebackBoost = await sequelizeInstance.models.rakebackBoostLevel.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        order: [['balanceRequired', 'ASC']]
      });

      return allRakebackBoost;
    } catch (error) {
      throw new APIError(error);
    }
  }
}
