"use client";
import { useState } from "react";
import {
  LineChart, Line, AreaChart, Area, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

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

// Interface for the new summary statistics
interface SummaryData {
  total_profit: number;
  total_units_sold: number;
  competitor_total_profit: number;
  avg_user_price: number;
  avg_competitor_price: number;
}

export default function SimulatorDashboard() {
  const [params, setParams] = useState<SimulationParams>({
    initial_price: 45,
    cost_price: 30,
    total_inventory: 3000,
    base_demand: 200,
    sensitivity: 2.5,
  });

  const [history, setHistory] = useState<HistoryData[]>([]);

  // 1. Properly initialized state for all 5 metrics
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
    // Add artificial delay for the loading animation effect
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const response = await fetch("http://127.0.0.1:8000/api/simulate", {
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

  const CustomTooltip = ({ active, payload, label, showInsight = false }: { active?: boolean; payload?: { name: string; value: number; color?: string; stroke?: string; payload: HistoryData }[]; label?: string; showInsight?: boolean }) => {
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
    <div className="h-screen flex flex-col bg-obsidian-900 text-foreground font-sans relative overflow-hidden group/main">
      {/* Dynamic Animated Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* Decorative ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-accent-cyan/15 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-screen" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[400px] bg-accent-amethyst/15 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-screen" />

      {/* --- TOP NAVIGATION HEADER --- */}
      <header className="h-20 border-b border-white/10 bg-obsidian-900/60 backdrop-blur-2xl shrink-0 flex items-center justify-between px-6 lg:px-8 z-20 relative shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan via-white to-accent-amethyst p-[1px] shadow-[0_0_20px_rgba(6,182,212,0.5)] animate-pulse-slow">
            <div className="w-full h-full bg-obsidian-900 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] leading-none mb-1">
              NEXUS <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-emerald font-light italic ml-1">Enterprise AI</span>
            </h1>
            <p className="text-[11px] text-accent-cyan/80 font-mono tracking-[0.3em] uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan inline-block animate-ping"></span>
              Simulation Engine v2.0
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">

        </div>
      </header>

      {/* --- MAIN LAYOUT CONTAINER --- */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden z-10 relative">

        {/* LEFT SIDEBAR: Controls */}
        <aside className="w-full lg:w-[380px] shrink-0 border-r border-white/5 bg-obsidian-800/30 backdrop-blur-xl p-6 lg:p-8 flex flex-col gap-8 overflow-y-auto no-scrollbar">

          <div>
            <h2 className="text-sm font-bold mb-5 text-white/90 flex items-center gap-2 uppercase tracking-wider">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-cyan"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              Market Parameters
            </h2>

            <div className="space-y-5">
              {[
                { label: "Initial Price ($)", key: "initial_price", desc: "Starting price point" },
                { label: "Cost Price ($)", key: "cost_price", desc: "Base manufacturing cost" },
                { label: "Total Inventory", key: "total_inventory", desc: "Initial stock available" }
              ].map((field) => (
                <div key={field.key} className="relative group/input">
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-cyan/10 to-transparent rounded-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500 blur-sm" />
                  <label className="absolute -top-2.5 left-3 px-2 text-[10px] font-bold tracking-widest uppercase text-accent-cyan/60 bg-obsidian-900 border border-transparent group-focus-within/input:bg-obsidian-800 transition-all group-focus-within/input:text-accent-cyan z-10 rounded">
                    {field.label}
                  </label>
                  <input
                    type="number"
                    className="w-full relative z-0 p-4 bg-obsidian-900/80 border border-white/10 rounded-xl text-white outline-none focus:border-accent-cyan/80 focus:ring-1 focus:ring-accent-cyan/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all duration-300 shadow-inner block group-hover/input:border-white/30"
                    value={params[field.key as keyof SimulationParams]}
                    onChange={(e) => setParams({ ...params, [field.key]: Number(e.target.value) })}
                  />
                  <p className="mt-1.5 text-[10px] text-white/30 ml-2 group-focus-within/input:text-accent-cyan/60 transition-colors">{field.desc}</p>
                </div>
              ))}

              <button
                onClick={runSimulation}
                disabled={isSimulating}
                className={`w-full mt-8 relative overflow-hidden group/btn bg-obsidian-900 rounded-xl border text-white font-bold py-4 px-4 transition-all duration-300 ${isSimulating
                    ? 'border-accent-cyan shadow-[0_0_30px_rgba(6,182,212,0.6)] scale-[0.98]'
                    : 'border-white/10 hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] active:scale-[0.98]'
                  }`}
              >
                <div className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${isSimulating
                    ? 'bg-gradient-to-r from-accent-cyan via-accent-amethyst to-accent-cyan opacity-100 animate-[pulse_1.5s_ease-in-out_infinite]'
                    : 'bg-gradient-to-r from-accent-cyan via-accent-emerald to-accent-amethyst opacity-50 group-hover/btn:opacity-100'
                  }`} />
                <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-md text-sm uppercase tracking-widest">
                  {isSimulating ? (
                    <>
                      <span className="relative flex h-3 w-3 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                      </span>
                      <span className="animate-pulse font-black tracking-[0.2em] text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">SIMULATING</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                      Run Simulation
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Strategic Insight Box (Sidebar) */}
          <div className="p-5 bg-obsidian-900/80 border border-accent-amethyst/30 rounded-xl shadow-[inset_0_0_20px_rgba(139,92,246,0.05)] hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] hover:border-accent-amethyst/50 transition-all duration-500 relative overflow-hidden mt-auto group/insight cursor-default">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accent-cyan to-accent-amethyst group-hover/insight:w-1.5 transition-all duration-500" />
            <div className="absolute inset-0 bg-gradient-to-br from-accent-amethyst/5 to-transparent opacity-0 group-hover/insight:opacity-100 transition-opacity duration-500" />

            <h3 className="text-[10px] font-black text-accent-amethyst uppercase tracking-[0.2em] mb-3 flex items-center gap-2 relative z-10">
              <span className="w-2 h-2 rounded-full bg-accent-amethyst animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.8)] border border-accent-amethyst/50" />
              Strategic Insight
            </h3>
            <p className="text-xs font-mono text-white/70 leading-relaxed min-h-[80px] relative z-10">
              {activeDay
                ? <span className="text-white/90">Day {activeDay.day} <span className="text-white/40 px-1">{`//`}</span> <span className="text-accent-cyan drop-shadow-[0_0_5px_rgba(6,182,212,0.3)]">{activeDay.insight}</span></span>
                : <span className="text-white/30">Hover over the graphs to see the AI&apos;s reasoning for each pricing decision.</span>}
            </p>
          </div>

        </aside>

        {/* RIGHT MAIN CONTENT: Dashboard */}
        <main className={`flex-1 overflow-y-auto p-6 lg:p-8 relative z-10 transition-all duration-500 ${isSimulating ? 'opacity-50 blur-sm scale-[0.99]' : 'opacity-100 blur-0 scale-100'}`}>

          {history.length === 0 ? (
            <div className={`h-full w-full flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl bg-obsidian-800/20 backdrop-blur-md relative overflow-hidden group ${isSimulating ? 'animate-pulse' : ''}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 to-accent-amethyst/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className={`w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all duration-500 relative ${isSimulating ? 'scale-110 border-accent-cyan/50' : 'group-hover:scale-110 group-hover:border-accent-cyan/30'}`}>
                <div className={`absolute inset-0 rounded-3xl border border-accent-cyan/50 animate-[spin_4s_linear_infinite] ${isSimulating ? 'opacity-100' : 'group-hover:opacity-100 opacity-0'}`} />
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={`text-white/40 transition-colors duration-500 ${isSimulating ? 'text-accent-cyan animate-pulse' : 'group-hover:text-accent-cyan'}`}><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>
              </div>
              <h2 className="text-2xl font-black text-white/80 mb-3 tracking-tight transition-colors duration-500 group-hover:text-white">
                {isSimulating ? 'Simulating Neural Parameters...' : 'Awaiting Data Telemetry'}
              </h2>
              <p className="text-sm text-white/40 max-w-md text-center font-mono transition-colors duration-500 group-hover:text-white/60">
                {isSimulating ? 'Interfacing with backend API and calculating market strategies...' : 'Configure market parameters in the control panel and execute the run protocol to generate real-time analytics.'}
              </p>
            </div>
          ) : (
            <div className={`max-w-[1600px] mx-auto space-y-8 transition-opacity duration-500`}>

              {/* --- 5-CARD SUMMARY SCOREBOARD --- */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">

                {/* AI Profit */}
                <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-emerald/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <p className="relative z-10 flex items-center gap-2 text-accent-emerald text-[10px] font-bold uppercase tracking-widest mb-2 group-hover:scale-105 origin-left transition-transform duration-300">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
                    Your Profit
                  </p>
                  <p className="relative z-10 text-3xl font-black text-white tracking-tight drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">${summary.total_profit.toLocaleString()}</p>
                </div>

                {/* Comp Profit */}
                <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-rose/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <p className="relative z-10 flex items-center gap-2 text-accent-rose text-[10px] font-bold uppercase tracking-widest mb-2 group-hover:scale-105 origin-left transition-transform duration-300">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" /></svg>
                    Comp Profit
                  </p>
                  <p className="relative z-10 text-3xl font-black text-white/80 tracking-tight drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]">${summary.competitor_total_profit.toLocaleString()}</p>
                </div>

                {/* Avg Price */}
                <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <p className="relative z-10 flex items-center gap-2 text-accent-cyan text-[10px] font-bold uppercase tracking-widest mb-2 group-hover:scale-105 origin-left transition-transform duration-300">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                    Your Avg Price
                  </p>
                  <p className="relative z-10 text-3xl font-black text-white tracking-tight drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">${summary.avg_user_price.toLocaleString()}</p>
                </div>

                {/* Comp Avg Price */}
                <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <p className="relative z-10 flex items-center gap-2 text-white/60 text-[10px] font-bold uppercase tracking-widest mb-2 group-hover:scale-105 origin-left transition-transform duration-300">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    Comp Avg Price
                  </p>
                  <p className="relative z-10 text-3xl font-black text-white/70 tracking-tight">${summary.avg_competitor_price.toLocaleString()}</p>
                </div>

                {/* Units Sold */}
                <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group col-span-2 lg:col-span-1 hover:-translate-y-1 transition-transform duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-amber/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <p className="relative z-10 flex items-center gap-2 text-accent-amber text-[10px] font-bold uppercase tracking-widest mb-2 group-hover:scale-105 origin-left transition-transform duration-300">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
                    Units Sold
                  </p>
                  <p className="relative z-10 text-3xl font-black text-white tracking-tight drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">{summary.total_units_sold.toLocaleString()}</p>
                </div>

              </div>

              {/* --- CHARTS GRID (2x2) --- */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* GRAPH 1: Price War */}
                <div className="glass-panel p-6 rounded-2xl h-[380px] group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-accent-cyan/5 rounded-full blur-[80px] -z-10 group-hover:bg-accent-cyan/10 transition-colors duration-700" />
                  <h2 className="text-sm font-bold mb-6 text-white/90 flex items-center gap-2 uppercase tracking-wide">
                    <div className="w-1.5 h-4 bg-accent-cyan rounded-full" />
                    Strategy vs. Competitor Price
                  </h2>
                  <ResponsiveContainer width="100%" height="85%">
                    <LineChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} onMouseMove={handleHover}>
                      <defs>
                        <linearGradient id="colorUserPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} dy={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.3)" domain={['dataMin - 5', 'dataMax + 5']} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} dx={-10} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip showInsight={true} />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                      <Legend verticalAlign="top" height={40} iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }} />

                      <Line type="monotone" dataKey="user_price" name="Your Price" stroke="#06b6d4" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 6, fill: '#06b6d4', stroke: '#151A23', strokeWidth: 2 }} />
                      <Line type="monotone" dataKey="competitor_price" name="Competitor Price" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 0 }} activeDot={{ r: 4, fill: '#f43f5e', stroke: 'none' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* GRAPH 2: Market Share */}
                <div className="glass-panel p-6 rounded-2xl h-[380px] group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-64 h-64 bg-accent-emerald/5 rounded-full blur-[80px] -z-10 group-hover:bg-accent-emerald/10 transition-colors duration-700" />
                  <h2 className="text-sm font-bold mb-6 text-white/90 flex items-center gap-2 uppercase tracking-wide">
                    <div className="w-1.5 h-4 bg-accent-emerald rounded-full" />
                    Market Share Capture (%)
                  </h2>
                  <ResponsiveContainer width="100%" height="85%">
                    <AreaChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} onMouseMove={handleHover}>
                      <defs>
                        <linearGradient id="colorMarketShare" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} dy={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.3)" domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} dx={-10} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip showInsight={false} />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                      <Legend verticalAlign="top" height={40} iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }} />
                      <Area type="monotone" dataKey="market_share" name="Market Share (%)" fill="url(#colorMarketShare)" stroke="#10b981" strokeWidth={3} activeDot={{ r: 6, fill: '#10b981', stroke: '#151A23', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* GRAPH 3: Inventory Burn */}
                <div className="glass-panel p-6 rounded-2xl h-[380px] group relative overflow-hidden">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-accent-amethyst/5 rounded-full blur-[80px] -z-10 group-hover:bg-accent-amethyst/10 transition-colors duration-700" />
                  <h2 className="text-sm font-bold mb-6 text-white/90 flex items-center gap-2 uppercase tracking-wide">
                    <div className="w-1.5 h-4 bg-accent-amethyst rounded-full" />
                    Inventory & Daily Velocity
                  </h2>
                  <ResponsiveContainer width="100%" height="85%">
                    <ComposedChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} onMouseMove={handleHover}>
                      <defs>
                        <linearGradient id="colorStockLevel" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} dy={10} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" stroke="rgba(255,255,255,0.3)" tick={{ fill: '#f59e0b', fontSize: 11 }} dx={-10} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.3)" tick={{ fill: '#8b5cf6', fontSize: 11 }} dx={10} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip showInsight={false} />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                      <Legend verticalAlign="top" height={40} iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }} />

                      <Bar yAxisId="left" dataKey="items_sold" name="Daily Sales" fill="url(#colorSales)" radius={[4, 4, 0, 0]} barSize={20} />
                      <Area yAxisId="right" type="step" dataKey="stock_level" name="Remaining Inventory" fill="url(#colorStockLevel)" stroke="#8b5cf6" strokeWidth={3} activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#151A23', strokeWidth: 2 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* GRAPH 4: A/B Test - Dynamic vs Static Profit */}
                <div className="glass-panel p-6 rounded-2xl h-[380px] group relative overflow-hidden border border-accent-emerald/30 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
                  <div className="absolute inset-0 bg-gradient-to-tr from-accent-emerald/5 via-transparent to-transparent pointer-events-none" />
                  <div className="flex justify-between items-center mb-6 relative z-10">
                    <h2 className="text-sm font-bold text-white/90 flex items-center gap-2 uppercase tracking-wide">
                      <div className="w-1.5 h-4 bg-white/50 rounded-full" />
                      A/B Test: Cumulative ROI
                    </h2>
                    <span className="bg-accent-emerald/20 text-accent-emerald text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-accent-emerald/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">ROI Proven</span>
                  </div>
                  <ResponsiveContainer width="100%" height="80%">
                    <LineChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} onMouseMove={handleHover}>
                      <defs>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="4" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} dy={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} dx={-10} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip showInsight={false} />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                      <Legend verticalAlign="top" height={40} iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }} />

                      <Line type="monotone" dataKey="dynamic_cumulative_profit" name="AI Pricing" stroke="#10b981" strokeWidth={4} dot={{ r: 0 }} activeDot={{ r: 6, fill: '#10b981', stroke: '#151A23', strokeWidth: 2 }} filter="url(#glow)" />
                      <Line type="monotone" dataKey="static_cumulative_profit" name="Static Pricing" stroke="rgba(255,255,255,0.3)" strokeWidth={2} strokeDasharray="6 6" dot={{ r: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}