import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Leaf, TreePine, Zap } from "lucide-react";

export function EcoLevel({ level, streak }: { level: string, streak: number }) {
  const levelInfo = {
    seedling: { icon: Leaf, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900", next: "sapling", threshold: 5 },
    sapling: { icon: Leaf, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900", next: "tree", threshold: 15 },
    tree: { icon: TreePine, color: "text-primary", bg: "bg-primary/20", next: "forest", threshold: 30 },
    forest: { icon: TreePine, color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-200 dark:bg-emerald-800", next: "max", threshold: 100 },
  };

  const info = levelInfo[(level as keyof typeof levelInfo) || "seedling"] || levelInfo.seedling;
  const Icon = info.icon;
  const progress = Math.min(100, (streak / info.threshold) * 100);

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-card to-secondary/30">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${info.bg}`}>
            <Icon className={`w-8 h-8 ${info.color}`} />
          </div>
          <div>
            <h3 className="text-xl font-bold font-outfit text-foreground capitalize">{level}</h3>
            <p className="text-muted-foreground text-sm">Level {streak} Days Streak</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-muted-foreground flex items-center gap-1">
              <Zap className="w-4 h-4 text-amber-500" /> Current Streak: {streak}
            </span>
            <span className="text-primary">{progress.toFixed(0)}% to {info.next}</span>
          </div>
          <Progress value={progress} className="h-2.5" />
        </div>
      </CardContent>
    </Card>
  );
}
