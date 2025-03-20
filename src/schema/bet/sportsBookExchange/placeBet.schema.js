import { EXCHANGE_BET_TYPES } from '@src/utils/constants/sportbookManagement.constants'

export const placeBetSchema = {
  body: {
    type: 'object',
    properties: {
      walletId: { type: 'string' },
      fixtureId: { type: 'string' },
      providerMarketId: { type: 'string' },
      providerOutcomeId: { type: 'string' },
      betType: { enum: Object.values(EXCHANGE_BET_TYPES) },
      stake: { type: 'number' },
      odds: { type: 'number' }
    },
    required: ['walletId', 'fixtureId', 'providerMarketId', 'providerOutcomeId', 'betType', 'stake', 'odds']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: { $ref: '#/definitions/exchangeBet' },
        errors: { type: 'array' }
      }
    }
  }
}
