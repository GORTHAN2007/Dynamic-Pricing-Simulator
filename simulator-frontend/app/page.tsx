"use client";
import { useState } from "react";
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// 1. Define our TypeScript Interfaces (The Blueprints)
interface SimulationParams {
  initial_price: number;
  cost_price: number;
  total_inventory: number;
  base_demand: number;
  sensitivity: number;
}

interface HistoryData {
  day: number;
  revenue: number;
  stock_level: number;
  competitor_price: number;
  premium_price: number;
  market_share_percent: number;
}

export default function SimulatorDashboard() {
  // 2. Apply the interfaces to our React State
  const [params, setParams] = useState<SimulationParams>({
    initial_price: 150,
    cost_price: 80,
    total_inventory: 500,
    base_demand: 200,
    sensitivity: 1.5,
  });

  const [history, setHistory] = useState<HistoryData[]>([]);

  // 3. The Fetch API call
  const runSimulation = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      
      const data = await response.json();
      setHistory(data.history);
    } catch (error) {
      console.error("Simulation failed. Is the FastAPI server running?", error);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-900 text-white font-sans">
      <h1 className="text-3xl font-bold mb-6">Dynamic Pricing Simulator</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Input Panel */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-300">Market Parameters</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Initial Price ($)</label>
              <input 
                type="number" 
                className="w-full p-2 bg-gray-700 rounded text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={params.initial_price}
                onChange={(e) => setParams({...params, initial_price: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Cost Price ($)</label>
              <input 
                type="number" 
                className="w-full p-2 bg-gray-700 rounded text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={params.cost_price}
                onChange={(e) => setParams({...params, cost_price: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Total Inventory</label>
              <input 
                type="number" 
                className="w-full p-2 bg-gray-700 rounded text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={params.total_inventory}
                onChange={(e) => setParams({...params, total_inventory: Number(e.target.value)})}
              />
            </div>
            <button 
              onClick={runSimulation}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition"
            >
              Run Simulation
            </button>
          </div>
        </div>

        {/* Graph Panel */}
        <div className="col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg" style={{ height: '400px' }}>
          <h2 className="text-xl font-semibold mb-4 text-gray-300">Market Share & Revenue War</h2>
          
          {history.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={history} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="day" stroke="#ccc" />
                
                <YAxis yAxisId="left" stroke="#ccc" />
                <YAxis yAxisId="right" orientation="right" stroke="#ccc" />
                
                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '8px' }} />
                <Legend />
                
                <Line yAxisId="left" type="monotone" dataKey="revenue" name="Daily Revenue ($)" stroke="#22c55e" strokeWidth={3} />
                <Line yAxisId="left" type="monotone" dataKey="competitor_price" name="Competitor Price ($)" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" />
                <Area yAxisId="right" type="step" dataKey="stock_level" name="Inventory Left" fill="#3b82f6" stroke="#2563eb" fillOpacity={0.3} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Enter parameters and click Run Simulation to see the graph.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}