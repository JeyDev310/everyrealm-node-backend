export const fileUploadSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            path: { type: 'string' }
          }
        },
        errors: { type: 'array' }
      }
    }
  }
}
