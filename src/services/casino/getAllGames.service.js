import { APIError } from "@src/errors/api.error";
import ajv from "@src/libs/ajv";
import ServiceBase from "@src/libs/serviceBase";
import { GetIpLocationService } from "@src/services/common/getIpLocation.service";
import { Op, Sequelize } from "sequelize";
import { logger } from '@src/utils/logger'

const constraints = ajv.compile({
  type: "object",
  properties: {
    categories: { type: "string", default: "[]" },
    deviceType: { type: "string" },
    ipAddress: { type: "string" },
    limit: { type: "number", minimum: 10, default: 10 },
    name: { type: "string" },
    pageNo: { type: "number", minimum: 1, default: 1 },
    providers: { type: "string", default: "[]" },
    rating: { type: "string", default: "[]" },
    search: { type: "string" },
    userId: { type: "string" },
  },
});

export class GetAllCasinoGamesService extends ServiceBase {
  get constraints() {
    return constraints;
  }

  async run() {
    const { categories: categoriesStr, deviceType, ipAddress, limit, name, pageNo, providers: providersStr, rating: ratingStr, userId } = this.args;
    logger.info('Start(GetAllCasinoGamesService):', { categoriesStr, deviceType, ipAddress, limit, name, pageNo, providersStr, ratingStr, userId });
    const rating = JSON.parse(ratingStr);
    const providers = JSON.parse(providersStr);
    const categories = JSON.parse(categoriesStr);

    try {
      const { result: country } = await GetIpLocationService.execute({ ipAddress }, this.context);

      const gameWhereObj = { isActive: true };
      if (name)
        gameWhereObj.name = { EN: { [Op.iLike]: `%${name}%` } };
      if (deviceType)
        gameWhereObj.devices = { [Op.contains]: [deviceType] };
      if (rating?.length)
        gameWhereObj.volatilityRating = { [Op.in]: rating };

      const providerWhereObj = { isActive: true };
      if (providers.length)
        providerWhereObj.id = { [Op.in]: providers };

      const categoryWhereObj = { isActive: true };
      if (categories.length)
        categoryWhereObj.id = { [Op.in]: categories };

      let casinoGames = {};
      if (!categories.length) {
        const isFavorite = userId
          ? Sequelize.literal(`(CASE WHEN EXISTS(SELECT id FROM favorite_games WHERE user_id=${userId} AND casino_game_id="casinoGame"."id") THEN true ELSE false END)`)
          : Sequelize.literal("false");
        casinoGames = await this.context.sequelize.models.casinoGame.findAndCountAll({
          subQuery: false,
          attributes: ["id", "name", "iconUrl", "casinoProviderId", "returnToPlayer", "uniqueId", "demoAvailable", "devices", "isActive", "isPlayable", "restrictedCountries", [isFavorite, "isFavorite"], "createdAt"],
          where: { ...gameWhereObj, [Op.not]: { restrictedCountries: { [Op.contains]: country.code } } },
          include: [{
            attributes: ["id", "name", "iconUrl"],
            model: this.context.sequelize.models.casinoProvider,
            where: { ...providerWhereObj, [Op.not]: { restrictedCountries: { [Op.contains]: country.id } } },
            required: true,
            include: [{
              attributes: ["id", "name"],
              model: this.context.sequelize.models.casinoAggregator,
              where: { isActive: true },
              required: true,
            }],
          }],
          order: [["createdAt", "DESC"]],
          limit,
          offset: (pageNo - 1) * limit,
        });
      } else {
        const isFavorite = userId
          ? Sequelize.literal(`(CASE WHEN EXISTS(SELECT id, casino_game_id FROM favorite_games WHERE user_id=${userId} AND casino_game_id="casinoGameCategory"."casino_game_id") THEN true ELSE false END)`)
          : Sequelize.literal("false")
        const casinoGameCategories = await this.context.sequelize.models.casinoGameCategory.findAndCountAll({
          subQuery: false,
          attributes: { exclude: ["createdAt", "updatedAt"] },
          include: [
            {
              attributes: ["id", "name", "iconUrl", "casinoProviderId", "returnToPlayer", "uniqueId", "isActive", "isPlayable", "demoAvailable", "devices", "restrictedCountries", [isFavorite, "isFavorite"]],
              model: this.context.sequelize.models.casinoGame,
              where: { ...gameWhereObj, [Op.not]: { restrictedCountries: { [Op.contains]: country.code } } },
              include: [{
                attributes: ["id", "name", "iconUrl", "casinoAggregatorId"],
                model: this.context.sequelize.models.casinoProvider,
                where: { ...providerWhereObj, [Op.not]: { restrictedCountries: { [Op.contains]: country.id } } },
                required: true,
                include: [{
                  attributes: ["id", "name"],
                  model: this.context.sequelize.models.casinoAggregator,
                  where: { isActive: true },
                  required: true,
                }],
              }],
              required: true,
            },
            {
              attributes: ["id", "name", "iconUrl"],
              model: this.context.sequelize.models.casinoCategory,
              where: { ...categoryWhereObj },
              required: true,
            },
          ],
          limit,
          offset: (pageNo - 1) * limit,
          order: [["orderId", "ASC"]],
        });
        const updatedCasinoGames = [];
        casinoGameCategories?.rows?.map((casinoGameCategory) => {
          const casinoGame = casinoGameCategory?.casinoGame;
          const OTHERWORLD_ORIGINALS_CATEGORY_ID = parseInt(process.env.OTHERWORLD_ORIGINALS_CATEGORY_ID, 10);
          updatedCasinoGames.push({
            casinoCategory: casinoGameCategory?.casinoCategory,
            casinoProvider: casinoGame?.casinoProvider,
            casinoProviderId: casinoGame?.casinoProviderId,
            demoAvailable: casinoGame?.demoAvailable,
            devices: casinoGame?.devices,
            iconUrl: casinoGame?.iconUrl,
            id: casinoGame?.id,
            isFavorite: casinoGame?.isFavorite || casinoGame?.dataValues?.isFavorite,
            name: casinoGame?.name,
            orderId: casinoGameCategory?.orderId,
            restrictedCountries: casinoGame?.restrictedCountries,
            returnToPlayer: casinoGame?.returnToPlayer,
            uniqueId: casinoGame?.uniqueId,
            isOriginals: casinoGameCategory.casinoCategory.id === OTHERWORLD_ORIGINALS_CATEGORY_ID,
            isActive: casinoGame?.isActive,
            isPlayable: casinoGame?.isPlayable,
          });
        });
        casinoGames = { ...casinoGameCategories, rows: updatedCasinoGames };
      }

      logger.info('Return(GetAllCasinoGamesService)');
      return { casinoGames };
    } catch (error) {
      logger.error('UnknownError(GetAllCasinoGamesService):', { message: error.message, stack: error.stack });
      throw new APIError(error);
    }
  }
}
