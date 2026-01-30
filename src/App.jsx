import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

const loadProfile = [
  2, 2, 2, 2, 3, 4, 5, 6, 6, 5, 4, 3, 3, 3, 4, 5, 6, 7, 6, 5, 4, 3, 3, 2,
];

const solarProfile = [
  0, 0, 0, 0, 0, 1, 2, 4, 6, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0,
];

export default function App() {
  const BATTERY_CAPACITY = 10;
  const GRID_COST = 6;

  const [batterySOC] = useState(10);
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);

  const simulateMicrogrid = () => {
    let socSmart = batterySOC;
    let totalCostSmart = 0;
    let totalCostBaseline = 0;
    let gridEnergySmart = 0;
    let data = [];

    for (let hour = 0; hour < 24; hour++) {
      const load = loadProfile[hour];
      const solar = solarProfile[hour];

      // Baseline: Grid only
      totalCostBaseline += load * GRID_COST;

      // Smart scheduler
      let remainingLoad = load;
      let gridUsed = 0;

      if (solar >= remainingLoad) {
        socSmart = Math.min(
          BATTERY_CAPACITY,
          socSmart + (solar - remainingLoad)
        );
        remainingLoad = 0;
      } else {
        remainingLoad -= solar;
        if (socSmart >= remainingLoad) {
          socSmart -= remainingLoad;
          remainingLoad = 0;
        } else {
          remainingLoad -= socSmart;
          socSmart = 0;
        }

        if (remainingLoad > 0) {
          gridUsed = remainingLoad;
          gridEnergySmart += remainingLoad;
          totalCostSmart += remainingLoad * GRID_COST;
          remainingLoad = 0;
        }
      }

      data.push({
        hour,
        load,
        solar,
        batterySOC: socSmart,
        grid: gridUsed,
      });
    }

    setResults(data);
    setSummary({
      baselineCost: totalCostBaseline,
      smartCost: totalCostSmart,
      savings: totalCostBaseline - totalCostSmart,
      gridEnergySmart,
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-2">
        Microgrid Simulator & Energy Scheduler
      </h1>
      <p className="text-center text-slate-300 mb-6">
        Baseline vs Smart Energy Management (24-hour simulation)
      </p>

      <div className="flex justify-center mb-6">
        <button
          onClick={simulateMicrogrid}
          className="bg-green-600 px-6 py-2 rounded"
        >
          Run Simulation
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-3 gap-4 text-center mb-6">
          <div className="bg-slate-800 p-4 rounded">
            <h3 className="text-lg">Baseline Cost</h3>
            <p className="text-red-400 text-xl">₹{summary.baselineCost}</p>
          </div>
          <div className="bg-slate-800 p-4 rounded">
            <h3 className="text-lg">Smart Cost</h3>
            <p className="text-green-400 text-xl">₹{summary.smartCost}</p>
          </div>
          <div className="bg-slate-800 p-4 rounded">
            <h3 className="text-lg">Savings</h3>
            <p className="text-yellow-400 text-xl">₹{summary.savings}</p>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-slate-800 p-4 rounded">
          <h2 className="text-xl mb-2">Battery SOC & Grid Usage</h2>
          <LineChart width={900} height={300} data={results}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line dataKey="batterySOC" stroke="#38bdf8" />
            <Line dataKey="grid" stroke="#facc15" />
          </LineChart>
        </div>
      )}
    </div>
  );
}
