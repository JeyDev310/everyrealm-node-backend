export const removeDocumentSchema = {
  body: {
    type: 'object',
    properties: {
      documentId: { type: 'string' }
    },
    required: ['documentId']
  }
}
