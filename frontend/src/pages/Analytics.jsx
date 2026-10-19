import React from 'react';
import { useLighting } from '../context/LightingContext';
import { Leaf, Award, DollarSign, CheckCircle2, TrendingDown, Shield, Sparkles } from 'lucide-react';

export default function Analytics() {
  const { kpis, zones } = useLighting();

  // Projected Annual Savings
  const dailyKwhSaved = parseFloat(kpis.totalSavedKwh);
  const annualKwhSaved = (dailyKwhSaved * 365).toFixed(0);
  const annualCostSavedInr = (dailyKwhSaved * 365 * 7.50).toLocaleString('en-IN');
  const annualCo2SavedTonnes = ((dailyKwhSaved * 365 * 0.82) / 1000).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center space-x-2">
          <Award className="w-5 h-5 text-emerald-400" />
          <span>Sustainability & SDG Impact Analytics</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Validation of energy conservation targets aligning with United Nations Sustainable Development Goals
        </p>
      </div>

      {/* SDG Impact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SDG 7 */}
        <div className="p-4 rounded-2xl glass-panel border-t-4 border-t-amber-500 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
              UN SDG 7
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">Target Achieved</span>
          </div>
          <h3 className="text-sm font-bold text-white">Affordable & Clean Energy</h3>
          <p className="text-xs text-slate-300">
            Achieved <strong className="text-emerald-400">{kpis.overallSavingsPct}%</strong> reduction in municipal grid energy consumption via intelligent regression-based load shedding.
          </p>
        </div>

        {/* SDG 9 */}
        <div className="p-4 rounded-2xl glass-panel border-t-4 border-t-sky-500 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
              UN SDG 9
            </span>
            <span className="text-xs font-mono font-bold text-sky-400">Smart Infra</span>
          </div>
          <h3 className="text-sm font-bold text-white">Industry, Innovation & Infra</h3>
          <p className="text-xs text-slate-300">
            Automated sensor fault diagnostics reduce manual physical patrolling and enable proactive component life cycle forecasting.
          </p>
        </div>

        {/* SDG 11 */}
        <div className="p-4 rounded-2xl glass-panel border-t-4 border-t-indigo-500 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
              UN SDG 11
            </span>
            <span className="text-xs font-mono font-bold text-indigo-400">Urban Living</span>
          </div>
          <h3 className="text-sm font-bold text-white">Sustainable Cities & Communities</h3>
          <p className="text-xs text-slate-300">
            Maintains 100% illumination during pedestrian/vehicle activity while curbing light pollution and dark sky degradation.
          </p>
        </div>

        {/* SDG 13 */}
        <div className="p-4 rounded-2xl glass-panel border-t-4 border-t-emerald-500 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              UN SDG 13
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">Decarbonization</span>
          </div>
          <h3 className="text-sm font-bold text-white">Climate Action & Carbon Offset</h3>
          <p className="text-xs text-slate-300">
            Offsetting <strong className="text-emerald-400">{kpis.totalCo2SavedKg} kg CO₂/day</strong> ({annualCo2SavedTonnes} metric tonnes/yr) based on regional grid emission factors.
          </p>
        </div>
      </div>

      {/* Municipal Financial Feasibility Projection */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-emerald-400" />
          <span>Municipal ROI & Financial Projection (Scale: 100 Fixtures Corridor)</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-center">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-700/60">
            <span className="text-xs text-slate-400 block mb-1">Annual Electricity Saved</span>
            <span className="text-xl font-bold text-sky-400">{annualKwhSaved} kWh</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-700/60">
            <span className="text-xs text-slate-400 block mb-1">Estimated Annual Cost Savings</span>
            <span className="text-xl font-bold text-emerald-400">₹{annualCostSavedInr}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-700/60">
            <span className="text-xs text-slate-400 block mb-1">Carbon Dioxide Mitigated</span>
            <span className="text-xl font-bold text-emerald-300">{annualCo2SavedTonnes} Tonnes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
