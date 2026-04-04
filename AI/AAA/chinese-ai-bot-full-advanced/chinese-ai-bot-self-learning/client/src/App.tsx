import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { BetaBanner } from "./components/BetaBanner";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Statistics from "./pages/Statistics";
import Agents from "./pages/Agents";
import Models from "./pages/Models";
import Knowledge from "./pages/Knowledge";
import TermsOfUse from "./pages/TermsOfUse";
import Feedback from "./pages/Feedback";
import Status from "./pages/Status";

function Router() {
  return (
    <Switch>
      <Route path={""} component={Home} />
      <Route path={"/terms"} component={TermsOfUse} />
      <Route path={"/feedback"} component={Feedback} />
      <Route path={"/status"} component={Status} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/chat"} component={Chat} />
      <Route path={"/knowledge"} component={Knowledge} />
      <Route path={"/statistics"} component={Statistics} />
      <Route path={"/agents"} component={Agents} />
      <Route path={"/models"} component={Models} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

const showBetaBanner = import.meta.env.VITE_SHOW_BETA_BANNER === "1";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          {showBetaBanner && <BetaBanner />}
          <Toaster
            position="top-center"
            richColors
            closeButton
            duration={4800}
            dir="rtl"
            toastOptions={{
              classNames: {
                toast:
                  "font-sans border border-slate-600/80 shadow-lg backdrop-blur-sm",
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
