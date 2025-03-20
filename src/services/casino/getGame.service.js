import { APIError } from "@src/errors/api.error";
import ajv from "@src/libs/ajv";
import ServiceBase from "@src/libs/serviceBase";
import { logger } from "@src/utils/logger";
import { Sequelize } from "sequelize";

const constraints = ajv.compile({
  type: "object",
  properties: {
    uniqueId: { type: "string" }
  },
  required: ["uniqueId"],
});

export class GetCasinoGameService extends ServiceBase {
  get constraints() {
    return constraints;
  }

  async run() {
    const { uniqueId } = this.args;

    logger.info("Start(GetCasinoGameService):", { uniqueId });

    try {
      const casinoGameQuery = `
        SELECT 
            cg.id,
            cg.unique_id AS "uniqueId",
            cg.name,
            json_agg(
                (
                    SELECT json_object_agg(lang, cc.name ->> lang)
                    FROM jsonb_object_keys(cc.name) AS langs(lang)
                )
            ) AS categories,
            cp.name AS "gameProvider",
            cg.return_to_player AS "returnToPlayer",
            cg.more_details ->> 'description' AS description,
            cg.more_details ->> 'short_description' AS "shortDescription",
            cg.icon_url AS "iconUrl"
        FROM casino_games cg
        LEFT JOIN casino_game_category cgc ON cg.id = cgc.casino_game_id
        LEFT JOIN casino_categories cc ON cgc.casino_category_id = cc.id
        LEFT JOIN casino_providers cp ON cg.casino_provider_id = cp.id
        WHERE cg.unique_id = :uniqueId
        GROUP BY cg.id, cp.name;
      `;

      const [casinoGame] = await this.context.sequelize.query(casinoGameQuery, {
        replacements: { uniqueId },
        type: Sequelize.QueryTypes.SELECT,
      });

      if (!casinoGame) {
        logger.warn("CasinoGameNotFound(GetCasinoGameService):", { uniqueId });
        return { casinoGame: null };
      }

      logger.info("Return(GetCasinoGameService)", { casinoGame });
      return { casinoGame };

    } catch (error) {
      logger.error("UnknownError(GetCasinoGameService):", { message: error.message, stack: error.stack });
      throw new APIError(error);
    }
  }
}
