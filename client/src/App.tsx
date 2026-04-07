import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import WhatsAppButton from "./components/WhatsAppButton";
import FacebookButton from "./components/FacebookButton";
import SovereignAgiWidget from "./components/SovereignAgiWidget";
import { LanguageProvider } from "./contexts/LanguageContext";
import SovereignDashboard from "./pages/SovereignDashboard";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/command-center"} component={SovereignDashboard} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function AgiBootLoader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p: number) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return p + Math.floor(Math.random() * 15) + 5;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0A0E17] flex flex-col items-center justify-center font-mono transition-opacity duration-1000">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a3a52]/20 via-[#0A0E17] to-[#0A0E17] animate-pulse"></div>
      
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="w-24 h-24 relative overflow-hidden rounded-2xl shadow-[0_0_30px_rgba(201,147,57,0.3)] bg-white/5 backdrop-blur-sm p-4 border border-white/10 animate-[bounce_2s_infinite]">
          <img src="/logo.png" alt="Rafid Power" className="w-full h-full object-contain" />
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            AL-RAFIDAIN SOVEREIGN
          </h2>
          <p className="text-xs text-[#c99339] tracking-[0.2em] font-bold">NEURAL ENGINE INITIATING</p>
        </div>

        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mt-4 relative">
          <div 
            className="h-full bg-gradient-to-r from-[#e63946] via-[#c99339] to-[#ffffff] transition-all duration-200 ease-out shadow-[0_0_10px_#e63946] agi-progress-bar"
            data-progress={progress}
          />
        </div>
        
        <p className="text-[10px] text-gray-500 tracking-widest mt-2">
          {progress < 30 ? "CALIBRATING LOAD CELLS..." : progress < 70 ? "ESTABLISHING SECURE PLC UPLINK..." : progress < 100 ? "LOADING COGNITIVE MEMORY..." : "SYSTEM ONLINE"}
        </p>
      </div>
    </div>
  );
}

function App() {
  const [isBooting, setIsBooting] = useState(true);

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <LanguageProvider>
          {isBooting && <AgiBootLoader onComplete={() => setIsBooting(false)} />}
          <TooltipProvider>
            <Toaster />
            <Router />
            <WhatsAppButton />
            <FacebookButton />
            <SovereignAgiWidget />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
