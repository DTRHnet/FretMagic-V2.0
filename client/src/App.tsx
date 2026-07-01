import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Public pages
import Home from "./pages/Home";
import Pricing from "./pages/Pricing";

// App pages (authenticated)
import Dashboard from "./pages/Dashboard";
import Fretboard from "./pages/Fretboard";
import Learn from "./pages/Learn";
import LessonDetail from "./pages/LessonDetail";
import PitchTrainer from "./pages/PitchTrainer";
import AIAssistant from "./pages/AIAssistant";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Analytics from "./pages/Analytics";

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Home} />
      <Route path="/pricing" component={Pricing} />

      {/* App */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/fretboard" component={Fretboard} />
      <Route path="/learn" component={Learn} />
      <Route path="/lesson/:id" component={LessonDetail} />
      <Route path="/pitch-trainer" component={PitchTrainer} />
      <Route path="/ai-assistant" component={AIAssistant} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/analytics" component={Analytics} />

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: "oklch(0.16 0.006 260)",
                border: "1px solid oklch(0.25 0.008 260)",
                color: "oklch(0.93 0.01 80)",
              },
            }}
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
