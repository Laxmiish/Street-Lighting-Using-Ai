import React, { useState, useEffect, useRef } from 'react';
import { useLighting } from '../context/LightingContext';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Shield,
  Zap,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Radio,
  Layers,
  Building2,
  UserCheck,
  X,
} from 'lucide-react';

export default function LucknowAreaMap({ showOfficerCard = true }) {
  const {
    poles,
    poleGroups,
    selectedZone,
    setSelectedZone,
    updatePoleBrightness,
  } = useLighting();
  const { user } = useAuth();

  // If user has an assignedZone from Auth (e.g. Nodal Officer), default to that zone
  const defaultZone = user?.assignedZone && user.assignedZone !== 'ALL'
    ? user.assignedZone
    : (selectedZone && selectedZone !== 'ALL' ? selectedZone : 'ALL');

  const [activeZone, setActiveZone] = useState(defaultZone);
  const [mapTheme, setMapTheme] = useState('DARK'); // 'DARK' | 'STREET'
  const [selectedFixture, setSelectedFixture] = useState(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Zonal boundaries / center points for Lucknow Administrative Divisions
  const LUCKNOW_ZONAL_CONFIG = {
    ALL: {
      name: 'All Lucknow Metropolitan',
      shortName: 'Metropolitan Overview',
      officer: user?.role === 'admin' && user?.assignedZone === 'ALL' ? user.name : 'Dr. Rajeshwar Rao, IAS',
      title: 'Municipal Commissioner & Director',
      department: 'Lucknow Urban Infrastructure Directorate',
      phone: '+91 98765 43210',
      coords: [26.8485, 80.9462],
      zoom: 13,
      description: 'Supervisory oversight across all 6 administrative zones, 110 wards & 25 smart corridors in Lucknow.',
    },
    'Zone 1: Hazratganj': {
      name: 'Zone 1: Hazratganj Heritage Sector',
      shortName: 'Hazratganj',
      officer: 'Er. Alok Srivastava',
      title: 'Nodal Zonal Officer (Zone 1)',
      department: 'Hazratganj Municipal Division, LMC',
      phone: '+91 98765 11001',
      coords: [26.8505, 80.9416],
      zoom: 15,
      description: 'Heritage promenade, Vidhan Sabha Marg, Raj Bhavan & GPO circle.',
    },
    'Zone 4: Gomti Nagar': {
      name: 'Zone 4: Gomti Nagar & Shaheed Path Sector',
      shortName: 'Gomti Nagar',
      officer: 'Er. Pradeep Mishra',
      title: 'Nodal Zonal Officer (Zone 4)',
      department: 'Gomti Nagar Infrastructure Division, LMC',
      phone: '+91 98765 11004',
      coords: [26.8425, 81.0065],
      zoom: 14,
      description: 'Commercial cyber hub, Patrakarpuram & Amar Shaheed Path elevated expressway.',
    },
    'Zone 5: Alambagh': {
      name: 'Zone 5: Alambagh Transport Sector',
      shortName: 'Alambagh',
      officer: 'Er. Sunil Verma',
      title: 'Nodal Zonal Officer (Zone 5)',
      department: 'Alambagh Transport & Urban Division, LMC',
      phone: '+91 98765 11005',
      coords: [26.8125, 80.9015],
      zoom: 15,
      description: 'Intermodal Bus Terminal, Metro Interchange & Kanpur Road highway axis.',
    },
    'Zone 6: Chowk Heritage': {
      name: 'Zone 6: Chowk Heritage Sector',
      shortName: 'Chowk Heritage',
      officer: 'Er. R.K. Pandey',
      title: 'Nodal Zonal Officer (Zone 6)',
      department: 'Old City Cultural & Heritage Division, LMC',
      phone: '+91 98765 11006',
      coords: [26.8665, 80.9115],
      zoom: 15,
      description: 'Rumi Darwaza, Bara Imambara precinct & Old Lucknow commercial bazaars.',
    },
    'Zone 3: Indira Nagar': {
      name: 'Zone 3: Indira Nagar & Ring Road Sector',
      shortName: 'Indira Nagar',
      officer: 'Er. Neha Tripathi',
      title: 'Nodal Zonal Officer (Zone 3)',
      department: 'Indira Nagar Municipal Division, LMC',
      phone: '+91 98765 11003',
      coords: [26.8785, 80.9882],
      zoom: 15,
      description: 'Munshi Pulia metro hub, Polytech flyover & Bhootnath commercial market.',
    },
    'Zone 2: Charbagh': {
      name: 'Zone 2: Charbagh Railway Sector',
      shortName: 'Charbagh',
      officer: 'Er. Sanjay Yadav',
      title: 'Nodal Zonal Officer (Zone 2)',
      department: 'Charbagh Railway & Industrial Division, LMC',
      phone: '+91 98765 11002',
      coords: [26.8350, 80.9220],
      zoom: 15,
      description: 'Charbagh Central Station forecourt, Gautam Buddha Marg & industrial corridor.',
    },
  };

  const currentZoneConfig = LUCKNOW_ZONAL_CONFIG[activeZone] || LUCKNOW_ZONAL_CONFIG.ALL;

  // Filter poles based on active zone
  const displayedPoles = activeZone === 'ALL'
    ? poles
    : poles.filter(p => p.zone === activeZone);

  const activeCount = displayedPoles.filter(p => p.status === 'ACTIVE').length;
  const dimmedCount = displayedPoles.filter(p => p.status === 'DIMMED').length;
  const faultyCount = displayedPoles.filter(p => p.status === 'FAULTY').length;
  const offlineCount = displayedPoles.filter(p => p.status === 'OFFLINE').length;
  const totalPower = displayedPoles.reduce((acc, p) => acc + (p.powerConsumedKwh || 0), 0);

  // Initialize OpenStreetMap via Leaflet (100% Free, Zero API Key)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!window.L) {
      const timer = setTimeout(() => {
        if (window.L && !mapInitialized) initLeaflet();
      }, 500);
      return () => clearTimeout(timer);
    }

    if (!mapInitialized && mapContainerRef.current) {
      initLeaflet();
    }

    function initLeaflet() {
      try {
        if (leafletMapRef.current) return;
        const L = window.L;

        const map = L.map(mapContainerRef.current, {
          center: currentZoneConfig.coords,
          zoom: currentZoneConfig.zoom,
          zoomControl: false,
          attributionControl: false,
        });

        // Add Zoom Control top right
        L.control.zoom({ position: 'topright' }).addTo(map);

        // 100% Free & Open-Source OpenStreetMap Tile Layer (Zero API Key Required)
        const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        });
        osmLayer.on('tileerror', (error, tile) => {
          if (tile && tile.src && !tile.src.includes('openstreetmap.fr')) {
            tile.src = tile.src.replace('tile.openstreetmap.org', 'tile.openstreetmap.fr/hot');
          }
        });
        osmLayer.addTo(map);

        markersLayerRef.current = L.layerGroup().addTo(map);
        leafletMapRef.current = map;
        setMapInitialized(true);
      } catch (err) {
        console.error('Leaflet initialization error:', err);
      }
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        setMapInitialized(false);
      }
    };
  }, []);

  // Update map viewport & markers when activeZone or displayedPoles change
  useEffect(() => {
    if (!mapInitialized || !leafletMapRef.current || !markersLayerRef.current || !window.L) return;

    const L = window.L;
    const map = leafletMapRef.current;
    const layer = markersLayerRef.current;

    // Clear previous markers
    layer.clearLayers();

    // 1. Pan / Zoom to current area
    map.flyTo(currentZoneConfig.coords, currentZoneConfig.zoom, {
      animate: true,
      duration: 1.0,
    });

    // 2. Render Fixture Markers
    displayedPoles.forEach(pole => {
      const isFaulty = pole.status === 'FAULTY';
      const isDimmed = pole.status === 'DIMMED';
      const isOffline = pole.status === 'OFFLINE';
      const isSelected = selectedFixture?.id === pole.id;

      let colorClass = 'bg-emerald-500 border-emerald-400 text-emerald-300 shadow-glow-emerald';
      let pinDot = 'bg-emerald-400';
      if (isFaulty) {
        colorClass = 'bg-red-500 border-red-400 text-red-300 shadow-glow-red animate-pulse';
        pinDot = 'bg-red-400';
      } else if (isDimmed) {
        colorClass = 'bg-sky-500 border-sky-400 text-sky-300 shadow-glow-cyan';
        pinDot = 'bg-sky-400';
      } else if (isOffline) {
        colorClass = 'bg-slate-600 border-slate-500 text-slate-300';
        pinDot = 'bg-slate-400';
      }

      const ring = isSelected ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-900 scale-125' : '';

      const markerHtml = `
        <div class="cursor-pointer transition-all duration-200 ${ring} flex items-center justify-center">
          <div class="w-6 h-6 rounded-full border-2 ${colorClass} flex items-center justify-center shadow-lg">
            <span class="w-2 h-2 rounded-full ${pinDot}"></span>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-lucknow-pole-marker',
        html: markerHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([pole.latitude, pole.longitude], { icon });

      // Click to inspect
      marker.on('click', () => {
        setSelectedFixture(pole);
      });

      // Bind simple popup
      marker.bindTooltip(
        `<div class="font-mono text-[11px] p-1 font-bold">
          <div>${pole.poleCode}</div>
          <div class="text-[10px] text-slate-300 font-normal">${pole.locationName}</div>
          <div class="text-[9px] text-emerald-400 font-bold">${pole.status} • ${pole.currentBrightness}% Bright</div>
        </div>`,
        { direction: 'top', offset: [0, -10] }
      );

      marker.addTo(layer);
    });
  }, [mapInitialized, activeZone, displayedPoles, selectedFixture]);

  // Handle Zone Switch
  const handleZoneSelect = (zoneKey) => {
    setActiveZone(zoneKey);
    setSelectedZone(zoneKey);
    setSelectedFixture(null);
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl glass-panel space-y-5">
      {/* 1. Header & Jurisdictional Area Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Lucknow City Geospatial Surveillance & Zonal Jurisdiction Map</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Zero-API OpenStreetMap
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Area-specific telemetry and fixture health tailored for Highest and Nodal Zonal Officers
              </p>
            </div>
          </div>
        </div>

        {/* Controls: Map Theme Mode & Zone Selector */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Map Theme Toggle (Night Mode / Street View - Zero API Key) */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setMapTheme('DARK')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold transition-all ${
                mapTheme === 'DARK'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Dark Nighttime Cartography Mode (CSS-rendered, 0 API key)"
            >
              Night Mode
            </button>
            <button
              type="button"
              onClick={() => setMapTheme('STREET')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold transition-all ${
                mapTheme === 'STREET'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Full Color OpenStreetMap Street Cartography (0 API key)"
            >
              Street View
            </button>
          </div>

          {/* Lucknow Administrative Zone Selector */}
          <div className="flex items-center flex-wrap gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => handleZoneSelect('ALL')}
              className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all ${
                activeZone === 'ALL'
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              All Lucknow City
            </button>
          {Object.entries(LUCKNOW_ZONAL_CONFIG)
            .filter(([key]) => key !== 'ALL')
            .map(([zoneKey, cfg]) => {
              const isCurrent = activeZone === zoneKey;
              return (
                <button
                  key={zoneKey}
                  onClick={() => handleZoneSelect(zoneKey)}
                  className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all ${
                    isCurrent
                      ? 'bg-sky-500 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={`${cfg.name} (Nodal: ${cfg.officer})`}
                >
                  {cfg.shortName}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Nodal Officer Briefing & Area Jurisdiction Card */}
      {showOfficerCard && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
          {/* Officer Identity & Office Contact */}
          <div className="md:col-span-6 space-y-1.5 border-b md:border-b-0 md:border-r border-slate-800 pb-3 md:pb-0 md:pr-4">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-mono font-bold uppercase">
                {activeZone === 'ALL' ? 'Executive Oversight' : 'Nodal Jurisdiction'}
              </span>
              <span className="font-bold text-white text-sm">{currentZoneConfig.officer}</span>
            </div>
            <p className="text-slate-300 font-semibold">{currentZoneConfig.title}</p>
            <p className="text-slate-400 text-[11px] font-mono">{currentZoneConfig.department}</p>
            <p className="text-slate-400 text-[11px] leading-relaxed pt-1">
              {currentZoneConfig.description}
            </p>
            <div className="flex items-center space-x-3 pt-1 text-[11px] text-slate-400 font-mono">
              <span className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-sky-400" />
                <span>{currentZoneConfig.phone}</span>
              </span>
            </div>
          </div>

          {/* Area Asset Coverage & Operational Metrics */}
          <div className="md:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-3 self-center pl-0 md:pl-2">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Total Fixtures</span>
              <span className="text-lg font-bold font-mono text-white mt-1 block">{displayedPoles.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-mono text-emerald-400 block">Online Active</span>
              <span className="text-lg font-bold font-mono text-emerald-400 mt-1 block">{activeCount + dimmedCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-mono text-red-400 block">Needs Service</span>
              <span className="text-lg font-bold font-mono text-red-400 mt-1 block">{faultyCount + offlineCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-mono text-sky-400 block">Active Draw</span>
              <span className="text-lg font-bold font-mono text-sky-400 mt-1 block">{totalPower.toFixed(2)} kW</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Interactive Zero-API OpenStreetMap Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 min-h-[380px] sm:min-h-[440px]">
        <div
          ref={mapContainerRef}
          className={`w-full h-[380px] sm:h-[440px] z-0 ${mapTheme === 'DARK' ? 'osm-dark-tiles' : ''}`}
        />

        {/* Map Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-10 p-2.5 rounded-xl bg-slate-900/95 border border-slate-800 backdrop-blur-md shadow-lg space-y-1.5 text-[11px] font-mono">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-glow-emerald"></span>
            <span className="text-slate-200">Active (Adaptive Bright)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-glow-cyan"></span>
            <span className="text-slate-200">Dimmed (Late-Night Eco)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-glow-red animate-pulse"></span>
            <span className="text-slate-200">Faulty (Repair Dispatched)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
            <span className="text-slate-400">Offline / Standby</span>
          </div>
        </div>

        {/* Selected Fixture Drawer / Quick Inspector */}
        {selectedFixture && (
          <div className="absolute top-3 right-3 z-10 w-72 p-4 rounded-2xl bg-slate-900/95 border border-slate-700/80 backdrop-blur-md shadow-2xl space-y-3 text-xs animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="text-sky-400 font-mono font-bold text-sm block">{selectedFixture.poleCode}</span>
                <span className="text-[10px] text-slate-400">{selectedFixture.zone}</span>
              </div>
              <button
                onClick={() => setSelectedFixture(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1 text-slate-300">
              <p className="font-semibold text-white">{selectedFixture.locationName}</p>
              <div className="flex justify-between text-[11px] font-mono pt-1">
                <span className="text-slate-400">Status:</span>
                <span className={selectedFixture.status === 'ACTIVE' ? 'text-emerald-400' : selectedFixture.status === 'FAULTY' ? 'text-red-400' : 'text-amber-400'}>
                  {selectedFixture.status}
                </span>
              </div>
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-400">Current Brightness:</span>
                <span className="text-white font-bold">{selectedFixture.currentBrightness}%</span>
              </div>
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-400">Base Wattage:</span>
                <span className="text-white">{selectedFixture.baseWattage}W LED</span>
              </div>
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-400">Power Consumed:</span>
                <span className="text-white">{selectedFixture.powerConsumedKwh} kWh</span>
              </div>
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-400">Radar Motion:</span>
                <span className={selectedFixture.motionDetected ? 'text-amber-300 font-bold' : 'text-slate-400'}>
                  {selectedFixture.motionDetected ? 'ACTIVE MOTION' : 'Clear'}
                </span>
              </div>
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-400">Coordinates:</span>
                <span className="text-slate-300">{selectedFixture.latitude.toFixed(4)}, {selectedFixture.longitude.toFixed(4)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">Heartbeat: {selectedFixture.lastHeartbeat}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
