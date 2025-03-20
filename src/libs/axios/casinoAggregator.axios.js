import { casinoAggregatorConfig } from '@src/configs'
import { messages } from '@src/utils/constants/error.constants'
import { Axios } from 'axios'

export class CasinoAggregatorAxios extends Axios {
  constructor () {
    super({
      baseURL: `${casinoAggregatorConfig.endpoint}/api/global`,
      auth: {
        username: casinoAggregatorConfig.basicAuth.username,
        password: casinoAggregatorConfig.basicAuth.password
      },
      headers: { 'Content-Type': 'application/json' }
    })
  }

  /**
   * @param {{
   *  demo: boolean,
   *  userId: string,
   *  ipAddress: string,
   *  gameId: string,
   *  aggregatorId: string,
   *  countryCode: string
   * }} params
   * @returns
   */
  static async getLaunchGameUrl (params) {
    try {
      const userBackendAxios = new CasinoAggregatorAxios()
      const response = await userBackendAxios.get('/get-launch-game-url', { params })
      const data = JSON.parse(response.data)
      if (response.status !== 200) throw data.errors

      return data?.data
    } catch (error) {
      throw messages.SERVICE_UNAVAILABLE
    }
  }
}
