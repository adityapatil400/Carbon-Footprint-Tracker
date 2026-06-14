import { pgTable, serial, text, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const recommendationsTable = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  estimatedSavingKg: real("estimated_saving_kg").notNull(),
  difficulty: text("difficulty").notNull().default("medium"),
  impact: text("impact").notNull().default("medium"),
  dismissed: boolean("dismissed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRecommendationSchema = createInsertSchema(recommendationsTable).omit({ id: true, createdAt: true });
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendationsTable.$inferSelect;
