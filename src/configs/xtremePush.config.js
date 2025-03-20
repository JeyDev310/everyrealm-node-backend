import { config } from './config'

export const xtremePush = {
  endpoint: config.get('xtremePush.endpoint'),
  token: config.get('xtremePush.token')
}
