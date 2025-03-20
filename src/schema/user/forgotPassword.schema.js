export const userForgotPasswordSchema = {
  body: {
    type: 'object',
    properties: {
      email: { type: 'string', transform: ['trim', 'toLowerCase'] }
    },
    required: ['email']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            emailVerificationSent: { type: 'boolean' }
          }
        },
        errors: { type: 'array' }
      }
    }
  }
}
