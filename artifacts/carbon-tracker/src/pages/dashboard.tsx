import { useGetDashboardSummary, useGetDashboardTrends, useGetCategoryBreakdown, useListRecommendations, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Layout } from "@/components/layout";
import { EcoLevel } from "@/components/eco-level";
import { Link } from "wouter";
import { ArrowUpRight, Plus, CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const { data: trends, isLoading: loadingTrends } = useGetDashboardTrends({ period: "weekly" }, { query: { queryKey: ["/api/dashboard/trends", { period: "weekly" }] } });
  const { data: breakdown, isLoading: loadingBreakdown } = useGetCategoryBreakdown({ query: { queryKey: ["/api/dashboard/breakdown"] } });
  const { data: recommendations, isLoading: loadingRecs } = useListRecommendations({ query: { queryKey: ["/api/recommendations"] } });

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-outfit text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Your planetary impact at a glance.</p>
          </div>
          <Link href="/log">
            <Button size="lg" className="shadow-md">
              <Plus className="w-5 h-5 mr-2" />
              Log Activity
            </Button>
          </Link>
        </header>

        {loadingSummary ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : summary ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-card to-card border-none shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">Total CO2 Footprint</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-4xl font-bold text-foreground">{summary.totalCo2Kg.toFixed(1)}</h2>
                  <span className="text-muted-foreground font-medium">kg</span>
                </div>
                <div className={`mt-3 flex items-center gap-1.5 text-sm font-medium ${summary.comparedToAveragePercent < 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {summary.comparedToAveragePercent < 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                  <span>{Math.abs(summary.comparedToAveragePercent)}% {summary.comparedToAveragePercent < 0 ? 'below' : 'above'} average</span>
                </div>
              </CardContent>
            </Card>

            <EcoLevel level={summary.level} streak={summary.streak} />

            <Card className="border-none shadow-sm bg-gradient-to-br from-card to-card">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">Impact Saved</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-4xl font-bold text-foreground">{summary.savedCo2Kg.toFixed(1)}</h2>
                  <span className="text-muted-foreground font-medium">kg</span>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Through completed actions</span>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm border-none">
            <CardHeader>
              <CardTitle>Weekly Trend</CardTitle>
              <CardDescription>CO2 emissions over the past periods</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTrends ? (
                <Skeleton className="w-full h-[300px] rounded-lg" />
              ) : trends && trends.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}kg`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Line type="monotone" dataKey="co2Kg" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No trend data available yet.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-none">
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Where your emissions come from</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingBreakdown ? (
                <Skeleton className="w-full h-[300px] rounded-lg" />
              ) : breakdown && breakdown.length > 0 ? (
                <div className="h-[300px] w-full flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={breakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="co2Kg"
                        nameKey="category"
                      >
                        {breakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                        formatter={(value: number) => [`${value.toFixed(1)} kg`, 'CO2']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="w-1/3 pr-4">
                    <ul className="space-y-2">
                      {breakdown.map((cat, i) => (
                        <li key={cat.category} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                            <span className="capitalize text-muted-foreground">{cat.category}</span>
                          </div>
                          <span className="font-medium">{cat.percentage.toFixed(0)}%</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No breakdown data available yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="pt-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-outfit text-foreground">Top Recommendations</h2>
            <Link href="/recommendations">
              <Button variant="ghost" className="text-primary hover:text-primary/80 hover:bg-primary/10">
                View All <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {loadingRecs ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          ) : recommendations && recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.filter(r => !r.dismissed).slice(0, 2).map((rec) => (
                <Card key={rec.id} className="shadow-sm border-none bg-card hover:bg-secondary/20 transition-colors cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <div className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                        {rec.category}
                      </div>
                      <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                        -{rec.estimatedSavingKg}kg CO2
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{rec.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">{rec.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed bg-transparent shadow-none">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Generate some fresh ideas to start reducing your impact.</p>
                <Link href="/recommendations">
                  <Button variant="outline" className="mt-4">Get Recommendations</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
