import { WebClient } from '@slack/web-api';
import { config } from '@src/configs/config';

const options = {};
const web = new WebClient(config.get('slack.token'), options);

export const sendSlackMessage = async (message, channel = null) => {
    return new Promise(async (resolve, reject) => {
        const channelId = channel || config.get('slack.channelId');
        try {
            const resp = await web.chat.postMessage({
                // blocks: message,
                text: message,
                channel: channelId,
            });
            return resolve(true);
        } catch (error) {
          logger.info(error)
            return resolve(true);
        }
    });
};
