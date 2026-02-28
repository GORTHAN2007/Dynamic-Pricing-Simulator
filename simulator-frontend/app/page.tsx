"use client";

import { useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { 
  LineChart, Line, AreaChart, Area, Bar, ComposedChart, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from "recharts";
import { 
  Sun, Moon, TrendingUp, DollarSign, Package, Users, Activity, 
  Play, Info, ChevronRight, Target, BarChart3
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- UI Utilities ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Interfaces ---
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

// --- Component: Sparkline ---
const Sparkline = ({ data, dataKey, color }: { data: any[], dataKey: string, color: string }) => (
  <div className="h-12 w-full mt-2">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          stroke={color} 
          strokeWidth={2} 
          dot={false} 
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// --- Component: Input Field ---
const InputField = ({ label, icon: Icon, value, onChange, type = "number" }: any) => (
  <div className="group relative">
    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
        <Icon size={16} />
      </div>
      <input 
        type={type}
        value={value}
        onChange={onChange}
        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
      />
    </div>
  </div>
);

export default function SimulatorDashboard() {
  const { theme, setTheme } = useTheme();
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

  const handleHover = (state: any) => {
    if (state && state.activePayload) {
      setActiveDay(state.activePayload[0].payload);
    }
  };

  const runSimulation = async () => {
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
    }
  };

  // --- Themes & Recharts Styles ---
  const isDark = theme === "dark";
  const colors = {
    primary: "#2563EB",
    success: "#10B981",
    danger: "#EF4444",
    warning: "#F59E0B",
    purple: "#8B5CF6",
    slate: isDark ? "#64748B" : "#94A3B8",
    grid: isDark ? "#1E293B" : "#F1F5F9",
    text: isDark ? "#94A3B8" : "#64748B",
  };

  const CustomTooltip = ({ active, payload, label, showInsight = false }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-2xl text-xs backdrop-blur-md bg-opacity-90">
          <p className="text-slate-500 dark:text-slate-400 font-bold mb-2 border-b border-slate-100 dark:border-slate-700 pb-2 flex items-center gap-2">
            <Activity size={14} className="text-blue-500" /> Day {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between gap-6 py-0.5">
              <span className="text-slate-500 dark:text-slate-400 capitalize">{entry.name}:</span>
              <span className="font-bold tabular-nums" style={{ color: entry.color }}>{entry.value.toLocaleString()}</span>
            </div>
          ))}
          {showInsight && (
            <div className="mt-3 pt-3 border-t border-blue-500/20 text-blue-600 dark:text-blue-400 italic leading-relaxed">
              "{data.insight}"
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 selection:bg-blue-100 dark:selection:bg-blue-900/40 transition-colors duration-300">
      
      {/* Header Area */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[1600px] mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black italic">O</div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">
              Omnia <span className="text-blue-600 font-medium">Pricing Simulator</span>
            </h1>
          </div>
          
          <button 
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT: Configuration Panel */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-6">
                <Target size={18} className="text-blue-500" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Market Parameters</h2>
              </div>
              
              <div className="space-y-5">
                <InputField 
                    label="Initial Price ($)" 
                    icon={DollarSign} 
                    value={params.initial_price} 
                    onChange={(e: any) => setParams({...params, initial_price: Number(e.target.value)})} 
                />
                <InputField 
                    label="Cost Price ($)" 
                    icon={TrendingUp} 
                    value={params.cost_price} 
                    onChange={(e: any) => setParams({...params, cost_price: Number(e.target.value)})} 
                />
                <InputField 
                    label="Total Inventory" 
                    icon={Package} 
                    value={params.total_inventory} 
                    onChange={(e: any) => setParams({...params, total_inventory: Number(e.target.value)})} 
                />
                
                <button 
                  onClick={runSimulation} 
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group"
                >
                  <Play size={18} fill="white" className="group-hover:scale-110 transition-transform" />
                  Run Simulation
                </button>
              </div>
            </div>

            {/* Strategic Insight Box */}
            <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 text-blue-500/10">
                <Info size={80} strokeWidth={1} />
              </div>
              <h3 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <ChevronRight size={14} /> Strategic Insight
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal italic min-h-[60px] relative z-10">
                {activeDay 
                  ? `${activeDay.insight}` 
                  : "Deploy simulation to start receiving real-time architectural insights from the Omnia Optimizer."}
              </p>
            </div>
          </div>

          {/* RIGHT: Display Panel */}
          <div className="lg:col-span-3 space-y-8">
            
            {history.length === 0 ? (
              <div className="h-[600px] flex flex-col items-center justify-center bg-white dark:bg-[#1E293B] rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center p-12">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 text-slate-400">
                  <BarChart3 size={32} />
                </div>
                <h2 className="text-xl font-bold mb-2">Awaiting Simulation Results</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Configure your enterprise parameters on the left to generate advanced pricing stress-tests.</p>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-500">
                
                {/* 5-Card Scoreboard with Sparklines */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { label: "Your Profit", val: `$${summary.total_profit.toLocaleString()}`, key: "dynamic_cumulative_profit", color: colors.success, icon: DollarSign },
                    { label: "Comp. Profit", val: `$${summary.competitor_total_profit.toLocaleString()}`, key: "competitor_price", color: colors.danger, icon: Users },
                    { label: "Avg Price", val: `$${summary.avg_user_price.toLocaleString()}`, key: "user_price", color: colors.primary, icon: Activity },
                    { label: "Comp. Avg", val: `$${summary.avg_competitor_price.toLocaleString()}`, key: "competitor_price", color: colors.slate, icon: Target },
                    { label: "Units Sold", val: summary.total_units_sold.toLocaleString(), key: "items_sold", color: colors.purple, icon: Package },
                  ].map((card, i) => (
                    <div key={i} className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:shadow-md active:scale-95 group">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{card.label}</span>
                        <card.icon size={14} className="text-slate-300 dark:text-slate-600 transition-colors group-hover:text-blue-500" />
                      </div>
                      <p className="text-xl font-black tabular-nums">{card.val}</p>
                      <Sparkline data={history} dataKey={card.key} color={card.color} />
                    </div>
                  ))}
                </div>

                {/* VISUALIZATIONS GRID */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  
                  {/* Graph 1: Price Evolution */}
                  <div className="bg-white dark:bg-[#1E293B] p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 h-[450px]">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <DollarSign size={18} className="text-blue-500" /> Automated Strategy vs. Competitor
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full font-bold">REAL-TIME</span>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history} onMouseMove={handleHover}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: colors.text }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: colors.text }} domain={['dataMin - 10', 'dataMax + 10']} />
                        <RechartsTooltip content={<CustomTooltip showInsight={true} />} />
                        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 20, fontSize: 12, fontWeight: 600 }} />
                        <Line type="monotone" dataKey="user_price" name="Your Price" stroke={colors.primary} strokeWidth={4} dot={{ r: 4, strokeWidth: 0, fill: colors.primary }} activeDot={{ r: 8, strokeWidth: 4, stroke: "white" }} />
                        <Line type="monotone" dataKey="competitor_price" name="Competitor" stroke={colors.slate} strokeWidth={2} strokeDasharray="6 4" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Graph 2: Profit Comparison */}
                  <div className="bg-white dark:bg-[#1E293B] p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 h-[450px]">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <TrendingUp size={18} className="text-emerald-500" /> ROI Evolution
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full font-bold">CUMULATIVE</span>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={history} onMouseMove={handleHover}>
                        <defs>
                          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={colors.success} stopOpacity={0.2}/>
                            <stop offset="95%" stopColor={colors.success} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: colors.text }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: colors.text }} />
                        <RechartsTooltip content={<CustomTooltip showInsight={false} />} />
                        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 20, fontSize: 12, fontWeight: 600 }} />
                        <Area type="monotone" dataKey="dynamic_cumulative_profit" name="Dynamic AI" stroke={colors.success} strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                        <Area type="monotone" dataKey="static_cumulative_profit" name="Static Base" stroke={colors.slate} strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Graph 3: Inventory Velocity */}
                  <div className="bg-white dark:bg-[#1E293B] p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 h-[450px]">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Package size={18} className="text-orange-500" /> Operations Health
                      </h3>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={history} onMouseMove={handleHover}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: colors.text }} />
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: colors.text }} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: colors.text }} />
                        <RechartsTooltip content={<CustomTooltip showInsight={false} />} />
                        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 20, fontSize: 12, fontWeight: 600 }} />
                        <Bar yAxisId="left" dataKey="items_sold" name="Daily Sales" fill={colors.warning} radius={[4, 4, 0, 0]} barSize={20} />
                        <Area yAxisId="right" type="step" dataKey="stock_level" name="Inventory" fill={colors.purple} stroke={colors.purple} fillOpacity={0.1} strokeWidth={2} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Graph 4: Market Share Area */}
                  <div className="bg-white dark:bg-[#1E293B] p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 h-[450px]">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Users size={18} className="text-indigo-500" /> Market Penetration (%)
                      </h3>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={history} onMouseMove={handleHover}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: colors.text }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: colors.text }} domain={[0, 100]} />
                        <RechartsTooltip content={<CustomTooltip showInsight={false} />} />
                        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 20, fontSize: 12, fontWeight: 600 }} />
                        <Area type="monotone" dataKey="market_share" name="Share %" fill="#818cf8" stroke="#4f46e5" fillOpacity={0.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}