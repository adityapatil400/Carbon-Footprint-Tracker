import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, ArrowRight, ArrowLeft } from "lucide-react";

const onboardingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  householdSize: z.coerce.number().min(1, "Household size must be at least 1"),
  dietType: z.string().min(1, "Please select a diet type"),
  carType: z.string().optional(),
  homeEnergySource: z.string().min(1, "Please select a home energy source"),
  flightsPerYear: z.coerce.number().min(0, "Cannot be negative"),
});

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const form = useForm<z.infer<typeof onboardingSchema>>({
    resolver: zodResolver(onboardingSchema),
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

  const createProfile = useCreateProfile();

  const onSubmit = (data: z.infer<typeof onboardingSchema>) => {
    if (step < totalSteps) {
      setStep(step + 1);
      return;
    }

    createProfile.mutate(
      { data: { ...data, onboardingComplete: true } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
          setLocation("/dashboard");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      
      <div className="w-full max-w-lg space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
            <Leaf className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-outfit text-foreground">Welcome to EcoTrace</h1>
          <p className="text-muted-foreground text-lg">Let's set up your planetary impact profile.</p>
        </div>

        <Card className="border-none shadow-xl bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex justify-between items-center text-lg">
              <span>Step {step} of {totalSteps}</span>
              <span className="text-sm font-normal text-muted-foreground">
                {Math.round((step / totalSteps) * 100)}% Complete
              </span>
            </CardTitle>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {step === 1 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What should we call you?</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" className="h-12 text-lg" {...field} />
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
                          <FormLabel>Which country do you live in?</FormLabel>
                          <FormControl>
                            <Input placeholder="Country" className="h-12 text-lg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                    <FormField
                      control={form.control}
                      name="householdSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>How many people live in your household?</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" className="h-12 text-lg" {...field} />
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
                          <FormLabel>What best describes your diet?</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 text-lg">
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
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                    <FormField
                      control={form.control}
                      name="carType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What kind of car do you drive?</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 text-lg">
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
                          <FormLabel>What's your primary home energy source?</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 text-lg">
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
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                    <FormField
                      control={form.control}
                      name="flightsPerYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>How many return flights do you take per year?</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" className="h-12 text-lg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="p-4 bg-primary/10 rounded-lg mt-6">
                      <p className="text-sm text-primary font-medium">
                        You're all set! Let's start tracking and reducing your footprint.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  {step > 1 ? (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setStep(step - 1)}
                      className="h-12 px-6"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  ) : <div></div>}
                  
                  <Button 
                    type="submit" 
                    className="h-12 px-8 ml-auto"
                    disabled={createProfile.isPending}
                  >
                    {step === totalSteps ? (
                      createProfile.isPending ? "Saving..." : "Complete"
                    ) : (
                      <>Next <ArrowRight className="w-4 h-4 ml-2" /></>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
