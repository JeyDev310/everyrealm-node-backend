import { BET_SLIP_SETTLEMENT_STATUS } from '@src/utils/constants/sportbookManagement.constants'

export const getBetsSchema = {
  query: {
    type: 'object',
    properties: {
      startDate: { type: 'string' },
      endDate: { type: 'string' },
      settlementStatus: { enum: Object.values(BET_SLIP_SETTLEMENT_STATUS) },
      page: { type: 'number', minimum: 1 },
      perPage: { type: 'string' }
    },
    required: ['page', 'perPage']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            betslips: {
              type: 'array',
              items: { $ref: '#/definitions/betslip' }
            },
            totalPages: { type: 'number' },
            page: { type: 'number' }
          }
        },
        errors: { type: 'array' }
      }
    }
  }
}
