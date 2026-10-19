import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const LightingContext = createContext(null);

export const LightingProvider = ({ children }) => {
  let auth = null;
  try {
    auth = useAuth();
  } catch (e) {
    // fallback if used without AuthProvider
  }

  const [currentRole, setCurrentRole] = useState(auth?.user?.role || 'admin');

  useEffect(() => {
    if (auth?.user?.role) {
      setCurrentRole(auth.user.role);
    }
  }, [auth?.user?.role]);

  const [loading, setLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);
  const [poles, setPoles] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [maintenanceOrders, setMaintenanceOrders] = useState([]);
  const [systemRecords, setSystemRecords] = useState([]);
  const [hourlyEnergy, setHourlyEnergy] = useState([]);
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiAdaptiveMode, setAiAdaptiveMode] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPole, setSelectedPole] = useState(null);

  // Refresh all domains directly from Express.js Backend (PostgreSQL database)
  const refreshFromBackend = async () => {
    setLoading(true);
    try {
      const [backendPoles, backendOrders, backendRecords, backendAlerts, backendEnergy, backendAi] = await Promise.all([
        api.getPoles(),
        api.getMaintenanceOrders(),
        api.getRecords(),
        api.getAlerts(),
        api.getEnergyChart(),
        api.getAiConfig(),
      ]);

      if (Array.isArray(backendPoles)) {
        setPoles(backendPoles);
        setBackendConnected(true);
      }
      if (Array.isArray(backendOrders)) {
        setMaintenanceOrders(backendOrders);
      }
      if (Array.isArray(backendRecords)) {
        setSystemRecords(backendRecords);
      }
      if (Array.isArray(backendAlerts)) {
        setAlerts(backendAlerts);
      }
      if (Array.isArray(backendEnergy)) {
        setHourlyEnergy(backendEnergy);
      }
      if (backendAi && backendAi.activeConfig) {
        setAiConfig(prev => ({ ...prev, ...backendAi.activeConfig }));
      }
    } catch (err) {
      console.warn('Backend synchronization check:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshFromBackend();
  }, []);

  // Dynamically derive corridor and zone summaries 100% from live backend poles
  const zones = useMemo(() => {
    if (!Array.isArray(poles) || poles.length === 0) return [];

    const zoneMap = new Map();
    poles.forEach(p => {
      const zName = p.zone || 'Metropolitan Sector';
      if (!zoneMap.has(zName)) {
        zoneMap.set(zName, {
          zone: zName,
          totalPoles: 0,
          active: 0,
          dimmed: 0,
          faulty: 0,
          offline: 0,
          brightnessSum: 0,
          kwhSum: 0,
        });
      }
      const entry = zoneMap.get(zName);
      entry.totalPoles += 1;
      if (p.status === 'ACTIVE') entry.active += 1;
      else if (p.status === 'DIMMED') entry.dimmed += 1;
      else if (p.status === 'FAULTY') entry.faulty += 1;
      else if (p.status === 'OFFLINE') entry.offline += 1;
      entry.brightnessSum += (p.currentBrightness || 0);
      entry.kwhSum += (p.powerConsumedKwh || 0);
    });

    return Array.from(zoneMap.values()).map(z => {
      const avgBrightness = z.totalPoles > 0 ? Math.round(z.brightnessSum / z.totalPoles) : 0;
      const savingsPct = Math.max(0, Math.min(100, Math.round(100 - avgBrightness)));
      return {
        zone: z.zone,
        totalPoles: z.totalPoles,
        active: z.active,
        dimmed: z.dimmed,
        faulty: z.faulty,
        offline: z.offline,
        avgBrightness,
        kwhToday: parseFloat(z.kwhSum.toFixed(2)),
        savingsPct,
      };
    });
  }, [poles]);

  // AI Configuration Parameters
  const [aiConfig, setAiConfig] = useState({
    nightFloorBrightness: 20,
    motionBoostBrightness: 80,
    ambientLuxThreshold: 50.0,
    motionHoldSeconds: 45,
    energyCostPerKwh: 7.50,
  });

  const updateAiParameters = (newParams) => {
    setAiConfig(prev => {
      const next = { ...prev, ...newParams };
      api.updateAiConfig(next).catch(() => {});
      return next;
    });
  };

  // Safe KPI Calculations with real database aggregates
  const safePoles = Array.isArray(poles) ? poles : [];
  const safeAlerts = Array.isArray(alerts) ? alerts : [];
  const safeHourlyEnergy = Array.isArray(hourlyEnergy) ? hourlyEnergy : [];

  const totalPoles = safePoles.length;
  const activePoles = safePoles.filter(p => p.status === 'ACTIVE').length;
  const dimmedPoles = safePoles.filter(p => p.status === 'DIMMED').length;
  const faultyPoles = safePoles.filter(p => p.status === 'FAULTY').length;
  const offlinePoles = safePoles.filter(p => p.status === 'OFFLINE').length;
  const activeAlertsCount = safeAlerts.filter(a => !a.resolved).length;
  const criticalAlertsCount = safeAlerts.filter(a => !a.resolved && a.severity === 'CRITICAL').length;

  const totalBaselineKwh = safeHourlyEnergy.reduce((sum, item) => sum + (parseFloat(item.baselineKwh) || 0), 0);
  const totalActualKwh = safeHourlyEnergy.reduce((sum, item) => sum + (parseFloat(item.aiOptimizedKwh) || 0), 0);
  const totalSavedKwh = Math.max(0, totalBaselineKwh - totalActualKwh);
  const overallSavingsPct = totalBaselineKwh > 0 ? ((totalSavedKwh / totalBaselineKwh) * 100).toFixed(1) : '0.0';
  const totalCo2SavedKg = (totalSavedKwh * 0.82).toFixed(2);
  const totalCostSavedInr = (totalSavedKwh * (aiConfig?.energyCostPerKwh || 7.50)).toFixed(2);

  // Update Individual Pole Brightness
  const updatePoleBrightness = (poleId, newBrightness) => {
    // Asynchronously synchronize with Express.js Backend
    api.setBrightness(poleId, newBrightness).catch(() => {});

    setPoles(prevPoles =>
      prevPoles.map(pole => {
        if (pole.id === poleId) {
          let newStatus = pole.status;
          if (newStatus !== 'FAULTY' && newStatus !== 'OFFLINE') {
            if (newBrightness === 0) newStatus = 'OFFLINE';
            else if (newBrightness <= 30) newStatus = 'DIMMED';
            else newStatus = 'ACTIVE';
          }
          const wattageRatio = newBrightness / 100;
          const powerConsumedKwh = parseFloat(((pole.baseWattage * wattageRatio) / 1000).toFixed(3));
          const currentAmps = parseFloat(((powerConsumedKwh * 1000) / (pole.voltage || 230)).toFixed(2));
          const lumenOutput = Math.round(pole.maxLumens * wattageRatio);

          return {
            ...pole,
            currentBrightness: newBrightness,
            status: newStatus,
            powerConsumedKwh,
            currentAmps,
            lumenOutput,
            lastHeartbeat: 'Just now (Manual command)',
          };
        }
        return pole;
      })
    );
  };

  // Batch Update All Poles in a Group / Zone
  const updateGroupBrightness = (zoneName, newBrightness) => {
    // Asynchronously synchronize with Express.js Backend
    api.batchBrightness(zoneName, newBrightness).catch(() => {});

    setPoles(prevPoles =>
      prevPoles.map(pole => {
        if (pole.zone === zoneName) {
          let newStatus = pole.status;
          if (newStatus !== 'FAULTY' && newStatus !== 'OFFLINE') {
            if (newBrightness === 0) newStatus = 'OFFLINE';
            else if (newBrightness <= 30) newStatus = 'DIMMED';
            else newStatus = 'ACTIVE';
          }
          const wattageRatio = newBrightness / 100;
          const powerConsumedKwh = parseFloat(((pole.baseWattage * wattageRatio) / 1000).toFixed(3));
          const currentAmps = parseFloat(((powerConsumedKwh * 1000) / (pole.voltage || 230)).toFixed(2));
          const lumenOutput = Math.round(pole.maxLumens * wattageRatio);

          return {
            ...pole,
            currentBrightness: newBrightness,
            status: newStatus,
            powerConsumedKwh,
            currentAmps,
            lumenOutput,
            lastHeartbeat: 'Just now (Group override)',
          };
        }
        return pole;
      })
    );
  };

  // Toggle Single Pole Motion
  const togglePoleMotion = (poleId) => {
    // Asynchronously synchronize with Express.js Backend
    api.triggerMotion(poleId).catch(() => {});

    setPoles(prevPoles =>
      prevPoles.map(pole => {
        if (pole.id === poleId) {
          const nextMotion = !pole.motionDetected;
          let newBrightness = pole.currentBrightness;
          if (aiAdaptiveMode && pole.status !== 'FAULTY' && pole.status !== 'OFFLINE') {
            newBrightness = nextMotion ? aiConfig.motionBoostBrightness : aiConfig.nightFloorBrightness;
          }
          const wattageRatio = newBrightness / 100;
          const powerConsumedKwh = parseFloat(((pole.baseWattage * wattageRatio) / 1000).toFixed(3));
          const currentAmps = parseFloat(((powerConsumedKwh * 1000) / (pole.voltage || 230)).toFixed(2));

          return {
            ...pole,
            motionDetected: nextMotion,
            currentBrightness: newBrightness,
            status: newBrightness <= 30 ? 'DIMMED' : 'ACTIVE',
            powerConsumedKwh,
            currentAmps,
            lastHeartbeat: 'Just now (Radar event)',
          };
        }
        return pole;
      })
    );
  };

  // Toggle Motion for All Poles in a Group / Zone
  const toggleGroupMotion = (zoneName) => {
    // Asynchronously synchronize with Express.js Backend
    api.batchMotion(zoneName).catch(() => {});

    setPoles(prevPoles => {
      const zonePoles = prevPoles.filter(p => p.zone === zoneName);
      const anyMotionActive = zonePoles.some(p => p.motionDetected);
      const nextMotion = !anyMotionActive;

      return prevPoles.map(pole => {
        if (pole.zone === zoneName) {
          let newBrightness = pole.currentBrightness;
          if (aiAdaptiveMode && pole.status !== 'FAULTY' && pole.status !== 'OFFLINE') {
            newBrightness = nextMotion ? aiConfig.motionBoostBrightness : aiConfig.nightFloorBrightness;
          }
          const wattageRatio = newBrightness / 100;
          const powerConsumedKwh = parseFloat(((pole.baseWattage * wattageRatio) / 1000).toFixed(3));
          const currentAmps = parseFloat(((powerConsumedKwh * 1000) / (pole.voltage || 230)).toFixed(2));

          return {
            ...pole,
            motionDetected: nextMotion,
            currentBrightness: newBrightness,
            status: newBrightness <= 30 ? 'DIMMED' : 'ACTIVE',
            powerConsumedKwh,
            currentAmps,
            lastHeartbeat: 'Just now (Radar event)',
          };
        }
        return pole;
      });
    });
  };

  // Resolve Alert
  const resolveAlert = (alertId, notes = 'Issue checked and resolved via municipal dispatch console') => {
    // Asynchronously synchronize with Express.js Backend
    api.resolveAlert(alertId, notes).catch(() => {});

    setAlerts(prevAlerts =>
      prevAlerts.map(alert => {
        if (alert.id === alertId) {
          return {
            ...alert,
            resolved: true,
            resolutionNotes: notes,
          };
        }
        return alert;
      })
    );
  };

  // Derive Area / Corridor Groups for the Map Display (Not individual, but in groups!)
  const poleGroups = useMemo(() => {
    const rawGroups = [
      {
        id: 'group-lko-hzg',
        name: 'Zone 1: Hazratganj Heritage Sector',
        shortName: 'Hazratganj',
        zone: 'Zone 1: Hazratganj',
        nodalOfficer: 'Er. Alok Srivastava',
        nodalPhone: '+91 98765 11001',
        coords: [26.8485, 80.9416],
        description: 'Heritage boulevard, Vidhan Sabha Marg, Raj Bhavan & GPO circle',
      },
      {
        id: 'group-lko-gmn',
        name: 'Zone 4: Gomti Nagar & Shaheed Path Sector',
        shortName: 'Gomti Nagar',
        zone: 'Zone 4: Gomti Nagar',
        nodalOfficer: 'Er. Pradeep Mishra',
        nodalPhone: '+91 98765 11004',
        coords: [26.8425, 81.0065],
        description: 'Commercial cyber hub, Patrakarpuram & Amar Shaheed Path elevated expressway',
      },
      {
        id: 'group-lko-alm',
        name: 'Zone 5: Alambagh Transport Sector',
        shortName: 'Alambagh',
        zone: 'Zone 5: Alambagh',
        nodalOfficer: 'Er. Sunil Verma',
        nodalPhone: '+91 98765 11005',
        coords: [26.8125, 80.9015],
        description: 'Intermodal Bus Terminal, Metro Interchange & Kanpur Road highway',
      },
      {
        id: 'group-lko-cwk',
        name: 'Zone 6: Chowk Heritage Sector',
        shortName: 'Chowk Heritage',
        zone: 'Zone 6: Chowk Heritage',
        nodalOfficer: 'Er. R.K. Pandey',
        nodalPhone: '+91 98765 11006',
        coords: [26.8665, 80.9115],
        description: 'Rumi Darwaza, Bara Imambara precinct & Old City cultural bazaars',
      },
      {
        id: 'group-lko-idn',
        name: 'Zone 3: Indira Nagar & Ring Road Sector',
        shortName: 'Indira Nagar',
        zone: 'Zone 3: Indira Nagar',
        nodalOfficer: 'Er. Neha Tripathi',
        nodalPhone: '+91 98765 11003',
        coords: [26.8785, 80.9882],
        description: 'Munshi Pulia intersection, Polytech flyover & Bhootnath commercial market',
      },
      {
        id: 'group-lko-cbg',
        name: 'Zone 2: Charbagh Railway Sector',
        shortName: 'Charbagh',
        zone: 'Zone 2: Charbagh',
        nodalOfficer: 'Er. Sanjay Yadav',
        nodalPhone: '+91 98765 11002',
        coords: [26.8350, 80.9220],
        description: 'Charbagh Central Station forecourt, Gautam Buddha Marg & industrial corridor',
      },
    ];

    return rawGroups.map(group => {
      const groupPoles = poles.filter(p => p.zone === group.zone);
      const totalCount = groupPoles.length;
      const activeCount = groupPoles.filter(p => p.status === 'ACTIVE').length;
      const dimmedCount = groupPoles.filter(p => p.status === 'DIMMED').length;
      const faultyCount = groupPoles.filter(p => p.status === 'FAULTY').length;
      const offlineCount = groupPoles.filter(p => p.status === 'OFFLINE').length;
      const totalPower = groupPoles.reduce((sum, p) => sum + p.powerConsumedKwh, 0);
      const avgBrightness = totalCount > 0 ? Math.round(groupPoles.reduce((sum, p) => sum + p.currentBrightness, 0) / totalCount) : 0;
      const motionActive = groupPoles.some(p => p.motionDetected);

      let groupStatus = 'ACTIVE';
      if (faultyCount > 0) groupStatus = 'FAULTY';
      else if (offlineCount === totalCount) groupStatus = 'OFFLINE';
      else if (dimmedCount > 0 && activeCount === 0) groupStatus = 'DIMMED';

      return {
        ...group,
        poles: groupPoles,
        totalCount,
        activeCount,
        dimmedCount,
        faultyCount,
        offlineCount,
        totalPowerKwh: totalPower.toFixed(3),
        avgBrightness,
        motionActive,
        groupStatus,
      };
    });
  }, [poles]);

  // Filtered Poles for Table
  const filteredPoles = useMemo(() => {
    return poles.filter(pole => {
      const matchesZone = selectedZone === 'ALL' || pole.zone === selectedZone;
      const matchesQuery =
        pole.poleCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pole.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pole.zone.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesZone && matchesQuery;
    });
  }, [poles, selectedZone, searchQuery]);

  // Maintenance Work Orders Actions
  const updateWorkOrderStatus = (workOrderId, newStatus, completionNotes = '') => {
    // Asynchronously synchronize with Express.js Backend
    api.updateWorkOrderStatus(workOrderId, newStatus, completionNotes).catch(() => {});

    setMaintenanceOrders(prevOrders =>
      prevOrders.map(order => {
        if (order.workOrderId === workOrderId) {
          const updated = {
            ...order,
            status: newStatus,
            ...(completionNotes ? { completionNotes } : {}),
            ...(newStatus === 'COMPLETED' ? { completedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) } : {})
          };
          return updated;
        }
        return order;
      })
    );

    // Auto-log into system audit records (Auditing Pattern)
    const order = maintenanceOrders.find(o => o.workOrderId === workOrderId);
    if (order) {
      logSystemRecord({
        recordId: `REC-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        sector: order.zone,
        eventType: 'Maintenance Status Update',
        summary: `Work order ${workOrderId} (${order.category}) updated to ${newStatus}.`,
        metric: `Status: ${newStatus}`,
        compliance: newStatus === 'COMPLETED' ? 'Resolved' : 'In Progress',
        loggedBy: 'Municipal Dispatch Console'
      });
    }
  };

  const createWorkOrder = (newOrder) => {
    const formattedOrder = {
      workOrderId: `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      scheduledDate: new Date().toISOString().split('T')[0],
      status: 'SCHEDULED',
      ...newOrder
    };

    // Asynchronously synchronize with Express.js Backend
    api.createWorkOrder(formattedOrder).catch(() => {});

    setMaintenanceOrders(prev => [formattedOrder, ...prev]);

    logSystemRecord({
      recordId: `REC-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      sector: formattedOrder.zone || 'Metropolitan Grid',
      eventType: 'Work Order Dispatched',
      summary: `Work order ${formattedOrder.workOrderId} created for ${formattedOrder.poleCode}: ${formattedOrder.category}`,
      metric: `Priority: ${formattedOrder.priority}`,
      compliance: 'SLA Initiated',
      loggedBy: 'Automated Operations Dispatcher'
    });
  };

  // System Record Logger
  const logSystemRecord = (newRecord) => {
    setSystemRecords(prev => [newRecord, ...prev]);
  };

  return (
    <LightingContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        backendConnected,
        loading,
        refreshFromBackend,
        poles,
        poleGroups,
        filteredPoles,
        alerts,
        maintenanceOrders,
        systemRecords,
        hourlyEnergy,
        zones,
        selectedZone,
        setSelectedZone,
        selectedGroupId,
        setSelectedGroupId,
        searchQuery,
        setSearchQuery,
        aiAdaptiveMode,
        setAiAdaptiveMode,
        activeTab,
        setActiveTab,
        selectedPole,
        setSelectedPole,
        aiConfig,
        setAiConfig,
        updateAiParameters,
        updatePoleBrightness,
        updateGroupBrightness,
        togglePoleMotion,
        toggleGroupMotion,
        resolveAlert,
        updateWorkOrderStatus,
        createWorkOrder,
        logSystemRecord,
        kpis: {
          totalPoles,
          activePoles,
          dimmedPoles,
          faultyPoles,
          offlinePoles,
          activeAlertsCount,
          criticalAlertsCount,
          totalMaintenanceCount: (maintenanceOrders || []).length,
          openMaintenanceCount: (maintenanceOrders || []).filter(o => o.status !== 'COMPLETED').length,
          totalRecordsCount: (systemRecords || []).length,
          totalBaselineKwh: Number(totalBaselineKwh || 0).toFixed(2),
          totalActualKwh: Number(totalActualKwh || 0).toFixed(2),
          totalSavedKwh: Number(totalSavedKwh || 0).toFixed(2),
          overallSavingsPct: overallSavingsPct || '0.0',
          totalCo2SavedKg: totalCo2SavedKg || '0.00',
          totalCostSavedInr: totalCostSavedInr || '0.00',
        },
      }}
    >
      {children}
    </LightingContext.Provider>
  );
};

export const useLighting = () => {
  const context = useContext(LightingContext);
  if (!context) {
    throw new Error('useLighting must be used within a LightingProvider');
  }
  return context;
};
