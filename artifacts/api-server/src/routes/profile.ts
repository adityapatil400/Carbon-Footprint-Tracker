import { Router } from "express";
import { db, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateProfileBody,
  UpdateProfileBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/profile", async (req, res): Promise<void> => {
  try {
    const profiles = await db.select().from(profilesTable).limit(1);
    if (profiles.length === 0) {
      res.status(404).json({ error: "No profile found" });
      return;
    }
    const p = profiles[0];
    res.json({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/profile", async (req, res): Promise<void> => {
  try {
    const parsed = CreateProfileBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }
    const existing = await db.select().from(profilesTable).limit(1);
    if (existing.length > 0) {
      const updated = await db
        .update(profilesTable)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(profilesTable.id, existing[0].id))
        .returning();
      const p = updated[0];
      res.status(201).json({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      });
      return;
    }
    const inserted = await db.insert(profilesTable).values(parsed.data).returning();
    const p = inserted[0];
    res.status(201).json({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/profile", async (req, res): Promise<void> => {
  try {
    const parsed = UpdateProfileBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }
    const profiles = await db.select().from(profilesTable).limit(1);
    if (profiles.length === 0) {
      res.status(404).json({ error: "No profile found" });
      return;
    }
    const updated = await db
      .update(profilesTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(profilesTable.id, profiles[0].id))
      .returning();
    const p = updated[0];
    res.json({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
