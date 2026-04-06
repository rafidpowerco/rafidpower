import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Cpu, Activity, Database, Lock, TerminalSquare, AlertTriangle, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function SovereignDashboard() {
  const { isRTL } = useLanguage();
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Generate mock active logs exactly like a real AGI interface
    const mockLogs = [
      "SYSTEM INITIATED - RAFIDAIN SOVEREIGN CORE ONLINE",
      "Module [DeepMemory v3.0] connected... OK",
      "Awaiting web socket connections...",
      "Detected presence: User ID 7x991 (Basra region)",
      "Analyzing input: 'سعر ميزان 100 طن'...",
      "Routed to Sales Matrix | Priority: HIGH",
      "Warning: PLC connection timeout on node 4. Retrying...",
      "Module [Language Processor] active - Arabic RTL enforced.",
    ];
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      setLogs(prev => [...prev, mockLogs[currentIndex]]);
      currentIndex++;
      if (currentIndex >= mockLogs.length) {
        clearInterval(interval);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#050B14] text-green-400 font-mono flex flex-col p-6" dir="ltr">
      <header className="border-b border-green-500/30 pb-4 mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Cpu className="text-[#F5060B] animate-pulse" size={32} />
          <div>
            <h1 className="text-xl font-bold text-white tracking-[0.2em] font-sans">
              AL-RAFIDAIN SOVEREIGN AGI
            </h1>
            <p className="text-xs text-green-500/60 uppercase tracking-widest">
              Live Command Center
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
          <span className="text-xs uppercase tracking-widest">System Secure</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Memory and Nodes Matrix */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-green-500/20 bg-green-900/5 p-4 rounded flex flex-col gap-2">
              <Activity size={20} className="text-[#F5060B]" />
              <span className="text-xs text-gray-400">Processing Load</span>
              <span className="text-2xl font-bold text-white">12.4%</span>
            </div>
            <div className="border border-green-500/20 bg-green-900/5 p-4 rounded flex flex-col gap-2">
              <Users size={20} className="text-[#F5060B]" />
              <span className="text-xs text-gray-400">Active Web Users</span>
              <span className="text-2xl font-bold text-white">4</span>
            </div>
            <div className="border border-green-500/20 bg-green-900/5 p-4 rounded flex flex-col gap-2">
              <Database size={20} className="text-[#F5060B]" />
              <span className="text-xs text-gray-400">Memory Matrix</span>
              <span className="text-2xl font-bold text-white">Synced</span>
            </div>
            <div className="border border-red-500/20 bg-red-900/5 p-4 rounded flex flex-col gap-2">
              <Lock size={20} className="text-[#F5060B]" />
              <span className="text-xs text-gray-400">Encryption Level</span>
              <span className="text-2xl font-bold text-red-500">AES-256</span>
            </div>
          </div>

          <div className="flex-1 border border-green-500/20 bg-black/40 rounded p-4 flex flex-col">
            <div className="border-b border-green-500/20 pb-2 mb-4 flex items-center gap-2">
              <TerminalSquare size={16} />
              <span className="text-xs font-bold uppercase tracking-widest text-green-300">Live Server Logs</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[11px] leading-relaxed">
              {logs.map((log, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className="flex gap-4"
                >
                  <span className="text-green-600">[{new Date().toISOString().split('T')[1].split('.')[0]}]</span>
                  <span className={log.includes('Warning') ? 'text-yellow-400' : 'text-green-400'}>{log}</span>
                </motion.div>
              ))}
              <div className="animate-pulse text-green-700">_</div>
            </div>
          </div>
        </div>

        {/* Global Security Panel */}
        <div className="flex flex-col gap-6">
          <div className="border border-[#F5060B]/30 bg-[#F5060B]/5 p-6 rounded flex flex-col items-center justify-center text-center gap-4 h-full relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#F5060B]/10 via-transparent to-transparent animate-pulse"></div>
            
            <AlertTriangle size={48} className="text-[#F5060B]" />
            <h3 className="text-white font-bold text-xl font-sans">SOVEREIGN MODE</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              The AGI is autonomously interacting with visitors, routing PLC configurations, and defending against unauthorized web scraping 24/7.
            </p>
            <div className="mt-4 px-4 py-2 border border-[#F5060B] bg-[#F5060B]/20 rounded-full text-white text-xs font-bold uppercase tracking-widest font-sans">
              No manual override required
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
