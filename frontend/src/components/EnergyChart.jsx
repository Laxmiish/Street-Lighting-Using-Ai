import React from 'react';
import { useLighting } from '../context/LightingContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { BarChart3, Info } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-xl backdrop-blur-md text-xs font-mono">
        <p className="font-bold text-sky-300 mb-1.5 flex items-center justify-between">
          <span>Time: {label}</span>
          <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]">
            {data.savingsPct}% Saved
          </span>
        </p>
        <div className="space-y-1 text-slate-300">
          <p className="flex justify-between gap-4">
            <span className="text-slate-400">Baseline (Always 100%):</span>
            <span className="font-bold text-slate-200">{data.baselineKwh} kWh</span>
          </p>
          <p className="flex justify-between gap-4">
            <span className="text-sky-400">AI Adaptive Consumed:</span>
            <span className="font-bold text-sky-300">{data.aiOptimizedKwh} kWh</span>
          </p>
          <div className="pt-1 mt-1 border-t border-slate-800 flex justify-between gap-4 text-emerald-400">
            <span>Net Energy Saved:</span>
            <span className="font-bold">{data.savedKwh} kWh</span>
          </div>
          <p className="text-[10px] text-slate-400 pt-0.5">
            CO₂ Avoided: {data.co2AvoidedKg} kg
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function EnergyChart() {
  const { hourlyEnergy, kpis } = useLighting();

  return (
    <div className="p-5 rounded-2xl glass-panel space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-sky-400" />
            <span>24-Hour Diurnal Energy Profile: Baseline vs. AI Adaptive</span>
          </h2>
          <p className="text-xs text-slate-400">
            Dynamic dimming response across morning sunrise, midday shutdown, and night motion triggers
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            Average Savings: {kpis.overallSavingsPct}%
          </span>
        </div>
      </div>

      {/* Recharts 24-Hour Curve */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={hourlyEnergy} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="baselineGradient" x1="0" y1="0" x2="0" y2="100%">
                <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="100%">
                <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
            <XAxis dataKey="hour" stroke="#64748B" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit=" kWh" />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
            />
            <Area
              type="monotone"
              dataKey="baselineKwh"
              name="Baseline (Legacy Fixed 100%)"
              stroke="#94A3B8"
              strokeDasharray="4 4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#baselineGradient)"
            />
            <Area
              type="monotone"
              dataKey="aiOptimizedKwh"
              name="AI Adaptive Consumption"
              stroke="#38BDF8"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#aiGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center space-x-2 text-[11px] text-slate-400 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
        <Info className="w-4 h-4 text-sky-400 shrink-0" />
        <span>
          <strong>AI Optimization Mechanism:</strong> Lamps automatically extinguish (0% brightness) during daytime (07:00–16:00), adaptively drop to 20% security baseline during late-night quiet hours, and instantly burst to 80–100% when radar detects pedestrian or vehicular movement.
        </span>
      </div>
    </div>
  );
}
