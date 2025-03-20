import countryCodesToCountries from '@src/database/models/static/countryCodesToCountries.json'
import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    userId: { type: 'string' },
    countryCode: { enum: Object.keys(countryCodesToCountries) },
    city: { type: 'string' },
    zipCode: { type: 'string' },
    address: { type: 'string' }
  },
  required: ['userId', 'countryCode', 'city', 'zipCode', 'address']
})

export class AddAddressService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    try {
      const transaction = this.context.sequelizeTransaction

      const user = await this.context.sequelize.models.user.findOne({ attributes: ['id', 'emailVerified', 'firstName', 'lastName', 'dateOfBirth', 'moreDetails'], where: { id: this.args.userId }, transaction })
      if (!user.emailVerified) return this.addError('EmailNotVerifiedErrorType')

      const address = await this.context.sequelize.models.address.create({
        userId: user.id,
        countryCode: this.args.countryCode,
        city: this.args.city,
        zipCode: this.args.zipCode,
        address: this.args.address
      }, transaction)

      if (address && user.firstName && user.lastName && user.dateOfBirth){
        user.moreDetails = {
          ...user.moreDetails,
          personalDetails: true
        }
        await user.save({ transaction })
      }

      return address
    } catch (error) {
      throw new APIError(error)
    }
  }
}
