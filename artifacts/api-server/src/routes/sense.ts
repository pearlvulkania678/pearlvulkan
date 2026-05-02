import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, senseTable } from "@workspace/db";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

function serializeSense(t: typeof senseTable.$inferSelect) {
  return { ...t, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString() };
}

router.get("/sense", async (req, res): Promise<void> => {
  const items = await db.select().from(senseTable).where(eq(senseTable.published, true)).orderBy(senseTable.sortOrder);
  res.json(items.map(serializeSense));
});

router.get("/admin/sense", async (req, res): Promise<void> => {
  const items = await db.select().from(senseTable).orderBy(senseTable.sortOrder);
  res.json(items.map(serializeSense));
});

router.post("/sense", async (req, res): Promise<void> => {
  const { title, date, location, description, imagePath, linkUrl, content, published, sortOrder } = req.body as Record<string, unknown>;
  if (!title) { res.status(400).json({ error: "title required" }); return; }
  const [item] = await db.insert(senseTable).values({
    title: title as string,
    date: (date as string | null) ?? null,
    location: (location as string | null) ?? null,
    description: (description as string | null) ?? null,
    imagePath: (imagePath as string | null) ?? null,
    linkUrl: (linkUrl as string | null) ?? null,
    content: typeof content === "string" ? content : "[]",
    published: published !== false,
    sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
  }).returning();
  await logActivity("CREATE", "sense", item.id, item.title);
  res.status(201).json(serializeSense(item));
});

router.patch("/sense/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const body = req.body as Record<string, unknown>;
  const patch: Partial<typeof senseTable.$inferInsert> = {};
  if ("title" in body)       patch.title       = body.title as string;
  if ("date" in body)        patch.date        = (body.date as string | null) ?? null;
  if ("location" in body)    patch.location    = (body.location as string | null) ?? null;
  if ("description" in body) patch.description = (body.description as string | null) ?? null;
  if ("imagePath" in body)   patch.imagePath   = (body.imagePath as string | null) ?? null;
  if ("linkUrl" in body)     patch.linkUrl     = (body.linkUrl as string | null) ?? null;
  if ("content" in body)     patch.content     = typeof body.content === "string" ? body.content : "[]";
  if ("published" in body)   patch.published   = body.published as boolean;
  if ("sortOrder" in body)   patch.sortOrder   = body.sortOrder as number;
  const [item] = await db.update(senseTable).set(patch).where(eq(senseTable.id, id)).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  await logActivity("UPDATE", "sense", item.id, item.title);
  res.json(serializeSense(item));
});

router.delete("/sense/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [item] = await db.delete(senseTable).where(eq(senseTable.id, id)).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  await logActivity("DELETE", "sense", item.id, item.title);
  res.sendStatus(204);
});

router.post("/sense/reorder", async (req, res): Promise<void> => {
  const { ids } = req.body as { ids: number[] };
  if (!Array.isArray(ids)) { res.status(400).json({ error: "ids array required" }); return; }
  await Promise.all(ids.map((id, i) => db.update(senseTable).set({ sortOrder: i }).where(eq(senseTable.id, id))));
  res.json({ ok: true });
});

export default router;
