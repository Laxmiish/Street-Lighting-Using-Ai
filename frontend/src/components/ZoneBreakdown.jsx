import React from 'react';
import { useLighting } from '../context/LightingContext';
import { Layers } from 'lucide-react';

export default function ZoneBreakdown() {
  const { zones, setSelectedZone, selectedZone, setActiveTab } = useLighting();

  return (
    <div className="p-5 sm:p-6 rounded-2xl glass-panel space-y-4">
      <div>
        <h2 className="text-sm font-bold text-white flex items-center space-x-2">
          <Layers className="w-4 h-4 text-sky-400 shrink-0" />
          <span>Metropolitan Corridor Sector Performance</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Micro-zone power segregation and targeted energy savings distribution
        </p>
      </div>

      <div className="space-y-3">
        {zones.map(z => {
          const isSelected = selectedZone === z.zone;
          return (
            <div
              key={z.zone}
              onClick={() => {
                setSelectedZone(z.zone);
                setActiveTab('map');
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-800 border-sky-400 shadow-glow-cyan'
                  : 'bg-slate-900/60 border-slate-700/60 hover:border-slate-500 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-white truncate">{z.zone}</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                  {z.savingsPct}% Saved
                </span>
              </div>

              <div className="mt-2.5 flex items-baseline justify-between text-xs font-mono">
                <span className="text-slate-400">{z.totalPoles} Fixtures</span>
                <span className="text-sky-300 font-bold">{z.kwhToday} kWh / day</span>
              </div>

              <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-sky-400 h-1.5 rounded-full"
                  style={{ width: `${z.savingsPct}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Dim Level: {z.avgBrightness}%</span>
                <span className={z.faulty > 0 ? 'text-red-400 font-bold' : 'text-slate-500'}>
                  {z.faulty > 0 ? `${z.faulty} Fault Alert` : 'Normal Operations'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
