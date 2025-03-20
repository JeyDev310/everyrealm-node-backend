import { config } from './config'

export const customerioConfig = {
    siteId: config.get('customerio.siteId'),
    trackApiKey: config.get('customerio.trackApiKey'),
    appApiKey: config.get('customerio.appApiKey')
}
