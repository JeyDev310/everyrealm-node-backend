import { config } from './config'

export const veriffConfig = {
    baseUrl: config.get('veriff.baseUrl'),
    secretKey: config.get('veriff.secretKey'),
    apiKey: config.get('veriff.apiKey')
}
