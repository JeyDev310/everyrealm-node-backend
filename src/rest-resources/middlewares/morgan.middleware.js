// src/middleware/morganMiddleware.js

import morgan from "morgan";
import { morganStream } from "@src/utils/logger";

// Define a compact log format for HTTP requests
const format = ':method | :url | :status | :res[content-length]B | :response-time ms';

// Optionally, add request ID token for distributed tracing (if needed)
// Uncomment the following lines if you want to include request IDs
/*
morgan.token("request-id", (req) => req.headers["x-request-id"] || "N/A");
const formatWithRequestId = ':date[iso] | :request-id | :remote-addr | :method :url | :status | :res[content-length]B | :response-time ms';
*/

// Configure Morgan to use Winston's morganStream
const morganMiddleware = morgan(format, { stream: morganStream });

// If using request ID, use the following line instead
// const morganMiddleware = morgan(formatWithRequestId, { stream: morganStream });

export default morganMiddleware;
