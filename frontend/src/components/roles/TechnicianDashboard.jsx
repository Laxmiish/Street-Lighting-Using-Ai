import React, { useState } from 'react';
import { useLighting } from '../../context/LightingContext';
import {
  HardHat,
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Package,
  MapPin,
  Truck,
  ShieldCheck,
  Check,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function TechnicianDashboard() {
  const {
    maintenanceOrders,
    updateWorkOrderStatus,
    alerts,
    resolveAlert,
    setActiveTab,
  } = useLighting();

  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'SCHEDULED' | 'COMPLETED'
  const [completedNotification, setCompletedNotification] = useState(null);

  // Field jobs derived from maintenance orders
  const openJobs = maintenanceOrders.filter(o => o.status !== 'COMPLETED');
  const completedJobs = maintenanceOrders.filter(o => o.status === 'COMPLETED');

  const filteredJobs = maintenanceOrders.filter(order => {
    if (activeFilter === 'CRITICAL') return order.priority === 'CRITICAL' && order.status !== 'COMPLETED';
    if (activeFilter === 'SCHEDULED') return order.status === 'SCHEDULED';
    if (activeFilter === 'COMPLETED') return order.status === 'COMPLETED';
    return true; // 'ALL'
  });

  const handleMarkRepaired = (job) => {
    // 1. Mark maintenance order as completed
    updateWorkOrderStatus(job.workOrderId, 'COMPLETED', 'Hardware replaced and restored in field by technician.');

    // 2. Also resolve any corresponding alert for this pole
    const matchingAlert = alerts.find(a => a.poleCode === job.poleCode && !a.resolved);
    if (matchingAlert) {
      resolveAlert(matchingAlert.id, 'Repaired and restored by field service crew');
    }

    setCompletedNotification(`Task completed! ${job.poleCode} marked repaired and restored to service.`);
    setTimeout(() => {
      setCompletedNotification(null);
    }, 5000);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* 1. Field Service Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider font-mono">
                Field Maintenance Crew
              </span>
              <span className="text-xs text-slate-400">Unit 4 • Rapid Response</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <HardHat className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Today's Street Light Repair Tasks</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Clear repair checklist with required spare parts. Tap "Mark Repaired" once physical fix is done.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('maintenance')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white font-medium border border-slate-700 transition-colors shadow-sm"
            >
              Full Maintenance Register &rarr;
            </button>
          </div>
        </div>

        {/* Status Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <p className="text-xs text-slate-400 font-mono uppercase">Assigned Tasks</p>
            <p className="text-2xl font-bold font-mono text-white mt-0.5">{openJobs.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 text-center">
            <p className="text-xs text-red-300 font-mono uppercase">Urgent Fixes</p>
            <p className="text-2xl font-bold font-mono text-red-400 mt-0.5">
              {openJobs.filter(j => j.priority === 'CRITICAL' || j.priority === 'HIGH').length}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-center">
            <p className="text-xs text-amber-300 font-mono uppercase">Pending Parts</p>
            <p className="text-2xl font-bold font-mono text-amber-400 mt-0.5">
              {openJobs.filter(j => j.status === 'SCHEDULED').length}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center">
            <p className="text-xs text-emerald-300 font-mono uppercase">Fixed Today</p>
            <p className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">{completedJobs.length}</p>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {completedNotification && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{completedNotification}</span>
        </div>
      )}

      {/* 2. Job Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeFilter === 'ALL'
              ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All Tasks ({maintenanceOrders.length})
        </button>
        <button
          onClick={() => setActiveFilter('CRITICAL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeFilter === 'CRITICAL'
              ? 'bg-red-500 text-white shadow-md font-bold'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Urgent Lights Down ({openJobs.filter(j => j.priority === 'CRITICAL' || j.priority === 'HIGH').length})
        </button>
        <button
          onClick={() => setActiveFilter('SCHEDULED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeFilter === 'SCHEDULED'
              ? 'bg-sky-500 text-white shadow-md font-bold'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Scheduled ({openJobs.filter(j => j.status === 'SCHEDULED').length})
        </button>
        <button
          onClick={() => setActiveFilter('COMPLETED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeFilter === 'COMPLETED'
              ? 'bg-emerald-500 text-white shadow-md font-bold'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Completed ({completedJobs.length})
        </button>
      </div>

      {/* 3. Non-Technical Job Cards */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="p-8 rounded-2xl glass-panel text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-white">No tasks matching this filter</p>
            <p className="text-xs text-slate-400">All assigned jobs are up to date.</p>
          </div>
        ) : (
          filteredJobs.map(job => {
            const isCompleted = job.status === 'COMPLETED';
            const isUrgent = job.priority === 'CRITICAL' || job.priority === 'HIGH';

            return (
              <div
                key={job.workOrderId}
                className={`p-5 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-slate-900/40 border-slate-800 opacity-80'
                    : isUrgent
                    ? 'bg-slate-900/90 border-red-500/40 shadow-lg'
                    : 'bg-slate-900/80 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2.5 flex-1 min-w-0">
                    {/* Header line */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-slate-800 text-white border border-slate-700">
                        {job.poleCode}
                      </span>
                      <span className="text-sm font-bold text-white">
                        {job.category}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : isUrgent
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {isCompleted ? 'REPAIRED' : isUrgent ? 'URGENT' : 'SCHEDULED'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono ml-auto sm:ml-0">
                        Task: {job.workOrderId}
                      </span>
                    </div>

                    {/* Simple plain-English problem & location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center space-x-2 text-slate-300">
                        <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                        <span className="truncate">{job.locationName || job.zone}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-amber-300 font-medium">
                        <Package className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="truncate">Part to bring: {job.partsRequired || 'Standard Fixture Repair Kit'}</span>
                      </div>
                    </div>

                    {/* Deadline and assigned crew */}
                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-mono pt-1">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Deadline: {job.slaDeadline || 'Today'}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Wrench className="w-3.5 h-3.5 text-slate-500" />
                        <span>Assigned: {job.assignedTechnician}</span>
                      </span>
                    </div>

                    {job.completionNotes && (
                      <p className="text-xs text-emerald-300 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 font-mono flex items-center space-x-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{job.completionNotes}</span>
                      </p>
                    )}
                  </div>

                  {/* Big Tap-to-Complete Button */}
                  <div className="shrink-0 flex items-center space-x-3 self-end lg:self-center">
                    {!isCompleted ? (
                      <button
                        onClick={() => handleMarkRepaired(job)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg transition-transform active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        <span>Mark as Repaired</span>
                      </button>
                    ) : (
                      <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Inspected & Restored</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Field Truck Inventory Quick Checklist */}
      <div className="p-5 rounded-2xl glass-panel space-y-3">
        <h3 className="text-xs font-bold text-slate-300 flex items-center space-x-2 uppercase tracking-wider font-mono">
          <Truck className="w-4 h-4 text-sky-400" />
          <span>Rapid Response Truck Checklist (Recommended Spares)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-2 text-slate-300">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>150W Constant-Current LED Driver (3 Loaded)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-2 text-slate-300">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Optical Luminaire Diode Arrays (2 Loaded)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-2 text-slate-300">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>4G Gateway Antenna Modules (2 Loaded)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-2 text-slate-300">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>High-Altitude Bucket Harness (Inspected)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
