import React from 'react';
import { useLighting } from '../context/LightingContext';
import { Zap, TrendingDown, Lightbulb, AlertTriangle, Leaf, IndianRupee } from 'lucide-react';

export default function KpiCards() {
  const { kpis, setActiveTab } = useLighting();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. Energy Savings Percentage */}
      <div className="p-5 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Energy Conservation Target
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-mono text-emerald-400 tracking-tight">
              {kpis.overallSavingsPct}%
            </span>
            <span className="text-xs text-emerald-400/90 font-medium">Reduction</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Against legacy un-dimmed baseline (Target: 40–60%)
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-700/60">
          <div className="w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-sky-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, kpis.overallSavingsPct)}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Actual: {kpis.totalActualKwh} kWh</span>
            <span className="text-slate-500">Base: {kpis.totalBaselineKwh} kWh</span>
          </div>
        </div>
      </div>

      {/* 2. Total Energy Saved & Cost Savings */}
      <div className="p-5 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Net Municipal Energy Saved
            </span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-mono text-white tracking-tight">
              {kpis.totalSavedKwh}
            </span>
            <span className="text-sm font-semibold text-slate-400 font-mono">kWh / day</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-sky-300 font-semibold space-x-1">
            <IndianRupee className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>₹{kpis.totalCostSavedInr} estimated municipal savings</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Tariff Rate</span>
          <span className="text-slate-300">₹7.50 / commercial kWh</span>
        </div>
      </div>

      {/* 3. Street Poles Infrastructure Health */}
      <div
        onClick={() => setActiveTab('poles')}
        className="p-5 rounded-2xl glass-panel glass-panel-hover cursor-pointer flex flex-col justify-between group"
      >
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Corridor Lighting Assets
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              <Lightbulb className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-mono text-white tracking-tight">
              {kpis.totalPoles}
            </span>
            <span className="text-sm font-semibold text-slate-400 font-mono">Fixtures Monitored</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Smart poles across 6 metropolitan arterial corridors
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-wrap gap-1.5 text-[10px] font-mono">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
            {kpis.activePoles} Active
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
            {kpis.dimmedPoles} Dimmed
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 font-bold">
            {kpis.faultyPoles} Faulty
          </span>
        </div>
      </div>

      {/* 4. Active Alerts & Environmental Offset */}
      <div
        onClick={() => setActiveTab('alerts')}
        className="p-5 rounded-2xl glass-panel glass-panel-hover cursor-pointer flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Active Alerts & Carbon Offset
            </span>
            <div className={`p-2 rounded-xl shrink-0 ${kpis.activeAlertsCount > 0 ? 'bg-red-500/10 text-red-400 border border-red-500/30 animate-pulse' : 'bg-slate-700/40 text-slate-400'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-mono text-red-400 tracking-tight">
              {kpis.activeAlertsCount}
            </span>
            <span className="text-sm font-medium text-slate-400">Incident Flags</span>
            {kpis.criticalAlertsCount > 0 && (
              <span className="text-[10px] font-bold text-red-300 bg-red-500/20 px-2 py-0.5 rounded-full ml-auto">
                {kpis.criticalAlertsCount} Critical
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center space-x-1.5 text-xs text-emerald-400 font-mono">
            <Leaf className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{kpis.totalCo2SavedKg} kg CO₂ mitigated daily</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Standards Compliance</span>
          <span className="text-sky-300">UN SDG 7 & SDG 13</span>
        </div>
      </div>
    </div>
  );
}
