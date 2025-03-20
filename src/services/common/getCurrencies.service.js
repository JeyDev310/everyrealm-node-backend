import { APIError } from '@src/errors/api.error'
import { Cache, CacheStore } from '@src/libs/cache'
import ServiceBase from '@src/libs/serviceBase'
import { CACHE_KEYS } from '@src/utils/constants/app.constants'

export class GetCurrenciesService extends ServiceBase {
  async run () {
    try {
      const currencies = await Cache.get(CacheStore.redis, CACHE_KEYS.CURRENCIES)
      return { currencies }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
