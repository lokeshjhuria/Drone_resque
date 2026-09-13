import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDrone } from '../../context/DroneContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Map as MapIcon, 
  Layers, 
  Crosshair, 
  Building2, 
  Droplet, 
  Truck, 
  Plane, 
  RefreshCw,
  Satellite,
  Compass,
  Search,
  Camera,
  Download,
  MapPin,
  Flame,
  Droplets,
  HeartPulse,
  Sparkles,
  Loader2,
  X,
  FolderDown
} from 'lucide-react';
import { DISASTER_SEARCH_PRESETS } from '../../utils/areaCapture';

const TacticalMap = ({ onOpenVaultModal }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerGroupRef = useRef(null);
  const droneMarkerRef = useRef(null);
  const searchRectangleRef = useRef(null);
  const baseCampMarkerRef = useRef(null);
  const hospitalMarkerRef = useRef(null);
  const bloodBankMarkerRef = useRef(null);
  const detectionMarkersRef = useRef({});
  const flightPathLineRef = useRef(null);
  const sosRouteLineRef = useRef(null);

  // Map Tile Style: 'satellite' | 'streets' | 'light'
  const [mapLayer, setMapLayer] = useState('satellite');

  // Search Area States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashEffect, setFlashEffect] = useState(false);
  const [captureToast, setCaptureToast] = useState(null);

  const { 
    telemetry, 
    detections, 
    activeTargetId, 
    lockTarget, 
    addLog, 
    sosState,
    activeSearchArea,
    searchAndFlyTo,
    captureLiveAreaIntel,
    capturedIntel
  } = useDrone();

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center coordinates
    const map = L.map(mapContainerRef.current, {
      center: [telemetry.lat, telemetry.lng],
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Tile Layer definitions
    const tileUrls = {
      satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      streets: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    };

    const initialLayer = L.tileLayer(tileUrls[mapLayer], {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    tileLayerGroupRef.current = initialLayer;

    // 1. Search Sector Boundary
    const searchBounds = [
      [telemetry.lat - 0.006, telemetry.lng - 0.007],
      [telemetry.lat + 0.006, telemetry.lng + 0.007]
    ];
    const rectangle = L.rectangle(searchBounds, {
      color: '#22c55e',
      weight: 2.5,
      dashArray: '6, 6',
      fillColor: '#22c55e',
      fillOpacity: 0.12
    }).addTo(map).bindTooltip('SEARCH SECTOR ACTIVE [SAR GRID]', { permanent: true, direction: 'top', className: 'tactical-tooltip' });
    searchRectangleRef.current = rectangle;

    // 2. SAR Base Alpha Camp Marker
    const baseIcon = L.divIcon({
      className: 'base-camp-icon',
      html: `
        <div style="background:#16a34a; color:#ffffff; padding:4px 8px; font-weight:bold; font-size:11px; font-family:monospace; border-radius:6px; border:2px solid #ffffff; box-shadow:0 3px 10px rgba(0,0,0,0.3); display:flex; align-items:center; gap:5px; white-space:nowrap;">
          <span>⛺</span> SAR BASE ALPHA
        </div>
      `,
      iconSize: [120, 26],
      iconAnchor: [60, 13]
    });
    baseCampMarkerRef.current = L.marker([telemetry.lat - 0.004, telemetry.lng - 0.004], { icon: baseIcon })
      .addTo(map)
      .bindPopup('<b>SAR BASE ALPHA</b><br/>Command HQ & Landing Pad');

    // 3. Level-1 Trauma Hospital Marker
    const hospitalIcon = L.divIcon({
      className: 'hospital-icon',
      html: `
        <div style="background:#2563eb; color:#ffffff; padding:4px 8px; font-weight:bold; font-size:11px; font-family:monospace; border-radius:6px; border:2px solid #ffffff; box-shadow:0 3px 10px rgba(0,0,0,0.3); display:flex; align-items:center; gap:5px; white-space:nowrap;">
          <span>🏥</span> ST. JUDE TRAUMA HOSPITAL
        </div>
      `,
      iconSize: [180, 26],
      iconAnchor: [90, 13]
    });
    hospitalMarkerRef.current = L.marker([telemetry.lat + 0.004, telemetry.lng + 0.005], { icon: hospitalIcon })
      .addTo(map)
      .bindPopup('<b>ST. JUDE LEVEL-1 TRAUMA HOSPITAL</b><br/>Emergency ER & Helipad (2.4 km)');

    // 4. Regional Blood Bank Marker
    const bloodBankIcon = L.divIcon({
      className: 'bloodbank-icon',
      html: `
        <div style="background:#e11d48; color:#ffffff; padding:4px 8px; font-weight:bold; font-size:11px; font-family:monospace; border-radius:6px; border:2px solid #ffffff; box-shadow:0 3px 10px rgba(0,0,0,0.3); display:flex; align-items:center; gap:5px; white-space:nowrap;">
          <span>🩸</span> REGIONAL BLOOD BANK
        </div>
      `,
      iconSize: [165, 26],
      iconAnchor: [82, 13]
    });
    bloodBankMarkerRef.current = L.marker([telemetry.lat - 0.004, telemetry.lng + 0.005], { icon: bloodBankIcon })
      .addTo(map)
      .bindPopup('<b>REGIONAL CENTRAL BLOOD BANK</b><br/>O-Negative Universal Reserve');

    // 5. Drone Flight Breadcrumbs Trail
    const flightPath = [
      [telemetry.lat - 0.005, telemetry.lng - 0.004],
      [telemetry.lat - 0.003, telemetry.lng - 0.001],
      [telemetry.lat - 0.001, telemetry.lng - 0.002],
      [telemetry.lat, telemetry.lng]
    ];
    const pathLine = L.polyline(flightPath, {
      color: '#4ade80',
      weight: 3.5,
      opacity: 0.9,
      dashArray: '6, 6'
    }).addTo(map);
    flightPathLineRef.current = pathLine;

    // 6. Drone Marker with Heading
    const droneIcon = L.divIcon({
      className: 'drone-custom-icon',
      html: `
        <div style="transform: rotate(${telemetry.heading}deg); transition: transform 0.4s ease;">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="22" cy="22" r="18" stroke="#22c55e" stroke-width="2.5" stroke-dasharray="4 4"/>
            <polygon points="22,4 32,38 22,30 12,38" fill="#22c55e" stroke="#ffffff" stroke-width="2"/>
            <circle cx="22" cy="22" r="4.5" fill="#ffffff"/>
          </svg>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const dMarker = L.marker([telemetry.lat, telemetry.lng], { icon: droneIcon }).addTo(map);
    droneMarkerRef.current = dMarker;

    // Click map to dispatch investigation waypoint
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      addLog('ALERT', `New Investigation Waypoint Placed at (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
      L.circleMarker([lat, lng], {
        radius: 8,
        color: '#f59e0b',
        fillColor: '#f59e0b',
        fillOpacity: 0.9
      }).addTo(map).bindPopup(`<div style="font-family:monospace;font-size:11px;color:#0f172a;"><b>WAYPOINT COMMAND</b><br/>Lat: ${lat.toFixed(4)}<br/>Lon: ${lng.toFixed(4)}</div>`).openPopup();
    });

    mapInstanceRef.current = map;

    // Resize ticks
    [50, 150, 300, 700].forEach(delay => {
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, delay);
    });

    // ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map center & sector bounds when activeSearchArea changes
  useEffect(() => {
    if (!mapInstanceRef.current || !activeSearchArea) return;
    const map = mapInstanceRef.current;
    const { lat, lng, zoom } = activeSearchArea;

    map.flyTo([lat, lng], zoom || 16, { duration: 1.2 });

    // Update search rectangle
    if (searchRectangleRef.current) {
      searchRectangleRef.current.setBounds([
        [lat - 0.006, lng - 0.007],
        [lat + 0.006, lng + 0.007]
      ]);
    }

    // Update emergency markers relative to new search area
    if (baseCampMarkerRef.current) {
      baseCampMarkerRef.current.setLatLng([lat - 0.004, lng - 0.004]);
    }
    if (hospitalMarkerRef.current) {
      hospitalMarkerRef.current.setLatLng([lat + 0.004, lng + 0.005]);
    }
    if (bloodBankMarkerRef.current) {
      bloodBankMarkerRef.current.setLatLng([lat - 0.004, lng + 0.005]);
    }

    if (droneMarkerRef.current) {
      droneMarkerRef.current.setLatLng([lat, lng]);
    }
  }, [activeSearchArea]);

  // Switch Tile Layer when layer button is toggled
  const switchLayer = (layerKey) => {
    setMapLayer(layerKey);
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerGroupRef.current) {
      map.removeLayer(tileLayerGroupRef.current);
    }

    const tileUrls = {
      satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      streets: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    };

    const newLayer = L.tileLayer(tileUrls[layerKey], {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    tileLayerGroupRef.current = newLayer;
    map.invalidateSize();
  };

  // Update Drone Marker when telemetry updates
  useEffect(() => {
    if (!droneMarkerRef.current || !mapInstanceRef.current) return;

    droneMarkerRef.current.setLatLng([telemetry.lat, telemetry.lng]);

    const iconHtml = `
      <div style="transform: rotate(${telemetry.heading}deg); transition: transform 0.4s ease;">
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="22" cy="22" r="18" stroke="#22c55e" stroke-width="2.5" stroke-dasharray="4 4"/>
          <polygon points="22,4 32,38 22,30 12,38" fill="#22c55e" stroke="#ffffff" stroke-width="2"/>
          <circle cx="22" cy="22" r="4.5" fill="#ffffff"/>
        </svg>
      </div>
    `;
    droneMarkerRef.current.setIcon(L.divIcon({
      className: 'drone-custom-icon',
      html: iconHtml,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    }));
  }, [telemetry.lat, telemetry.lng, telemetry.heading]);

  // Update Detection Markers & SOS Response route
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    detections.forEach((det) => {
      const isLocked = det.id === activeTargetId;
      const isHypo = det.bodyTemp < 35.0;
      const pulseColor = isHypo ? '#f59e0b' : '#ef4444';

      const markerHtml = `
        <div style="position:relative; width:40px; height:40px; cursor:pointer;">
          <div style="position:absolute; inset:0; border-radius:50%; background:${pulseColor}; opacity:0.4; animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="position:absolute; top:4px; left:4px; width:32px; height:32px; border-radius:50%; background:#ffffff; border:3px solid ${isLocked ? '#22c55e' : pulseColor}; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 10px rgba(0,0,0,0.3);">
            <span style="font-size:11px; font-weight:bold; color:#0f172a; font-family:monospace;">${det.id.replace('SAR-TRG-', 'T')}</span>
          </div>
        </div>
      `;

      if (detectionMarkersRef.current[det.id]) {
        detectionMarkersRef.current[det.id].setLatLng([det.lat, det.lng]);
        detectionMarkersRef.current[det.id].setIcon(L.divIcon({
          className: 'survivor-marker',
          html: markerHtml,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        }));
      } else {
        const marker = L.marker([det.lat, det.lng], {
          icon: L.divIcon({
            className: 'survivor-marker',
            html: markerHtml,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          })
        }).addTo(map);

        marker.on('click', () => {
          lockTarget(det.id);
        });

        marker.bindTooltip(
          `<b>${det.id} (${det.confidence}%)</b><br/>Temp: ${det.bodyTemp}°C<br/>${det.status}`,
          { direction: 'top', className: 'tactical-tooltip' }
        );

        detectionMarkersRef.current[det.id] = marker;
      }
    });

    // Draw emergency route lines if SOS is active
    if (sosState.isActive) {
      const target = detections.find(d => d.id === sosState.targetId) || detections[0];
      if (target) {
        if (sosRouteLineRef.current) {
          map.removeLayer(sosRouteLineRef.current);
        }

        const routePoints = [
          [telemetry.lat - 0.004, telemetry.lng - 0.004], // Base Camp
          [target.lat, target.lng] // Survivor
        ];
        const route = L.polyline(routePoints, {
          color: '#ef4444',
          weight: 4,
          dashArray: '6, 8',
          opacity: 0.9
        }).addTo(map).bindTooltip('EMERGENCY RESCUE CONVOY ENROUTE', { permanent: true, className: 'tactical-tooltip' });
        
        sosRouteLineRef.current = route;
      }
    }
  }, [detections, activeTargetId, lockTarget, sosState.isActive, sosState.targetId, telemetry.lat, telemetry.lng]);

  const recenterDrone = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo([telemetry.lat, telemetry.lng], { animate: true });
      mapInstanceRef.current.invalidateSize();
    }
  };

  // Perform area geocode search using OpenStreetMap Nominatim
  const handlePerformSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowDropdown(true);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=5`,
        {
          headers: {
            'User-Agent': 'AerosarDroneSARApp/1.0',
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.warn('Geocoding network error, relying on presets:', err);
      // Filter disaster presets that match query
      const matchingPresets = DISASTER_SEARCH_PRESETS.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.region.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(matchingPresets.map(p => ({
        display_name: `${p.name} (${p.region})`,
        lat: p.lat,
        lon: p.lng,
        isPreset: true,
        presetData: p
      })));
    } finally {
      setIsSearching(false);
    }
  };

  // Select a searched place or preset
  const handleSelectLocation = (loc) => {
    const lat = parseFloat(loc.lat);
    const lng = parseFloat(loc.lon || loc.lng);
    const name = loc.display_name?.split(',')[0] || loc.name || 'Target Search Area';

    searchAndFlyTo(name, lat, lng, 16);
    setSearchQuery(name);
    setShowDropdown(false);
  };

  // Select a predefined disaster hotspot preset
  const handleSelectPreset = (preset) => {
    searchAndFlyTo(preset.name, preset.lat, preset.lng, preset.zoom || 16, preset.category);
    setSearchQuery(preset.name);
    setShowDropdown(false);
  };

  // CAPTURE LIVE AREA RECON IMAGE
  const handleCaptureLiveArea = async () => {
    setIsCapturing(true);
    // Visual flash effect
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 350);

    const snapshot = await captureLiveAreaIntel(activeSearchArea.name);
    setIsCapturing(false);

    if (snapshot) {
      setCaptureToast(`📸 Aerial Intel Captured for ${activeSearchArea.name}!`);
      setTimeout(() => setCaptureToast(null), 3500);
      if (onOpenVaultModal) {
        onOpenVaultModal();
      }
    }
  };

  return (
    <div className="relative w-full h-full min-h-[420px] sm:min-h-[480px] bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
      
      {/* Visual Camera Shutter Flash Animation */}
      {flashEffect && (
        <div className="absolute inset-0 z-50 bg-white/80 pointer-events-none animate-pulse transition-opacity duration-300"></div>
      )}

      {/* Floating Success Toast */}
      {captureToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-xl bg-emerald-900/90 text-white border border-emerald-400 font-mono-code text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <Camera className="w-4 h-4 text-emerald-400" />
          <span>{captureToast}</span>
        </div>
      )}

      {/* 1. TOP TOOLBAR: Title, Layers & Capture Action Buttons */}
      <div className="bg-white border-b border-slate-200 px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 font-mono-code text-xs z-20">
        <div className="flex items-center gap-2 text-slate-900 font-bold">
          <MapIcon className="w-4 h-4 text-emerald-700" />
          <span className="font-chakra text-sm tracking-wide">TACTICAL RADAR & SAR MAP</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Tile Layer Selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
            <button
              onClick={() => switchLayer('satellite')}
              className={`px-2 py-1 rounded font-bold transition-all flex items-center gap-1 ${
                mapLayer === 'satellite'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Satellite className="w-3 h-3" />
              <span>SATELLITE</span>
            </button>

            <button
              onClick={() => switchLayer('streets')}
              className={`px-2 py-1 rounded font-bold transition-all ${
                mapLayer === 'streets'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              STREETS
            </button>

            <button
              onClick={() => switchLayer('light')}
              className={`px-2 py-1 rounded font-bold transition-all ${
                mapLayer === 'light'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              LIGHT
            </button>
          </div>

          {/* Re-center Drone */}
          <button
            onClick={recenterDrone}
            title="Center map on drone coordinates"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors"
          >
            <Crosshair className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">CENTER DRONE</span>
          </button>

          {/* 📸 CAPTURE LIVE AREA BUTTON */}
          <button
            onClick={handleCaptureLiveArea}
            disabled={isCapturing}
            title="Capture high-resolution aerial reconnaissance image of the live searched area"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all font-chakra tracking-wider"
          >
            {isCapturing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>CAPTURING...</span>
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
                <span>CAPTURE LIVE AREA</span>
              </>
            )}
          </button>

          {/* 📁 INTEL VAULT BUTTON */}
          {onOpenVaultModal && (
            <button
              onClick={onOpenVaultModal}
              title="Open Reconnaissance Intel Vault"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold transition-colors"
            >
              <FolderDown className="w-3.5 h-3.5 text-emerald-700" />
              <span>VAULT [{capturedIntel.length}]</span>
            </button>
          )}

        </div>
      </div>

      {/* 2. SEARCH AREA BAR WITH DISASTER PRESETS & NOMINATIM GEOCODING */}
      <div className="bg-slate-50 border-b border-slate-200 px-3.5 py-2 relative z-20">
        <form onSubmit={handlePerformSearch} className="flex items-center gap-2">
          
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search area (e.g. Houston Floods, Sierra Ridge, Mount Shasta, Paris, Tokyo)..."
              className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-mono-code text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-mono-code transition-colors flex items-center gap-1.5 shadow-sm"
          >
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">SEARCH</span>
          </button>

        </form>

        {/* Quick Disaster Hotspot Chips */}
        <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 text-[10px] font-mono-code">
          <span className="text-slate-500 font-bold whitespace-nowrap">QUICK ZONES:</span>
          {DISASTER_SEARCH_PRESETS.slice(0, 5).map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="px-2 py-0.5 rounded-full bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-300 hover:border-emerald-500 transition-colors whitespace-nowrap flex items-center gap-1 font-medium shadow-xs"
            >
              {preset.category === 'FLOOD' && <span>🌊</span>}
              {preset.category === 'WILDFIRE' && <span>🔥</span>}
              {preset.category === 'ALPINE_MEDEVAC' && <span>🏔️</span>}
              {preset.category === 'URBAN' && <span>🏙️</span>}
              <span>{preset.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Autocomplete / Geocoding Results Dropdown */}
        {showDropdown && (searchResults.length > 0 || searchQuery.length > 0) && (
          <div className="absolute top-full left-3.5 right-3.5 mt-1 bg-white rounded-xl shadow-2xl border border-slate-200 divide-y divide-slate-100 max-h-64 overflow-y-auto z-30 font-mono-code text-xs">
            <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-500 flex items-center justify-between">
              <span>SEARCH RESULTS</span>
              <button 
                type="button" 
                onClick={() => setShowDropdown(false)} 
                className="text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>

            {searchResults.map((result, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectLocation(result)}
                className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-start gap-2 text-slate-800 transition-colors group"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate text-slate-900">
                    {result.display_name?.split(',')[0]}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {result.display_name}
                  </div>
                  <div className="text-[9px] text-emerald-700 font-semibold mt-0.5">
                    LAT: {parseFloat(result.lat).toFixed(4)} | LON: {parseFloat(result.lon || result.lng).toFixed(4)}
                  </div>
                </div>
              </button>
            ))}

            {searchResults.length === 0 && !isSearching && (
              <div className="px-3 py-3 text-center text-slate-500 text-xs">
                No matching places found. Try typing a city or select a preset zone above.
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. MAP CANVAS with Guaranteed Responsive Layout */}
      <div 
        ref={mapContainerRef} 
        className="w-full flex-1 relative z-0" 
        style={{ minHeight: '340px', width: '100%', height: '100%' }}
      />

      {/* 4. BOTTOM MAP STATUS & CURRENT SEARCHED SECTOR BANNER */}
      <div className="bg-slate-50 border-t border-slate-200 px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-code text-slate-700 z-10">
        <div className="flex items-center gap-3 font-semibold">
          <span className="flex items-center gap-1.5 text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
            SECTOR: <span className="text-slate-900 font-bold">{activeSearchArea.name}</span>
          </span>
          <span className="hidden sm:inline text-slate-400">•</span>
          <span className="text-slate-600">
            ({telemetry.lat.toFixed(4)}°N, {Math.abs(telemetry.lng).toFixed(4)}°W)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-normal hidden md:inline">
            CLICK MAP TO ADD SEARCH WAYPOINT
          </span>
          <button
            onClick={handleCaptureLiveArea}
            className="px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold border border-emerald-300 transition-colors flex items-center gap-1"
          >
            <Camera className="w-3 h-3" />
            <span>SNAPSHOT LIVE AREA</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default TacticalMap;
