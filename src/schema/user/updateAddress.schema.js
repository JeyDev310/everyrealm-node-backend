export const updateAddressSchema = {
  body: {
    type: 'object',
    properties: {
      addressId: { type: 'string' },
      countryCode: { type: 'string' },
      city: { type: 'string' },
      zipCode: { type: 'string' },
      address: { type: 'string' }
    },
    required: ['addressId']
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
