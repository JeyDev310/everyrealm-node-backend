import { healthCheck } from "@src/libs/healthCheck";
import express from "express";
import apiRoutes from "./api/v1";
import callbackRoutes from "./callback/v1";

const apiFamily = process.env.API_FAMILY
const endpointPath = process.env.ENDPOINT_PATH;
const apiVersion = process.env.API_VERSION || "v1";

const router = express.Router();

/* base router for the entire container */
const mainRouter = router.use(`/${apiFamily}${endpointPath}/${apiVersion}`, router);
mainRouter.use("/", apiRoutes);
mainRouter.use("/callback", callbackRoutes);
mainRouter.get("/health-check", healthCheck);

export default router;

