import { Router } from "express";
import { db, recommendationsTable, emissionsTable, profilesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { DismissRecommendationParams } from "@workspace/api-zod";

const router = Router();

interface RecommendationTemplate {
  category: string;
  title: string;
  description: string;
  estimatedSavingKg: number;
  difficulty: string;
  impact: string;
  tags: string[];
}

const ALL_RECOMMENDATIONS: RecommendationTemplate[] = [
  {
    category: "transportation",
    title: "Switch to cycling for short trips",
    description: "Replace car trips under 5km with cycling. This is one of the fastest ways to cut transport emissions — and it's free exercise.",
    estimatedSavingKg: 120,
    difficulty: "easy",
    impact: "medium",
    tags: ["car", "petrol", "diesel"],
  },
  {
    category: "transportation",
    title: "Use public transit once a week",
    description: "Swap one car journey per week for bus or train. Over a year this can save over 200kg of CO2 depending on your commute.",
    estimatedSavingKg: 200,
    difficulty: "easy",
    impact: "high",
    tags: ["car", "petrol", "diesel"],
  },
  {
    category: "transportation",
    title: "Carpool with colleagues",
    description: "Sharing a commute with one other person halves your transport emissions per trip. Apps like BlaBlaCar make this simple.",
    estimatedSavingKg: 180,
    difficulty: "medium",
    impact: "high",
    tags: ["car", "petrol", "diesel"],
  },
  {
    category: "transportation",
    title: "Plan your next car as electric",
    description: "When replacing your vehicle, choose an electric model. Over its lifetime, an EV emits up to 70% less CO2 than a petrol car.",
    estimatedSavingKg: 600,
    difficulty: "hard",
    impact: "high",
    tags: ["petrol", "diesel"],
  },
  {
    category: "transportation",
    title: "Offset your next flight",
    description: "Purchase verified carbon offsets for your flights through Gold Standard or Verra-certified projects. Aim to offset 100% of flight emissions.",
    estimatedSavingKg: 300,
    difficulty: "easy",
    impact: "high",
    tags: ["flights"],
  },
  {
    category: "transportation",
    title: "Take the train instead of flying",
    description: "Rail produces 80-90% less CO2 than flying for the same journey. For trips under 600km, trains are often faster door-to-door.",
    estimatedSavingKg: 250,
    difficulty: "medium",
    impact: "high",
    tags: ["flights"],
  },
  {
    category: "energy",
    title: "Switch to a renewable energy tariff",
    description: "Many energy providers offer 100% renewable electricity plans at competitive prices. This single switch can eliminate your home electricity emissions.",
    estimatedSavingKg: 400,
    difficulty: "easy",
    impact: "high",
    tags: ["fossil", "mixed"],
  },
  {
    category: "energy",
    title: "Install a smart thermostat",
    description: "Smart thermostats learn your schedule and can cut heating and cooling energy use by 10-15%, saving both money and carbon.",
    estimatedSavingKg: 150,
    difficulty: "medium",
    impact: "medium",
    tags: ["fossil", "mixed", "renewable"],
  },
  {
    category: "energy",
    title: "Insulate your home",
    description: "Proper loft and wall insulation can cut heat loss by 30-40%. It's an upfront investment that pays back in lower bills and emissions for decades.",
    estimatedSavingKg: 500,
    difficulty: "hard",
    impact: "high",
    tags: ["fossil", "mixed"],
  },
  {
    category: "energy",
    title: "Air-dry your laundry",
    description: "Tumble dryers are energy-hungry. Air-drying saves up to 150kg of CO2 per year — and clothes last longer too.",
    estimatedSavingKg: 150,
    difficulty: "easy",
    impact: "medium",
    tags: ["fossil", "mixed", "renewable"],
  },
  {
    category: "food",
    title: "Try meat-free Mondays",
    description: "Cutting meat from one day per week can save over 50kg of CO2 annually. Plant-based meals have a fraction of the carbon footprint of beef.",
    estimatedSavingKg: 60,
    difficulty: "easy",
    impact: "medium",
    tags: ["omnivore", "meat-heavy"],
  },
  {
    category: "food",
    title: "Reduce beef and lamb consumption",
    description: "Beef and lamb produce 5-10x more emissions than chicken or pork. Swapping just two beef meals a week for alternatives saves 200kg+ per year.",
    estimatedSavingKg: 200,
    difficulty: "medium",
    impact: "high",
    tags: ["omnivore", "meat-heavy"],
  },
  {
    category: "food",
    title: "Buy local and seasonal produce",
    description: "Locally grown, seasonal food travels less and requires less cold storage. Farmers markets and veg boxes are an easy way to start.",
    estimatedSavingKg: 80,
    difficulty: "easy",
    impact: "medium",
    tags: ["omnivore", "meat-heavy", "vegetarian", "vegan"],
  },
  {
    category: "food",
    title: "Cut food waste in half",
    description: "About 10% of global emissions come from food waste. Meal planning, proper storage, and using leftovers can halve the food you throw away.",
    estimatedSavingKg: 100,
    difficulty: "medium",
    impact: "medium",
    tags: ["omnivore", "meat-heavy", "vegetarian", "vegan"],
  },
  {
    category: "consumption",
    title: "Buy secondhand before buying new",
    description: "Manufacturing new goods is carbon-intensive. Secondhand platforms like Vinted, eBay, and local charity shops give items a second life.",
    estimatedSavingKg: 90,
    difficulty: "easy",
    impact: "medium",
    tags: ["consumption"],
  },
  {
    category: "consumption",
    title: "Repair instead of replace",
    description: "Before replacing a broken item, check if it can be repaired. Most electronics, clothing, and appliances can be fixed for a fraction of the replacement cost.",
    estimatedSavingKg: 70,
    difficulty: "medium",
    impact: "medium",
    tags: ["consumption"],
  },
  {
    category: "consumption",
    title: "Switch to a plant-based diet",
    description: "A fully plant-based diet can cut food-related emissions by up to 73%. Even a partial shift makes a significant difference.",
    estimatedSavingKg: 400,
    difficulty: "hard",
    impact: "high",
    tags: ["omnivore", "meat-heavy"],
  },
];

function personalizeRecommendations(
  profile: { dietType?: string | null; carType?: string | null; homeEnergySource?: string | null; flightsPerYear?: number | null } | null,
  topCategories: string[]
): RecommendationTemplate[] {
  const scored = ALL_RECOMMENDATIONS.map((rec) => {
    let score = 0;

    if (topCategories.includes(rec.category)) score += 3;

    if (profile) {
      if (rec.tags.includes(profile.carType ?? "")) score += 2;
      if (rec.tags.includes(profile.dietType ?? "")) score += 2;
      if (rec.tags.includes(profile.homeEnergySource ?? "")) score += 2;
      if ((profile.flightsPerYear ?? 0) > 0 && rec.tags.includes("flights")) score += 2;
    }

    score += Math.random() * 0.5;
    return { rec, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((s) => s.rec);
}

router.get("/recommendations", async (req, res): Promise<void> => {
  try {
    const recs = await db
      .select()
      .from(recommendationsTable)
      .where(eq(recommendationsTable.dismissed, false))
      .orderBy(desc(recommendationsTable.createdAt));

    res.json(
      recs.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list recommendations");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/recommendations", async (req, res): Promise<void> => {
  try {
    const profiles = await db.select().from(profilesTable).limit(1);
    const profile = profiles[0] ?? null;

    const emissions = await db.select().from(emissionsTable);
    const categoryTotals: Record<string, number> = {};
    for (const e of emissions) {
      categoryTotals[e.category] = (categoryTotals[e.category] ?? 0) + e.co2Kg;
    }
    const topCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat);

    const selected = personalizeRecommendations(profile, topCategories);

    await db.delete(recommendationsTable);
    const inserted = await db
      .insert(recommendationsTable)
      .values(
        selected.map((r) => ({
          category: r.category,
          title: r.title,
          description: r.description,
          estimatedSavingKg: r.estimatedSavingKg,
          difficulty: r.difficulty,
          impact: r.impact,
          dismissed: false,
        }))
      )
      .returning();

    res.status(201).json(
      inserted.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to generate recommendations");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/recommendations/:id/dismiss", async (req, res): Promise<void> => {
  try {
    const params = DismissRecommendationParams.safeParse({ id: Number(req.params.id) });
    if (!params.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const updated = await db
      .update(recommendationsTable)
      .set({ dismissed: true })
      .where(eq(recommendationsTable.id, params.data.id))
      .returning();
    if (updated.length === 0) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ ...updated[0], createdAt: updated[0].createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to dismiss recommendation");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
