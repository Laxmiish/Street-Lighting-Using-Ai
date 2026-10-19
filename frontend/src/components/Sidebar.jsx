import React from 'react';
import { useLighting } from '../context/LightingContext';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  MapPin,
  Lightbulb,
  BarChart3,
  AlertTriangle,
  SlidersHorizontal,
  Shield,
  Activity,
  Wrench,
  FileText,
} from 'lucide-react';

export default function Sidebar() {
  const { activeTab, setActiveTab, kpis } = useLighting();
  const { user, canAccessTab } = useAuth();

  const allNavItems = [
    { id: 'dashboard', label: 'Operations Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Corridor Live Map', icon: MapPin },
    { id: 'poles', label: 'Lighting Asset Inventory', icon: Lightbulb, count: kpis.totalPoles },
    { id: 'maintenance', label: 'Maintenance Hub', icon: Wrench, count: kpis.openMaintenanceCount },
    { id: 'records', label: 'Audit & Records', icon: FileText, count: kpis.totalRecordsCount },
    { id: 'analytics', label: 'Sustainability & SDGs', icon: BarChart3 },
    { id: 'alerts', label: 'Incident Management', icon: AlertTriangle, count: kpis.activeAlertsCount, isAlert: true },
    { id: 'ai-settings', label: 'AI Adaptive Engine', icon: SlidersHorizontal },
  ];

  // RBAC Permission Filter: strictly show only permitted tabs for the authenticated role
  const permittedNavItems = allNavItems.filter(item => {
    if (!user) return true;
    return canAccessTab(item.id);
  });

  return (
    <aside className="w-64 shrink-0 bg-[#0F172A] border-r border-slate-800 flex flex-col justify-between p-4 min-h-[calc(100vh-65px)]">
      {/* Navigation Links */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
              Role Navigation
            </p>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {user?.roleLabel || 'RBAC Filter'}
            </span>
          </div>

          <nav className="space-y-1">
            {permittedNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-500/20 to-blue-500/10 text-sky-300 border border-sky-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                    <span className="whitespace-nowrap truncate">{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                        item.isAlert && item.count > 0
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40 font-bold'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Real-time Infrastructure Health Snapshot Card */}
        <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Grid Fleet Health</span>
            </span>
            <span className="text-emerald-400 font-semibold font-mono">92.4% Optimal</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-sky-400 h-1.5 rounded-full w-[92.4%]" />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 pt-0.5 font-mono">
            <span>Online: {kpis.activePoles + kpis.dimmedPoles}</span>
            <span className="text-red-400">Needs Service: {kpis.faultyPoles}</span>
          </div>
        </div>
      </div>

      {/* Enterprise Authority Footer */}
      <div className="pt-3">
        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center space-x-1.5 text-slate-300 font-semibold">
            <Shield className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>Urban Infrastructure Directorate</span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono">
            Municipal Operations • System v2.6
          </p>
        </div>
      </div>
    </aside>
  );
}
