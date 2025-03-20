import { APIError } from "@src/errors/api.error";
import ajv from "@src/libs/ajv";
import ServiceBase from "@src/libs/serviceBase";
import { logger } from "@src/utils/logger";
import { dynamoCreate, dynamoGetWithPkSk } from "@src/utils/aws.utils";

const constraints = ajv.compile({
  type: "object",
  properties: {
    chatId: { type: "number" },
    messageId: { type: "number" },
  },
  required: ["chatId", "messageId"],
});

export class RecordButtonClickedService extends ServiceBase {
  get constraints() {
    return constraints;
  }

  async run() {
    const { chatId, messageId } = this.args;
    logger.info("Start(RecordButtonClickedService):", { chatId, messageId });

    try {
      // Get the TELEGRAM MESSAGE DDB item
      const messagePk = `TELEGRAM#${messageId}`;
      const messageSk = "MESSAGE";
      const telegramMessage = await dynamoGetWithPkSk(messagePk, messageSk);
      if (!telegramMessage) {
        logger.warn("TelegramMessageNotFound(RecordButtonClickedService):", { messageId });
        return { success: false, message: "Message with this ID not found." };
      }
  
      // Check if the ChatID is in that TELEGRAM MESSAGE DDB item
      if (!telegramMessage.chatIdList?.includes(chatId)) {
        logger.warn("ChatIdNotInMessage(RecordButtonClickedService):", { chatId, messageId });
        return { success: false, message: "Chat ID not found in message." };
      }

      // Check if the click action is already recorded
      const clickedPk = `TELEGRAM#${messageId}`;
      const clickedSk = `CLICKED#CHATID#${chatId}`;

      const clickAlreadyRecorded = await dynamoGetWithPkSk(clickedPk, clickedSk);

      if (clickAlreadyRecorded) {
        logger.warn("ButtonAlreadyClicked(RecordButtonClickedService):", { chatId, messageId });
        return { success: false, message: "Button click already recorded." };
      }

      // Create a new DDB item to record user clicked the button
      const now = new Date();
      const values = [];
      values.push({ key: 'chatId', value: chatId });
      values.push({ key: 'clickedAt', value: now.valueOf() });

      const createResult = await dynamoCreate(clickedPk, clickedSk, values);

      if (!createResult) {
        logger.error("UnknownError(RecordButtonClickedService):", { chatId, messageId });
        throw new APIError("Unknown error occurred.");
      }
  
      return { success: true, message: "Button click recorded successfully." };
    } catch (error) {
      logger.error("UnknownError(RecordButtonClickedService):", { message: error.message, stack: error.stack });
      throw new APIError(error);
    }
  }
}
