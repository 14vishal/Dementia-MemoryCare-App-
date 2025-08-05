import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/ThemeProvider";
import HomePage from "@/pages/home-page";
import MemoryJournalPage from "@/pages/memory-journal";
import FamiliarFacesPage from "@/pages/familiar-faces";
import DailyRoutinePage from "@/pages/daily-routine";
import ContactsPage from "@/pages/contacts";
import SettingsPage from "@/pages/settings";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/memory-journal" component={MemoryJournalPage} />
      <Route path="/familiar-faces" component={FamiliarFacesPage} />
      <Route path="/daily-routine" component={DailyRoutinePage} />
      <Route path="/contacts" component={ContactsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/auth" component={AuthPage} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            {/* Parallax Background */}
            <div className="parallax-bg" />
            {/* Floating Particles */}
            <div className="parallax-particles">
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
            </div>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
