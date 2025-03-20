export const getPagesSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            pages: {
              type: 'array',
              items: { $ref: '#/definitions/page' }
            }
          }
        },
        errors: { type: 'array' }
      }
    }
  }
}
