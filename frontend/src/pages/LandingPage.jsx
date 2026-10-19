import React, { useState } from 'react';
import {
  Shield,
  Zap,
  Activity,
  BarChart3,
  Lightbulb,
  Sliders,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Building2,
  Lock,
  Radio,
  Cpu,
  Layers,
  Sparkles,
  Server,
  ChevronRight,
  Eye,
  Clock,
  Globe,
  Compass,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoUrl from '../assets/logo.svg';

export default function LandingPage({ onEnterConsole, onOpenDemoLab, onLogout }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [selectedCorridor, setSelectedCorridor] = useState('hazratganj');

  const handleSignOut = () => {
    if (onLogout) onLogout();
    else if (logout) logout();
  };

  const corridors = [
    {
      id: 'hazratganj',
      name: 'Hazratganj Heritage Corridor',
      zone: 'Zone 1: Vidhan Sabha & Raj Bhavan',
      fixtures: 5,
      brightness: '50%',
      savings: '56.4%',
      status: 'Normal Illumination',
      aiMode: 'Radar Surge Active',
    },
    {
      id: 'gomtinagar',
      name: 'Gomti Nagar & Shaheed Path',
      zone: 'Zone 4: Express Arterial & IT Hub',
      fixtures: 6,
      brightness: '65%',
      savings: '48.2%',
      status: 'Inspection Scheduled',
      aiMode: 'Traffic Density Tracking',
    },
    {
      id: 'alambagh',
      name: 'Alambagh Transport Axis',
      zone: 'Zone 5: Intermodal Metro Corridor',
      fixtures: 4,
      brightness: '55%',
      savings: '52.0%',
      status: 'Normal Illumination',
      aiMode: 'Adaptive Dimming',
    },
    {
      id: 'chowk',
      name: 'Chowk Heritage Boulevard',
      zone: 'Zone 6: Rumi Darwaza & Old City',
      fixtures: 4,
      brightness: '30%',
      savings: '68.5%',
      status: 'Normal Illumination',
      aiMode: 'Pedestrian Floor 20%',
    },
  ];

  const pillarCards = [
    {
      icon: Cpu,
      title: 'Autonomous AI Dimming',
      description:
        'Continuous Ridge Regression coupled with radar surge detection dynamically trims brightness from 80% to 20% floor, conserving 40%–60% energy while delivering instantaneous illumination upon vehicle approach.',
      tag: 'Closed-Loop Control',
      color: 'from-sky-500/20 to-blue-500/10',
      border: 'border-sky-500/30',
      iconColor: 'text-sky-400',
    },
    {
      icon: Activity,
      title: 'Dual-Class Fault Diagnostics',
      description:
        'Instantly distinguishes isolated luminaire dark fixtures (normal voltage, zero current) from feeder transformer blackouts (zero voltage), dispatching the right crew without manual night patrols.',
      tag: 'Zero Dark Downtime',
      color: 'from-emerald-500/20 to-teal-500/10',
      border: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
    },
    {
      icon: Shield,
      title: 'Three-Tier Municipal RBAC',
      description:
        'Role-tailored interfaces for City Commissioners (budget ROI, SDG compliance), Control Room Dispatchers (one-touch lighting scenes, live map), and Field Technicians (1-tap SLA repair tracking).',
      tag: 'Zero Tech Confusion',
      color: 'from-indigo-500/20 to-purple-500/10',
      border: 'border-indigo-500/30',
      iconColor: 'text-indigo-400',
    },
    {
      icon: Server,
      title: 'TimescaleDB Telemetry Engine',
      description:
        'Enterprise hypertable architecture ingesting sub-second voltage, lux, and wattage telemetry across all poles, paired with immutable statutory audit logs adhering to IT Act 2000.',
      tag: 'Gov-Grade Security',
      color: 'from-amber-500/20 to-orange-500/10',
      border: 'border-amber-500/30',
      iconColor: 'text-amber-400',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* 1. Global Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0F172A]/90 border-b border-slate-800/80 px-6 sm:px-12 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-glow-cyan border border-sky-500/40 flex items-center justify-center bg-slate-900 shrink-0">
            <img src={logoUrl} alt="LuminaAI Crest" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-white tracking-tight">
                Lumina<span className="text-sky-400">AI</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-sky-500/10 text-sky-400 border border-sky-500/30 rounded-full font-mono">
                Smart Cities Mission
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              National Directorate of Urban Local Bodies • Autonomous Street Lighting Infrastructure
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Gateway Online • TimescaleDB Connected</span>
          </div>

          {isAuthenticated && user ? (
            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex items-center space-x-2 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                <span className="text-white font-semibold truncate max-w-[140px]">{user.name}</span>
                <span className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30 text-[10px] font-mono uppercase font-bold">
                  {user.roleLabel || user.role}
                </span>
              </div>

              <button
                onClick={onEnterConsole}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg transition-all"
              >
                <span>Enter Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleSignOut}
                className="px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-400 hover:text-red-300 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm"
                title="Sign Out of Console"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onEnterConsole}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg transition-all"
            >
              <span>Officer Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-6 sm:px-12 border-b border-slate-800/80">
        {/* Ambient Radial Lights */}
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-sky-300 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Autonomous Closed-Loop Municipal Illumination Management</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Intelligent Street Lighting for <br />
            <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              Tomorrow's Smart Cities
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
            LuminaAI transforms municipal public lighting into an intelligent, energy-conserving grid.
            By fusing real-time radar motion sensors, Ridge Regression traffic forecasting, and automated dual-class fault detection,
            cities reduce energy consumption by up to <strong className="text-emerald-400">60%</strong> while maintaining public safety.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {isAuthenticated && user ? (
              <>
                <button
                  onClick={onEnterConsole}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm flex items-center space-x-2.5 shadow-glow-cyan transition-all transform hover:-translate-y-0.5"
                >
                  <span>Enter Operations Console ({user?.roleLabel || 'Officer'})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleSignOut}
                  className="px-5 py-3.5 rounded-2xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-400 hover:text-red-300 font-bold text-sm flex items-center space-x-2 transition-all transform hover:-translate-y-0.5 shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onEnterConsole}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm flex items-center space-x-2.5 shadow-glow-cyan transition-all transform hover:-translate-y-0.5"
                >
                  <span>Access Operations Console</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('corridors');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 hover:text-white border border-slate-700 font-semibold text-sm flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Explore Network Corridors &darr;</span>
                </button>
              </>
            )}
          </div>

          {/* Key Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl glass-panel text-center space-y-1">
              <p className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">56.2%</p>
              <p className="text-xs text-slate-400">Average Power Reduction</p>
            </div>
            <div className="p-4 rounded-2xl glass-panel text-center space-y-1">
              <p className="text-2xl sm:text-3xl font-extrabold font-mono text-sky-400">&lt; 400ms</p>
              <p className="text-xs text-slate-400">Radar Surge Response</p>
            </div>
            <div className="p-4 rounded-2xl glass-panel text-center space-y-1">
              <p className="text-2xl sm:text-3xl font-extrabold font-mono text-indigo-400">6 Zones</p>
              <p className="text-xs text-slate-400">Arterial City Corridors</p>
            </div>
            <div className="p-4 rounded-2xl glass-panel text-center space-y-1">
              <p className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400">100%</p>
              <p className="text-xs text-slate-400">SLA Repair Compliance</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Pillars / Architecture Capabilities */}
      <section className="py-16 px-6 sm:px-12 border-b border-slate-800/80 bg-slate-950/40">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-semibold text-sky-400 uppercase tracking-wider">
              Engineering Excellence
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Designed for Scale, Reliability & Fiscal Stewardship
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              A comprehensive municipal platform engineered to eliminate energy waste without sacrificing night visibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillarCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className={`p-6 rounded-3xl glass-panel border ${card.border} space-y-4 hover:border-sky-500/50 transition-all`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                      <Icon className={`w-6 h-6 ${card.iconColor}`} />
                    </div>
                    <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {card.tag}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-white">{card.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Live Corridor Interactive Showcase */}
      <section className="py-16 px-6 sm:px-12 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-semibold text-sky-400 uppercase tracking-wider">
                Corridor Supervision
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                Monitored City Sectors
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Active municipal circuits operating under autonomous supervisory control
              </p>
            </div>

            <button
              onClick={onEnterConsole}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center space-x-1.5"
            >
              <span>View full geospatial map &rarr;</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {corridors.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCorridor(c.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  selectedCorridor === c.id
                    ? 'bg-slate-800/90 border-sky-400 shadow-glow-cyan'
                    : 'glass-panel border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">{c.zone}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {c.savings} saved
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mt-3">{c.name}</h4>

                <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span>Average Dim:</span>
                    <span className="text-sky-300 font-bold">{c.brightness}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Active Poles:</span>
                    <span className="text-slate-200">{c.fixtures} fixtures</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Logic:</span>
                    <span className="text-emerald-400">{c.aiMode}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Stakeholder Role-Based Experience */}
      <section className="py-16 px-6 sm:px-12 border-b border-slate-800/80 bg-slate-950/40">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-semibold text-indigo-400 uppercase tracking-wider">
              Human-Centric Interface
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Intuitive Dashboards for Every Municipal Role
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              No technical clutter or confusing electrical jargon. Each official sees precisely what their mission requires.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* City Executive */}
            <div className="p-6 rounded-3xl glass-panel border border-indigo-500/30 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">City Executive & Commissioner</h3>
                <p className="text-xs text-indigo-300 font-mono">Strategic Administration</p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fiscal dashboards highlighting total rupees saved, SDG 7 & 11 environmental offsets, and city-wide corridor health metrics in plain language.
              </p>
              <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                <div className="flex items-center space-x-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Annual ₹ Budget Forecast</span>
                </div>
                <div className="flex items-center space-x-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Carbon Dioxide (CO₂) Tonnes</span>
                </div>
              </div>
            </div>

            {/* Shift Operator */}
            <div className="p-6 rounded-3xl glass-panel border border-sky-500/30 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold">
                <Sliders className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Control Room Operator</h3>
                <p className="text-xs text-sky-300 font-mono">Shift Supervisory Dispatch</p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                One-touch preset scenes for heavy rainfall, late-night quiet hours, or emergency full illumination with real-time interactive GIS map tracking.
              </p>
              <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                <div className="flex items-center space-x-1.5 text-sky-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>One-Touch Weather Presets</span>
                </div>
                <div className="flex items-center space-x-1.5 text-sky-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Geospatial Circuit Pinning</span>
                </div>
              </div>
            </div>

            {/* Field Technician */}
            <div className="p-6 rounded-3xl glass-panel border border-amber-500/30 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Rapid Response Technician</h3>
                <p className="text-xs text-amber-300 font-mono">Field Maintenance Crew</p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Streamlined mobile task view detailing physical pole location, pre-identified replacement parts, and a single "Mark Repaired" completion button.
              </p>
              <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                <div className="flex items-center space-x-1.5 text-amber-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Exact Replacement Part Pre-Check</span>
                </div>
                <div className="flex items-center space-x-1.5 text-amber-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>1-Tap SLA Work Order Resolution</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call To Action Footer */}
      <section className="py-16 px-6 sm:px-12 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to Explore the Platform?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Sign in with official credentials to access real-time telemetry, automated dimming schedules, and incident management.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 pt-2">
            <div className="flex flex-wrap items-center justify-center gap-4">
              {isAuthenticated && user ? (
                <>
                  <button
                    onClick={onEnterConsole}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg transition-all"
                  >
                    <span>Enter Operations Console ({user?.roleLabel || 'Officer'}) &rarr;</span>
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="px-4 py-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-400 hover:text-red-300 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={onEnterConsole}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg transition-all"
                >
                  <span>Officer Sign In &rarr;</span>
                </button>
              )}
            </div>

            {onOpenDemoLab && (
              <button
                onClick={onOpenDemoLab}
                className="text-[11px] text-slate-500 hover:text-sky-400 font-mono transition-colors mt-2"
              >
                Developer & Engineering Simulation Lab &rarr;
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 7. Official Municipal Footer */}
      <footer className="border-t border-slate-800/80 px-6 sm:px-12 py-6 text-xs text-slate-400 bg-[#0F172A]/90">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
              <img src={logoUrl} alt="LuminaAI" className="w-4 h-4 object-contain" />
            </div>
            <p className="font-semibold text-slate-300">
              LuminaAI • National Directorate of Urban Local Bodies
            </p>
          </div>

          <div className="flex items-center space-x-4 text-[11px] font-mono text-slate-400">
            <span>Smart Cities Mission</span>
            <span>•</span>
            <span>TimescaleDB & PostgreSQL 16</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
