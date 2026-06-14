import { useGetProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUpdateProfile } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  householdSize: z.coerce.number().min(1, "Household size must be at least 1"),
  dietType: z.string().min(1, "Please select a diet type"),
  carType: z.string().optional(),
  homeEnergySource: z.string().min(1, "Please select a home energy source"),
  flightsPerYear: z.coerce.number().min(0, "Cannot be negative"),
});

export default function Settings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: profile, isLoading } = useGetProfile({ query: { queryKey: getGetProfileQueryKey() } });
  
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      country: "",
      householdSize: 1,
      dietType: "",
      carType: "none",
      homeEnergySource: "",
      flightsPerYear: 0,
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        country: profile.country,
        householdSize: profile.householdSize,
        dietType: profile.dietType,
        carType: profile.carType || "none",
        homeEnergySource: profile.homeEnergySource,
        flightsPerYear: profile.flightsPerYear,
      });
    }
  }, [profile, form]);

  const updateProfile = useUpdateProfile();

  const onSubmit = (data: z.infer<typeof profileSchema>) => {
    updateProfile.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
          toast({
            title: "Profile Updated",
            description: "Your settings have been saved successfully.",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update profile.",
            variant: "destructive"
          });
        }
      }
    );
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
        <header className="mb-8">
          <h1 className="text-3xl font-bold font-outfit text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your profile and footprint baseline.</p>
        </header>

        {isLoading ? (
          <div className="space-y-6">
            <div className="h-20 bg-muted animate-pulse rounded-lg"></div>
            <div className="h-20 bg-muted animate-pulse rounded-lg"></div>
          </div>
        ) : (
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="householdSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Household Size</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dietType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diet Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select diet" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="vegan">Vegan</SelectItem>
                              <SelectItem value="vegetarian">Vegetarian</SelectItem>
                              <SelectItem value="omnivore">Omnivore</SelectItem>
                              <SelectItem value="meat-heavy">Meat-heavy</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="carType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Car Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select car type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">I don't drive</SelectItem>
                              <SelectItem value="electric">Electric (EV)</SelectItem>
                              <SelectItem value="hybrid">Hybrid</SelectItem>
                              <SelectItem value="petrol">Petrol / Gas</SelectItem>
                              <SelectItem value="diesel">Diesel</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="homeEnergySource"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Home Energy</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select energy source" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="renewable">100% Renewable</SelectItem>
                              <SelectItem value="mixed">Mixed Grid</SelectItem>
                              <SelectItem value="fossil">Mainly Fossil Fuels</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="flightsPerYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Flights Per Year (Return)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <Button type="submit" disabled={updateProfile.isPending}>
                      {updateProfile.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
