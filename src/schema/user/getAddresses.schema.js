export const getAddressesSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            addresses: {
              type: 'array',
              items: { $ref: '#/definitions/address' }
            }
          }
        },
        errors: { type: 'array' }
      }
    }
  }
}
