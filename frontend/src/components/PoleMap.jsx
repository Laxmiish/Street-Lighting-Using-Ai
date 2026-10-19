import React, { useState, useEffect, useRef } from 'react';
import { useLighting } from '../context/LightingContext';
import {
  MapPin,
  Radio,
  Lightbulb,
  Zap,
  Activity,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Layers,
  ChevronRight,
  Maximize2,
  Navigation,
} from 'lucide-react';

export default function PoleMap() {
  const {
    poleGroups,
    selectedZone,
    setSelectedZone,
    updateGroupBrightness,
    updatePoleBrightness,
  } = useLighting();

  const [activeGroup, setActiveGroup] = useState(poleGroups[0]);
  const [mapTheme, setMapTheme] = useState('DARK'); // 'DARK' | 'STREET'
  const [activeFixture, setActiveFixture] = useState(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef({});

  // Sync active group when selectedZone changes
  useEffect(() => {
    if (selectedZone && selectedZone !== 'ALL') {
      const match = poleGroups.find(g => g.zone === selectedZone);
      if (match) setActiveGroup(match);
    }
  }, [selectedZone, poleGroups]);

  // Keep activeGroup data fresh when pole state changes
  useEffect(() => {
    if (activeGroup) {
      const updated = poleGroups.find(g => g.id === activeGroup.id);
      if (updated) setActiveGroup(updated);
    } else if (poleGroups && poleGroups.length > 0) {
      setActiveGroup(poleGroups[0]);
    }
  }, [poleGroups, activeGroup]);

  // Initialize OpenStreetMap (Leaflet)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if Leaflet is loaded
    if (!window.L) {
      // Retry in 500ms if script is still loading
      const timer = setTimeout(() => {
        if (window.L && !mapInitialized) initializeLeafletMap();
      }, 500);
      return () => clearTimeout(timer);
    }

    if (!mapInitialized && mapContainerRef.current) {
      initializeLeafletMap();
    }

    function initializeLeafletMap() {
      try {
        if (leafletMapRef.current) return;

        const L = window.L;
        // Coordinates for Lucknow City Metropolitan Centre
        const map = L.map(mapContainerRef.current, {
          center: [26.8485, 80.9462],
          zoom: 13,
          zoomControl: false,
          attributionControl: false,
        });

        // Add Zoom Control in top right
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

        leafletMapRef.current = map;
        setMapInitialized(true);
      } catch (err) {
        console.error('Leaflet OpenStreetMap initialization error:', err);
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

  // Update Group Markers on OpenStreetMap
  useEffect(() => {
    if (!mapInitialized || !leafletMapRef.current || !window.L) return;

    const L = window.L;
    const map = leafletMapRef.current;

    // Clear previous markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    poleGroups.forEach(group => {
      const isSelected = activeGroup?.id === group.id;
      const isFaulty = group.faultyCount > 0;
      const isDimmed = group.dimmedCount > 0 && !isFaulty;

      // Group Marker Pin Styling
      let borderClass = 'border-emerald-400 bg-slate-900/95 text-emerald-300 shadow-glow-emerald';
      let statusDot = 'bg-emerald-400';
      if (isFaulty) {
        borderClass = 'border-red-500 bg-red-950/90 text-red-300 shadow-glow-red animate-pulse';
        statusDot = 'bg-red-400';
      } else if (isDimmed) {
        borderClass = 'border-amber-400 bg-slate-900/95 text-amber-300 shadow-glow-amber';
        statusDot = 'bg-amber-400';
      }

      const ringEffect = isSelected ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-950 scale-105' : '';

      // HTML custom element for Group Marker
      const customHtml = `
        <div class="cursor-pointer transition-all duration-200 ${ringEffect}">
          <div class="flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl border ${borderClass} font-mono text-[11px] font-bold shadow-lg whitespace-nowrap">
            <span class="w-2.5 h-2.5 rounded-full ${statusDot}"></span>
            <span>${group.shortName}</span>
            <span class="bg-slate-800/80 px-1.5 py-0.5 rounded-full text-[10px] text-slate-300">${group.totalCount}</span>
          </div>
          ${group.motionActive ? '<div class="w-full text-center mt-1"><span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-mono border border-amber-500/40 font-bold">RADAR ACTIVE</span></div>' : ''}
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-osm-group-marker',
        html: customHtml,
        iconSize: [120, 36],
        iconAnchor: [60, 18],
      });

      const marker = L.marker(group.coords, { icon }).addTo(map);

      marker.on('click', () => {
        setActiveGroup(group);
        setSelectedZone(group.zone);
        map.panTo(group.coords, { animate: true, duration: 0.8 });
      });

      markersRef.current[group.id] = marker;
    });
  }, [mapInitialized, poleGroups, activeGroup]);

  // Center map on active group change
  const handleSelectGroup = (group) => {
    setActiveGroup(group);
    setSelectedZone(group.zone);
    if (leafletMapRef.current) {
      leafletMapRef.current.panTo(group.coords, { animate: true, duration: 0.8 });
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl glass-panel space-y-5">
      {/* Map Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Navigation className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white">
              Lucknow Metropolitan Zonal Map (OpenStreetMap Engine)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Area-based cluster monitoring across 6 Lucknow administrative sectors (Click sector to inspect & control)
          </p>
        </div>

        {/* Controls: Theme Toggle & Sector Group Quick Jump Selector */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Map Theme Toggle (Night Mode / Street View - Zero API Key) */}
          <div className="flex items-center bg-slate-900/95 p-1 rounded-2xl border border-slate-750 text-xs">
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

          {/* Sector Group Quick Jump Selector */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/95 p-1.5 rounded-2xl border border-slate-750">
            <button
              onClick={() => {
                setSelectedZone('ALL');
                if (leafletMapRef.current) {
                  leafletMapRef.current.setView([26.8485, 80.9462], 13, { animate: true });
                }
              }}
              className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-colors ${
                selectedZone === 'ALL'
                  ? 'bg-sky-500 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Sectors
            </button>
            {poleGroups.map(group => {
              const isCurrent = activeGroup?.id === group.id && selectedZone === group.zone;
              return (
                <button
                  key={group.id}
                  onClick={() => handleSelectGroup(group)}
                  className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all ${
                    isCurrent
                      ? 'bg-sky-500 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {group.shortName}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Map + Group Control Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[460px]">
        {/* OpenStreetMap Container (8 Columns) */}
        <div className="lg:col-span-8 rounded-2xl overflow-hidden border border-slate-700/80 relative min-h-[360px] lg:min-h-[460px] bg-slate-950">
          <div
            ref={mapContainerRef}
            className={`w-full h-full min-h-[360px] lg:min-h-[460px] z-10 ${
              mapTheme === 'DARK' ? 'osm-dark-tiles' : ''
            }`}
          />

          {/* Fallback if Leaflet tile is loading */}
          {!mapInitialized && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-400 text-xs space-y-2 z-0">
              <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              <span>Loading OpenStreetMap tiles...</span>
            </div>
          )}

          {/* Map Overlay Badge */}
          <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
            <span className="px-3 py-1 rounded-xl bg-slate-900/90 text-slate-300 border border-slate-700/80 text-[10px] font-mono shadow-md backdrop-blur-md flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>OpenStreetMap (100% Open Source • Zero API Key Required)</span>
            </span>
          </div>
        </div>

        {/* Selected Sector Group Control & Telemetry Panel (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col justify-between p-5 rounded-2xl bg-slate-900/90 border border-slate-750 space-y-4">
          {activeGroup ? (
            <>
              {/* Group Header */}
              <div className="space-y-1.5 border-b border-slate-800 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                    Active Sector
                  </span>
                  <span
                    className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      activeGroup.groupStatus === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : activeGroup.groupStatus === 'DIMMED'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>{activeGroup.groupStatus}</span>
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{activeGroup.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{activeGroup.description}</p>
              </div>

              {/* Group Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Total Fixtures</span>
                  <span className="text-white text-base font-bold">{activeGroup.totalCount} Poles</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Sector Power</span>
                  <span className="text-sky-300 text-base font-bold">{activeGroup.totalPowerKwh} kW</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Avg Dim Level</span>
                  <span className="text-amber-300 text-base font-bold">{activeGroup.avgBrightness}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Radar Sensor</span>
                  <span className={activeGroup.motionActive ? 'text-amber-400 font-bold' : 'text-slate-400 font-bold'}>
                    {activeGroup.motionActive ? 'RADAR ACTIVE' : 'CLEAR'}
                  </span>
                </div>
              </div>

              {/* Batch Sector Controls */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-semibold flex items-center space-x-1.5">
                    <Sliders className="w-3.5 h-3.5 text-sky-400" />
                    <span>Set Sector Brightness (All {activeGroup.totalCount} Fixtures):</span>
                  </span>
                  <span className="font-mono font-bold text-sky-400">{activeGroup.avgBrightness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={activeGroup.avgBrightness}
                  onChange={(e) => updateGroupBrightness(activeGroup.zone, parseInt(e.target.value, 10))}
                  className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  title="Batch adjust all street lights in this sector"
                />
              </div>

              {/* Individual Fixtures List in this Group */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Fixtures in {activeGroup.shortName}:
                </span>
                {activeGroup.poles.map(p => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <div className="text-sky-300 font-bold">{p.poleCode}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{p.locationName}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-bold">{p.currentBrightness}%</span>
                      <span className={`w-2 h-2 rounded-full ${p.status === 'ACTIVE' ? 'bg-emerald-400' : p.status === 'DIMMED' ? 'bg-amber-400' : p.status === 'FAULTY' ? 'bg-red-400' : 'bg-slate-500'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
              <Layers className="w-6 h-6 mb-2 text-slate-600" />
              <span>Select any corridor sector on the map</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
