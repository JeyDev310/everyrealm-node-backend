import axios from 'axios'
import { APIError } from '@src/errors/api.error'
import { getGeoLocation } from '@src/libs/geoLocation'
import ServiceBase from '@src/libs/serviceBase'
import { maxmindConfig } from '@src/configs'
import { logger } from "@src/utils/logger";


const respRestricted = {
  code: 403,
  message: 'Geo restricted'
}
const respError = {
  code: 500,
  message: 'Internal Error'
}
const respOk = {
  code: 200,
  message: 'Ok'
}

export class GetGeoLocationService extends ServiceBase {
  async run() {

    logger.info('Checking user region for restrictions ...')

    const geo = this.context.req.query.geo ? this.context.req.query.geo : ''

    // FOR TESTING PURPOSE ONLY
    if (geo === '' || geo === 'false') {
      logger.info('Skipping geo restriction check')
      return respOk
    }

    const WHITELISTED_IPS = maxmindConfig.whitelistedIps ? maxmindConfig.whitelistedIps.split(',') : []
    const RESTRICTED_COUNTRIES = [
      'AF', 'AL', 'DZ', 'AW', 'AU', 'AT', 'BH', 'BY', 'BE', 'BZ', 'BQ', 'BA', 'BR', 
      'BN', 'BG', 'BI', 'KH', 'CA', 'CF', 'TD', 'CN', 'CO', 'HR', 'CU', 'CW', 'CY', 
      'CZ', 'KP', 'CD', 'DK', 'EG', 'EE', 'ET', 'FR', 'GE', 'GR', 'GN', 'GW', 'HU', 
      'ID', 'IR', 'IQ', 'IE', 'IT', 'JP', 'JO', 'KZ', 'KW', 'LV', 'LB', 'LY', 'LT', 
      'LU', 'MK', 'MV', 'ML', 'MT', 'MM', 'NL', 'NI', 'NG', 'OM', 'PA', 'PL', 'PT', 
      'QA', 'CG', 'RO', 'RU', 'SA', 'RS', 'BQ', 'SX', 'SK', 'SI', 'SO', 'SS', 'ES', 
      'PS', 'SD', 'SY', 'TZ', 'TH', 'TT', 'TN', 'TR', 'UA', 'AE', 'GB', 'US', 'VE', 
      'VN', 'YE', 'ZW'
    ];

    try {
      let ip = this.args.ipAddress
      logger.info('User IP: ', { ip })

      // allow whitelisted IPs
      if (WHITELISTED_IPS.includes(ip)) {
        logger.info('IP is whitelited and skipping the geo restriction check')
        return respOk
      }

      let geoliteUrl = `${maxmindConfig.geoliteUrl}`
      geoliteUrl = geoliteUrl.concat(ip)

      const reqHeaders = {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${maxmindConfig.accountId}:${maxmindConfig.licenseKey}`).toString('base64')
      }

      let axiosConfig = {
        method: 'get',
        url: geoliteUrl,
        headers: reqHeaders
      }

      let resp = await axios(axiosConfig)
      logger.info('Maxmind geolite response ', { data: resp.data })

      const ipCountry = resp?.data?.country?.iso_code ? resp.data.country.iso_code : ''
      if (RESTRICTED_COUNTRIES.includes(ipCountry)) {
        logger.info("User's country is restricted: ", { ipCountry })
        return respRestricted
      }

      // if the country is CA and state is Ontario then restrict users
      if (ipCountry === 'CA') {

        const requestData = {
          device: {
            ip_address: `${ip}`
          }
        }
        const jsonData = JSON.stringify(requestData)

        axiosConfig = {
          method: 'post',
          url: `${maxmindConfig.minfraudUrl}`,
          headers: reqHeaders,
          data: jsonData
        }

        resp = await axios(axiosConfig)
        logger.info('Maxmind minfraud response ', { data: resp.data })

        if (resp.data?.ip_address) {
          const stateCode = resp.data.ip_address?.subdivisions ? resp.data.ip_address.subdivisions[0]?.iso_code : ''

          if (stateCode === 'ON') {
            logger.info('User region CA-ON is restricted')
            return respRestricted
          }
        }
      }

      logger.info('User country ', ipCountry, ' is NOT restricted!')
      return respOk
    } catch (error) {
      logger.error('Error in GetGeoLocationService:', { message: error.message, stack: error.stack })
      throw new APIError(error)
    }
  }
}
