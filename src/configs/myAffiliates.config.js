import { config } from './config'

export const myAffiliatesConfig = {
    authUsername: config.get('myAffiliates.authUsername'),
    authPassword: config.get('myAffiliates.authPassword'),
    endpoint: config.get('myAffiliates.endpoint'),
}
