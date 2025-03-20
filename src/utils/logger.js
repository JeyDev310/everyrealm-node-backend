import winston from "winston";

// Define custom log levels and their corresponding colors
const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        debug: 4,
    },
    colors: {
        error: "red",
        warn: "yellow",
        info: "green",
        http: "magenta",
        debug: "blue",
    },
};

// Add custom colors to Winston
winston.addColors(customLevels.colors);

// Determine if the environment is local based on the IS_LOCAL environment variable
const isLocal = process.env.IS_LOCAL === 'true';

// Function to prevent circular JSON errors
function removeCircularReferences() {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return "[Circular]";
      seen.add(value);
    }
    return value;
  };
}

// Create the Winston Logger
const logger = winston.createLogger({
    levels: customLevels.levels,
    level: "debug", // Capture all log levels
    transports: [
        new winston.transports.Console({
            level: "debug",
            format: winston.format.combine(
                isLocal
                    ? winston.format.colorize({ all: true })
                    : winston.format.uncolorize(),
                winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                winston.format.printf(({ timestamp, level, message, ...meta }) => {
                    if (level === "http") {
                        return `${message}`;
                    }

                    // ✅ Ensure single-line logs for CloudWatch
                    let formattedMessage = typeof message === "object"
                        ? JSON.stringify(message, removeCircularReferences())
                        : message;

                    let metaString = Object.keys(meta).length
                        ? ` | ${JSON.stringify(meta, removeCircularReferences())}`
                        : "";

                    return `[${level}]: ${formattedMessage}${metaString}`.trim();
                })
            ),
            handleExceptions: true,
        }),
    ],
    exitOnError: false,
});

// Define morganStream for HTTP logs
const morganStream = {
    write: (message) => {
        logger.http(message.trim());
    },
};

export { logger, morganStream };
