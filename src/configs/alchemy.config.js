import { config } from './config'

export const alchemyConfig = {
    everyTokenRPCUrl: config.get('alchemy.everyTokenRPCUrl'),
    everyETHAddress: config.get('alchemy.everyETHAddress'),
    everyTokenBaseUrl: config.get('alchemy.everyTokenBaseUrl'),
    everyBaseAddress: config.get('alchemy.everyBaseAddress'),
    cacheExpiresIn: (config.get('alchemy.cacheExpiresIn') ?? 5) * 60 * 1000
}
