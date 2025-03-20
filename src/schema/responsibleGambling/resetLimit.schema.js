export const resetLimitsSchema = {
  body: {
    type: 'object',
    properties: {
      dailyDepositLimit: { type: 'boolean' },
      weeklyDepositLimit: { type: 'boolean' },
      monthlyDepositLimit: { type: 'boolean' },
      dailyBetLimit: { type: 'boolean' },
      weeklyBetLimit: { type: 'boolean' },
      monthlyBetLimit: { type: 'boolean' }
    }
  }
}
