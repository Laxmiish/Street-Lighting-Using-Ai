import React, { useState } from 'react';
import { useLighting } from '../context/LightingContext';
import {
  Search,
  Lightbulb,
  Radio,
  Sliders,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function PoleTable() {
  const {
    filteredPoles,
    searchQuery,
    setSearchQuery,
    updatePoleBrightness,
  } = useLighting();

  const [statusFilter, setStatusFilter] = useState('ALL');

  const displayedPoles = filteredPoles.filter(pole => {
    if (statusFilter === 'ALL') return true;
    return pole.status === statusFilter;
  });

  return (
    <div className="p-5 sm:p-6 rounded-2xl glass-panel space-y-5">
      {/* Table Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Lightbulb className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Municipal Street Lighting Asset Register</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time individual fixture telemetry, wattage ratings, and interactive dimming controls
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search code or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 w-52 sm:w-64"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-sky-500 font-mono"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active (Online)</option>
            <option value="DIMMED">Dimmed</option>
            <option value="FAULTY">Faulty</option>
            <option value="OFFLINE">Offline</option>
          </select>
        </div>
      </div>

      {/* Table Wrapper with horizontal scrolling & padding */}
      <div className="overflow-x-auto rounded-2xl border border-slate-700/80 bg-slate-900/60 shadow-inner">
        <table className="w-full text-left border-collapse text-xs min-w-[840px]">
          <thead>
            <tr className="bg-slate-800/90 text-slate-400 border-b border-slate-700 uppercase font-mono text-[10px] tracking-wider">
              <th className="py-3.5 px-5 whitespace-nowrap">Asset Identifier</th>
              <th className="py-3.5 px-5 whitespace-nowrap">Zone / Corridor</th>
              <th className="py-3.5 px-5 whitespace-nowrap">Operating Status</th>
              <th className="py-3.5 px-5 whitespace-nowrap">Brightness Level</th>
              <th className="py-3.5 px-5 whitespace-nowrap">Electrical Telemetry</th>
              <th className="py-3.5 px-5 whitespace-nowrap">Radar Detection</th>
              <th className="py-3.5 px-5 text-right whitespace-nowrap">Last Ping</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {displayedPoles.length === 0 && (
              <tr>
                <td colSpan="6" className="py-12 text-center text-slate-500 text-xs font-mono">
                  {searchQuery || statusFilter !== 'ALL'
                    ? 'No fixtures match the specified filter criteria.'
                    : 'Loading fixtures from database...'}
                </td>
              </tr>
            )}
            {displayedPoles.map(pole => {
              const isFaulty = pole.status === 'FAULTY';
              const isDimmed = pole.status === 'DIMMED';

              return (
                <tr key={pole.id} className="hover:bg-slate-800/40 transition-colors">
                  {/* Pole Code & Name */}
                  <td className="py-3.5 px-5">
                    <div className="font-mono font-bold text-sky-300 text-xs">{pole.poleCode}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[220px]" title={pole.locationName}>
                      {pole.locationName}
                    </div>
                  </td>

                  {/* Zone */}
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                      {pole.zone}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                        pole.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : isDimmed
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : isFaulty
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30 animate-pulse'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${pole.status === 'ACTIVE' ? 'bg-emerald-400' : isDimmed ? 'bg-amber-400' : isFaulty ? 'bg-red-400' : 'bg-slate-500'}`} />
                      <span>{pole.status}</span>
                    </span>
                  </td>

                  {/* Brightness Slider */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center space-x-3 min-w-[150px]">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={pole.currentBrightness}
                        onChange={(e) => updatePoleBrightness(pole.id, parseInt(e.target.value, 10))}
                        className="w-24 sm:w-28 accent-sky-400 cursor-pointer h-1.5 bg-slate-750 rounded-lg"
                        title="Adjust brightness level"
                      />
                      <span className="font-mono font-bold text-white text-xs w-9">
                        {pole.currentBrightness}%
                      </span>
                    </div>
                  </td>

                  {/* Power Draw */}
                  <td className="py-3.5 px-5 font-mono text-slate-300 whitespace-nowrap">
                    <div className="font-semibold text-white">{pole.powerConsumedKwh.toFixed(3)} kW</div>
                    <div className="text-[10px] text-slate-500">{pole.currentAmps} A • {pole.voltage} V</div>
                  </td>

                  {/* Radar Motion Telemetry */}
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono ${
                        pole.motionDetected
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800/80 text-slate-400 border border-slate-700/60'
                      }`}
                    >
                      <Radio className={`w-3 h-3 ${pole.motionDetected ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
                      <span>{pole.motionDetected ? 'Motion Detected' : 'Clear'}</span>
                    </span>
                  </td>

                  {/* Heartbeat */}
                  <td className="py-3.5 px-5 text-right font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {pole.lastHeartbeat}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
