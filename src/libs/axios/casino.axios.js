import { casinoGaming } from '@src/configs'
import { Axios } from 'axios'

export class CasinoAPIs {
  static axios = new Axios({ baseURL: casinoGaming.casinoUrl })

  static async getAllProviders () {
    const result = await this.axios.get('providersList')
    return JSON.parse(result.data)
  }

  static async getAllGames () {
    const result = await this.axios.get('gameList')
    return JSON.parse(result.data).games
  }
}
