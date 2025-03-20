export const getDocumentLabelsSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            documentLabels: {
              type: 'array',
              items: { $ref: '#/definitions/documentLabel' }
            }
          }
        },
        errors: { type: 'array' }
      }
    }
  }
}
