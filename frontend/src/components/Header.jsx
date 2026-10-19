import React from 'react';
import { useLighting } from '../context/LightingContext';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  Shield,
  Monitor,
  Wrench,
  LogOut,
} from 'lucide-react';
import logoUrl from '../assets/logo.svg';

export default function Header({ onLogout }) {
  const {
    currentRole,
    backendConnected,
    kpis,
    setActiveTab,
  } = useLighting();

  const { user, logout } = useAuth();

  const getRoleIcon = (role) => {
    switch (role) {
      case 'technician':
        return Wrench;
      case 'operator':
        return Monitor;
      case 'admin':
      default:
        return Shield;
    }
  };

  const activeRole = user?.role || currentRole || 'admin';
  const RoleIcon = getRoleIcon(activeRole);

  return (
    <header className="sticky top-0 z-50 bg-[#0F172A] border-b border-slate-800 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4 shadow-lg">
      {/* Brand & Platform Identity */}
      <div className="flex items-center space-x-3.5">
        <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-glow-cyan border border-sky-500/40 flex items-center justify-center bg-slate-900 shrink-0">
          <img src={logoUrl} alt="LuminaAI Crest" className="w-8 h-8 object-contain" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center">
              Lumina<span className="text-sky-400">AI</span>
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-sky-500/10 text-sky-400 border border-sky-500/30 rounded-full whitespace-nowrap font-mono">
              Smart Cities Mission
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Directorate of Urban Local Bodies • Autonomous Street Lighting
          </p>
        </div>
      </div>

      {/* Global Controls, RBAC Profile & Connection */}
      <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
        {/* Grid Telemetry Gateway Connection Status Badge */}
        <div
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-[11px] font-mono border ${
            backendConnected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}
          title={backendConnected ? 'Connected to PostgreSQL & TimescaleDB Telemetry Pipeline' : 'Telemetry Gateway Initializing / Standby'}
        >
          <span className={`w-2 h-2 rounded-full shrink-0 ${backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
          <span className="font-semibold">{backendConnected ? 'Grid Gateway: Live' : 'Gateway: Standby'}</span>
        </div>

        {/* Active Alert Notification Badge */}
        <button
          onClick={() => setActiveTab('alerts')}
          className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700/80 text-slate-300 hover:text-white transition-colors"
          title="View Active Notices"
        >
          <Bell className="w-4 h-4" />
          {kpis.activeAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-glow-red animate-pulse">
              {kpis.activeAlertsCount}
            </span>
          )}
        </button>

        {/* Authenticated Officer Profile (Bound to authenticated session - No switching) */}
        <div className="flex items-center space-x-2 pl-2 sm:pl-3 border-l border-slate-800">
          <div className="flex items-center space-x-2.5 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700/80">
            <RoleIcon className="w-4 h-4 text-sky-400 shrink-0" />
            <div className="text-left">
              <div className="flex items-center space-x-2">
                <p className="text-xs font-bold text-white leading-tight">
                  {user?.name || 'Authorized Officer'}
                </p>
                <span className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[9px] font-mono uppercase font-bold">
                  {user?.roleLabel || user?.role || 'Admin'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden md:block">
                {user?.department || 'Operations Directorate'}
              </p>
            </div>
          </div>

          {/* Prominent High-Visibility Sign Out Button */}
          <button
            onClick={async () => {
              if (onLogout) await onLogout();
              else if (logout) await logout();
            }}
            className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-400 hover:text-red-300 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm"
            title="Sign Out from Console and return to Landing Page"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
