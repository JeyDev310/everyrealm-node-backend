export const WEBHOOK_RESPONSE = {
  ADDRESS_NOT_FOUND: {
    status: true,
    statusCode: 400,
    message: 'Address do not exists'
  },
  USER_NOT_FOUND: {
    status: true,
    statusCode: 400,
    message: 'User do not exists'
  },
  IPN_ALREADY_PROCESSED: {
    status: true,
    statusCode: 200,
    message: 'IPN Already received successfully'
  },
  IPN_PROCESSED: {
    status: true,
    statusCode: 202,
    message: 'IPN received successfully'
  },
  PAYMENT_NOT_FOUND: {
    status: true,
    statusCode: 202,
    message: 'Payment Id not found.'
  },
  SIGNATURE_NOT_FOUND: {
    status: true,
    statusCode: 400,
    message: 'Moonpay Signature webhook not found.'
  },
  INVALID_SIGNATURE: {
    status: true,
    statusCode: 400,
    message: 'Moonpay Signature format invalid.'
  }

}

export const COINPAYMENT_DEPOSIT = ['UtxoExternalReceive', 'InternalReceive', 'AccountBasedExternalTokenReceive', 'AccountBasedExternalReceive', 'SameUserReceive']

export const COINPAYMENT_WITHDRAW = ['ExternalSpend', 'AccountBasedTokenSpend', 'InternalSpend']
