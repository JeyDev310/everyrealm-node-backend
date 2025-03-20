import { appConfig } from '@src/configs'
import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import { VeriffAxios } from '@src/libs/axios/veriff.axios'
import ServiceBase from '@src/libs/serviceBase'
import { VERIFF_STATUS } from '@src/utils/constants/app.constants'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    userId: { type: 'string' }
  },
  required: ['userId']
})

export class CreateVeriffSessionService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const transaction = this.context.sequelizeTransaction
    const userId = this.args.userId
    const userModel = this.context.sequelize.models.user

    try {
      let data
      const userDetails = await userModel.findOne({ where: { id: userId }, transaction })

      const dob = new Date(userDetails.dateOfBirth)

      if (userDetails.veriffStatus !== VERIFF_STATUS.APPROVED) {
        const payload = {
          verification: {
            callback: appConfig.app.userFeUrl,
            person: {
              firstName: userDetails.firstName,
              lastName: userDetails.lastName,
              idNumber: userDetails.userId,
              gender: userDetails.gender,
              dateOfBirth: dob.getFullYear() + '-' + (dob.getMonth() + 1).toString().padStart(2, '0') + '-' + dob.getDate().toString().padStart(2, '0')
            },
            address: { fullAddress: `${userDetails.addressLine_1}${userDetails.addressLine_2 ? userDetails.addressLine_2 : ''}` },
            vendorData: userDetails.uniqueId
          }
        }
        const { result } = await VeriffAxios.initVeriff(payload)
        data = result
        if (data.verification) {
          userDetails.veriffApplicantId = data.verification.id
          await userDetails.save({ transaction })
        }
      } else {
        return this.addError('VeriffAlreadyVerifiedErrorType')
      }

      return { ...data }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
