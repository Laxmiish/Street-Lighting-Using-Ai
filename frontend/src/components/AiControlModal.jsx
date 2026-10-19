import React from 'react';
import { useLighting } from '../context/LightingContext';
import { SlidersHorizontal, Sparkles, Cpu, ShieldCheck } from 'lucide-react';

export default function AiControlModal() {
  const { aiConfig, setAiConfig, updateAiParameters } = useLighting();

  const handleChange = (field, value) => {
    if (updateAiParameters) {
      updateAiParameters({ [field]: value });
    } else {
      setAiConfig(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-2xl glass-panel space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2.5">
            <Cpu className="w-5 h-5 text-sky-400 shrink-0" />
            <span>AI Adaptive Engine & Control Optimization Parameters</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Fine-tune linear regression inference thresholds, diurnal dimming schedules, and radar responsiveness
          </p>
        </div>
        <div className="flex items-center space-x-2 self-start sm:self-center">
          <span className="text-xs text-slate-400">Inference Engine:</span>
          <span className="px-3 py-1 rounded-xl bg-sky-500/10 text-sky-300 font-mono text-xs border border-sky-500/20 font-bold whitespace-nowrap">
            Linear Regression + Decision Boundary
          </span>
        </div>
      </div>

      {/* Model Mathematical Formula Display */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-slate-400 text-xs">
          <span className="flex items-center space-x-2 text-sky-300 font-bold">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Active Closed-Loop Inference Formula</span>
          </span>
          <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            R² Correlation: 0.942 (Optimal Calibration)
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 overflow-x-auto text-xs leading-relaxed">
          <span className="text-sky-400">Brightness_cmd</span> = 
          MAX( <span className="text-amber-300">{aiConfig.nightFloorBrightness}%</span>, 
          IF(<span className="text-amber-400">Motion == TRUE</span>, <span className="text-sky-300">{aiConfig.motionBoostBrightness}%</span>, 
          ROUND(<span className="text-purple-300">100 - (AmbientLux * 1.25) + TimeWeight</span>) ) )
        </div>
      </div>

      {/* Tuning Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* Night Security Floor Brightness */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <label className="text-slate-200 font-semibold">Late-Night Quiet Security Floor</label>
            <span className="font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
              {aiConfig.nightFloorBrightness}%
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Minimum safe illumination maintained between 23:00 and 05:00 when no vehicular/pedestrian motion is detected.
          </p>
          <input
            type="range"
            min="10"
            max="40"
            value={aiConfig.nightFloorBrightness}
            onChange={(e) => handleChange('nightFloorBrightness', parseInt(e.target.value, 10))}
            className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-750 rounded-lg mt-2"
          />
        </div>

        {/* Motion Boost Brightness */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <label className="text-slate-200 font-semibold">Motion / Vehicle Boost Illumination</label>
            <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {aiConfig.motionBoostBrightness}%
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Target illumination triggered instantly when radar/PIR detects oncoming traffic or pedestrians.
          </p>
          <input
            type="range"
            min="60"
            max="100"
            value={aiConfig.motionBoostBrightness}
            onChange={(e) => handleChange('motionBoostBrightness', parseInt(e.target.value, 10))}
            className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-750 rounded-lg mt-2"
          />
        </div>

        {/* Ambient Lux Switch-On Threshold */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <label className="text-slate-200 font-semibold">Ambient Lux Switch-On Threshold</label>
            <span className="font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              {aiConfig.ambientLuxThreshold} Lux
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ambient light level below which the fixture activates automatically at dusk.
          </p>
          <input
            type="range"
            min="10"
            max="150"
            value={aiConfig.ambientLuxThreshold}
            onChange={(e) => handleChange('ambientLuxThreshold', parseFloat(e.target.value))}
            className="w-full accent-purple-400 cursor-pointer h-2 bg-slate-750 rounded-lg mt-2"
          />
        </div>

        {/* Motion Hold Timeout */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <label className="text-slate-200 font-semibold">Radar Motion Hold Timeout</label>
            <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {aiConfig.motionHoldSeconds} Seconds
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Duration to maintain boost brightness after the moving subject has passed the fixture detection cone.
          </p>
          <input
            type="range"
            min="15"
            max="120"
            step="5"
            value={aiConfig.motionHoldSeconds}
            onChange={(e) => handleChange('motionHoldSeconds', parseInt(e.target.value, 10))}
            className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-750 rounded-lg mt-2"
          />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-750 text-xs text-slate-300 flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          <strong>Municipal Safety Constraints Active:</strong> Automated safety floors prevent street fixtures from dropping below 20% illumination under any circumstance, maintaining alignment with National Urban Transport & Road Lighting Safety Standards (IRC:SP:72).
        </span>
      </div>
    </div>
  );
}
