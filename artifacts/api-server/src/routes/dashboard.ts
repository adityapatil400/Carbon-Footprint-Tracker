import { Router } from "express";
import { db, emissionsTable, actionsTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { GetDashboardTrendsQueryParams } from "@workspace/api-zod";

const router = Router();

const GLOBAL_AVERAGE_CO2_KG_YEAR = 4000;

function getLevel(savedKg: number, streak: number): string {
  const score = savedKg + streak * 5;
  if (score >= 200) return "forest";
  if (score >= 80) return "tree";
  if (score >= 20) return "sapling";
  return "seedling";
}

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  try {
    const emissions = await db.select().from(emissionsTable);
    const actions = await db.select().from(actionsTable).orderBy(desc(actionsTable.completedAt));

    const totalCo2Kg = emissions.reduce((s, e) => s + e.co2Kg, 0);
    const savedCo2Kg = actions.reduce((s, a) => s + a.co2SavedKg, 0);

    const now = new Date();
    const firstDate = emissions.length > 0
      ? new Date(Math.min(...emissions.map(e => new Date(e.date).getTime())))
      : now;
    const monthsDiff = Math.max(1, (now.getFullYear() - firstDate.getFullYear()) * 12 + now.getMonth() - firstDate.getMonth());
    const monthlyAverageCo2Kg = totalCo2Kg / monthsDiff;

    const comparedToAveragePercent = totalCo2Kg > 0
      ? ((totalCo2Kg - GLOBAL_AVERAGE_CO2_KG_YEAR) / GLOBAL_AVERAGE_CO2_KG_YEAR) * 100
      : 0;

    const categoryTotals: Record<string, number> = {};
    for (const e of emissions) {
      categoryTotals[e.category] = (categoryTotals[e.category] ?? 0) + e.co2Kg;
    }
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "none";

    let currentStreak = 0;
    if (actions.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let checkDate = new Date(today);
      for (const action of actions) {
        const actionDate = new Date(action.completedAt);
        actionDate.setHours(0, 0, 0, 0);
        if (actionDate.getTime() === checkDate.getTime()) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    const level = getLevel(savedCo2Kg, currentStreak);

    res.json({
      totalCo2Kg: Math.round(totalCo2Kg * 10) / 10,
      monthlyAverageCo2Kg: Math.round(monthlyAverageCo2Kg * 10) / 10,
      comparedToAveragePercent: Math.round(comparedToAveragePercent),
      topCategory,
      streak: currentStreak,
      savedCo2Kg: Math.round(savedCo2Kg * 10) / 10,
      level,
      totalEntries: emissions.length,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard summary");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/trends", async (req, res): Promise<void> => {
  try {
    const qp = GetDashboardTrendsQueryParams.safeParse(req.query);
    const period = (qp.success && qp.data.period) ? qp.data.period : "weekly";

    const emissions = await db.select().from(emissionsTable).orderBy(desc(emissionsTable.date));

    const grouped: Record<string, { co2Kg: number; entryCount: number }> = {};

    for (const e of emissions) {
      const d = new Date(e.date);
      let key: string;
      if (period === "monthly") {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      } else {
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        key = weekStart.toISOString().slice(0, 10);
      }
      if (!grouped[key]) grouped[key] = { co2Kg: 0, entryCount: 0 };
      grouped[key].co2Kg += e.co2Kg;
      grouped[key].entryCount += 1;
    }

    const trends = Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, data]) => ({
        period,
        co2Kg: Math.round(data.co2Kg * 10) / 10,
        entryCount: data.entryCount,
      }));

    res.json(trends);
  } catch (err) {
    req.log.error({ err }, "Failed to get trends");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/category-breakdown", async (req, res): Promise<void> => {
  try {
    const emissions = await db.select().from(emissionsTable);
    const totalCo2 = emissions.reduce((s, e) => s + e.co2Kg, 0);

    const categoryTotals: Record<string, { co2Kg: number; entryCount: number }> = {};
    for (const e of emissions) {
      if (!categoryTotals[e.category]) categoryTotals[e.category] = { co2Kg: 0, entryCount: 0 };
      categoryTotals[e.category].co2Kg += e.co2Kg;
      categoryTotals[e.category].entryCount += 1;
    }

    const breakdown = Object.entries(categoryTotals).map(([category, data]) => ({
      category,
      co2Kg: Math.round(data.co2Kg * 10) / 10,
      percentage: totalCo2 > 0 ? Math.round((data.co2Kg / totalCo2) * 1000) / 10 : 0,
      entryCount: data.entryCount,
    }));

    res.json(breakdown);
  } catch (err) {
    req.log.error({ err }, "Failed to get category breakdown");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
