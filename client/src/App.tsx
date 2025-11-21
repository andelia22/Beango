import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Welcome from "@/pages/Welcome";
import Create from "@/pages/Create";
import Join from "@/pages/Join";
import Hunt from "@/pages/Hunt";
import Stats from "@/pages/Stats";
import Profile from "@/pages/Profile";
import History from "@/pages/History";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Welcome} />
          <Route path="/create" component={Create} />
          <Route path="/join" component={Join} />
          <Route path="/hunt/:code" component={Hunt} />
          <Route path="/stats/:code" component={Stats} />
          <Route path="/profile" component={Profile} />
          <Route path="/history" component={History} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
