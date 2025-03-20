import { createAdapter } from "@socket.io/redis-adapter";
import { publisherClient, subscriberClient } from "@src/libs/redisPubSub";
import { Server as SocketServer } from "socket.io";
import { registerNamespaces } from "./namespaces";

const apiFamily = process.env.API_FAMILY
const endpointPath= process.env.ENDPOINT_PATH;
const apiVersion = process.env.API_VERSION;

const socketServer = new SocketServer({
  cors: { origin: "*" },
  path: `/${apiFamily}${endpointPath}/${apiVersion}/socket`,
});

socketServer.adapter(createAdapter(publisherClient, subscriberClient));
registerNamespaces(socketServer);

export { socketServer };
