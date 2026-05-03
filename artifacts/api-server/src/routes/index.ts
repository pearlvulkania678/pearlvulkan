import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tracksRouter from "./tracks";
import poemsRouter from "./poems";
import galleryRouter from "./gallery";
import touchRouter from "./touch";
import senseRouter from "./sense";
import adminAuthRouter from "./admin-auth";
import uploadRouter from "./upload";
import storageRouter from "./storage";
import activityRouter from "./activity";
import startRouter from "./start";
import socialLinksRouter from "./social-links";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminAuthRouter);
router.use(uploadRouter);
router.use(storageRouter);
router.use(startRouter);
router.use(socialLinksRouter);
router.use(tracksRouter);
router.use(poemsRouter);
router.use(galleryRouter);
router.use(touchRouter);
router.use(senseRouter);
router.use(activityRouter);

export default router;
