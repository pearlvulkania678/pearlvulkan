import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, galleryTable } from "@workspace/db";
import {
  ListGalleryResponse,
  CreateGalleryItemBody,
  UpdateGalleryItemParams,
  UpdateGalleryItemBody,
  UpdateGalleryItemResponse,
  DeleteGalleryItemParams,
  ListGalleryResponseItem,
} from "@workspace/api-zod";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

function serializeGallery(g: typeof galleryTable.$inferSelect) {
  return { ...g, createdAt: g.createdAt.toISOString(), updatedAt: g.updatedAt.toISOString() };
}

router.get("/gallery", async (req, res): Promise<void> => {
  const items = await db.select().from(galleryTable).where(eq(galleryTable.published, true)).orderBy(galleryTable.sortOrder);
  res.json(ListGalleryResponse.parse(items.map(serializeGallery)));
});

router.post("/gallery", async (req, res): Promise<void> => {
  const parsed = CreateGalleryItemBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid gallery body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.insert(galleryTable).values(parsed.data).returning();
  await logActivity("CREATE", "gallery", item.id, item.caption);
  res.status(201).json(ListGalleryResponseItem.parse(serializeGallery(item)));
});

router.patch("/gallery/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateGalleryItemParams.safeParse({ id: rawId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateGalleryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db
    .update(galleryTable)
    .set(parsed.data)
    .where(eq(galleryTable.id, params.data.id))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Gallery item not found" });
    return;
  }
  await logActivity("UPDATE", "gallery", item.id, item.caption);
  res.json(UpdateGalleryItemResponse.parse(serializeGallery(item)));
});

router.delete("/gallery/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteGalleryItemParams.safeParse({ id: rawId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [item] = await db.delete(galleryTable).where(eq(galleryTable.id, params.data.id)).returning();
  if (!item) {
    res.status(404).json({ error: "Gallery item not found" });
    return;
  }
  await logActivity("DELETE", "gallery", item.id, item.caption);
  res.sendStatus(204);
});

export default router;
