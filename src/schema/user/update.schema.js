import { USER_GENDER } from '@src/utils/constants/public.constants.utils'

export const userUpdateSchema = {
  body: {
    type: 'object',
    properties: {
      address: { type: 'string', transform: ['trim'] },
      attestation: { type: 'boolean' },
      city: { type: 'string', transform: ['trim'] },
      countryCode: { type: 'string', transform: ['trim'] },
      dateOfBirth: { type: 'string', transform: ['trim'] },
      firstName: { type: 'string', transform: ['trim'] },
      gender: { enum: Object.values(USER_GENDER) },
      lastName: { type: 'string', transform: ['trim'] },
      occupation: { type: 'string', transform: ['trim'] },
      password: { type: 'string', transform: ['trim'] },
      phone: { type: 'string', transform: ['trim'] },
      phoneCode: { type: 'string', transform: ['trim'] },
      username: { type: 'string', transform: ['trim'] },
      zipCode: { type: 'string', transform: ['trim'] },
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: { user: { $ref: '#/definitions/user' } }
        },
        errors: { type: 'array' }
      }
    }
  }
}
