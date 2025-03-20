import { xtremePush } from '@src/configs'
import { messages } from '@src/utils/constants/error.constants'
import { Axios } from 'axios'

export class XtremePushAxios extends Axios {
  constructor () {
    super({
      baseURL: xtremePush.endpoint,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  /**
   *
   * @param {String} campaignName
   * @returns
   */
  static async getCampaignId (campaignName) {
    try {
      const XtremePush = new XtremePushAxios()
      const response = await XtremePush.post('/list/campaign', JSON.stringify({
        apptoken: xtremePush.token,
        limit: 1,
        offset: 0,
        condition: [
          ['active', '=', 1],
          ['trigger', '=', 3],
          ['title', '=', campaignName]
        ]
      })
      )
      const campaigns = JSON.parse(response.data)
      if (response.status === 200) return campaigns.data[0].id
      if (response.status !== 200) throw response.data?.errors
    } catch (error) {
      throw messages.SERVICE_UNAVAILABLE
    }
  }

  static async sendEmailByXtremepush (campaignId, firstName, email, userId) {
    try {
      const XtremePush = new XtremePushAxios()
      const response = await XtremePush.post('/execute/campaign', JSON.stringify({
        apptoken: xtremePush.token,
        target_by: 'user_id',
        target: [userId],
        id: campaignId,
        params: {
          first_name: firstName,
          email_content: email
        }
      })
      )
      const result = JSON.parse(response.data)
      if (response.status === 200) return { success: true, result }
      if (response.status !== 200) throw result.data?.errors
    } catch (error) {
      throw messages.SERVICE_UNAVAILABLE
    }
  }

  static async sendSMSByXtremepush (campaignId, message, userId) {
    try {
      const XtremePush = new XtremePushAxios()
      const response = await XtremePush.post('/execute/campaign', JSON.stringify({
        apptoken: xtremePush.token,
        target_by: 'user_id',
        target: [userId],
        id: campaignId,
        params: {
          Message: message
        }
      })
      )
      const result = JSON.parse(response.data)
      if (response.status === 200) return { success: true, result }
      if (response.status !== 200) throw result.data?.errors
    } catch (error) {
      throw messages.SERVICE_UNAVAILABLE
    }
  }

  static async createXtremepushUserProfile (details) {
    try {
      const columns = ['user_id', 'email', 'mobile_number', 'first_name', 'last_name', 'dob', 'gender', 'user_name', 'last_logged_in_Ip']
      const XtremePush = new XtremePushAxios()
      const response = await XtremePush.post('/import/profile', JSON.stringify({
        apptoken: xtremePush.token,
        rows: [[details.id, details.email, details.phone, details.firstName, details.lastName, details.dateOfBirth, details.gender, details.username, details.lastLoggedInIp]],
        columns: columns,
        async: true
      })
      )
      const result = JSON.parse(response.data)
      if (response.status === 200 || response.status === 202) return { success: true, result }
      if (response.status !== 200 || response.status === 200) throw result.data?.errors
    } catch (error) {
      throw messages.SERVICE_UNAVAILABLE
    }
  }

  static async updateXtremepushUserProfile (columns, rows) {
    try {
      const XtremePush = new XtremePushAxios()
      const response = await XtremePush.post('/import/profile', JSON.stringify({
        apptoken: xtremePush.token,
        rows: [rows],
        columns: columns,
        async: true
      })
      )
      const result = JSON.parse(response.data)
      if (response.status === 200 || response.status === 202) return { success: true, result }
      if (response.status !== 200 || response.status === 200) throw result.data?.errors
    } catch (error) {
      throw messages.SERVICE_UNAVAILABLE
    }
  }
}
