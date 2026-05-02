import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const socialLinksTable = pgTable("social_links", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SocialLink = typeof socialLinksTable.$inferSelect;
