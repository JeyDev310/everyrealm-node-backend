export const initGameSchema = {
  body: {
    type: 'object',
    properties: {
      gameId: { type: 'number' },
      demo: { type: 'string' },
      aggregator: { type: 'string' },
      tournamentId: { type: 'number' }
    },
    required: ['gameId', 'aggregator']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'object'
        },
        errors: { type: 'array' }
      }
    }
  }
}
