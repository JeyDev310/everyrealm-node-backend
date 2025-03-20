import { APIError } from "@src/errors/api.error";
import ajv from "@src/libs/ajv";
import ServiceBase from "@src/libs/serviceBase";
import { logger } from "@src/utils/logger";
import { info } from "console";
const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

const constraints = ajv.compile({
  type: "object",
  properties: {
    message: { type: "object" },
    method: { type: "string" },
  },
  required: ["method"],
});

export class TelegramBotStartService extends ServiceBase {
  get constraints() {
    return constraints;
  }

  async run() {
    const { message, method } = this.args;
    logger.info("Start(TelegramBotStartService):", { message, method });
    try {
      if (method === "POST") {
        if (message && message.text === "/start") {
          const chatId = message.chat.id;
          logger.info("ChatID(TelegramBotStartService):", { chatId });
          await bot.sendPhoto(
            chatId,
            "https://cdn.otherworld.xyz/public/assets/telegram/telegram-bot-login.jpg",
            {
              caption: `Welcome to Otherworld—a fantasy real estate casino where you can build your empire with every bet. 🏙️

We support all major cryptocurrencies for deposits. 💸

Play slots, table games, and live casino games from your favorite providers like Evolution, Nolimit City, Pragmatic Play, Hacksaw, Bgaming, and more. 🎰

Get started and claim your 100% first time deposit bonus (terms apply). 💥`,

              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "Play Now ▶️",

                      web_app: { url: process.env.USER_FE_URL },
                    },
                  ],
                  [
                    {
                      text: "Join the Community",
                      url: "https://t.me/otherworldchat",
                    },
                  ],
                ],
              },
            }
          );
        }

        logger.info("Return(TelegramBotStartService)");
        return { status: 200, success: true, message: "OK" };
      } else {
        logger.error("MethodNotAllowed(TelegramBotStartService)");
        return { status: 405, success: false, message: "Method Not Allowed" };
      }
    } catch (error) {
      logger.error("UnknownError(TelegramBotStartService):",  { message: error.message, stack: error.stack });
      throw new APIError(error);
    }
  }
}
