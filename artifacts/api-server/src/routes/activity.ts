import { Router, type IRouter } from "express";
import { db, activityLogTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/admin/activity", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(activityLogTable)
    .orderBy(desc(activityLogTable.createdAt))
    .limit(100);
  res.json(rows.map(r => ({ ...r, createdAt: r.createdAt.toISOString() })));
});

export default router;
