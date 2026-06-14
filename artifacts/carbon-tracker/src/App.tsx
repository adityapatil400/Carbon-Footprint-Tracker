import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useGetProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useEffect } from "react";

import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/onboarding";
import Dashboard from "@/pages/dashboard";
import LogEmission from "@/pages/log-emission";
import History from "@/pages/history";
import Recommendations from "@/pages/recommendations";
import Actions from "@/pages/actions";
import Settings from "@/pages/settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: profile, isLoading, isError } = useGetProfile({ query: { queryKey: getGetProfileQueryKey() } });

  useEffect(() => {
    if (isLoading) return;

    if (isError || !profile || !profile.onboardingComplete) {
      if (location !== "/") {
        setLocation("/");
      }
    } else {
      if (location === "/") {
        setLocation("/dashboard");
      }
    }
  }, [profile, isLoading, isError, location, setLocation]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <AuthGuard>
      <Switch>
        <Route path="/" component={Onboarding} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/log" component={LogEmission} />
        <Route path="/history" component={History} />
        <Route path="/recommendations" component={Recommendations} />
        <Route path="/actions" component={Actions} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </AuthGuard>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
