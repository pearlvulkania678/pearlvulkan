import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, startSettingsTable } from "@workspace/db";

const router: IRouter = Router();

const DEFAULTS = {
  id: 1,
  artistName: "Pearl Vulkan",
  quote: "There are places in the dark where the sound settles, where dust catches the amber light, and the silence has a shape.",
  tagline: "Enter. Slowly.",
  backgroundImage: null,
  bgOpacity: 15,
};

router.get("/start", async (req, res): Promise<void> => {
  const [row] = await db.select().from(startSettingsTable).where(eq(startSettingsTable.id, 1));
  res.json(row ?? DEFAULTS);
});

router.get("/admin/start", async (req, res): Promise<void> => {
  const [row] = await db.select().from(startSettingsTable).where(eq(startSettingsTable.id, 1));
  res.json(row ?? DEFAULTS);
});

router.put("/admin/start", async (req, res): Promise<void> => {
  const { artistName, quote, tagline, backgroundImage, bgOpacity } = req.body as Record<string, unknown>;
  const opacityVal = typeof bgOpacity === "number" ? Math.max(0, Math.min(100, Math.round(bgOpacity))) : DEFAULTS.bgOpacity;
  const [row] = await db
    .insert(startSettingsTable)
    .values({
      id: 1,
      artistName: typeof artistName === "string" ? artistName : DEFAULTS.artistName,
      quote: typeof quote === "string" ? quote : DEFAULTS.quote,
      tagline: typeof tagline === "string" ? tagline : DEFAULTS.tagline,
      backgroundImage: typeof backgroundImage === "string" ? backgroundImage || null : null,
      bgOpacity: opacityVal,
    })
    .onConflictDoUpdate({
      target: startSettingsTable.id,
      set: {
        artistName: typeof artistName === "string" ? artistName : DEFAULTS.artistName,
        quote: typeof quote === "string" ? quote : DEFAULTS.quote,
        tagline: typeof tagline === "string" ? tagline : DEFAULTS.tagline,
        backgroundImage: typeof backgroundImage === "string" ? backgroundImage || null : null,
        bgOpacity: opacityVal,
        updatedAt: new Date(),
      },
    })
    .returning();
  res.json(row);
});

export default router;
