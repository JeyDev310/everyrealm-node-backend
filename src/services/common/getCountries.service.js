import { APIError } from '@src/errors/api.error'
import { CacheStore, Cache } from '@src/libs/cache'
import ServiceBase from '@src/libs/serviceBase'
import { CACHE_KEYS } from '@src/utils/constants/app.constants'

export class GetCountriesService extends ServiceBase {
  async run () {
    try {
      const countries = await Cache.get(CacheStore.redis, CACHE_KEYS.COUNTRIES)
      return { countries }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
