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

  const customTooltipStyle = { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-xl text-sm">
          <p className="text-gray-400 font-bold mb-1 border-b border-gray-700 pb-1">Day {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              <span className="font-semibold">{entry.name}:</span> {entry.value.toLocaleString()}
            </p>
          ))}
          <div className="mt-2 pt-2 border-t border-indigo-500/30 text-indigo-300 italic max-w-[200px]">
            {data.insight}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen p-8 bg-gray-900 text-white font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center lg:text-left">Dynamic Pricing Simulator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* LEFT COLUMN: Input Panel */}
        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg shadow-lg h-fit border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-300">Market Parameters</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-gray-400">Initial Price ($)</label>
              <input type="number" className="w-full p-2 bg-gray-700 rounded text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={params.initial_price} onChange={(e) => setParams({...params, initial_price: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-400">Cost Price ($)</label>
              <input type="number" className="w-full p-2 bg-gray-700 rounded text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={params.cost_price} onChange={(e) => setParams({...params, cost_price: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-400">Total Inventory</label>
              <input type="number" className="w-full p-2 bg-gray-700 rounded text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={params.total_inventory} onChange={(e) => setParams({...params, total_inventory: Number(e.target.value)})} />
            </div>
            <button onClick={runSimulation} className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded transition shadow-lg">
              Run 30-Day Simulation
            </button>
          </div>

          {/* Strategic Insight Box */}
          <div className="mt-8 p-4 bg-indigo-900/30 border border-indigo-500/50 rounded-lg">
            <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-2">Strategic Insight</h3>
            <p className="text-sm text-gray-200 italic">
              {activeDay 
                ? `Day ${activeDay.day}: ${activeDay.insight}` 
                : "Hover over the graphs to see the AI's reasoning for each pricing decision."}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Summary Cards and Graphs */}
        <div className="lg:col-span-3 space-y-6">
          
          {history.length === 0 ? (
            <div className="bg-gray-800 p-10 rounded-lg shadow-lg text-center border border-gray-700 text-gray-500">
              Set parameters and run the simulation to generate market reports.
            </div>
          ) : (
            <>
              {/* --- NEW 5-CARD SUMMARY SCOREBOARD --- */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-2">
                
                {/* Your AI Profit */}
                <div className="bg-gradient-to-br from-green-900/40 to-gray-800 p-4 rounded-xl border border-green-500/30 shadow-xl">
                  <p className="text-green-400 text-[10px] font-bold uppercase tracking-widest mb-1">Your AI Profit</p>
                  <p className="text-2xl font-black text-white">${summary.total_profit.toLocaleString()}</p>
                </div>

                {/* Competitor Profit */}
                <div className="bg-gradient-to-br from-red-900/40 to-gray-800 p-4 rounded-xl border border-red-500/30 shadow-xl">
                  <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest mb-1">Competitor Profit</p>
                  <p className="text-2xl font-black text-white">${summary.competitor_total_profit.toLocaleString()}</p>
                </div>

                {/* Your Average Price */}
                <div className="bg-gradient-to-br from-blue-900/40 to-gray-800 p-4 rounded-xl border border-blue-500/30 shadow-xl">
                  <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-1">Your Avg Price</p>
                  <p className="text-2xl font-black text-white">${summary.avg_user_price.toLocaleString()}</p>
                </div>

                {/* Competitor Average Price */}
                <div className="bg-gradient-to-br from-pink-900/40 to-gray-800 p-4 rounded-xl border border-pink-500/30 shadow-xl">
                  <p className="text-pink-400 text-[10px] font-bold uppercase tracking-widest mb-1">Comp. Avg Price</p>
                  <p className="text-2xl font-black text-white">${summary.avg_competitor_price.toLocaleString()}</p>
                </div>

                {/* Units Sold */}
                <div className="bg-gradient-to-br from-purple-900/40 to-gray-800 p-4 rounded-xl border border-purple-500/30 shadow-xl">
                  <p className="text-purple-400 text-[10px] font-bold uppercase tracking-widest mb-1">Units Sold</p>
                  <p className="text-2xl font-black text-white">{summary.total_units_sold.toLocaleString()}</p>
                </div>

              </div>

              {/* GRAPH 1: Price War */}
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700" style={{ height: '350px' }}>
                <h2 className="text-lg font-semibold mb-4 text-gray-300">Strategy vs. Competitor Price</h2>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 5, right: 30, left: 0, bottom: 20 }} onMouseMove={handleHover}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} />
                    
                    <Line type="monotone" dataKey="user_price" name="Your Optimized Price ($)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="competitor_price" name="Competitor Price ($)" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* GRAPH 2: Market Share */}
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700" style={{ height: '300px' }}>
                <h2 className="text-lg font-semibold mb-4 text-gray-300">Market Share Capture (%)</h2>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history} margin={{ top: 5, right: 30, left: 0, bottom: 20 }} onMouseMove={handleHover}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="day" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} />
                    <Area type="monotone" dataKey="market_share" name="Market Share (%)" fill="#10b981" stroke="#059669" fillOpacity={0.4} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* GRAPH 3: Inventory Burn */}
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700" style={{ height: '350px' }}>
                <h2 className="text-lg font-semibold mb-4 text-gray-300">Inventory Levels & Daily Velocity</h2>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={history} margin={{ top: 5, right: 30, left: 0, bottom: 20 }} onMouseMove={handleHover}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#9ca3af" />
                    <YAxis yAxisId="left" stroke="#f59e0b" />
                    <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} />
                    <Bar yAxisId="left" dataKey="items_sold" name="Daily Sales" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Area yAxisId="right" type="step" dataKey="stock_level" name="Inventory Remaining" fill="#8b5cf6" stroke="#7c3aed" fillOpacity={0.2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              
              {/* GRAPH 4: A/B Test - Dynamic vs Static Profit */}
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700" style={{ height: '350px' }}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-300">A/B Test: Cumulative Profit ($)</h2>
                  <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">ROI PROOF</span>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 5, right: 30, left: 0, bottom: 20 }} onMouseMove={handleHover}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} />
                    
                    {/* The Green Line: Your AI */}
                    <Line type="monotone" dataKey="dynamic_cumulative_profit" name="Dynamic Pricing AI" stroke="#10b981" strokeWidth={4} dot={false} />
                    
                    {/* The Gray Line: The "Do Nothing" approach */}
                    <Line type="monotone" dataKey="static_cumulative_profit" name="Static Pricing (Initial Price)" stroke="#6b7280" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}