export const customerioUnsubscribeSchema = {
  query: {
    type: 'object',
    properties: {
      userId: { type: 'string', transform: ['trim'] }
    },
    required: ['userId']
  }
}
