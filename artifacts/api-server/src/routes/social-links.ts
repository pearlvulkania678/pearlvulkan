import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, socialLinksTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/social-links", async (req, res): Promise<void> => {
  const items = await db.select().from(socialLinksTable)
    .where(eq(socialLinksTable.published, true))
    .orderBy(asc(socialLinksTable.sortOrder));
  res.json(items);
});

router.get("/admin/social-links", async (req, res): Promise<void> => {
  const items = await db.select().from(socialLinksTable).orderBy(asc(socialLinksTable.sortOrder));
  res.json(items);
});

router.post("/social-links", async (req, res): Promise<void> => {
  const { label, url, published, sortOrder } = req.body as Record<string, unknown>;
  if (!label || !url) { res.status(400).json({ error: "label and url required" }); return; }
  const [item] = await db.insert(socialLinksTable).values({
    label: label as string,
    url: url as string,
    published: published !== false,
    sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
  }).returning();
  res.status(201).json(item);
});

router.patch("/social-links/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const body = req.body as Record<string, unknown>;
  const patch: Partial<typeof socialLinksTable.$inferInsert> = {};
  if ("label" in body)     patch.label     = body.label as string;
  if ("url" in body)       patch.url       = body.url as string;
  if ("published" in body) patch.published = body.published as boolean;
  if ("sortOrder" in body) patch.sortOrder = body.sortOrder as number;
  const [item] = await db.update(socialLinksTable).set(patch).where(eq(socialLinksTable.id, id)).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json(item);
});

router.delete("/social-links/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(socialLinksTable).where(eq(socialLinksTable.id, id));
  res.status(204).end();
});

router.post("/social-links/reorder", async (req, res): Promise<void> => {
  const { ids } = req.body as { ids: number[] };
  if (!Array.isArray(ids)) { res.status(400).json({ error: "ids array required" }); return; }
  await Promise.all(ids.map((id, i) =>
    db.update(socialLinksTable).set({ sortOrder: i }).where(eq(socialLinksTable.id, id))
  ));
  res.json({ ok: true });
});

export default router;
