import { maintenanceCheckMiddleware } from "@src/rest-resources/middlewares/maintenanceCheck.middleware";
import express from "express";
import { casinoRouter } from "./casino.routes";
import { commonRouter } from "./common.routes";
import { documentRouter } from "./document.routes";
import { externalRouter } from "./external.routes";
import { internalRouter } from "./internal.routes";
import { paymentRouter } from "./payment.routes";
import { responsibleGamblingRouter } from "./responsibleGambling.routes";
import { userRouter } from "./user.routes";

const apiRoutes = express.Router();

apiRoutes.use("/user", maintenanceCheckMiddleware, userRouter);
apiRoutes.use("/common", commonRouter);
apiRoutes.use("/casino", maintenanceCheckMiddleware, casinoRouter);
apiRoutes.use("/external", maintenanceCheckMiddleware, externalRouter);
apiRoutes.use("/internal", internalRouter);
apiRoutes.use("/payment", paymentRouter);
apiRoutes.use("/document", maintenanceCheckMiddleware, documentRouter);
apiRoutes.use("/responsible-gambling", maintenanceCheckMiddleware, responsibleGamblingRouter);

export default apiRoutes;
