import { APIError } from '@src/errors/api.error'
import ServiceBase from '@src/libs/serviceBase'
import ajv from 'src/libs/ajv'
import CryptoJS from 'crypto-js'
import encode from 'crypto-js/enc-hex'
import axios from 'axios'
import { casinoSoftSwissAggregatorConfig } from '@src/configs/casinoSoftSwissAggregator.config'
import { logger } from '@src/utils/logger'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    issueId: { type: 'string' }
  },
  required: ['issueId']
})

export class CancelFreespinService extends ServiceBase {
  get constraints () {
    return constraints
  }
  async run () {
    const AUTH_TOKEN = `${casinoSoftSwissAggregatorConfig.accessToken}`
    try{
        const parameters = {
            casino_id: `${casinoSoftSwissAggregatorConfig.casinoId}`,
            issue_id: `${this.args.issueId}`
        }
        const token = CryptoJS.HmacSHA256(JSON.stringify(parameters), AUTH_TOKEN).toString(encode)
        let response = await axios.post(`${casinoSoftSwissAggregatorConfig.gcpUrl}/freespins/cancel`, parameters, {
            headers: { 'X-REQUEST-SIGN': token }
        })
        return response
    }catch(error){
        logger.error('Error in CancelFreespinService:',  { message: error.message, stack: error.stack })
        throw new APIError(error)
    }
  }
}
