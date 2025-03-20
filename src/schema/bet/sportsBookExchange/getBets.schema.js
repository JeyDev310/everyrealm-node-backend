export const getBetsSchema = {
  query: {
    type: 'object',
    properties: {
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
            bets: {
              type: 'array',
              items: { $ref: '#/definitions/exchangeBet' }
            }
          }
        },
        errors: { type: 'array' }
      }
    }
  }
}
