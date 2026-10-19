import React, { useState } from 'react';
import { useLighting } from '../../context/LightingContext';
import {
  Sliders,
  Sun,
  CloudRain,
  Moon,
  AlertOctagon,
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import PoleMap from '../PoleMap';
import AlertFeed from '../AlertFeed';
import PoleTable from '../PoleTable';

export default function OperatorDashboard() {
  const {
    aiAdaptiveMode,
    setAiAdaptiveMode,
    updateGroupBrightness,
    zones,
    kpis,
  } = useLighting();

  const [activeScene, setActiveScene] = useState(aiAdaptiveMode ? 'AUTO' : 'CUSTOM');
  const [sceneFeedback, setSceneFeedback] = useState(null);

  // One-touch municipal lighting preset commands
  const handleApplyScene = (sceneKey) => {
    setActiveScene(sceneKey);

    if (sceneKey === 'AUTO') {
      setAiAdaptiveMode(true);
      setSceneFeedback('AI Adaptive Auto Mode engaged. Lights will adjust automatically based on real-time traffic and radar.');
    } else if (sceneKey === 'RAIN_FOG') {
      setAiAdaptiveMode(false);
      zones.forEach(z => updateGroupBrightness(z.zone, 90));
      setSceneFeedback('Rain & Fog Safety Mode active. All city corridors boosted to 90% high visibility.');
    } else if (sceneKey === 'LATE_NIGHT') {
      setAiAdaptiveMode(false);
      zones.forEach(z => updateGroupBrightness(z.zone, 20));
      setSceneFeedback('Late-Night Economy Mode active. Quiet sectors dimmed to 20% floor to maximize energy conservation.');
    } else if (sceneKey === 'EMERGENCY') {
      setAiAdaptiveMode(false);
      zones.forEach(z => updateGroupBrightness(z.zone, 100));
      setSceneFeedback('Emergency Full Power active! All municipal street lights engaged at 100% full illumination.');
    }

    setTimeout(() => {
      setSceneFeedback(null);
    }, 6000);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* 1. Control Room Header with Quick Scene Control Panel */}
      <div className="p-5 sm:p-6 rounded-3xl glass-panel space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase tracking-wider font-mono">
                Control Room Console
              </span>
              <span className="text-xs text-slate-400">Shift Operations Dispatch</span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">
              One-Touch Municipal Lighting Scenes
            </h1>
            <p className="text-xs text-slate-400">
              Select an instant citywide lighting mode or let LuminaAI adapt automatically to road activity
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
              {kpis.totalPoles} Total Fixtures
            </span>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {kpis.activePoles + kpis.dimmedPoles} Online
            </span>
            {kpis.faultyPoles > 0 && (
              <span className="px-3 py-1 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30">
                {kpis.faultyPoles} Lights Down
              </span>
            )}
          </div>
        </div>

        {/* 4 One-Touch Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Preset 1: Auto AI */}
          <button
            onClick={() => handleApplyScene('AUTO')}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
              activeScene === 'AUTO' && aiAdaptiveMode
                ? 'bg-sky-500/20 border-sky-400 shadow-glow-cyan text-white'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider font-mono">Scene 1</span>
              <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm font-bold text-white">Normal Auto (AI)</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Dynamic traffic & radar adaptation. Best balance of safety & power.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-sky-300">
              {activeScene === 'AUTO' && aiAdaptiveMode ? '● Currently Active' : 'Tap to Activate'}
            </div>
          </button>

          {/* Preset 2: Bad Weather / Rain & Fog */}
          <button
            onClick={() => handleApplyScene('RAIN_FOG')}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
              activeScene === 'RAIN_FOG'
                ? 'bg-amber-500/20 border-amber-400 shadow-glow-amber text-white'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider font-mono">Scene 2</span>
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <CloudRain className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm font-bold text-white">Rain / Fog Mode (90%)</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Boosts all corridors to high beam to support driver safety in low visibility.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-amber-300">
              {activeScene === 'RAIN_FOG' ? '● Currently Active' : 'Tap to Activate'}
            </div>
          </button>

          {/* Preset 3: Late Night Economy */}
          <button
            onClick={() => handleApplyScene('LATE_NIGHT')}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
              activeScene === 'LATE_NIGHT'
                ? 'bg-indigo-500/20 border-indigo-400 text-white'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider font-mono">Scene 3</span>
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Moon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm font-bold text-white">Late-Night Economy (20%)</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Dims quiet streets to 20% floor to save maximum electricity after midnight.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-indigo-300">
              {activeScene === 'LATE_NIGHT' ? '● Currently Active' : 'Tap to Activate'}
            </div>
          </button>

          {/* Preset 4: Emergency All-On */}
          <button
            onClick={() => handleApplyScene('EMERGENCY')}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
              activeScene === 'EMERGENCY'
                ? 'bg-red-500/20 border-red-400 shadow-glow-red text-white'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider font-mono">Scene 4</span>
              <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
                <AlertOctagon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm font-bold text-white">Emergency All-On (100%)</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Maximum citywide illumination for emergency response or police escort.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-red-300">
              {activeScene === 'EMERGENCY' ? '● Currently Active' : 'Tap to Activate'}
            </div>
          </button>
        </div>

        {/* Scene Activation Feedback Banner */}
        {sceneFeedback && (
          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs text-sky-300 flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
            <span>{sceneFeedback}</span>
          </div>
        )}
      </div>

      {/* 2. Interactive Geospatial Corridor Map */}
      <PoleMap />

      {/* 3. Operational Real-Time Incident Notices (Simplified) */}
      <AlertFeed />

      {/* 4. Complete Street Lighting Asset Register */}
      <PoleTable />
    </div>
  );
}
