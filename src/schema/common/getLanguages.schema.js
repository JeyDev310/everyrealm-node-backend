export const getLanguagesSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            languages: {
              type: 'array',
              items: { $ref: '#/definitions/language' }
            }
          }
        },
        errors: { type: 'array' }
      }
    }
  }
}
