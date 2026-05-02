import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const poemsTable = pgTable("poems", {
  id: serial("id").primaryKey(),
  title: text("title"),
  content: text("content").notNull(),
  tags: text("tags").array().notNull().default([]),
  published: boolean("published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPoemSchema = createInsertSchema(poemsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPoem = z.infer<typeof insertPoemSchema>;
export type Poem = typeof poemsTable.$inferSelect;
