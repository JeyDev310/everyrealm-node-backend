export const userLoginSchema = {
  body: {
    type: 'object',
    properties: {
      // email: { type: 'string', transform: ['trim', 'toLowerCase'], format: 'email' },
      privyId: { type: 'string', transform: ['trim']},
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            user: { type: 'object' },
          }
        },
        errors: { type: 'array' }
      }
    }
  }
}

export const userLogoutSchema = {
  body: {
    type: 'object',
    properties: {
      // email: { type: 'string', transform: ['trim', 'toLowerCase'], format: 'email' },
      privyId: { type: 'string', transform: ['trim']}
    }
  }
}
