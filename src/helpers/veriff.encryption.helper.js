import { veriffConfig } from '@src/configs/veriff.config'
import crypto from 'crypto'

export const createHMACSignature = (data, secretKey) => {
  const message = JSON.stringify(data)

  const computedSignature = crypto.createHmac('sha256', secretKey).update(message).digest('hex')
  return computedSignature
}

export const verifyHMACSignature = (data, signature, secretKey) => {
  const message = JSON.stringify(data)

  const computedSignature = crypto.createHmac('sha256', secretKey).update(message).digest('hex')
  return signature === computedSignature
}

export const createSignature = ({ payload }) => {
  try {
    const signature = crypto.createHmac('sha256', `${veriffConfig.secretKey}`).update(payload).digest('hex')

    return signature
  } catch (error) {
    return false
  }
}
