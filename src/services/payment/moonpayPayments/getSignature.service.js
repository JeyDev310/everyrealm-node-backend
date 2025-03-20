import { config } from '@src/configs/config';
import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'
import crypto from 'crypto';

const constraints = ajv.compile({
  type: 'object',
  properties: {
    url: { type: 'string' },

  },
  required: ['url']
})

export class GetSignatureService extends ServiceBase {
  get constraints() {
    return constraints
  }

  async run() {
    try {
      // const transaction = this.context.sequelizeTransaction
      const { url } = this.args

      const signature = crypto
        .createHmac('sha256', config.get('moonpay.secretKey'))  // Use your secret key here
        .update(new URL(url).search)  // Use the query string part of the URL
        .digest('base64');  // Convert the result to a base64 string

      // const urlWithSignature = `${url}&signature=${encodeURIComponent(signature)}`;  // Add the signature to the URL

      return { signature: signature }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
