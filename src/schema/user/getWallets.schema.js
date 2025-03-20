export const getWalletsSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            wallets: {
              type: 'array',
              items: { $ref: '#/definitions/wallet' }
            }
          }
        },
        errors: { type: 'array' }
      }
    }
  }
}
