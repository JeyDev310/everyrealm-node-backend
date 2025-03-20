import { dayjs } from '@src/libs/dayjs'
import { NumberPrecision } from '@src/libs/numberPrecision'
import { USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES } from '@src/utils/constants/public.constants.utils'
import { Op } from 'sequelize'

export function alignDatabaseDateFilter(startDate, endDate) {
  let filterObj = {}
  if (startDate && endDate)
    filterObj = { [Op.and]: [{ [Op.gte]: dayjs(startDate).format() }, { [Op.lte]: dayjs(endDate).endOf('day').format() }] }
  else if (endDate)
    filterObj = { [Op.gte]: dayjs(endDate).endOf('day').format() }
  else if (startDate)
    filterObj = { [Op.gte]: dayjs(startDate).format() }
  return filterObj
}

/**
 * @param {string} key
 * @param {string?} previousExpireAt
 * @returns
 */
export function getExpireAt(key, previousExpireAt = dayjs().format()) {
  const timeUnit = key.includes('daily') ? 'd' : key.includes('weekly') ? 'w' : key.includes('monthly') ? 'M' : null
  if (!timeUnit)
    throw Error('Invalid time unit')

  return dayjs().add(dayjs().diff(previousExpireAt, timeUnit) + 1, timeUnit).format()
}

/**
 * @param {string} userId
 * @param {string?} amount
 * @returns
 */
export async function checkBetLimit(userId, amount, context) {
  let isLimitExceed = false
  const transaction = context.sequelizeTransaction
  const limits = await context.sequelize.models.userLimit.findAll({
    where: {
      userId,
      key: {
        [Op.in]: [
          USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.DAILY_BET_LIMIT,
          USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.WEEKLY_BET_LIMIT,
          USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.MONTHLY_BET_LIMIT
        ]
      }
    },
    transaction
  })

  for (const limit of limits) {
    if (dayjs().isAfter(limit.expireAt)) {
      limit.currentValue = 0
      limit.expireAt = getExpireAt(limit.key, limit.expireAt)
    }
    const totalLimitAmount = NumberPrecision.plus(limit.currentValue, amount)
    if (+limit.value && totalLimitAmount > limit.value)
      isLimitExceed = true

    limit.currentValue = totalLimitAmount
    await limit.save({ transaction })
  }

  return isLimitExceed
}


/**
 * @param {string} userId
 * @returns
 */
export async function checkDepositLimit(userId, context) {
  let isLimitExceed = false
  const transaction = context.sequelizeTransaction
  const limits = await context.sequelize.models.userLimit.findAll({
    where: {
      userId,
      key: {
        [Op.in]: [
          USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.DAILY_DEPOSIT_LIMIT,
          USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.WEEKLY_DEPOSIT_LIMIT,
          USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.MONTHLY_DEPOSIT_LIMIT
        ]
      }
    },
    transaction
  })

  for (const limit of limits) {
    if (dayjs().isAfter(limit.expireAt)) {
      limit.currentValue = 0
      limit.expireAt = getExpireAt(limit.key, limit.expireAt)
    }

    if (+limit.value && limit.currentValue && +limit.currentValue > +limit.value)
      isLimitExceed = true
    await limit.save({ transaction })
  }

  return isLimitExceed
}


export async function updateDepositLimit(userId, amount, context) {
  const transaction = context.sequelizeTransaction
  const limits = await context.sequelize.models.userLimit.findAll({
    where: {
      userId: userId,
      key: {
        [Op.in]: [
          USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.DAILY_DEPOSIT_LIMIT,
          USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.WEEKLY_DEPOSIT_LIMIT,
          USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.MONTHLY_DEPOSIT_LIMIT
        ]
      }
    },
    transaction
  })

  for (const limit of limits) {
    limit.currentValue = NumberPrecision.plus(limit.currentValue, amount)
    await limit.save({ transaction })
  }

  return
}

export const roundUpBalance = (number, precision = 5) => {
  const decimalIndex = number.toString().indexOf('.')
  if (decimalIndex === -1) {
    return number.toString() + '.00000'
  }

  const roundedNumber = parseFloat(number.toString().slice(0, decimalIndex + precision + 1))
  let result = roundedNumber.toString()
  const currentDecimalIndex = result.indexOf('.')
  if (currentDecimalIndex === -1) {
    return parseFloat(result + '.00000');
  }

  const decimalPart = result.slice(currentDecimalIndex + 1)
  if (decimalPart.length < precision) {
    result += '0'.repeat(precision - decimalPart.length)
  }
  return parseFloat(result)
}
