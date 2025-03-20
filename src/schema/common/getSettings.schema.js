export const getSettingsSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        data: { type: 'object' },
        errors: { type: 'array' }
      }
    }
  }
}
