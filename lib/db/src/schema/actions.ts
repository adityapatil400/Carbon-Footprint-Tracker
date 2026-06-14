import { pgTable, serial, text, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const actionsTable = pgTable("completed_actions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  co2SavedKg: real("co2_saved_kg").notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
  notes: text("notes"),
});

export const insertActionSchema = createInsertSchema(actionsTable).omit({ id: true, completedAt: true });
export type InsertAction = z.infer<typeof insertActionSchema>;
export type CompletedAction = typeof actionsTable.$inferSelect;
