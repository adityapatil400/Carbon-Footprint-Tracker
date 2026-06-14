import { useState } from "react";
import { useListRecommendations, useGenerateRecommendations, useDismissRecommendation, useCompleteAction, getListRecommendationsQueryKey, getGetDashboardSummaryQueryKey, getListActionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, CheckCircle2, X, RefreshCw, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function Recommendations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: recommendations, isLoading } = useListRecommendations({ query: { queryKey: getListRecommendationsQueryKey() } });
  const generateMut = useGenerateRecommendations();
  const dismissMut = useDismissRecommendation();
  const completeMut = useCompleteAction();

  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [notes, setNotes] = useState("");

  const handleGenerate = () => {
    generateMut.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListRecommendationsQueryKey() });
        toast({ title: "Fresh ideas generated!" });
      }
    });
  };

  const handleDismiss = (id: number) => {
    dismissMut.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListRecommendationsQueryKey() });
      }
    });
  };

  const handleComplete = () => {
    if (!selectedAction) return;
    
    completeMut.mutate({
      data: {
        title: selectedAction.title,
        category: selectedAction.category,
        co2SavedKg: selectedAction.estimatedSavingKg,
        notes: notes || undefined
      }
    }, {
      onSuccess: () => {
        // Also dismiss the recommendation
        dismissMut.mutate({ id: selectedAction.id });
        
        queryClient.invalidateQueries({ queryKey: getListRecommendationsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListActionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        
        toast({
          title: "Action Completed!",
          description: `Awesome! You saved ~${selectedAction.estimatedSavingKg}kg of CO2.`,
        });
        
        setSelectedAction(null);
        setNotes("");
      }
    });
  };

  const difficultyColor = {
    easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  };

  const impactColor = {
    low: "text-slate-500",
    medium: "text-blue-500",
    high: "text-emerald-600 font-bold"
  };

  const activeRecs = recommendations?.filter(r => !r.dismissed) || [];

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-outfit text-foreground flex items-center gap-3">
              Ideas <Sparkles className="w-8 h-8 text-amber-500" />
            </h1>
            <p className="text-muted-foreground mt-1">Personalized actions to lower your footprint.</p>
          </div>
          <Button 
            onClick={handleGenerate} 
            variant="outline" 
            disabled={generateMut.isPending}
            className="shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${generateMut.isPending ? 'animate-spin' : ''}`} />
            {generateMut.isPending ? "Thinking..." : "Generate Fresh Ideas"}
          </Button>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        ) : activeRecs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeRecs.map(rec => (
              <Card key={rec.id} className="flex flex-col border-none shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
                <CardContent className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="secondary" className={`capitalize ${difficultyColor[rec.difficulty as keyof typeof difficultyColor] || ""}`}>
                      {rec.difficulty} Effort
                    </Badge>
                    <button 
                      onClick={() => handleDismiss(rec.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      aria-label="Dismiss"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{rec.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">{rec.description}</p>
                  
                  <div className="flex items-center gap-2 mt-auto text-sm bg-secondary/50 p-2.5 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Impact:</span>
                    <span className={`capitalize ${impactColor[rec.impact as keyof typeof impactColor] || ""}`}>
                      {rec.impact} (~{rec.estimatedSavingKg}kg CO2)
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button 
                    className="w-full" 
                    variant="default"
                    onClick={() => setSelectedAction(rec)}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark Completed
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4 bg-card rounded-2xl border border-dashed">
            <Sparkles className="w-12 h-12 text-amber-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium mb-2">You're all caught up!</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              You've cleared your recommendation list. Generate new ideas when you're ready for your next eco challenge.
            </p>
            <Button onClick={handleGenerate} disabled={generateMut.isPending} size="lg">
              Generate New Ideas
            </Button>
          </div>
        )}

        <Dialog open={!!selectedAction} onOpenChange={(open) => !open && setSelectedAction(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Complete Action</DialogTitle>
              <DialogDescription>
                Awesome! You're marking "{selectedAction?.title}" as complete.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg flex items-center justify-between">
                <span className="text-emerald-800 dark:text-emerald-300 font-medium">Estimated Impact</span>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">-{selectedAction?.estimatedSavingKg}kg CO2</span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Reflections or Notes (Optional)</Label>
                <Textarea 
                  id="notes" 
                  placeholder="How did it go? Will you do it again?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none h-24"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedAction(null)}>Cancel</Button>
              <Button onClick={handleComplete} disabled={completeMut.isPending}>
                {completeMut.isPending ? "Saving..." : "Confirm Completion"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
