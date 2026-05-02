import { Router, type IRouter } from "express";
import { db, tracksTable, poemsTable, galleryTable } from "@workspace/db";

const router: IRouter = Router();

router.post("/admin/auth", (req, res): void => {
  const { password } = req.body as { password?: string };
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }
  res.json({ ok: true });
});

router.get("/admin/tracks", async (_req, res): Promise<void> => {
  const tracks = await db.select().from(tracksTable).orderBy(tracksTable.sortOrder);
  res.json(tracks.map(t => ({ ...t, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString() })));
});

router.get("/admin/poems", async (_req, res): Promise<void> => {
  const poems = await db.select().from(poemsTable).orderBy(poemsTable.sortOrder);
  res.json(poems.map(p => ({ ...p, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString() })));
});

router.get("/admin/gallery", async (_req, res): Promise<void> => {
  const items = await db.select().from(galleryTable).orderBy(galleryTable.sortOrder);
  res.json(items.map(g => ({ ...g, createdAt: g.createdAt.toISOString(), updatedAt: g.updatedAt.toISOString() })));
});

export default router;
