import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'
import countryCodesToCountries from '@src/database/models/static/countryCodesToCountries.json'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    userId: { type: 'string' },
    addressId: { type: 'string' },
    countryCode: { enum: Object.keys(countryCodesToCountries) },
    city: { type: 'string' },
    zipCode: { type: 'string' },
    address: { type: 'string' }
  },
  required: ['userId', 'addressId']
})

export class UpdateAddressService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    try {
      const transaction = this.context.sequelizeTransaction

      const user = await this.context.sequelize.models.user.findOne({ attributes: ['id', 'emailVerified', 'firstName', 'lastName', 'dateOfBirth', 'moreDetails'], where: { id: this.args.userId }, transaction })

      const address = await this.context.sequelize.models.address.findOne({
        where: {
          id: this.args.addressId,
          userId: this.args.userId
        },
        transaction
      })
      if (!address) return this.addError('InvalidAddressIdErrorType')

      const countryCode = this.args.countryCode
      const city = this.args.city
      const zipCode = this.args.zipCode
      const addressField = this.args.address

      if (countryCode) address.countryCode = countryCode
      if (city) address.city = city
      if (zipCode) address.zipCode = zipCode
      if (addressField) address.address = addressField
      
      if (user.firstName && user.lastName && user.dateOfBirth){
        user.moreDetails = {
          ...user.moreDetails,
          personalDetails: true
        }
        await user.save({ transaction })
      }
      await address.save({ transaction })
      
      return address
    } catch (error) {
      throw new APIError(error)
    }
  }
}
