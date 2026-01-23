import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/providers/AuthProvider";
import { AppFooter } from "@/components/AppFooter";
import { DataMigrationHandler } from "@/components/DataMigrationHandler";
import NotFound from "@/pages/not-found";
import LoadingScreen from "@/pages/LoadingScreen";
import InterestSelection from "@/pages/InterestSelection";
import Welcome from "@/pages/Welcome";
import Create from "@/pages/Create";
import Join from "@/pages/Join";
import Hunt from "@/pages/Hunt";
import Lobby from "@/pages/Lobby";
import Stats from "@/pages/Stats";
import Profile from "@/pages/Profile";
import History from "@/pages/History";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoadingScreen} />
      <Route path="/interests" component={InterestSelection} />
      <Route path="/welcome" component={Welcome} />
      <Route path="/create" component={Create} />
      <Route path="/join" component={Join} />
      <Route path="/lobby/:code" component={Lobby} />
      <Route path="/hunt/:code" component={Hunt} />
      <Route path="/stats/:code" component={Stats} />
      <Route path="/profile" component={Profile} />
      <Route path="/history" component={History} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <DataMigrationHandler />
          <Toaster />
          <Router />
          <AppFooter />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
