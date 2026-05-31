import { Router } from "express";
import { authRouter } from "./modules/auth.routes";
import { entitiesRouter } from "./modules/entities.routes";
import { extrasRouter } from "./modules/extras.routes";
import { paymentsRouter } from "./modules/payments.routes";

export const apiRouter = Router();

apiRouter.use(extrasRouter);
apiRouter.use(entitiesRouter);
apiRouter.use(paymentsRouter);
apiRouter.use("/auth", authRouter);

