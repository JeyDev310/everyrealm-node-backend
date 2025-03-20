import { uniqueUsernameGenerator } from 'unique-username-generator'
export * from './error.utils'

/**
 * @param {import('express').Request} request
 * @returns {string} ipAddress of the request
 */
export function getIp (request) {
  const ip = request.headers['x-forwarded-for']?.split(',')[0] || request.ip || request.connection.remoteAddress
  return ip === '::1' || ip.includes('192.168') ? '1.1.1.1' : ip.includes('ffff') ? ip.split('::ffff:')[1] : ip
}

export const getEmailFromPrivy = (privyUser) => {
  if (privyUser?.email) {
    if (privyUser?.email?.address) return privyUser?.email?.address
    else return null
  } else if(privyUser?.discord) {
    return privyUser.discord.email || null
  } else if (privyUser?.google) {
    return privyUser.google.email || null
  } else {
    return null
  }
}

const firstCharacters = [
  'Lucky',
  'Swift',
  'Bold',
  'Flashy',
  'Stealthy',
  'Golden',
  'Daring',
  'Fearless',
  'Brave',
  'Clever',
  'Mighty',
  'Brilliant',
  'Quick',
  'Sly',
  'Slick'
]

const secondCharacters = [
  'Player',
  'Bettor',
  'Joker',
  'Roller',
  'Token',
  'Stake',
  'Gambler',
  'Spinner',
  'Star',
  'Highroller',
  'Winner',
  'King',
  'Queen',
  'Jack',
  'Ace'
]

export const generateUsername = () => {
  const config = {
    dictionaries: [firstCharacters, secondCharacters],
    separator: '',
    randomDigits: 3,
    style: 'capital'
  }

  return uniqueUsernameGenerator(config)
}
