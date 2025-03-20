import { appConfig } from '@src/configs'
import Mailjet from 'node-mailjet'

const mailjet = new Mailjet({
  apiKey: appConfig.mailjet.apiKey,
  apiSecret: appConfig.mailjet.secretKey,
  options: {
    timeout: 5000
  }
})

/**
 * @param {string} email
 * @param {string} name
 * @param {string} HTMLEmailTemplate
 * @returns {boolean}
 */
export async function sendEmail (email, name, subject, HTMLEmailTemplate) {
  try {
    const response = await mailjet.post('send', { version: 'v3.1' }).request({
      messages: [{
        From: {
          Email: appConfig.mailjet.senderEmail,
          Name: appConfig.mailjet.senderName
        },
        To: [{ 
          Email: email,
          Name: name
        }],
        Subject: subject,
        HTMLPart: HTMLEmailTemplate
      }]
    })

    return response.response.status === 200
  } catch (error) {
    throw Error(error)
  }
}
