import { db, activityLogTable } from "@workspace/db";

export async function logActivity(
  action: "CREATE" | "UPDATE" | "DELETE",
  entity: "track" | "poem" | "gallery",
  entityId: number,
  entityTitle: string | null,
) {
  try {
    await db.insert(activityLogTable).values({ action, entity, entityId, entityTitle });
  } catch {
    // non-blocking — never let logging break a request
  }
}
