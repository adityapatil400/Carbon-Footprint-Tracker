import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateEmission, getListEmissionsQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/layout";
import { Car, Zap, Utensils, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const emissionSchema = z.object({
  category: z.string().min(1, "Please select a category"),
  subcategory: z.string().min(1, "Please select a subcategory"),
  description: z.string().min(2, "Description is required"),
  co2Kg: z.coerce.number().min(0.1, "Value must be greater than 0"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
});

const CATEGORIES = [
  { id: "transportation", label: "Transportation", icon: Car },
  { id: "energy", label: "Energy", icon: Zap },
  { id: "food", label: "Food", icon: Utensils },
  { id: "consumption", label: "Consumption", icon: ShoppingBag },
];

const PRESETS = [
  { label: "Car Commute (10km)", category: "transportation", subcategory: "driving", description: "Daily car commute", co2Kg: 2.5 },
  { label: "Flight (Short Haul)", category: "transportation", subcategory: "flying", description: "Short haul flight", co2Kg: 150 },
  { label: "Beef Meal", category: "food", subcategory: "meat", description: "Steak dinner", co2Kg: 5.5 },
  { label: "Electricity Bill", category: "energy", subcategory: "electricity", description: "Monthly electricity", co2Kg: 40 },
];

export default function LogEmission() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof emissionSchema>>({
    resolver: zodResolver(emissionSchema),
    defaultValues: {
      category: "",
      subcategory: "",
      description: "",
      co2Kg: 0,
      date: new Date().toISOString().split('T')[0],
      notes: "",
    },
  });

  const category = form.watch("category");
  const co2Kg = form.watch("co2Kg");

  const createEmission = useCreateEmission();

  const onSubmit = (data: z.infer<typeof emissionSchema>) => {
    createEmission.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListEmissionsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          toast({
            title: "Emission Logged",
            description: `Successfully logged ${data.co2Kg}kg of CO2.`,
          });
          setLocation("/dashboard");
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to log emission. Please try again.",
            variant: "destructive"
          });
        }
      }
    );
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    form.setValue("category", preset.category);
    form.setValue("subcategory", preset.subcategory);
    form.setValue("description", preset.description);
    form.setValue("co2Kg", preset.co2Kg);
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold font-outfit text-foreground">Log Activity</h1>
          <p className="text-muted-foreground mt-1">Track your impact, one step at a time.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {CATEGORIES.map((cat) => (
                                <button
                                  type="button"
                                  key={cat.id}
                                  onClick={() => field.onChange(cat.id)}
                                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                                    field.value === cat.id 
                                      ? 'border-primary bg-primary/10 text-primary' 
                                      : 'border-border bg-card hover:bg-secondary/50 text-muted-foreground'
                                  }`}
                                >
                                  <cat.icon className="w-6 h-6 mb-2" />
                                  <span className="text-sm font-medium">{cat.label}</span>
                                </button>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="subcategory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subcategory</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. driving, flying, electricity" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input placeholder="What did you do?" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="co2Kg"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estimated CO2 (kg)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" min="0" className="text-xl h-14 font-medium" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes (Optional)</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Any additional details..." className="resize-none" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-border">
                      <div className="text-muted-foreground text-sm">
                        Real-time estimate: <strong className="text-foreground text-lg ml-1">{Number(co2Kg) || 0} kg</strong>
                      </div>
                      <Button type="submit" size="lg" disabled={createEmission.isPending}>
                        {createEmission.isPending ? "Logging..." : "Log Activity"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-secondary/30">
              <CardHeader>
                <CardTitle className="text-lg">Quick Add Presets</CardTitle>
                <CardDescription>Common activities for fast logging.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyPreset(preset)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-card hover:bg-primary/10 border border-border transition-colors text-left group"
                  >
                    <div>
                      <div className="font-medium group-hover:text-primary transition-colors">{preset.label}</div>
                      <div className="text-xs text-muted-foreground capitalize">{preset.category}</div>
                    </div>
                    <div className="font-semibold text-foreground bg-secondary px-2 py-1 rounded-md text-sm">
                      {preset.co2Kg}kg
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
