export const getCurrenciesSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            currencies: {
              type: 'object',
              properties: {
                cryptoTokens: { type: 'object' }
              }
            }
          }
        },
        errors: { type: 'array' }
      }
    }
  }
}
