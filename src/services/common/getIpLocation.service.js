import { APIError } from '@src/errors/api.error'
import { getGeoLocation } from '@src/libs/geoLocation'
import ServiceBase from '@src/libs/serviceBase'

export class GetIpLocationService extends ServiceBase {
  async run () {
    try {
      const { countryCode } = await getGeoLocation(this.args.ipAddress)
      const country = await this.context.sequelize.models.country.findOne({ where: { code: countryCode } })
      if (!country) return this.addError('YourCountryIsNotListedErrorType')

      return country
    } catch (error) {
      throw new APIError(error)
    }
  }
}
