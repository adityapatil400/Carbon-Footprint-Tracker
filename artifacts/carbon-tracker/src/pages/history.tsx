import { useState } from "react";
import { useListEmissions, useDeleteEmission, getListEmissionsQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Trash2, Edit, AlertTriangle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function History() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  const queryParams = categoryFilter !== "all" ? { category: categoryFilter } : {};
  const { data: emissions, isLoading } = useListEmissions(queryParams, { query: { queryKey: getListEmissionsQueryKey(queryParams) } });
  
  const deleteMut = useDeleteEmission();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMut.mutate({ id: deleteId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEmissionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        toast({ title: "Entry deleted successfully" });
        setDeleteId(null);
      }
    });
  };

  // Group emissions by month
  const groupedEmissions = emissions?.reduce((acc: any, curr) => {
    const date = new Date(curr.date);
    const monthYear = format(date, "MMMM yyyy");
    if (!acc[monthYear]) acc[monthYear] = { total: 0, items: [] };
    acc[monthYear].items.push(curr);
    acc[monthYear].total += curr.co2Kg;
    return acc;
  }, {});

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-outfit text-foreground">History</h1>
            <p className="text-muted-foreground mt-1">Review your past logs and impact.</p>
          </div>
          
          <div className="w-full sm:w-48">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="transportation">Transportation</SelectItem>
                <SelectItem value="energy">Energy</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="consumption">Consumption</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : !emissions || emissions.length === 0 ? (
          <Card className="border-dashed shadow-none bg-transparent">
            <CardContent className="p-12 text-center text-muted-foreground">
              No entries found. Go log some activities!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedEmissions).map(([month, data]: [string, any]) => (
              <div key={month} className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h2 className="text-xl font-semibold">{month}</h2>
                  <span className="font-bold text-primary">{data.total.toFixed(1)} kg CO2</span>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {data.items.map((entry: any) => (
                    <Card key={entry.id} className="border-none shadow-sm hover:shadow-md transition-all group">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="hidden sm:flex w-12 h-12 bg-secondary rounded-full items-center justify-center font-bold text-secondary-foreground text-sm">
                            {format(new Date(entry.date), "d")}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-base">{entry.description}</h3>
                              <Badge variant="outline" className="capitalize text-xs">{entry.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(entry.date), "MMM d, yyyy")} • {entry.subcategory}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-lg font-bold text-foreground block">{entry.co2Kg} kg</span>
                          </div>
                          
                          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => setDeleteId(entry.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Delete Entry
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this emission log? This action cannot be undone and will affect your dashboard totals.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {deleteMut.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
