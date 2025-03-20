import express from "express";
import { casinoSoftSwissRouter } from "./casinoSoftSwiss.routes";
import { originalsRouter } from "./originals.routes";
import { veriffRouter } from "./veriff.routes";

const callbackRoutes = express.Router();

callbackRoutes.use("/casino", casinoSoftSwissRouter);
callbackRoutes.use("/originals", originalsRouter);
callbackRoutes.use("/veriff", veriffRouter);

export default callbackRoutes;
