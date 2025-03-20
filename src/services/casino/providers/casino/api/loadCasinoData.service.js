import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import { CasinoAPIs } from '@src/libs/axios/casino.axios'
import ServiceBase from '@src/libs/serviceBase'
import { AGGREGATORS, CATEGORIES, DEVICE_TYPE_MAP, DEFAULT_CATEGORIES } from '@src/utils/constants/casinoManagement.constants'
/**
 * @typedef {Object} Language
 * @property {string} id
 * @property {string} code
 */
const constraints = ajv.compile({
  type: 'object',
  properties: {
    languages: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          code: { type: 'string' }
        },
        required: ['id', 'code']
      }
    }
  },
  required: ['languages']
})

export class LoadCasinoDataService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    /** @type {Language[]} */
    const languages = this.args.languages
    const transaction = this.context.sequelizeTransaction

    try {
      const aggregator = await this.createAggregator(AGGREGATORS.CASINO.id, AGGREGATORS.CASINO.name, languages, transaction)

      const providers = await CasinoAPIs.getAllProviders()
      const providerIdsMap = await this.createProviders(aggregator.id, providers, languages, transaction)

      const categoryIdsMap = await this.createCategories(DEFAULT_CATEGORIES, languages, transaction)

      const games = await CasinoAPIs.getAllGames()
      await this.createGames(categoryIdsMap, providerIdsMap, games, languages, transaction)

      return { success: true }
    } catch (error) {
      throw new APIError(error)
    }
  }

  /**
   * @param {Language[]} languages
   * @param {string} defaultName
   */
  getNames (languages, defaultName) {
    return languages.reduce((prev, language) => {
      prev[language.code] = defaultName
      return prev
    }, {})
  }

  /**
   * @param {string} uniqueId
   * @param {string} name
   * @param {Language[]} languages
   * @param {import ('sequelize').Transaction} transaction
   * @returns {{ id: string }}
   */
  async createAggregator (uniqueId, name, languages, transaction) {
    const aggregatorNames = this.getNames(languages, name)
    const [aggregator] = await this.context.sequelize.models.casinoAggregator.findOrCreate({
      defaults: { name: aggregatorNames, uniqueId },
      where: { uniqueId },
      returning: ['id'],
      transaction,
      logging: true
    })

    return aggregator
  }

  /**
   * @param {string} aggregatorId
   * @param {{ id: number, name: string, logo: string, category: number }[]} providers
   * @param {Language[]} languages
   * @param {import ('sequelize').Transaction} transaction
   * @returns {Object.<string, string>}
   */
  async createProviders (aggregatorId, providers, languages, transaction) {
    const updatedProviders = await this.context.sequelize.models.casinoProvider.bulkCreate(providers.map(provider => {
      return {
        casinoAggregatorId: aggregatorId,
        uniqueId: provider.id,
        name: this.getNames(languages, provider.name),
        iconUrl: provider.logo
      }
    }), {
      updateOnDuplicate: ['name', 'iconUrl'],
      transaction,
      logging: true
    })

    return updatedProviders.reduce((prev, updatedProvider) => {
      prev[updatedProvider.uniqueId] = updatedProvider.id
      return prev
    }, {})
  }

  /**
   * @param {typeof DEFAULT_CATEGORIES[string]} categories
   * @param {Language[]} languages
   * @param {import ('sequelize').Transaction} transaction
   * @returns {Object.<string, string>}
   */
  async createCategories (categories, languages, transaction) {
    const updatedCategories = await this.context.sequelize.models.casinoCategory.bulkCreate(categories.map(category => {
      return {
        uniqueId: category.id,
        name: this.getNames(languages, category.name)
      }
    }), {
      returning: ['id', 'uniqueId'],
      updateOnDuplicate: ['updatedAt'],
      transaction,
      logging: true
    })

    return updatedCategories.reduce((prev, category) => {
      prev[category.uniqueId] = category.id
      return prev
    }, {})
  }

  /**
   * @param {Object.<string, string>} categoryIdsMap
   * @param {Object.<string, string>} providerIdsMap
   * @param {{ id: string, name: string, basicRTP: number, device: string, typeId: string, providerId: string, img_provider: string, img: string, demo: boolean }[]} games
   * @param {Language[]} languages
   * @param {import ('sequelize').Transaction} transaction
   * @returns {Boolean}
   */
  async createGames (categoryIdsMap, providerIdsMap, games, languages, transaction) {
    await this.context.sequelize.models.casinoGame.bulkCreate(games.reduce((prev, game) => {
      const providerId = providerIdsMap[game.providerId]
      if (!providerId) return prev
      const categoryId = categoryIdsMap[game.typeId] ? categoryIdsMap[game.typeId] : categoryIdsMap[CATEGORIES.Live]
      if (!categoryId) return prev

      prev.push({
        casinoProviderId: providerId,
        casinoCategoryId: categoryId,
        uniqueId: game.id,
        name: this.getNames(languages, game.name),
        returnToPlayer: game.basicRTP,
        wageringContribution: 0,
        iconUrl: game.img_vertical ? game.img_vertical : game.img,
        devices: DEVICE_TYPE_MAP[game.device],
        demoAvailable: game.demo
      })
      return prev
    }, []), {
      updateOnDuplicate: ['name', 'iconUrl'],
      transaction,
      logging: true
    })

    return true
  }
}
