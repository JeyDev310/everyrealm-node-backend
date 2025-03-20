export const updateLimitsSchema = {
  body: {
    type: 'object',
    properties: {
      dailyDepositLimit: { type: 'number' },
      weeklyDepositLimit: { type: 'number' },
      monthlyDepositLimit: { type: 'number' },
      dailyBetLimit: { type: 'number' },
      weeklyBetLimit: { type: 'number' },
      monthlyBetLimit: { type: 'number' }
    }
  }
}
