import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profileRouter from "./profile";
import emissionsRouter from "./emissions";
import dashboardRouter from "./dashboard";
import recommendationsRouter from "./recommendations";
import actionsRouter from "./actions";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profileRouter);
router.use(emissionsRouter);
router.use(dashboardRouter);
router.use(recommendationsRouter);
router.use(actionsRouter);

export default router;
