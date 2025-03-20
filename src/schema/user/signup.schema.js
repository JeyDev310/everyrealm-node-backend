import { USER_GENDER } from '@src/utils/constants/public.constants.utils'

export const userSignupSchema = {
  body: {
    type: 'object',
    properties: {
      email: { type: 'string', transform: ['trim', 'toLowerCase'] },
      phone: { type: 'string', transform: ['trim'] },
      username: { type: 'string', transform: ['trim'] },
      firstName: { type: 'string', transform: ['trim'] },
      lastName: { type: 'string', transform: ['trim'] },
      phoneCode: { type: 'string', transform: ['trim'] },
      dateOfBirth: { type: 'string', transform: ['trim'] },
      password: { type: 'string', transform: ['trim'] },
      gender: { enum: Object.values(USER_GENDER) },
      referralCode: { type: 'string', transform: ['trim'] }
    },
    required: ['email', 'username', 'password']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            user: { $ref: '#/definitions/user' },
            accessToken: { type: 'string' },
            emailVerificationSent: { type: 'boolean' },
            phoneVerificationSent: { type: 'boolean' }
          }
        },
        errors: { type: 'array' }
      }
    }
  }
}
