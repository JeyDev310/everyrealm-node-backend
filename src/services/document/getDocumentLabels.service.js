import { APIError } from '@src/errors/api.error'
import { CacheStore, Cache } from '@src/libs/cache'
import ServiceBase from '@src/libs/serviceBase'
import { CACHE_KEYS } from '@src/utils/constants/app.constants'

export class GetDocumentLabelsService extends ServiceBase {
  async run () {
    try {
      const documentLabels = await Cache.get(CacheStore.redis, CACHE_KEYS.DOCUMENT_LABELS)
      return { documentLabels }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
