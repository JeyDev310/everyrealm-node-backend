export const verfiyForgotPasswordSchema = {
  body: {
    type: 'object',
    properties: {
      token: { type: 'string', transform: ['trim'] },
      newPassword: { type: 'string', transform: ['trim'] },
      repeatPassword: { type: 'string', transform: ['trim'] }
    },
    required: ['token', 'newPassword', 'repeatPassword']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: { $ref: '#/definitions/user' },
        errors: { type: 'array' }
      }
    }
  }
}
