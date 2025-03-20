import { APIError } from "@src/errors/api.error";
import ajv from "@src/libs/ajv";
import ServiceBase from "@src/libs/serviceBase";
import { ADDITIONAL_VERIFICATION_LEVELS, VERIFF_STATUS } from "@src/utils/constants/app.constants";

const constraints = ajv.compile({
  type: 'object',
  properties: {
    userId: { type: 'string' }
  },
  required: ['userId']
})
export class ByPassVeriffKycService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const transaction = this.context.sequelizeTransaction
    try{
      const userDetails = await this.context.sequelize.models.user.findOne({ where: { id: this.args.userId }, transaction })
      if(userDetails.veriffStatus !== VERIFF_STATUS.APPROVED){
        userDetails.veriffStatus = VERIFF_STATUS.APPROVED
        if(userDetails.moreDetails.additionalVerification == ADDITIONAL_VERIFICATION_LEVELS.LEVEL2_REQUIRED){
          userDetails.moreDetails = {
            ...userDetails.moreDetails,
            additionalVerification: ADDITIONAL_VERIFICATION_LEVELS.NOT_REQUIRED
          }
        }
        await userDetails.save({ transaction })
        return { success: true }
      }
      else{
        return this.addError('VeriffAlreadyVerifiedErrorType')
      }
    }catch(error){
      throw new APIError(error)
    }
  }

}
