import React, { useState } from 'react';
import { useLighting } from '../context/LightingContext';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  ShieldCheck,
  UserCheck,
  Package,
  Calendar,
  X,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function Maintenance() {
  const {
    maintenanceOrders,
    updateWorkOrderStatus,
    createWorkOrder,
    poles,
  } = useLighting();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderForNotes, setSelectedOrderForNotes] = useState(null);
  const [completionNotes, setCompletionNotes] = useState('');

  // Form State for Dispatching New Work Order
  const [newOrder, setNewOrder] = useState({
    poleCode: poles[0]?.poleCode || 'SL-METRO-001',
    zone: poles[0]?.zone || 'Gateway Corridor',
    locationName: poles[0]?.locationName || 'Metropolitan Ingress',
    category: 'LED Driver Replacement',
    priority: 'HIGH',
    assignedTechnician: 'Field Operations — Rapid Response Unit',
    partsRequired: '150W Constant-Current LED Driver (IP67)',
    slaDeadline: 'Within 24 Hours',
    estimatedHours: 2.0,
    description: '',
  });

  // Filtered Orders
  const filteredOrders = maintenanceOrders.filter(order => {
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || order.priority === priorityFilter;
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      order.workOrderId.toLowerCase().includes(query) ||
      order.poleCode.toLowerCase().includes(query) ||
      order.locationName.toLowerCase().includes(query) ||
      order.category.toLowerCase().includes(query) ||
      order.assignedTechnician.toLowerCase().includes(query);

    return matchesStatus && matchesPriority && matchesQuery;
  });

  // KPI Calculations
  const totalOrders = maintenanceOrders.length;
  const openOrders = maintenanceOrders.filter(o => o.status !== 'COMPLETED').length;
  const criticalOrders = maintenanceOrders.filter(o => o.priority === 'CRITICAL' && o.status !== 'COMPLETED').length;
  const inProgressOrders = maintenanceOrders.filter(o => o.status === 'IN_PROGRESS' || o.status === 'DISPATCHED').length;
  const completedOrders = maintenanceOrders.filter(o => o.status === 'COMPLETED').length;

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const targetPole = poles.find(p => p.poleCode === newOrder.poleCode);
    createWorkOrder({
      ...newOrder,
      zone: targetPole ? targetPole.zone : newOrder.zone,
      locationName: targetPole ? targetPole.locationName : newOrder.locationName,
      description: newOrder.description || `Scheduled ${newOrder.category} for fixture ${newOrder.poleCode}.`,
    });
    setIsModalOpen(false);
    setNewOrder({
      poleCode: poles[0]?.poleCode || 'SL-METRO-001',
      zone: poles[0]?.zone || 'Gateway Corridor',
      locationName: poles[0]?.locationName || 'Metropolitan Ingress',
      category: 'LED Driver Replacement',
      priority: 'HIGH',
      assignedTechnician: 'Field Operations — Rapid Response Unit',
      partsRequired: '150W Constant-Current LED Driver (IP67)',
      slaDeadline: 'Within 24 Hours',
      estimatedHours: 2.0,
      description: '',
    });
  };

  const handleCompleteOrder = (orderId) => {
    updateWorkOrderStatus(orderId, 'COMPLETED', completionNotes || 'Field maintenance completed by service team.');
    setSelectedOrderForNotes(null);
    setCompletionNotes('');
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Title & Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl glass-panel">
        <div>
          <div className="flex items-center space-x-2 text-sky-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Wrench className="w-3.5 h-3.5 shrink-0" />
            <span>Infrastructure Maintenance & Field Logistics</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Municipal Work-Order Management Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            SLA-driven work orders, technician dispatches, and replacement components tracking for all street lighting assets.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-sky-500/20 transition-all self-start md:self-center shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Dispatch Work Order</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Open Work Orders */}
        <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-slate-750 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pending Work Orders</span>
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-white">{openOrders}</span>
            <span className="text-xs text-slate-400">/ {totalOrders} total</span>
          </div>
          <div className="text-[11px] text-sky-400/90 flex items-center space-x-1 font-mono">
            <span>Active maintenance queue</span>
          </div>
        </div>

        {/* Critical SLA Orders */}
        <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-slate-750 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Critical Priority Orders</span>
            <span className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-red-400">{criticalOrders}</span>
            <span className="text-xs text-slate-400">requiring immediate fix</span>
          </div>
          <div className="text-[11px] text-red-400/90 font-mono">
            <span>&lt; 12-Hour SLA turnaround</span>
          </div>
        </div>

        {/* In-Progress Dispatches */}
        <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-slate-750 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Dispatched Field Units</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <UserCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-amber-400">{inProgressOrders}</span>
            <span className="text-xs text-slate-400">technicians on site</span>
          </div>
          <div className="text-[11px] text-amber-400/90 font-mono">
            <span>Active field servicing</span>
          </div>
        </div>

        {/* SLA Resolution Rate / MTTR */}
        <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-slate-750 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Avg MTTR Performance</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">2.4 hrs</span>
            <span className="text-xs text-slate-400">avg repair time</span>
          </div>
          <div className="text-[11px] text-emerald-400/90 font-mono flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>98.6% SLA Compliance</span>
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
            placeholder="Search work order ID, pole code, technician, or part..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700/80 text-xs">
            {['ALL', 'DISPATCHED', 'IN_PROGRESS', 'SCHEDULED', 'COMPLETED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors ${
                  statusFilter === status
                    ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {status === 'ALL' ? 'All' : status.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Priority Select */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 text-xs text-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-sky-500 font-mono"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Work Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-8 rounded-2xl glass-panel text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-medium text-slate-300">No work orders match the selected filters.</p>
            <p className="text-xs text-slate-500">All municipal street lighting circuits operating within standard parameters.</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const isCompleted = order.status === 'COMPLETED';
            const isCritical = order.priority === 'CRITICAL';
            const isHigh = order.priority === 'HIGH';

            return (
              <div
                key={order.workOrderId}
                className={`p-5 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-slate-900/40 border-slate-800 opacity-80'
                    : isCritical
                    ? 'bg-slate-900/90 border-red-500/40 shadow-lg shadow-red-950/20'
                    : 'bg-slate-900/80 border-slate-750 hover:border-slate-650'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left Column: Core Work Order Meta */}
                  <div className="space-y-2.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-sky-400 text-xs bg-sky-950/40 border border-sky-800/60 px-2.5 py-0.5 rounded-lg">
                        {order.workOrderId}
                      </span>
                      <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700">
                        {order.poleCode}
                      </span>
                      <span className="text-xs text-slate-400 truncate max-w-xs font-medium">
                        {order.locationName}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {order.zone}
                      </span>
                    </div>

                    {/* Category & Description */}
                    <div>
                      <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                        <span>{order.category}</span>
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {order.description}
                      </p>
                    </div>

                    {/* Operational Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs pt-1">
                      <div className="flex items-center space-x-2 text-slate-400 font-mono">
                        <UserCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="truncate">Tech: {order.assignedTechnician}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-400 font-mono">
                        <Package className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">Parts: {order.partsRequired || 'Standard Toolkit'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-400 font-mono">
                        <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>SLA: {order.slaDeadline}</span>
                      </div>
                    </div>

                    {/* Completion Notes if already closed */}
                    {order.completionNotes && (
                      <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300 flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">Resolution Notes: </span>
                          <span>{order.completionNotes}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Status Badges & Action Controls */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Priority Badge */}
                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full ${
                          isCritical
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : isHigh
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {order.priority} PRIORITY
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : order.status === 'IN_PROGRESS'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    {!isCompleted ? (
                      <div className="flex items-center space-x-2">
                        {order.status === 'SCHEDULED' && (
                          <button
                            onClick={() => updateWorkOrderStatus(order.workOrderId, 'DISPATCHED')}
                            className="px-3 py-1.5 rounded-xl bg-sky-600/30 hover:bg-sky-600/50 text-sky-300 border border-sky-500/40 text-xs font-semibold font-mono transition-colors"
                          >
                            Dispatch Unit
                          </button>
                        )}
                        {order.status === 'DISPATCHED' && (
                          <button
                            onClick={() => updateWorkOrderStatus(order.workOrderId, 'IN_PROGRESS')}
                            className="px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 text-xs font-semibold font-mono transition-colors"
                          >
                            Mark On-Site
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedOrderForNotes(order)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold font-mono flex items-center space-x-1.5 transition-colors shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Close Order</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 font-mono">
                        Closed on schedule
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Dispatch New Work Order */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">Dispatch Municipal Work Order</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                {/* Target Pole Selection */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Asset (Pole)</label>
                  <select
                    value={newOrder.poleCode}
                    onChange={(e) => {
                      const selected = poles.find(p => p.poleCode === e.target.value);
                      setNewOrder({
                        ...newOrder,
                        poleCode: e.target.value,
                        zone: selected?.zone || newOrder.zone,
                        locationName: selected?.locationName || newOrder.locationName,
                      });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                  >
                    {poles.map(p => (
                      <option key={p.id} value={p.poleCode}>
                        {p.poleCode} ({p.zone})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority Selection */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Priority Level</label>
                  <select
                    value={newOrder.priority}
                    onChange={(e) => setNewOrder({ ...newOrder, priority: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                  >
                    <option value="CRITICAL">CRITICAL (&lt;12 hrs)</option>
                    <option value="HIGH">HIGH (&lt;24 hrs)</option>
                    <option value="MEDIUM">MEDIUM (&lt;48 hrs)</option>
                    <option value="LOW">LOW (Routine)</option>
                  </select>
                </div>
              </div>

              {/* Maintenance Category */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Maintenance Category</label>
                <select
                  value={newOrder.category}
                  onChange={(e) => setNewOrder({ ...newOrder, category: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="LED Driver Replacement">LED Driver Replacement</option>
                  <option value="Luminaire Module Swap">Luminaire Module Swap</option>
                  <option value="Gateway Telemetry Check">Gateway Telemetry Check</option>
                  <option value="Heatsink & Thermal Servicing">Heatsink & Thermal Servicing</option>
                  <option value="Radar Sensor Calibration">Radar Sensor Calibration</option>
                  <option value="Photocell Optical Cleaning">Photocell Optical Cleaning</option>
                </select>
              </div>

              {/* Assigned Technician */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Assigned Dispatch Unit</label>
                <input
                  type="text"
                  value={newOrder.assignedTechnician}
                  onChange={(e) => setNewOrder({ ...newOrder, assignedTechnician: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  placeholder="e.g., Field Operations — Unit 4"
                  required
                />
              </div>

              {/* Parts Required */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Required Components / Kit</label>
                <input
                  type="text"
                  value={newOrder.partsRequired}
                  onChange={(e) => setNewOrder({ ...newOrder, partsRequired: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  placeholder="e.g., 150W Constant-Current LED Driver (IP67)"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Work Description & Instructions</label>
                <textarea
                  rows={3}
                  value={newOrder.description}
                  onChange={(e) => setNewOrder({ ...newOrder, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-sky-500"
                  placeholder="Detail the physical inspection and replacement procedure..."
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-md hover:from-sky-400 hover:to-blue-500 transition-all"
                >
                  Create & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Close Order Notes */}
      {selectedOrderForNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Complete Work Order</h3>
              </div>
              <button
                onClick={() => setSelectedOrderForNotes(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Provide technician resolution notes for work order{' '}
              <span className="font-mono font-bold text-sky-400">{selectedOrderForNotes.workOrderId}</span> (
              {selectedOrderForNotes.poleCode}).
            </p>

            <textarea
              rows={3}
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="e.g., Driver replaced; current draw stabilized at 0.65A under 100% illumination test."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
            />

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrderForNotes(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleCompleteOrder(selectedOrderForNotes.workOrderId)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                Confirm Completion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
