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
}

// Interface for the new summary statistics
interface SummaryData {
  total_profit: number;
  total_units_sold: number;
}

export default function SimulatorDashboard() {
  const [params, setParams] = useState<SimulationParams>({
    initial_price: 45,
    cost_price: 30,
    total_inventory: 3000,
    base_demand: 200,
    sensitivity: 1.5,
  });

  const [history, setHistory] = useState<HistoryData[]>([]);
  
  // 1. New state to store the summary metrics from the backend
  const [summary, setSummary] = useState<SummaryData>({ 
    total_profit: 0, 
    total_units_sold: 0 
  });

  const runSimulation = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await response.json();
      
      // 2. Set both the history and the summary data
      setHistory(data.history);
      setSummary(data.summary);
    } catch (error) {
      console.error("Simulation failed.", error);
    }
  };

  const customTooltipStyle = { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' };

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
        </div>

        {/* RIGHT COLUMN: Summary Cards and Graphs */}
        <div className="lg:col-span-3 space-y-6">
          
          {history.length === 0 ? (
            <div className="bg-gray-800 p-10 rounded-lg shadow-lg text-center border border-gray-700 text-gray-500">
              Set parameters and run the simulation to generate market reports.
            </div>
          ) : (
            <>
              {/* 3. New Summary Cards Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-900/40 to-gray-800 p-5 rounded-xl border border-green-500/30 shadow-xl">
                  <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-1">Total Net Profit</p>
                  <p className="text-4xl font-black text-white">${summary.total_profit.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-900/40 to-gray-800 p-5 rounded-xl border border-blue-500/30 shadow-xl">
                  <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">Units Sold</p>
                  <p className="text-4xl font-black text-white">{summary.total_units_sold.toLocaleString()} <span className="text-lg font-normal text-gray-400">units</span></p>
                </div>
              </div>

              {/* GRAPH 1: Price War */}
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700" style={{ height: '350px' }}>
                <h2 className="text-lg font-semibold mb-4 text-gray-300">Strategy vs. Competitor Price</h2>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 5, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip contentStyle={customTooltipStyle} />
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
                  <AreaChart data={history} margin={{ top: 5, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="day" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" domain={[0, 100]} />
                    <Tooltip contentStyle={customTooltipStyle} />
                    <Legend verticalAlign="top" height={36} />
                    <Area type="monotone" dataKey="market_share" name="Market Share (%)" fill="#10b981" stroke="#059669" fillOpacity={0.4} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* GRAPH 3: Inventory Burn */}
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700" style={{ height: '350px' }}>
                <h2 className="text-lg font-semibold mb-4 text-gray-300">Inventory Levels & Daily Velocity</h2>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={history} margin={{ top: 5, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#9ca3af" />
                    <YAxis yAxisId="left" stroke="#f59e0b" />
                    <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" />
                    <Tooltip contentStyle={customTooltipStyle} />
                    <Legend verticalAlign="top" height={36} />
                    <Bar yAxisId="left" dataKey="items_sold" name="Daily Sales" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Area yAxisId="right" type="step" dataKey="stock_level" name="Inventory Remaining" fill="#8b5cf6" stroke="#7c3aed" fillOpacity={0.2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}