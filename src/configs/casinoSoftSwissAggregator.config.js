import { config } from './config'

export const casinoSoftSwissAggregatorConfig = {
  gcpUrl: config.get('casino_soft_swiss_aggregator.gcpUrl'),
  accessToken: config.get('casino_soft_swiss_aggregator.accessToken'),
  casinoId: config.get('casino_soft_swiss_aggregator.casinoId')
}
