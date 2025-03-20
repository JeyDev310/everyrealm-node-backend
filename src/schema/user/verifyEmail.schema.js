export const verfiyEmailSchema = {
  query: {
    type: 'object',
    properties: {
      token: { type: 'string', transform: ['trim'] }
    },
    required: ['token']
  }
}
