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
