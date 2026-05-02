import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";

export const activityLogTable = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: integer("entity_id").notNull(),
  entityTitle: text("entity_title"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ActivityLog = typeof activityLogTable.$inferSelect;
