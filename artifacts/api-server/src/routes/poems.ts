import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, poemsTable } from "@workspace/db";
import {
  ListPoemsResponse,
  CreatePoemBody,
  UpdatePoemParams,
  UpdatePoemBody,
  UpdatePoemResponse,
  DeletePoemParams,
  ListPoemsResponseItem,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serializePoem(p: typeof poemsTable.$inferSelect) {
  return { ...p, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString() };
}

router.get("/poems", async (req, res): Promise<void> => {
  const poems = await db.select().from(poemsTable).where(eq(poemsTable.published, true)).orderBy(poemsTable.sortOrder);
  res.json(ListPoemsResponse.parse(poems.map(serializePoem)));
});

router.post("/poems", async (req, res): Promise<void> => {
  const parsed = CreatePoemBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid poem body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [poem] = await db.insert(poemsTable).values(parsed.data).returning();
  res.status(201).json(ListPoemsResponseItem.parse(serializePoem(poem)));
});

router.patch("/poems/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdatePoemParams.safeParse({ id: rawId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdatePoemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [poem] = await db
    .update(poemsTable)
    .set(parsed.data)
    .where(eq(poemsTable.id, params.data.id))
    .returning();
  if (!poem) {
    res.status(404).json({ error: "Poem not found" });
    return;
  }
  res.json(UpdatePoemResponse.parse(serializePoem(poem)));
});

router.delete("/poems/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeletePoemParams.safeParse({ id: rawId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [poem] = await db.delete(poemsTable).where(eq(poemsTable.id, params.data.id)).returning();
  if (!poem) {
    res.status(404).json({ error: "Poem not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
