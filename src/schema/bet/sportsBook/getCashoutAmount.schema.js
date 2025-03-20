
export const getCashoutSchema = {
  query: {
    type: 'object',
    properties: {
      betslipId: { type: 'number' }
    },
    required: ['betslipId']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            betslipId: { type: 'number' },
            cashoutAmount: { type: 'number' }
          }
        },
        errors: { type: 'array' }
      }
    }
  }
}
