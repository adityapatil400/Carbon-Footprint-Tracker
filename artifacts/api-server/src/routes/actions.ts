import { Router } from "express";
import { db, actionsTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { CompleteActionBody } from "@workspace/api-zod";

const router = Router();

const BADGES = [
  { threshold: 1, badge: "First Step" },
  { threshold: 5, badge: "Getting Started" },
  { threshold: 10, badge: "Momentum Builder" },
  { threshold: 25, badge: "Climate Advocate" },
  { threshold: 50, badge: "Eco Champion" },
  { threshold: 100, badge: "Planet Defender" },
];

const LEVELS = [
  { min: 0, name: "seedling", nextAt: 5 },
  { min: 5, name: "sapling", nextAt: 15 },
  { min: 15, name: "tree", nextAt: 30 },
  { min: 30, name: "forest", nextAt: 9999 },
];

function computeLevel(totalActions: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalActions >= LEVELS[i].min) {
      return { level: LEVELS[i].name, nextLevelAt: LEVELS[i].nextAt - totalActions };
    }
  }
  return { level: "seedling", nextLevelAt: 5 };
}

function computeStreak(actions: typeof actionsTable.$inferSelect[]): { currentStreak: number; longestStreak: number } {
  if (actions.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const sortedDesc = [...actions].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  const days = sortedDesc.map((a) => {
    const d = new Date(a.completedAt);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });

  const uniqueDays = [...new Set(days)].sort((a, b) => b - a);

  let currentStreak = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (uniqueDays[0] !== today.getTime() && uniqueDays[0] !== yesterday.getTime()) {
    currentStreak = 0;
  } else {
    for (let i = 1; i < uniqueDays.length; i++) {
      if (uniqueDays[i - 1] - uniqueDays[i] === 86400000) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  let longestStreak = 1;
  let cur = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    if (uniqueDays[i - 1] - uniqueDays[i] === 86400000) {
      cur++;
      longestStreak = Math.max(longestStreak, cur);
    } else {
      cur = 1;
    }
  }

  return { currentStreak, longestStreak };
}

router.get("/actions", async (req, res): Promise<void> => {
  try {
    const actions = await db.select().from(actionsTable).orderBy(desc(actionsTable.completedAt));
    res.json(
      actions.map((a) => ({
        ...a,
        completedAt: a.completedAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list actions");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/actions", async (req, res): Promise<void> => {
  try {
    const parsed = CompleteActionBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }
    const inserted = await db.insert(actionsTable).values(parsed.data).returning();
    const a = inserted[0];
    res.status(201).json({
      ...a,
      completedAt: a.completedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to complete action");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/actions/streak", async (req, res): Promise<void> => {
  try {
    const actions = await db.select().from(actionsTable).orderBy(desc(actionsTable.completedAt));
    const totalActions = actions.length;
    const totalSavedKg = actions.reduce((s, a) => s + a.co2SavedKg, 0);
    const { currentStreak, longestStreak } = computeStreak(actions);
    const { level, nextLevelAt } = computeLevel(totalActions);

    const earnedBadges = BADGES.filter((b) => totalActions >= b.threshold).map((b) => b.badge);

    res.json({
      currentStreak,
      longestStreak,
      totalActions,
      totalSavedKg: Math.round(totalSavedKg * 10) / 10,
      level,
      nextLevelAt: Math.max(0, nextLevelAt),
      badges: earnedBadges,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get streak");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
