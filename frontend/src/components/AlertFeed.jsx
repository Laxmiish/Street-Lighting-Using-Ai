import React from 'react';
import { useLighting } from '../context/LightingContext';
import { AlertTriangle, AlertCircle, CheckCircle2, Clock, Wrench } from 'lucide-react';

/**
 * Translates technical alerts into plain, non-technical everyday language
 * Prevents overwhelming users with electrical or circuit failure explanations
 */
function getSimpleAlertInfo(alert) {
  const cat = (alert.faultCategory || alert.faultType || '').toLowerCase();

  if (cat.includes('power') || cat.includes('no_power') || cat.includes('grid')) {
    return {
      title: 'Light Not Powering On',
      statusText: 'Service crew dispatched to check power supply',
      badge: 'No Power',
    };
  }
  if (cat.includes('optical') || cat.includes('bulb') || cat.includes('burnout')) {
    return {
      title: 'Light Fixture is Dark',
      statusText: 'Replacement light panel scheduled for installation',
      badge: 'Dark Fixture',
    };
  }
  if (cat.includes('communication') || cat.includes('timeout') || cat.includes('signal')) {
    return {
      title: 'Signal Check in Progress',
      statusText: 'Reconnecting to municipal lighting controller',
      badge: 'Signal Check',
    };
  }
  if (cat.includes('thermal') || cat.includes('heat') || cat.includes('temperature')) {
    return {
      title: 'Self-Cooling Protection',
      statusText: 'Light dimmed automatically to prevent overheating',
      badge: 'Cooling Mode',
    };
  }
  return {
    title: alert.title || 'Service Inspection Needed',
    statusText: 'Assigned to municipal field maintenance crew',
    badge: 'Inspection',
  };
}

export default function AlertFeed() {
  const { alerts, resolveAlert, setActiveTab } = useLighting();

  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  const resolvedAlerts = alerts.filter(a => a.resolved);

  return (
    <div className="p-5 sm:p-6 rounded-2xl glass-panel space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Active Maintenance Notices</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Clear, non-technical overview of street lights requiring attention
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('maintenance')}
            className="text-xs text-sky-400 hover:text-sky-300 font-mono flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 transition-colors"
          >
            <span>Maintenance Hub &rarr;</span>
          </button>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 whitespace-nowrap">
            {unresolvedAlerts.length} Active
          </span>
        </div>
      </div>

      {/* Active Notices */}
      <div className="space-y-3">
        {unresolvedAlerts.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>All street lighting fixtures operating normally. Zero outstanding issues.</span>
          </div>
        ) : (
          unresolvedAlerts.map(alert => {
            const isCritical = alert.severity === 'CRITICAL';
            const simple = getSimpleAlertInfo(alert);

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCritical
                    ? 'bg-red-950/20 border-red-500/30 hover:border-red-400'
                    : 'bg-amber-950/20 border-amber-500/30 hover:border-amber-400'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${isCritical ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {simple.title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {alert.poleCode}
                        </span>
                        <span
                          className={`px-2 py-0.2 rounded text-[10px] font-semibold ${
                            isCritical ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {simple.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        {simple.statusText} • <span className="text-slate-400">{alert.locationName || alert.zone}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>Reported: {alert.timestamp}</span>
                        </span>
                        <span className="flex items-center space-x-1 text-slate-300">
                          <Wrench className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>Assigned: {alert.assignedTo || 'Rapid Response'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Single Action Button */}
                  <div className="shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => resolveAlert(alert.id, 'Issue resolved in field')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center space-x-1.5 shadow-sm transition-colors whitespace-nowrap"
                      title="Mark as Resolved"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Recently Resolved History */}
      {resolvedAlerts.length > 0 && (
        <div className="pt-2 border-t border-slate-800 space-y-1.5">
          <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Recently Fixed Lights
          </h3>
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {resolvedAlerts.slice(0, 3).map(alert => (
              <div
                key={alert.id}
                className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-2 text-xs text-slate-300"
              >
                <div className="flex items-center space-x-2 truncate">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-bold text-slate-200">{alert.poleCode}</span>
                  <span className="truncate text-slate-400">{alert.locationName || alert.zone}</span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                  Fixed
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
