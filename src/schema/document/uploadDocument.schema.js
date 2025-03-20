export const uploadDocumentSchema = {
  body: {
    type: 'object',
    properties: {
      labelId: { type: 'string' }
    },
    required: ['labelId']
  }
}
