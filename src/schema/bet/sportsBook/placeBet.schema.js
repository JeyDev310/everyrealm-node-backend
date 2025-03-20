export const placeBetSchema = {
  body: {
    type: 'object',
    properties: {
      walletId: { type: 'string' },
      stake: { type: 'number' },
      betsData: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            fixtureId: { type: 'string' },
            providerMarketId: { type: 'string' },
            providerOutcomeId: { type: 'string' },
            odds: { type: 'number' }
          },
          required: ['fixtureId', 'providerMarketId', 'providerOutcomeId', 'odds']
        }
      }
    },
    required: ['walletId', 'stake', 'betsData']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: { $ref: '#/definitions/betslip' },
        errors: { type: 'array' }
      }
    }
  }
}
