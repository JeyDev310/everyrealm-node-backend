import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'
import { logger } from "@src/utils/logger";

const constraints = ajv.compile({
  type: 'object',
  properties: {
    acknowledgeCode: { type: 'string' },
    userId: { type: 'string' },
    version: { type: 'string' },
  },
  required: ['acknowledgeCode', 'userId', 'version']
})

export class UserAcknowledgeService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    logger.info('Start(UserAcknowledgeService):', {args: this.args});
    const { acknowledgeCode, userId, version } = this.args;
    const transaction = this.context.sequelizeTransaction;

    const user = await this.context.sequelize.models.user.findOne({
      attributes: ['id', 'moreDetails'],
      where: { id: userId },
      transaction
    });
    const acknowledgements = user.moreDetails.acknowledgements || {};
    await user.set({
      moreDetails: {
        ...user.moreDetails,
        acknowledgements: {
          ...acknowledgements,
          [acknowledgeCode]: version
        }
      }
    }).save({transaction});

    logger.info('Return(UserAcknowledgeService):', {user});
    return { user };
  }
}
