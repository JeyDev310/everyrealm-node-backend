export const removeAddressSchema = {
  body: {
    type: 'object',
    properties: {
      addressId: { type: 'string' }
    },
    required: ['addressId']
  }
}
