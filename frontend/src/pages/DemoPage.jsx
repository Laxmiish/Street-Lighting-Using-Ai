import React, { useState } from 'react';
import { useLighting } from '../context/LightingContext';
import api from '../services/api';
import {
  FlaskConical,
  Database,
  Radio,
  Zap,
  AlertTriangle,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Activity,
  Play,
  Flame,
  CloudRain,
  Sun,
  Moon,
} from 'lucide-react';

export default function DemoPage() {
  const { refreshFromBackend, zones, poles } = useLighting();

  const [loadingAction, setLoadingAction] = useState('');
  const [feedback, setFeedback] = useState({ message: '', type: 'info' });

  // Custom sensor injection state
  const [customTelemetry, setCustomTelemetry] = useState({
    poleId: 'pole-lko-01',
    zoneId: 'Zone 1: Hazratganj',
    miniClusterId: 'MC-HZG-01',
    lux: 5.0,
    motion: true,
    powerW: 145.0,
    currentA: 0.65,
    tempC: 32.0,
  });

  const showNotification = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback({ message: '', type: 'info' });
    }, 6000);
  };

  // 1. Database Seeding & Reset
  const handleSeedDatabase = async () => {
    setLoadingAction('seed');
    try {
      const res = await api.seedDatabase();
      if (res && res.success) {
        if (refreshFromBackend) await refreshFromBackend();
        showNotification('Database successfully populated with clean municipal baseline assets and telemetry!', 'success');
      } else {
        showNotification('Database re-seed requested. Ensure PostgreSQL backend is running.', 'info');
      }
    } catch (err) {
      showNotification(`Seeding error: ${err.message}`, 'error');
    } finally {
      setLoadingAction('');
    }
  };

  // 2. Synthetic Fault Injection
  const handleInjectFault = async (poleId, faultType, label) => {
    setLoadingAction(`fault-${faultType}`);
    try {
      const res = await api.injectFault(poleId, faultType);
      if (refreshFromBackend) await refreshFromBackend();
      showNotification(`Injected '${label}' on ${poleId}. Check Incident Management / Maintenance tab to inspect status.`, 'warning');
    } catch (err) {
      showNotification(`Fault injection error: ${err.message}`, 'error');
    } finally {
      setLoadingAction('');
    }
  };

  // 3. Traffic Simulation
  const handleSimulateTraffic = async (zone, density) => {
    setLoadingAction(`traffic-${density}`);
    try {
      await api.simulateTraffic(zone, density);
      if (refreshFromBackend) await refreshFromBackend();
      showNotification(`Simulated ${density} traffic on ${zone}. Adaptive lighting adjusted!`, 'success');
    } catch (err) {
      showNotification(`Traffic simulation error: ${err.message}`, 'error');
    } finally {
      setLoadingAction('');
    }
  };

  // 4. Edge Telemetry Packet Ingestion
  const handleIngestCustomTelemetry = async (e) => {
    e.preventDefault();
    setLoadingAction('ingest');
    try {
      const data = await api.ingestTelemetry({
        zone_id: customTelemetry.zoneId,
        mini_cluster_id: customTelemetry.miniClusterId,
        pole_id: customTelemetry.poleId,
        sensors: {
          lux: parseFloat(customTelemetry.lux),
          motion: customTelemetry.motion,
          power_w: parseFloat(customTelemetry.powerW),
          current_a: parseFloat(customTelemetry.currentA),
        },
      });
      const calculatedBrightness = data?.control?.commandedBrightness ?? data?.commanded_brightness_pct ?? 80;
      if (refreshFromBackend) await refreshFromBackend();
      showNotification(`Telemetry packet ingested: AI calculated ${calculatedBrightness}% brightness!`, 'success');
    } catch (err) {
      showNotification(`Ingestion failed: ${err.message}`, 'error');
    } finally {
      setLoadingAction('');
    }
  };



  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider font-mono">
              Isolated Testbed
            </span>
            <span className="text-xs text-slate-400">Engineering Simulation Environment</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1 flex items-center gap-2.5">
            <FlaskConical className="w-5 h-5 text-indigo-400" />
            <span>Simulation & Synthetic Telemetry Lab</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Dedicated test bench for synthetic sensor telemetry, fault injection, edge telemetry ingestion, and database re-population.
          </p>
        </div>

        <button
          onClick={handleSeedDatabase}
          disabled={loadingAction === 'seed'}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg transition-all shrink-0"
        >
          <Database className="w-4 h-4" />
          <span>{loadingAction === 'seed' ? 'Populating Database...' : 'Populate / Reset Database'}</span>
        </button>
      </div>

      {/* Feedback Toast */}
      {feedback.message && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center space-x-2.5 animate-fadeIn ${
            feedback.type === 'error'
              ? 'bg-red-950/30 border-red-500/30 text-red-300'
              : feedback.type === 'warning'
              ? 'bg-amber-950/30 border-amber-500/30 text-amber-300'
              : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Fault Injection Studio */}
        <div className="lg:col-span-6 space-y-6">
          {/* Fault Injection Studio */}
          <div className="p-5 rounded-2xl glass-panel space-y-4">
            <h2 className="text-xs font-bold text-slate-300 flex items-center space-x-2 uppercase tracking-wider font-mono">
              <Zap className="w-4 h-4 text-red-400" />
              <span>Hardware Anomaly & Fault Injection Studio</span>
            </h2>
            <p className="text-xs text-slate-400">
              Inject hardware anomalies into the backend anomaly service to test fault classification:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleInjectFault('pole-lko-06', 'NO_POWER', 'LED Driver Failure')}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-red-500/40 text-left transition-all space-y-1"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>Driver Outage</span>
                  <span className="text-[10px] font-mono text-red-400">LKO-GMN-002</span>
                </div>
                <p className="text-[11px] text-slate-400">Amar Shaheed Path: Zero current draw despite commanded load</p>
              </button>

              <button
                onClick={() => handleInjectFault('pole-lko-11', 'BULB_BURNOUT', 'Burned Diode Array')}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-red-500/40 text-left transition-all space-y-1"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>Dark Diode Array</span>
                  <span className="text-[10px] font-mono text-red-400">LKO-ALM-001</span>
                </div>
                <p className="text-[11px] text-slate-400">Alambagh Metro: Normal wattage consumed but zero lumens</p>
              </button>

              <button
                onClick={() => handleInjectFault('pole-lko-01', 'HIGH_TEMPERATURE', 'Thermal Throttling')}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 text-left transition-all space-y-1"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>Thermal Throttling</span>
                  <span className="text-[10px] font-mono text-amber-400">LKO-HZG-001</span>
                </div>
                <p className="text-[11px] text-slate-400">Hazratganj Atal Chowk: Temp exceeds 82°C threshold</p>
              </button>

              <button
                onClick={() => handleInjectFault('pole-lko-15', 'COMM_TIMEOUT', 'Gateway Drop')}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 text-left transition-all space-y-1"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>Gateway Drop</span>
                  <span className="text-[10px] font-mono text-amber-400">LKO-CWK-001</span>
                </div>
                <p className="text-[11px] text-slate-400">Chowk Rumi Darwaza: Cellular gateway signal loss</p>
              </button>
            </div>
          </div>

          {/* Traffic Density Surge */}
          <div className="p-5 rounded-2xl glass-panel space-y-4">
            <h2 className="text-xs font-bold text-slate-300 flex items-center space-x-2 uppercase tracking-wider font-mono">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Traffic & Vehicular Surge Simulator</span>
            </h2>
            <p className="text-xs text-slate-400">
              Simulate traffic flow across Lucknow corridors to test AI closed-loop brightness response:
            </p>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => handleSimulateTraffic('Zone 4: Gomti Nagar', 'HIGH')}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/40 text-center transition-all"
              >
                <p className="text-xs font-bold text-sky-400">Shaheed Path Rush</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Surge to 95%</p>
              </button>

              <button
                onClick={() => handleSimulateTraffic('Zone 1: Hazratganj', 'MEDIUM')}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/40 text-center transition-all"
              >
                <p className="text-xs font-bold text-slate-300">Hazratganj Flow</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Adapt to 60%</p>
              </button>

              <button
                onClick={() => handleSimulateTraffic('Zone 6: Chowk Heritage', 'LOW')}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/40 text-center transition-all"
              >
                <p className="text-xs font-bold text-emerald-400">Chowk Quiet</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Dim to 25%</p>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Custom Telemetry Packet Ingestion */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-2xl glass-panel space-y-5">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Radio className="w-4 h-4 text-sky-400" />
                <span>3-Tier Edge Ingestion Simulator (/api/telemetry/ingest)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Directly transmit a synthetic JSON packet conforming to the <code className="text-sky-300">ai_config.md</code> standard.
              </p>
            </div>

            <form onSubmit={handleIngestCustomTelemetry} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block font-mono text-[10px] uppercase mb-1">
                    Pole Code
                  </label>
                  <input
                    type="text"
                    value={customTelemetry.poleId}
                    onChange={(e) => setCustomTelemetry({ ...customTelemetry, poleId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block font-mono text-[10px] uppercase mb-1">
                    Mini-Cluster ID
                  </label>
                  <input
                    type="text"
                    value={customTelemetry.miniClusterId}
                    onChange={(e) => setCustomTelemetry({ ...customTelemetry, miniClusterId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block font-mono text-[10px] uppercase mb-1">
                    Ambient Lux
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={customTelemetry.lux}
                    onChange={(e) => setCustomTelemetry({ ...customTelemetry, lux: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block font-mono text-[10px] uppercase mb-1">
                    Radar Motion
                  </label>
                  <select
                    value={customTelemetry.motion ? 'true' : 'false'}
                    onChange={(e) => setCustomTelemetry({ ...customTelemetry, motion: e.target.value === 'true' })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  >
                    <option value="true">Triggered</option>
                    <option value="false">Quiet</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block font-mono text-[10px] uppercase mb-1">
                    Power (W)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={customTelemetry.powerW}
                    onChange={(e) => setCustomTelemetry({ ...customTelemetry, powerW: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block font-mono text-[10px] uppercase mb-1">
                    Current (A)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={customTelemetry.currentA}
                    onChange={(e) => setCustomTelemetry({ ...customTelemetry, currentA: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingAction === 'ingest'}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-lg transition-all"
              >
                <Play className="w-4 h-4" />
                <span>{loadingAction === 'ingest' ? 'Transmitting Ingestion...' : 'Transmit Ingestion Packet to Backend'}</span>
              </button>
            </form>
          </div>

          {/* Quick Database Statistics */}
          <div className="p-5 rounded-2xl glass-panel space-y-3">
            <h3 className="text-xs font-bold text-slate-300 flex items-center space-x-2 uppercase tracking-wider font-mono">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Database Assets Status</span>
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Total Poles</span>
                <span className="text-base font-bold text-white">{poles?.length || 12}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Corridors</span>
                <span className="text-base font-bold text-sky-400">6 Zones</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">AI Pipeline</span>
                <span className="text-base font-bold text-emerald-400">Ridge ML</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
