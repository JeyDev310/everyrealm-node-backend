import { Cache, CacheStore } from '@src/libs/cache'
import i18n from 'i18n'

async function configureCachedI18n () {
  const locales = await Cache.get(CacheStore.local, 'locales')
  const staticCatalog = await Cache.get(CacheStore.local, 'errorMessages')
  i18n.configure({
    locales,
    defaultLocale: 'en',
    syncFiles: true,
    autoReload: true,
    staticCatalog
  })
}

export { configureCachedI18n, i18n }
