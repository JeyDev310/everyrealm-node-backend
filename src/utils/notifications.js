const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm");
import { logger } from "@src/utils/logger"

const NotificationType = {
    SUCCESS: "success",
    ERROR: "error",
    WARNING: "warning",
    INFO: "info",
};

export class SlackNotificationHelper {
    static instance = null;

    constructor() {
        if (SlackNotificationHelper.instance) {
            return SlackNotificationHelper.instance;
        }

        this.sns = new SNSClient({});
        this.ssm = new SSMClient({});
        this.appName = process.env.APP_NAME || "otherworld";
        this.environment = process.env.TAG_ENV || "dev";

        SlackNotificationHelper.instance = this;
    }

    async getTopicArn(notificationType) {
        const paramName = `/${this.appName}/${this.environment}/sns/${notificationType}`;
        const command = new GetParameterCommand({ Name: paramName });

        try {
            const response = await this.ssm.send(command);
            return response.Parameter?.Value || "";
        } catch (error) {
          logger.error(`❌ Error fetching SNS Topic ARN: ${error.message}`);
            return "";
        }
    }

    async sendNotification(notificationType, message, metadata = {}) {
        const topicArn = await this.getTopicArn(notificationType);

        if (!topicArn) {
          logger.error(`❌ No SNS Topic ARN found for ${notificationType}`);
            return;
        }

        const formattedMessage = this.formatSlackMessage(notificationType, message, metadata);

        const publishCommand = new PublishCommand({
            TopicArn: topicArn,
            Message: formattedMessage,
        });

        try {
            await this.sns.send(publishCommand);
            logger.info(`✅ Sent ${notificationType.toUpperCase()} notification`);
        } catch (error) {
          logger.error(`❌ Failed to send SNS notification: ${error.message}`);
        }
    }

    async sendSuccess(message, metadata = {}) {
        await this.sendNotification(NotificationType.SUCCESS, message, metadata);
    }

    async sendError(message, metadata = {}) {
        await this.sendNotification(NotificationType.ERROR, message, metadata);
    }

    async sendWarning(message, metadata = {}) {
        await this.sendNotification(NotificationType.WARNING, message, metadata);
    }

    async sendInfo(message, metadata = {}) {
        await this.sendNotification(NotificationType.INFO, message, metadata);
    }

    formatSlackMessage(notificationType, message, metadata) {
        const emojiMap = {
            SUCCESS: "✅",
            ERROR: "❌",
            WARNING: "⚠️",
            INFO: "ℹ️"
        };

        let formattedMessage = `
${emojiMap[notificationType.toUpperCase()]} *${notificationType.toUpperCase()} NOTIFICATION*
---------------------------------------------------
📝 *Message:*
${this.formatMessage(message)}
`;

        switch (notificationType.toUpperCase()) {
            case "ERROR":
                formattedMessage += `
📌 *Class:* \`${metadata.class || "N/A"}\`
📌 *Status Code:* \`${metadata.exception?.statusCode || "Unknown"}\`
📌 *Error Code:* \`${metadata.exception?.errorCode || "Unknown"}\`

📊 *Exception Details:*
\`\`\`json
${JSON.stringify(metadata.exception, null, 2)}
\`\`\`
`;
                break;

            case "SUCCESS":
                formattedMessage += `
🎯 *Action:* \`${metadata.action || "N/A"}\`
`;
                break;

            case "WARNING":
                formattedMessage += `
⚠️ *Potential Issue:* \`${metadata.issue || "N/A"}\`
🔍 *Suggested Fix:* \`${metadata.suggestion || "N/A"}\`
`;
                break;

            case "INFO":
                formattedMessage += `
📍 *Source:* \`${metadata.source || "Unknown Source"}\`
ℹ️ *Additional Details:* \`${metadata.details || "N/A"}\`
`;
                break;
        }

        return formattedMessage.trim();
    }

    formatMessage(message) {
        return typeof message === "object"
            ? `\`\`\`json\n${JSON.stringify(message, null, 2)}\n\`\`\``
            : message;
    }
}

export default new SlackNotificationHelper();
