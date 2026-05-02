import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, tracksTable } from "@workspace/db";
import {
  ListTracksResponse,
  CreateTrackBody,
  UpdateTrackParams,
  UpdateTrackBody,
  UpdateTrackResponse,
  DeleteTrackParams,
  ListTracksResponseItem,
} from "@workspace/api-zod";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

function serializeTrack(t: typeof tracksTable.$inferSelect) {
  return { ...t, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString() };
}

router.get("/tracks", async (req, res): Promise<void> => {
  const tracks = await db.select().from(tracksTable).where(eq(tracksTable.published, true)).orderBy(tracksTable.sortOrder);
  res.json(ListTracksResponse.parse(tracks.map(serializeTrack)));
});

router.post("/tracks", async (req, res): Promise<void> => {
  const parsed = CreateTrackBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid track body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [track] = await db.insert(tracksTable).values(parsed.data).returning();
  await logActivity("CREATE", "track", track.id, track.title);
  res.status(201).json(ListTracksResponseItem.parse(serializeTrack(track)));
});

router.patch("/tracks/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateTrackParams.safeParse({ id: rawId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateTrackBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [track] = await db
    .update(tracksTable)
    .set(parsed.data)
    .where(eq(tracksTable.id, params.data.id))
    .returning();
  if (!track) {
    res.status(404).json({ error: "Track not found" });
    return;
  }
  await logActivity("UPDATE", "track", track.id, track.title);
  res.json(UpdateTrackResponse.parse(serializeTrack(track)));
});

router.delete("/tracks/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteTrackParams.safeParse({ id: rawId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [track] = await db.delete(tracksTable).where(eq(tracksTable.id, params.data.id)).returning();
  if (!track) {
    res.status(404).json({ error: "Track not found" });
    return;
  }
  await logActivity("DELETE", "track", track.id, track.title);
  res.sendStatus(204);
});

export default router;
