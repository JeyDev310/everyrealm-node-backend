import { config } from './config'

export const originalConfig = {
  crashURL: config.get('original.crashUrl'),
  plinkoUrl: config.get('original.plinkoUrl'),
  blshUrl: config.get('original.blshUrl'),
  accessToken: config.get('original.accessToken'),
}
