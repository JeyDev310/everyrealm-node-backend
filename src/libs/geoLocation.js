import { ipApiConfig } from '@src/configs'
import { logger } from '@src/utils/logger'

export async function getGeoLocation (ipAddress) {
  const ipApiApiKey = ipApiConfig.apiKey
  try {
    const geoIpLookupResponse = await fetch(`https://pro.ip-api.com/json/${ipAddress}?key=${ipApiApiKey}&fields=status,message,country,countryCode`)
    const geoIpLookupData = await geoIpLookupResponse.json()
    const isLookupSuccess = geoIpLookupData.status.toLowerCase() === "success"
    const countryCode = geoIpLookupData.countryCode
    if (!isLookupSuccess || !countryCode) throw new Error('Unable to get country code from IP address')
    return { countryCode }
  } catch (error) {
    logger.error('Error in getGeoLocation:', { message: error.message, stack: error.stack } );

    throw error
  }
}
