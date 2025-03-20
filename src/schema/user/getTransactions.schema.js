import { LEDGER_PURPOSE } from '@src/utils/constants/public.constants.utils'

export const getTransactionsSchema = {
  query: {
    type: 'object',
    properties: {
      startDate: { type: 'string' },
      endDate: { type: 'string' },
      purpose: { enum: Object.values(LEDGER_PURPOSE) },
      currencyId: { type: 'string', default: '1' },
      page: { type: 'number', default: 1, minimum: 1 },
      perPage: { type: 'string', default: 10 }
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
            transactions: { type: 'array', items: { $ref: '#/definitions/transaction' } },
            totalPages: { type: 'number' },
            page: { type: 'number' }
          }
        },
        errors: { type: 'array' }
      }
    }
  }
}
