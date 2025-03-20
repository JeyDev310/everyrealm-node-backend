import { config } from './config'

export const maxmindConfig = {
  geoliteUrl: config.get('maxmind.geoliteUrl'),
  minfraudUrl: config.get('maxmind.minfraudUrl'),
  accountId: config.get('maxmind.accountId'),
  licenseKey: config.get('maxmind.licenseKey'),
  whitelistedIps: config.get('maxmind.whitelistedIps')
}
