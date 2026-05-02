import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const startSettingsTable = pgTable("start_settings", {
  id: integer("id").primaryKey().default(1),
  artistName: text("artist_name").notNull().default("Pearl Vulkan"),
  quote: text("quote").notNull().default("There are places in the dark where the sound settles, where dust catches the amber light, and the silence has a shape."),
  tagline: text("tagline").notNull().default("Enter. Slowly."),
  backgroundImage: text("background_image"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type StartSettings = typeof startSettingsTable.$inferSelect;
