
export const userAcknowledgeSchema = {
  body: {
    type: 'object',
    properties: {
      acknowledgeCode: { type: 'string', transform: ['trim'] },
      version: { type: 'string', transform: ['trim'] },
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            user: { $ref: '#/definitions/user' }
          }
        },
        errors: { type: 'array' }
      }
    }
  }
}
