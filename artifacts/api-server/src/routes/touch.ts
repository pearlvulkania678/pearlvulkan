import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, touchTable } from "@workspace/db";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

function serializeTouch(t: typeof touchTable.$inferSelect) {
  return { ...t, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString() };
}

router.get("/touch", async (req, res): Promise<void> => {
  const items = await db.select().from(touchTable).where(eq(touchTable.published, true)).orderBy(touchTable.sortOrder);
  res.json(items.map(serializeTouch));
});

router.get("/admin/touch", async (req, res): Promise<void> => {
  const items = await db.select().from(touchTable).orderBy(touchTable.sortOrder);
  res.json(items.map(serializeTouch));
});

router.post("/touch", async (req, res): Promise<void> => {
  const { title, subtitle, description, imagePath, linkUrl, published, sortOrder } = req.body as Record<string, unknown>;
  if (!title || !description) { res.status(400).json({ error: "title and description required" }); return; }
  const [item] = await db.insert(touchTable).values({
    title: title as string,
    subtitle: (subtitle as string | null) ?? null,
    description: description as string,
    imagePath: (imagePath as string | null) ?? null,
    linkUrl: (linkUrl as string | null) ?? null,
    published: published !== false,
    sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
  }).returning();
  await logActivity("CREATE", "touch", item.id, item.title);
  res.status(201).json(serializeTouch(item));
});

router.patch("/touch/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const body = req.body as Record<string, unknown>;
  const patch: Partial<typeof touchTable.$inferInsert> = {};
  if ("title" in body)       patch.title       = body.title as string;
  if ("subtitle" in body)    patch.subtitle    = (body.subtitle as string | null) ?? null;
  if ("description" in body) patch.description = body.description as string;
  if ("imagePath" in body)   patch.imagePath   = (body.imagePath as string | null) ?? null;
  if ("linkUrl" in body)     patch.linkUrl     = (body.linkUrl as string | null) ?? null;
  if ("published" in body)   patch.published   = body.published as boolean;
  if ("sortOrder" in body)   patch.sortOrder   = body.sortOrder as number;
  const [item] = await db.update(touchTable).set(patch).where(eq(touchTable.id, id)).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  await logActivity("UPDATE", "touch", item.id, item.title);
  res.json(serializeTouch(item));
});

router.delete("/touch/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [item] = await db.delete(touchTable).where(eq(touchTable.id, id)).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  await logActivity("DELETE", "touch", item.id, item.title);
  res.sendStatus(204);
});

router.post("/touch/reorder", async (req, res): Promise<void> => {
  const { ids } = req.body as { ids: number[] };
  if (!Array.isArray(ids)) { res.status(400).json({ error: "ids array required" }); return; }
  await Promise.all(ids.map((id, i) => db.update(touchTable).set({ sortOrder: i }).where(eq(touchTable.id, id))));
  res.json({ ok: true });
});

export default router;
