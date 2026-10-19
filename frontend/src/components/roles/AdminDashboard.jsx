import React from 'react';
import { useLighting } from '../../context/LightingContext';
import { useAuth } from '../../context/AuthContext';
import {
  IndianRupee,
  TrendingDown,
  Leaf,
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Award,
  Clock,
  Sparkles,
  MapPin,
  Phone,
} from 'lucide-react';
import EnergyChart from '../EnergyChart';
import LucknowAreaMap from '../LucknowAreaMap';

export default function AdminDashboard() {
  const { kpis, zones, poleGroups, selectedZone, setSelectedZone, setActiveTab } = useLighting();
  const { user } = useAuth();

  // Lucknow Municipal Administrative Zones & Nodal Officer Sector Health
  const sectorHealth = [
    {
      name: 'Zone 1: Hazratganj',
      shortName: 'Hazratganj Heritage',
      nodalOfficer: 'Er. Alok Srivastava',
      status: 'Normal Illumination',
      state: 'HEALTHY',
      summary: 'Vidhan Sabha Marg & Raj Bhavan corridors operating safely. Adaptive evening dimming active.',
      lightsCount: 5,
    },
    {
      name: 'Zone 4: Gomti Nagar',
      shortName: 'Gomti Nagar & Shaheed Path',
      nodalOfficer: 'Er. Pradeep Mishra',
      status: 'Inspection Scheduled',
      state: 'ATTENTION',
      summary: '1 dark fixture reported on Amar Shaheed Path median. Night repair team dispatched.',
      lightsCount: 6,
    },
    {
      name: 'Zone 5: Alambagh',
      shortName: 'Alambagh Transport',
      nodalOfficer: 'Er. Sunil Verma',
      status: 'Crew Dispatched',
      state: 'ATTENTION',
      summary: '1 bulb module burnout at Alambagh Metro Junction East. Replacement unit in transit.',
      lightsCount: 4,
    },
    {
      name: 'Zone 6: Chowk Heritage',
      shortName: 'Chowk Old City',
      nodalOfficer: 'Er. R.K. Pandey',
      status: 'Normal Illumination',
      state: 'HEALTHY',
      summary: 'Rumi Darwaza & Bara Imambara avenues softly illuminated. High energy conservation.',
      lightsCount: 4,
    },
    {
      name: 'Zone 3: Indira Nagar',
      shortName: 'Indira Nagar & Ring Road',
      nodalOfficer: 'Er. Neha Tripathi',
      status: 'Normal Illumination',
      state: 'HEALTHY',
      summary: 'Munshi Pulia & Bhootnath commercial areas operating at 100% illumination reliability.',
      lightsCount: 3,
    },
    {
      name: 'Zone 2: Charbagh',
      shortName: 'Charbagh Railway Axis',
      nodalOfficer: 'Er. Sanjay Yadav',
      status: 'Normal Illumination',
      state: 'HEALTHY',
      summary: 'Charbagh Station forecourt & Gautam Buddha Marg safe with active pedestrian radar.',
      lightsCount: 3,
    },
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* 1. Executive Welcome & Briefing Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider font-mono">
                City Executive Briefing
              </span>
              <span className="text-xs text-slate-400 font-mono">Directorate of Urban Local Bodies</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Metropolitan Smart Street Lighting Overview
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Street lighting across all 6 metropolitan arterial corridors is operating safely with{' '}
              <span className="text-emerald-400 font-semibold">{kpis.overallSavingsPct}% energy reduction</span>,
              saving municipal taxpayer funds while maintaining public safety.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('analytics')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-semibold flex items-center space-x-2 shadow-lg transition-all"
            >
              <span>View Financial Savings & ROI &rarr;</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. High-Level Outcome Scorecards (Zero Technical Jargon) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Money Saved */}
        <div className="p-5 rounded-2xl glass-panel flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Municipal Budget Saved
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-bold font-mono text-emerald-400 tracking-tight">
                ₹{kpis.totalCostSavedInr}
              </span>
              <span className="text-xs text-emerald-300">saved/day</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Estimated <span className="text-white font-medium">₹{(parseFloat(kpis.totalCostSavedInr) * 30).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span> monthly energy bill reduction
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center text-[11px] text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1.5 shrink-0" />
            <span>Commercial tariff: ₹7.50 / kWh</span>
          </div>
        </div>

        {/* Energy Conserved */}
        <div className="p-5 rounded-2xl glass-panel flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Energy Conservation
            </span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-bold font-mono text-sky-400 tracking-tight">
                {kpis.overallSavingsPct}%
              </span>
              <span className="text-xs text-sky-300">less power used</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {kpis.totalSavedKwh} kWh saved daily compared to traditional non-dimmed lights
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center text-[11px] text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-sky-400 mr-1.5 shrink-0" />
            <span>AI automatically adapts to traffic flow</span>
          </div>
        </div>

        {/* Clean Air & CO2 */}
        <div className="p-5 rounded-2xl glass-panel flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Clean Air & Green Impact
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-bold font-mono text-emerald-400 tracking-tight">
                {kpis.totalCo2SavedKg}
              </span>
              <span className="text-xs text-emerald-300">kg CO₂ prevented/day</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Supports City Climate Action Plan & Clean Air Initiative
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center text-[11px] text-slate-400">
            <Award className="w-3.5 h-3.5 text-emerald-400 mr-1.5 shrink-0" />
            <span>Meets UN Sustainable Development Goals</span>
          </div>
        </div>

        {/* City Street Safety & Reliability */}
        <div className="p-5 rounded-2xl glass-panel flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              City Illumination Reliability
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-bold font-mono text-white tracking-tight">
                98.4%
              </span>
              <span className="text-xs text-emerald-400 font-semibold">Reliable</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {kpis.activePoles + kpis.dimmedPoles} of {kpis.totalPoles} lights fully illuminating city streets
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center text-[11px] text-slate-400">
            <Clock className="w-3.5 h-3.5 text-indigo-400 mr-1.5 shrink-0" />
            <span>24/7 automated municipal monitoring</span>
          </div>
        </div>
      </div>

      {/* 3. Live Geospatial Area Surveillance Map (Zero-API OpenStreetMap Engine) */}
      <LucknowAreaMap showOfficerCard={true} />

      {/* 4. Simple City Precincts Status (Non-Technical Plain English) */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-sky-400" />
              <span>City Precincts & Corridors Status</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live street status in simple, everyday language — zero electrical jargon
            </p>
          </div>
          <button
            onClick={() => setActiveTab('map')}
            className="text-xs text-sky-400 hover:text-sky-300 font-mono flex items-center space-x-1"
          >
            <span>Open Dedicated Map View &rarr;</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectorHealth.map(sec => {
            const isHealthy = sec.state === 'HEALTHY';
            const isSelected = selectedZone === sec.name;
            return (
              <div
                key={sec.name}
                onClick={() => setSelectedZone(sec.name)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-sky-400 border-sky-400 bg-sky-950/30'
                    : isHealthy
                    ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    : 'bg-amber-950/20 border-amber-500/30 hover:border-amber-400'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-white">{sec.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">Nodal: {sec.nodalOfficer}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap ${
                      isHealthy
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {sec.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {sec.summary}
                </p>
                <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>{sec.lightsCount} Street Fixtures</span>
                  <span className={isHealthy ? 'text-emerald-400' : 'text-amber-400'}>
                    {isHealthy ? '● All Normal' : '● Action Scheduled'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. 24-Hour Energy Savings Trend (Visual & Clear) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <EnergyChart />
        </div>

        {/* Executive Summary Card */}
        <div className="lg:col-span-4 p-5 rounded-2xl glass-panel space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Municipal Service Reliability</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              LuminaAI automatically balances energy conservation with citizen safety. When traffic or pedestrians are present, illumination automatically surges to 100%. When streets are empty at late night, soft lighting maintains safety while cutting wasted electricity.
            </p>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Citizen Safety Compliance</span>
                <span className="text-emerald-400 font-bold">Target SLA: 100%</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Average Repair Response</span>
                <span className="text-sky-300 font-bold">&lt; 4 Hours</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Taxpayer Savings / Year</span>
                <span className="text-emerald-400 font-bold">₹22.1 Lakh Est.</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setActiveTab('maintenance')}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center space-x-1"
            >
              <span>View Active Maintenance Repairs &rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
