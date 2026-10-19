import React, { useState } from 'react';
import { useLighting } from '../context/LightingContext';
import {
  FileText,
  Download,
  Search,
  Filter,
  ShieldCheck,
  Cpu,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Zap,
  Wrench,
  Sliders,
  ExternalLink,
  X,
  Layers,
} from 'lucide-react';

export default function Records() {
  const { systemRecords } = useLighting();

  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Filtered Records
  const filteredRecords = systemRecords.filter(record => {
    const matchesSector = sectorFilter === 'ALL' || record.sector === sectorFilter;
    const matchesType = eventTypeFilter === 'ALL' || record.eventType === eventTypeFilter;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      record.recordId.toLowerCase().includes(q) ||
      record.summary.toLowerCase().includes(q) ||
      record.sector.toLowerCase().includes(q) ||
      record.loggedBy.toLowerCase().includes(q) ||
      record.metric.toLowerCase().includes(q);

    return matchesSector && matchesType && matchesQuery;
  });

  // Unique Sectors and Event Types for dropdowns
  const sectors = ['ALL', ...Array.from(new Set(systemRecords.map(r => r.sector)))];
  const eventTypes = ['ALL', ...Array.from(new Set(systemRecords.map(r => r.eventType)))];

  // CSV Export Handler
  const exportToCsv = () => {
    const headers = ['Record ID', 'Timestamp', 'Sector', 'Event Type', 'Operational Summary', 'Metric / Impact', 'Compliance Rating', 'Logged By'];
    const rows = filteredRecords.map(r => [
      `"${r.recordId}"`,
      `"${r.timestamp}"`,
      `"${r.sector}"`,
      `"${r.eventType}"`,
      `"${r.summary.replace(/"/g, '""')}"`,
      `"${r.metric}"`,
      `"${r.compliance}"`,
      `"${r.loggedBy}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LuminaAI_Municipal_Audit_Register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for Event Type Badges & Icons
  const getEventBadge = (type) => {
    switch (type) {
      case 'AI Dynamic Shift':
        return {
          icon: Cpu,
          className: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        };
      case 'Automated Fault Flag':
      case 'Driver Failure Alert':
        return {
          icon: AlertCircle,
          className: 'bg-red-500/20 text-red-300 border-red-500/30',
        };
      case 'Daylight Transition':
        return {
          icon: Sun,
          className: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        };
      case 'Quiet Hours Dimming':
      case 'Dusk Activation':
        return {
          icon: Moon,
          className: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        };
      case 'Maintenance Status Update':
      case 'Work Order Dispatched':
        return {
          icon: Wrench,
          className: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
        };
      default:
        return {
          icon: Zap,
          className: 'bg-slate-700/60 text-slate-300 border-slate-600',
        };
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl glass-panel">
        <div>
          <div className="flex items-center space-x-2 text-sky-400 font-mono text-xs uppercase tracking-wider mb-1">
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>Audit & Compliance Trail</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            System Audit Register & Historical Telemetry Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Immutable chronological record of energy events, automated AI dimming shifts, sensor calibrations, and incident audits.
          </p>
        </div>

        <button
          onClick={exportToCsv}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-2 border border-slate-700 shadow-sm transition-all self-start md:self-center shrink-0"
        >
          <Download className="w-4 h-4 text-sky-400" />
          <span>Export Audit Register (.CSV)</span>
        </button>
      </div>

      {/* Audit KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-slate-750 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Logged Events in Ledger</span>
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-white">{systemRecords.length}</span>
            <span className="text-xs text-slate-400">events registered</span>
          </div>
          <div className="text-[11px] text-sky-400/90 font-mono">
            <span>Continuous edge telemetry sync</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-slate-750 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Statutory Retention</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">7 Years</span>
            <span className="text-xs text-slate-400">immutable archive</span>
          </div>
          <div className="text-[11px] text-emerald-400/90 font-mono">
            <span>TimescaleDB Partitioned</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-slate-750 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Autonomous Grid Control</span>
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Cpu className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-purple-400">99.8%</span>
            <span className="text-xs text-slate-400">AI closed-loop</span>
          </div>
          <div className="text-[11px] text-purple-400/90 font-mono">
            <span>Automated dynamic dimming</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-slate-750 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Audit Standards Met</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-amber-400">100%</span>
            <span className="text-xs text-slate-400">compliance</span>
          </div>
          <div className="text-[11px] text-amber-400/90 font-mono">
            <span>IRC:SP:72 & SDG 7 Compliant</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-750 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search record ID, sector, event summary, or subsystem..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sector Filter */}
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 text-xs text-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-sky-500 font-mono"
          >
            {sectors.map(s => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All Municipal Sectors' : s}
              </option>
            ))}
          </select>

          {/* Event Type Filter */}
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 text-xs text-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-sky-500 font-mono"
          >
            {eventTypes.map(t => (
              <option key={t} value={t}>
                {t === 'ALL' ? 'All Event Classifications' : t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-750 bg-slate-900/60 shadow-inner">
        <table className="w-full text-left border-collapse text-xs min-w-[900px]">
          <thead>
            <tr className="bg-slate-800/90 text-slate-400 border-b border-slate-700 uppercase font-mono text-[10px] tracking-wider">
              <th className="py-3.5 px-4 whitespace-nowrap">Record ID</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Timestamp</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Sector / Precinct</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Event Classification</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Operational Summary</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Metric / Impact</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Compliance Status</th>
              <th className="py-3.5 px-4 whitespace-nowrap text-right">Inspection</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No audit records match the selected filter criteria.
                </td>
              </tr>
            ) : (
              filteredRecords.map(record => {
                const badge = getEventBadge(record.eventType);
                const BadgeIcon = badge.icon;

                return (
                  <tr key={record.recordId} className="hover:bg-slate-800/40 transition-colors">
                    {/* Record ID */}
                    <td className="py-3 px-4 font-mono font-bold text-sky-400 whitespace-nowrap">
                      {record.recordId}
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{record.timestamp}</span>
                      </div>
                    </td>

                    {/* Sector */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 font-medium border border-slate-700">
                        {record.sector}
                      </span>
                    </td>

                    {/* Event Type Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${badge.className}`}
                      >
                        <BadgeIcon className="w-3 h-3 shrink-0" />
                        <span>{record.eventType}</span>
                      </span>
                    </td>

                    {/* Operational Summary */}
                    <td className="py-3 px-4 text-slate-300 max-w-sm truncate" title={record.summary}>
                      {record.summary}
                    </td>

                    {/* Metric */}
                    <td className="py-3 px-4 font-mono text-slate-200 whitespace-nowrap">
                      {record.metric}
                    </td>

                    {/* Compliance */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span>{record.compliance}</span>
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white border border-slate-700 font-mono text-[11px] transition-colors inline-flex items-center space-x-1"
                        title="View complete audit record details"
                      >
                        <span>Inspect</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Detailed Record Inspection Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">Audit Record Dossier</h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">RECORD IDENTIFIER</span>
                  <span className="font-bold text-sky-400 text-sm">{selectedRecord.recordId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">TIMESTAMP</span>
                  <span className="text-slate-300">{selectedRecord.timestamp}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">SECTOR / ZONE</span>
                  <span className="text-slate-300">{selectedRecord.sector}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">CLASSIFICATION</span>
                  <span className="text-white font-semibold">{selectedRecord.eventType}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-semibold mb-1">
                  OPERATIONAL SUMMARY
                </span>
                <p className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-200 leading-relaxed">
                  {selectedRecord.summary}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px] font-semibold mb-1">
                    TELEMETRIC IMPACT
                  </span>
                  <span className="font-mono text-slate-200 font-bold">{selectedRecord.metric}</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px] font-semibold mb-1">
                    COMPLIANCE STANDARD
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">{selectedRecord.compliance}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-400">
                <span className="block text-[11px] font-semibold text-slate-400 mb-1">
                  LOGGED BY SUBSYSTEM
                </span>
                <span className="font-mono text-sky-300">{selectedRecord.loggedBy}</span>
                <div className="text-[10px] text-slate-500 mt-1">
                  SHA-256 Audit Seal: Recorded in PostgreSQL TimescaleDB Hypertable
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-700/80">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
