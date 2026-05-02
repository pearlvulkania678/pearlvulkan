import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tracksRouter from "./tracks";
import poemsRouter from "./poems";
import galleryRouter from "./gallery";

const router: IRouter = Router();

router.use(healthRouter);
router.use(tracksRouter);
router.use(poemsRouter);
router.use(galleryRouter);

export default router;
