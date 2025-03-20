import { config } from '../config'

export const casinoGaming = {
  authKey: config.get('casinoGame.authKey'),
  casinoUrl: config.get('casinoGame.url'),
  casinoTokenEx: config.get('casinoGame.casinoTokenEx')
}
