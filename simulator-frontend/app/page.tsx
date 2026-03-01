"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, AreaChart, Area, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

// --- INTERFACES ---
interface SimulationParams {
  initial_price: number;
  cost_price: number;
  total_inventory: number;
  base_demand: number;
  sensitivity: number;
}

interface HistoryData {
  day: number;
  user_price: number;
  competitor_price: number;
  market_share: number;
  items_sold: number;
  stock_level: number;
  dynamic_cumulative_profit: number;
  static_cumulative_profit: number;
  insight: string;
}

interface SummaryData {
  total_profit: number;
  total_units_sold: number;
  competitor_total_profit: number;
  avg_user_price: number;
  avg_competitor_price: number;
}

// --- COMPONENTS ---

const BackgroundDecoration = () => (
  <>
    {/* Dynamic Animated Grid Background */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

    {/* Decorative ambient light */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-accent-cyan/15 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-screen" />
    <div className="absolute bottom-0 right-0 w-[800px] h-[400px] bg-accent-amethyst/15 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-screen" />
  </>
);

const HomePage = ({ onGetStarted }: { onGetStarted: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col items-center justify-center min-h-screen z-10 p-8 text-center"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <h1 className="text-7xl lg:text-9xl font-black tracking-tighter text-white mb-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
          OptiFlux
        </h1>
        <p className="text-lg lg:text-2xl text-accent-cyan font-medium tracking-wide mb-12">
          Real-time demand-based price optimization.
        </p>
      </motion.div>

      <motion.button
        onClick={onGetStarted}
        whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(6,182,212,0.4)" }}
        whileTap={{ scale: 0.98 }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="px-12 py-5 bg-gradient-to-r from-accent-cyan via-accent-emerald to-accent-amethyst text-white font-black text-xl uppercase tracking-widest rounded-2xl shadow-2xl transition hover:brightness-110"
      >
        Get Started
      </motion.button>
    </motion.div>
  );
};

const Dashboard = ({ onBack }: { onBack: () => void }) => {
  const [params, setParams] = useState<SimulationParams>({
    initial_price: 45,
    cost_price: 30,
    total_inventory: 3000,
    base_demand: 200,
    sensitivity: 2.5,
  });

  const [history, setHistory] = useState<HistoryData[]>([]);
  const [summary, setSummary] = useState<SummaryData>({
    total_profit: 0,
    total_units_sold: 0,
    competitor_total_profit: 0,
    avg_user_price: 0,
    avg_competitor_price: 0
  });

  const [activeDay, setActiveDay] = useState<HistoryData | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleHover = (state: any) => {
    if (state && state.activePayload) {
      setActiveDay(state.activePayload[0].payload);
    }
  };

  const runSimulation = async () => {
    setIsSimulating(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${apiUrl}/api/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await response.json();
      setHistory(data.history);
      setSummary(data.summary);
    } catch (error) {
      console.error("Simulation failed.", error);
    } finally {
      setIsSimulating(false);
    }
  };

  const customTooltipStyle = {
    backgroundColor: 'rgba(21, 26, 35, 0.85)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#fff',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
  };

  const CustomTooltip = ({ active, payload, label, showInsight = false }: { active?: boolean; payload?: any[]; label?: string; showInsight?: boolean }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={customTooltipStyle} className="p-4 text-sm font-sans">
          <p className="text-white/60 font-bold mb-3 pb-2 border-b border-white/10 uppercase tracking-widest text-xs">Day {label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-6 mb-1.5">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.stroke }} />
                <span className="text-white/80">{entry.name}</span>
              </span>
              <span className="font-mono font-bold" style={{ color: entry.color || entry.stroke }}>
                {entry.name.includes('$') || entry.name.includes('Profit') || entry.name.includes('Price') ? '$' : ''}{entry.value.toLocaleString()}
                {entry.name.includes('Share') ? '%' : ''}
              </span>
            </div>
          ))}
          {showInsight && data.insight && (
            <div className="mt-3 pt-3 border-t border-white/5 text-accent-cyan/90 text-xs italic max-w-[220px] leading-relaxed relative pl-3">
              <div className="absolute left-0 top-3 bottom-0 w-0.5 bg-accent-cyan/50 rounded-full" />
              {data.insight}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 flex flex-col h-screen overflow-hidden z-10 relative"
    >
      {/* HEADER */}
      <header className="h-20 border-b border-white/10 bg-obsidian-900/60 backdrop-blur-2xl shrink-0 flex items-center justify-between px-6 lg:px-8 z-20 relative">
        <div className="flex items-center gap-4 cursor-pointer" onClick={onBack}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan via-white to-accent-amethyst p-[1px] shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <div className="w-full h-full bg-obsidian-900 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white leading-none mb-1">
              OptiFlux
            </h1>
            <p className="text-[10px] text-accent-cyan/80 font-mono tracking-[0.2em] uppercase flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-accent-cyan inline-block animate-pulse"></span>
              Simulation Dashboard
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT COLUMN: Input Panel */}
        <aside className="w-full lg:w-1/4 shrink-0 border-r border-white/5 bg-obsidian-800/20 backdrop-blur-xl p-6 lg:p-8 flex flex-col gap-8 overflow-y-auto no-scrollbar">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl">
            <h2 className="text-sm font-bold mb-6 text-white/90 flex items-center gap-2 uppercase tracking-wider">
              Market Parameters
            </h2>

            <div className="space-y-5">
              {[
                { label: "Initial Price ($)", key: "initial_price" },
                { label: "Cost Price ($)", key: "cost_price" },
                { label: "Total Inventory", key: "total_inventory" },
                { label: "Base Demand", key: "base_demand" },
                { label: "Sensitivity", key: "sensitivity" }
              ].map((field) => (
                <div key={field.key} className="relative group/input">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-white/40 mb-1.5 block">
                    {field.label}
                  </label>
                  <input
                    type="number"
                    className="w-full p-4 bg-obsidian-900/60 border border-white/10 rounded-xl text-white outline-none focus:border-accent-cyan/80 focus:ring-1 focus:ring-accent-cyan/50 transition-all"
                    value={params[field.key as keyof SimulationParams]}
                    onChange={(e) => setParams({ ...params, [field.key]: Number(e.target.value) })}
                  />
                </div>
              ))}

              <button
                onClick={runSimulation}
                disabled={isSimulating}
                className={`w-full mt-6 py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all duration-300 ${isSimulating
                    ? 'bg-accent-amethyst/20 text-accent-amethyst border border-accent-amethyst/30 cursor-wait'
                    : 'bg-accent-cyan hover:bg-accent-cyan/90 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-[1.02] active:scale-[0.98]'
                  }`}
              >
                {isSimulating ? "Processing..." : "Start"}
              </button>
            </div>
          </div>

          <div className="p-5 bg-obsidian-900/40 border border-white/5 rounded-2xl mt-auto">
            <h3 className="text-[10px] font-black text-accent-amethyst uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-amethyst" />
              System Status
            </h3>
            <div className="text-[11px] font-mono text-white/50 leading-relaxed min-h-[60px]">
              {activeDay
                ? <p><span className="text-accent-cyan">Day {activeDay.day}:</span> {activeDay.insight}</p>
                : <p>Hover over historical data to view automated strategic reasoning.</p>
              }
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: Results */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <AnimatePresence mode="wait">
            {history.length === 0 ? (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full w-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl bg-obsidian-800/10 backdrop-blur-sm"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/20"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>
                </div>
                <h2 className="text-xl font-bold text-white/40 mb-2">Set parameters and run the simulation to generate market reports.</h2>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* SUMMARY CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { label: "Your AI Profit", val: `$${summary.total_profit.toLocaleString()}`, color: "from-accent-emerald/20 to-accent-emerald/5", text: "text-accent-emerald" },
                    { label: "Competitor Profit", val: `$${summary.competitor_total_profit.toLocaleString()}`, color: "from-accent-rose/20 to-accent-rose/5", text: "text-accent-rose" },
                    { label: "Your Avg Price", val: `$${summary.avg_user_price.toLocaleString()}`, color: "from-accent-cyan/20 to-accent-cyan/5", text: "text-accent-cyan" },
                    { label: "Comp. Avg Price", val: `$${summary.avg_competitor_price.toLocaleString()}`, color: "from-white/10 to-transparent", text: "text-white/80" },
                    { label: "Units Sold", val: summary.total_units_sold.toLocaleString(), color: "from-accent-amber/20 to-accent-amber/5", text: "text-accent-amber" }
                  ].map((card, i) => (
                    <div key={i} className={`glass-panel p-5 rounded-2xl bg-gradient-to-br ${card.color} border-white/5 hover:-translate-y-1 transition-all duration-300`}>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${card.text}`}>{card.label}</p>
                      <p className="text-2xl font-black text-white">{card.val}</p>
                    </div>
                  ))}
                </div>

                {/* CHARTS GRID */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Graph 1 */}
                  <div className="glass-panel p-6 rounded-2xl h-[350px]">
                    <h3 className="text-xs font-bold mb-4 text-white/60 uppercase tracking-widest">Strategy vs Competitor Price</h3>
                    <ResponsiveContainer width="100%" height="90%">
                      <LineChart data={history} onMouseMove={handleHover}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="day" hide />
                        <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip showInsight />} />
                        <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                        <Line type="monotone" dataKey="user_price" name="User Price" stroke="#06b6d4" strokeWidth={3} dot={false} />
                        <Line type="monotone" dataKey="competitor_price" name="Competitor Price" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Graph 2 */}
                  <div className="glass-panel p-6 rounded-2xl h-[350px]">
                    <h3 className="text-xs font-bold mb-4 text-white/60 uppercase tracking-widest">Market Share Capture (%)</h3>
                    <ResponsiveContainer width="100%" height="90%">
                      <AreaChart data={history} onMouseMove={handleHover}>
                        <defs><linearGradient id="colorMS" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="day" hide />
                        <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} domain={[0, 100]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="market_share" name="Market Share %" stroke="#10b981" fillOpacity={1} fill="url(#colorMS)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Graph 3 */}
                  <div className="glass-panel p-6 rounded-2xl h-[350px]">
                    <h3 className="text-xs font-bold mb-4 text-white/60 uppercase tracking-widest">Inventory & Sales Velocity</h3>
                    <ResponsiveContainer width="100%" height="90%">
                      <ComposedChart data={history} onMouseMove={handleHover}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="day" hide />
                        <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} />
                        <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar yAxisId="left" dataKey="items_sold" name="Daily Sales" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        <Area yAxisId="right" type="stepAfter" dataKey="stock_level" name="Inventory" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Graph 4 */}
                  <div className="glass-panel p-6 rounded-2xl h-[350px] relative">
                    <div className="absolute top-4 right-4 bg-accent-emerald/20 text-accent-emerald text-[9px] font-bold px-2 py-1 rounded border border-accent-emerald/30">ROI PROOF</div>
                    <h3 className="text-xs font-bold mb-4 text-white/60 uppercase tracking-widest">A/B Test: Cumulative Profit</h3>
                    <ResponsiveContainer width="100%" height="90%">
                      <LineChart data={history} onMouseMove={handleHover}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="day" hide />
                        <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                        <Line type="monotone" dataKey="dynamic_cumulative_profit" name="Dynamic Pricing AI" stroke="#10b981" strokeWidth={4} dot={false} />
                        <Line type="monotone" dataKey="static_cumulative_profit" name="Static Pricing" stroke="rgba(255,255,255,0.3)" strokeWidth={2} strokeDasharray="6 6" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [view, setView] = useState<"home" | "dashboard">("home");

  return (
    <div className="min-h-screen bg-obsidian-900 text-foreground font-sans relative overflow-hidden">
      <BackgroundDecoration />

      <AnimatePresence mode="wait">
        {view === "home" ? (
          <HomePage key="home" onGetStarted={() => setView("dashboard")} />
        ) : (
          <Dashboard key="dashboard" onBack={() => setView("home")} />
        )}
      </AnimatePresence>
    </div>
  );
}