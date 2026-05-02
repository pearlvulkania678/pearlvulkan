import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const SERVER_START = new Date().toISOString();

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json({ ...data, startedAt: SERVER_START });
});

export default router;
