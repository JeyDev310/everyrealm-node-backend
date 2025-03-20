export const getDocumentsSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            documents: {
              type: 'array',
              items: { $ref: '#/definitions/document' }
            }
          }
        },
        errors: { type: 'array' }
      }
    }
  }
}
