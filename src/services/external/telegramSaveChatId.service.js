import { APIError } from "@src/errors/api.error";
import ajv from "@src/libs/ajv";
import ServiceBase from "@src/libs/serviceBase";
import { logger } from "@src/utils/logger";

const constraints = ajv.compile({
  type: "object",
  properties: {
    userId: { type: "string" },
    chatId: { type: "number" },
  },
  required: ["userId", "chatId"],
});

export class TelegramSaveChatIdService extends ServiceBase {
  get constraints() {
    return constraints;
  }

  async run() {
    const { userId, chatId } = this.args;
    logger.info("Start(TelegramSaveChatIdService):", { userId, chatId });
    const userModel = this.context.sequelize.models.user;
    try {
      const [updatedRows] = await userModel.update(
        { telegramChatId: chatId },
        { where: { id: userId } } 
      );

      if (updatedRows === 0) {
        logger.warn("UserNotFound(TelegramSaveChatIdService):", { userId });
        throw new APIError("User not found", 404);
      }

      logger.info("Success(TelegramSaveChatIdService):", { userId, chatId });
      return { success: true, message: "Telegram chat ID updated successfully" };
    } catch (error) {
      logger.error("UnknownError(TelegramSaveChatIdService):",  { message: error.message, stack: error.stack });
      throw new APIError(error);
    }
  }
}
