export const addAddressSchema = {
  body: {
    type: 'object',
    properties: {
      countryCode: { type: 'string' },
      city: { type: 'string' },
      zipCode: { type: 'string' },
      address: { type: 'string' }
    },
    required: ['countryCode', 'city', 'zipCode', 'address']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: { $ref: '#/definitions/address' },
        errors: { type: 'array' }
      }
    }
  }
}
