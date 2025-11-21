import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Welcome from "@/pages/Welcome";
import Create from "@/pages/Create";
import Join from "@/pages/Join";
import Hunt from "@/pages/Hunt";
import Stats from "@/pages/Stats";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Welcome} />
      <Route path="/create" component={Create} />
      <Route path="/join" component={Join} />
      <Route path="/hunt/:code" component={Hunt} />
      <Route path="/stats/:code" component={Stats} />
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
