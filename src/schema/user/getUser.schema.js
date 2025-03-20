export const getUserSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            user: { type: 'object' }
          }
        },
        errors: { type: 'array' }
      }
    }
  }
}
