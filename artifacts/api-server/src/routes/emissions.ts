import { Router } from "express";
import { db, emissionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  ListEmissionsQueryParams,
  CreateEmissionBody,
  GetEmissionParams,
  UpdateEmissionParams,
  UpdateEmissionBody,
  DeleteEmissionParams,
} from "@workspace/api-zod";

const router = Router();

function formatEmission(e: typeof emissionsTable.$inferSelect) {
  return {
    ...e,
    createdAt: e.createdAt.toISOString(),
  };
}

router.get("/emissions", async (req, res): Promise<void> => {
  try {
    const qp = ListEmissionsQueryParams.safeParse(req.query);
    const all = await db
      .select()
      .from(emissionsTable)
      .orderBy(desc(emissionsTable.date));
    let results = all;
    if (qp.success && qp.data.category) {
      results = all.filter((e) => e.category === qp.data.category);
    }
    if (qp.success && qp.data.limit) {
      results = results.slice(0, qp.data.limit);
    }
    res.json(results.map(formatEmission));
  } catch (err) {
    req.log.error({ err }, "Failed to list emissions");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/emissions", async (req, res): Promise<void> => {
  try {
    const parsed = CreateEmissionBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }
    const inserted = await db.insert(emissionsTable).values(parsed.data).returning();
    res.status(201).json(formatEmission(inserted[0]));
  } catch (err) {
    req.log.error({ err }, "Failed to create emission");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/emissions/:id", async (req, res): Promise<void> => {
  try {
    const params = GetEmissionParams.safeParse({ id: Number(req.params.id) });
    if (!params.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const rows = await db.select().from(emissionsTable).where(eq(emissionsTable.id, params.data.id));
    if (rows.length === 0) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(formatEmission(rows[0]));
  } catch (err) {
    req.log.error({ err }, "Failed to get emission");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/emissions/:id", async (req, res): Promise<void> => {
  try {
    const params = UpdateEmissionParams.safeParse({ id: Number(req.params.id) });
    const parsed = UpdateEmissionBody.safeParse(req.body);
    if (!params.success || !parsed.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }
    const updated = await db
      .update(emissionsTable)
      .set(parsed.data)
      .where(eq(emissionsTable.id, params.data.id))
      .returning();
    if (updated.length === 0) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(formatEmission(updated[0]));
  } catch (err) {
    req.log.error({ err }, "Failed to update emission");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/emissions/:id", async (req, res): Promise<void> => {
  try {
    const params = DeleteEmissionParams.safeParse({ id: Number(req.params.id) });
    if (!params.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    await db.delete(emissionsTable).where(eq(emissionsTable.id, params.data.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete emission");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
