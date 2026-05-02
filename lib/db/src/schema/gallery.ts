import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const galleryTable = pgTable("gallery", {
  id: serial("id").primaryKey(),
  src: text("src").notNull(),
  caption: text("caption").notNull(),
  published: boolean("published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertGallerySchema = createInsertSchema(galleryTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertGallery = z.infer<typeof insertGallerySchema>;
export type GalleryItem = typeof galleryTable.$inferSelect;
