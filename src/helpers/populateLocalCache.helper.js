import { sequelize } from '@src/database';
import { Cache, CacheStore } from '@src/libs/cache';
import { CACHE_KEYS } from '@src/utils/constants/app.constants';
import { SETTING_DATA_TYPES } from '@src/utils/constants/public.constants.utils';
import _ from 'lodash';
import { Sequelize } from "sequelize";
import { logger } from '@src/utils/logger'

function settingParser(settingDataType, value) {
  if (settingDataType === SETTING_DATA_TYPES.JSON)
    return value;

  if (settingDataType === SETTING_DATA_TYPES.PERCENTAGE)
    return Number(value);

  return global[_.startCase(settingDataType)](value);
}

async function populateTranslationCache() {
  const languageModel = sequelize.models.language;
  const languages = await languageModel.findAll({ raw: true });

  const { locales, messages } = languages.reduce((prev, language) => {
    prev.locales.push(language.code);
    prev.messages[language.code] = language.translations || {};
    return prev;
  }, {
    locales: !languages.length ? ['en'] : [],
    messages: { en: {} }
  });

  await Cache.set(CacheStore.local, 'errorMessages', messages);
  await Cache.set(CacheStore.local, 'locales', locales);
  logger.info('Info(Cache): Translation');;
}

async function populateSettingsCache() {
  const settingModel = sequelize.models.setting;
  const settings = await settingModel.findAll({ raw: true });
  const modifiedSettings = settings.reduce((prev, setting) => {
    prev[setting.key] = settingParser(setting.dataType, setting.value);
    return prev;
  }, {});

  await Cache.set(CacheStore.redis, CACHE_KEYS.SETTINGS, modifiedSettings);
  logger.info('Info(Cache): Settings');
}

async function populateCurrenciesCache() {
  const currencies = await sequelize.models.currency.findAll({
    attributes: { exclude: ['createdAt', 'updatedAt'] },
    where: { isActive: true },
    include: [{
      model: sequelize.models.cryptoToken,
    }]
  });
  await Cache.set(CacheStore.redis, CACHE_KEYS.CURRENCIES, currencies);
  logger.info('Info(Cache): Currencies');
}

async function populatePagesCache() {
  const pages = await sequelize.models.page.findAll({
    attributes: { exclude: ['createdAt', 'updatedAt'] },
    where: { isActive: true },
    raw: true
  });
  await Cache.set(CacheStore.redis, CACHE_KEYS.PAGES, pages);
  logger.info('Info(Cache): Pages');
}

async function populateLanguagesCache() {
  const languages = await sequelize.models.language.findAll({
    attributes: { exclude: ['createdAt', 'updatedAt'] },
    where: { isActive: true },
    raw: true
  });
  await Cache.set(CacheStore.redis, CACHE_KEYS.LANGUAGES, languages);
  logger.info('Info(Cache): Languages');
}

async function populateBannerCache() {
  const banners = await sequelize.models.banner.findAll({
    attributes: { exclude: ['createdAt', 'updatedAt'] },
    raw: true
  });
  await Cache.set(CacheStore.redis, CACHE_KEYS.BANNERS, banners);
  logger.info('Info(Cache): Banners');
}

async function populateCountryCache() {
  const countries = await sequelize.models.country.findAll({
    attributes: { exclude: ['createdAt', 'updatedAt'] },
    where: { isActive: true },
    raw: true
  });
  await Cache.set(CacheStore.redis, CACHE_KEYS.COUNTRIES, countries);
  logger.info('Info(Cache): Countries');
}

async function populateDocumentLabelCache() {
  const documentLabels = await sequelize.models.documentLabel.findAll({
    attributes: { exclude: ['createdAt', 'updatedAt'] },
    raw: true
  });
  await Cache.set(CacheStore.redis, CACHE_KEYS.DOCUMENT_LABELS, documentLabels);
  logger.info('Info(Cache): Document Labels');
}

export async function populateCache() {
  await populateSettingsCache();
  await populateLanguagesCache();
  await populateCurrenciesCache();
  await populateTranslationCache();
  await populatePagesCache();
  await populateBannerCache();
  await populateCountryCache();
  await populateDocumentLabelCache();
}
