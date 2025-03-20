export const depositSchema = {
  body: {
    type: 'object',
    properties: {
      amount: { type: 'number' },
      walletId: { type: 'number' }
    },
    required: ['amount', 'walletId']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: { type: 'object' },
        errors: { type: 'array' }
      }
    }
  }
}
