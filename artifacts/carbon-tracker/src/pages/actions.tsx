import { useListActions, useGetActionStreak, getListActionsQueryKey, getGetActionStreakQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Flame, Leaf, ArrowRight } from "lucide-react";
import { EcoLevel } from "@/components/eco-level";

export default function Actions() {
  const { data: actions, isLoading: loadingActions } = useListActions({ query: { queryKey: getListActionsQueryKey() } });
  const { data: streakInfo, isLoading: loadingStreak } = useGetActionStreak({ query: { queryKey: getGetActionStreakQueryKey() } });

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-outfit text-foreground">Your Progress</h1>
          <p className="text-muted-foreground mt-1">Actions taken and milestones achieved.</p>
        </header>

        {loadingStreak ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        ) : streakInfo ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <EcoLevel level={streakInfo.level} streak={streakInfo.currentStreak} />
            
            <Card className="border-none shadow-sm bg-gradient-to-br from-card to-card">
              <CardContent className="p-6 h-full flex flex-col justify-center">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary/50 p-4 rounded-xl text-center">
                    <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                    <div className="text-3xl font-bold">{streakInfo.longestStreak}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Longest Streak</div>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-xl text-center">
                    <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-3xl font-bold">{streakInfo.totalActions}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Total Actions</div>
                  </div>
                </div>
                
                {streakInfo.badges && streakInfo.badges.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm font-medium text-muted-foreground mb-3">Earned Badges</p>
                    <div className="flex flex-wrap gap-2">
                      {streakInfo.badges.map(badge => (
                        <Badge key={badge} variant="secondary" className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 hover:bg-amber-100">
                          <Award className="w-3.5 h-3.5 mr-1" />
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Completed Actions Log</CardTitle>
            <CardDescription>A record of your positive climate choices.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingActions ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : actions && actions.length > 0 ? (
              <div className="relative border-l-2 border-muted ml-4 md:ml-6 space-y-8 pb-4">
                {actions.map((action, i) => (
                  <div key={action.id} className="relative pl-6 md:pl-8">
                    <div className="absolute w-4 h-4 bg-primary rounded-full -left-[9px] top-1 border-4 border-card" />
                    
                    <div className="bg-card border rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow group">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 mb-2">
                        <h3 className="font-semibold text-lg">{action.title}</h3>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="capitalize text-muted-foreground">{action.category}</Badge>
                          <span className="text-sm text-muted-foreground font-medium">
                            {format(new Date(action.completedAt), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-emerald-600 dark:text-emerald-400 font-medium text-sm mt-3 bg-emerald-50 dark:bg-emerald-900/20 inline-flex px-3 py-1.5 rounded-md">
                        <Leaf className="w-4 h-4 mr-1.5" />
                        Saved {action.co2SavedKg}kg CO2
                      </div>
                      
                      {action.notes && (
                        <p className="mt-3 text-sm text-muted-foreground italic border-l-2 border-muted pl-3">
                          "{action.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No actions completed yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Head over to Recommendations to find ways to reduce your footprint and earn your first badge.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
