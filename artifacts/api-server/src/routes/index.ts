import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tracksRouter from "./tracks";
import poemsRouter from "./poems";
import galleryRouter from "./gallery";
import adminAuthRouter from "./admin-auth";
import uploadRouter from "./upload";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminAuthRouter);
router.use(uploadRouter);
router.use(tracksRouter);
router.use(poemsRouter);
router.use(galleryRouter);

export default router;
