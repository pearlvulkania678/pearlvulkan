import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const senseTable = pgTable("sense_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  date: text("date"),
  location: text("location"),
  description: text("description"),
  imagePath: text("image_path"),
  linkUrl: text("link_url"),
  content: text("content").notNull().default("[]"),
  published: boolean("published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSenseSchema = createInsertSchema(senseTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSense = z.infer<typeof insertSenseSchema>;
export type SenseItem = typeof senseTable.$inferSelect;
