import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
  return (
    <Switch>
      <Route path="/" component={() => <ProtectedRoute component={Welcome} />} />
      <Route path="/create" component={() => <ProtectedRoute component={Create} />} />
      <Route path="/join" component={() => <ProtectedRoute component={Join} />} />
      <Route path="/hunt/:code" component={() => <ProtectedRoute component={Hunt} />} />
      <Route path="/stats/:code" component={() => <ProtectedRoute component={Stats} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      <Route path="/history" component={() => <ProtectedRoute component={History} />} />
      <Route path="/landing" component={Landing} />
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
