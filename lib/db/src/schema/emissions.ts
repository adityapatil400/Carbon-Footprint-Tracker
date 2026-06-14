import { pgTable, serial, text, real, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const emissionsTable = pgTable("emissions", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  subcategory: text("subcategory").notNull(),
  description: text("description").notNull(),
  co2Kg: real("co2_kg").notNull(),
  date: date("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertEmissionSchema = createInsertSchema(emissionsTable).omit({ id: true, createdAt: true });
export const updateEmissionSchema = insertEmissionSchema.partial();

export type InsertEmission = z.infer<typeof insertEmissionSchema>;
export type Emission = typeof emissionsTable.$inferSelect;
