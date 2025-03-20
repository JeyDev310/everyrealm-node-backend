export const getLimitsSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            limits: { $ref: '#/definitions/userLimit' }
          }
        },
        errors: { type: 'array' }
      }
    }
  }
}
