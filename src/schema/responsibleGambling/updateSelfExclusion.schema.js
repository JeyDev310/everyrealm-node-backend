import { SELF_EXCLUSION_TYPES } from '@src/utils/constants/public.constants.utils'

export const updateSelfExclusionSchema = {
  body: {
    type: 'object',
    properties: {
      expireIn: { type: 'string' },
      selfExclusionType: { enum: Object.values(SELF_EXCLUSION_TYPES) }
    },
    required: ['selfExclusionType'],
    anyOf: [{
      properties: {
        expireIn: { type: 'string' },
        selfExclusionType: { const: SELF_EXCLUSION_TYPES.TEMPORARY }
      },
      required: ['expireIn']
    }, {
      properties: {
        selfExclusionType: { const: SELF_EXCLUSION_TYPES.PERMANENT }
      }
    }]
  }
}
