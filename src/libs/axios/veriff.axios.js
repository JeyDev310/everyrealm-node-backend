import { veriffConfig } from '@src/configs/veriff.config'
import { createSignature } from '@src/helpers/veriff.encryption.helper'
import { messages } from '@src/utils/constants/error.constants'
import { Axios } from 'axios'

export class VeriffAxios extends Axios {
  constructor () {
    super({
      baseURL: veriffConfig.baseUrl,
      headers: { 
        'Content-Type': 'application/json',
        'X-AUTH-CLIENT': veriffConfig.apiKey
      }
    })
  }

  static async initVeriff (payload) {
    try {
      const Veriff = new VeriffAxios()
      const response = await Veriff.post('/v1/sessions', JSON.stringify(payload))
      const result = JSON.parse(response.data)

      if (result.status === 'success') return { success: true, result }
      if (result.status !== 'success') throw result.data?.errors
    } catch (error) {
      throw messages.SERVICE_UNAVAILABLE
    }
  }

  static async getVeriffDocuments (veriffID) {
    try {
      const Veriff = new VeriffAxios()
      Veriff.defaults.headers = {
        'Content-Type': 'application/json',
        'X-AUTH-CLIENT': veriffConfig.apiKey,
        'X-HMAC-SIGNATURE': `${createSignature({ payload: veriffID })}`
      }
      const response = await Veriff.get(`/v1/sessions/${veriffID}/media`)
      const data = JSON.parse(response.data)
      
      if (data.status !== 'success') throw data.errors
      
      return data
    } catch (error) {
      throw messages.SERVICE_UNAVAILABLE
    }
  }
}
