// ============================================
// Asset Map Page — GIS Interactive Mapping for Gujarat & Ahmedabad Infrastructure
// Apple Design System: Clean OSM & Satellite layers, Live GPS Geolocation,
// Deep linking focus navigation, High-contrast custom pins
// ============================================

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter, Layers, MapPin, AlertTriangle, RefreshCw,
  ChevronRight, X, Navigation, Compass, Crosshair, ExternalLink,
  Wrench, Calendar, DollarSign, Activity, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { cachedGet } from '../lib/api';
import { ASSET_CATEGORIES, ASSET_STATUSES, CONDITION_RATINGS } from '../lib/constants';
import { formatIndianCurrency } from '../lib/formatters';
import useThemeStore from '../store/themeStore';

// Fix Leaflet default marker asset paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom colored pin marker for GIS assets
const createPinIcon = (color, categoryIcon = '') => {
  return L.divIcon({
    className: 'rnb-custom-marker',
    html: `
      <div style="
        position: relative;
        width: 34px;
        height: 34px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid #ffffff;
        box-shadow: 0 4px 14px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.15s ease;
      ">
        <div style="
          transform: rotate(45deg);
          font-size: 14px;
          line-height: 1;
        ">
          ${categoryIcon || '•'}
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
};

// Pulsing Live User Location Marker
const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'user-live-gps-marker',
    html: `
      <div style="position: relative; width: 22px; height: 22px;">
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(0, 102, 204, 0.35);
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          position: absolute;
          inset: 2px;
          border-radius: 50%;
          background: #0066cc;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11],
  });
};

// Available Tile Layers for RnB Department (Streets & Satellite)
// Note: Carto dark canvas removed as requested due to broken API key requirements
const TILE_LAYERS = {
  streets: {
    name: 'Standard Streets',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  satellite: {
    name: 'Satellite Aerial',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; DigitalGlobe, GeoEye, Earthstar Geographics',
    maxZoom: 18,
  },
};

// Map controller for bounds, live location flyTo, and deep-link focus
function MapController({ assets, focusCoords, userLocation, hasInitialFitted }) {
  const map = useMap();

  // Deep-link focus handling
  useEffect(() => {
    if (focusCoords && focusCoords[0] && focusCoords[1]) {
      map.flyTo(focusCoords, 16, { duration: 1.2 });
    }
  }, [focusCoords, map]);

  // User live location flyTo
  useEffect(() => {
    if (userLocation) {
      map.flyTo(userLocation, 15, { duration: 1.2 });
    }
  }, [userLocation, map]);

  // Initial bounds fit
  useEffect(() => {
    if (!hasInitialFitted.current && assets.length > 0 && !focusCoords) {
      const validCoords = assets
        .filter(a => typeof a.latitude === 'number' && typeof a.longitude === 'number')
        .map(a => [a.latitude, a.longitude]);

      if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        hasInitialFitted.current = true;
      }
    }
  }, [assets, map, focusCoords, hasInitialFitted]);

  return null;
}

export default function MapPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isDark } = useThemeStore();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [colorMode, setColorMode] = useState('condition'); // 'condition' | 'category' | 'status'
  const [selectedLayer, setSelectedLayer] = useState('streets');
  const [filters, setFilters] = useState({ category: '', status: '', conditionRating: '' });
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Live User Location state
  const [userLocation, setUserLocation] = useState(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const hasInitialFitted = useRef(false);

  // Deep link query params
  const focusId = searchParams.get('focusId');
  const focusLat = searchParams.get('lat');
  const focusLng = searchParams.get('lng');

  const focusCoords = useMemo(() => {
    if (focusLat && focusLng) {
      return [parseFloat(focusLat), parseFloat(focusLng)];
    }
    return null;
  }, [focusLat, focusLng]);

  // Default coordinate center: Ahmedabad, Gujarat
  const AHMEDABAD_CENTER = [23.0225, 72.5714];

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.conditionRating) params.append('conditionRating', filters.conditionRating);

      const res = await cachedGet(`/assets/map/all?${params.toString()}`, {}, 20);
      const data = res.data.data || [];
      setAssets(data);

      // If deep linking with focusId, select that asset
      if (focusId) {
        const target = data.find(a => a.id === focusId);
        if (target) setSelectedAsset(target);
      }
    } catch (err) {
      console.error('Map fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [filters]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('');

  // Filter assets dynamically by search query and zone
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = (asset.name || '').toLowerCase().includes(q);
        const matchCode = (asset.assetCode || '').toLowerCase().includes(q);
        const matchAddr = (asset.address || '').toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchAddr) return false;
      }
      if (selectedZone) {
        const z = selectedZone.toLowerCase();
        const text = `${asset.zone || ''} ${asset.ward || ''} ${asset.address || ''} ${asset.name || ''}`.toLowerCase();
        let match = false;
        if (z === 'north west' || z === 'north-west') {
          match = text.includes('north west') || text.includes('thaltej') || text.includes('bodakdev') || text.includes('sg highway') || text.includes('sarkhej');
        } else if (z === 'west') {
          match = text.includes('west zone') || text.includes('navrangpura') || text.includes('paldi') || text.includes('usmanpura') || text.includes('ashram road');
        } else if (z === 'central') {
          match = text.includes('central') || text.includes('jamalpur') || text.includes('lal darwaja') || text.includes('ellis bridge') || text.includes('riverfront');
        } else if (z === 'north') {
          match = text.includes('north zone') || text.includes('subhash bridge') || text.includes('shahibaug') || text.includes('dudheshwar');
        } else if (z === 'south') {
          match = text.includes('south') || text.includes('narol') || text.includes('vatva') || text.includes('maninagar') || text.includes('raska');
        } else if (z === 'gandhinagar') {
          match = text.includes('gandhinagar') || text.includes('capital') || text.includes('kudasan') || text.includes('ch-');
        } else if (z === 'sanand') {
          match = text.includes('sanand') || text.includes('bol');
        } else {
          match = text.includes(z);
        }
        if (!match) return false;
      }
      return true;
    });
  }, [assets, searchQuery, selectedZone]);

  // Locate user GPS position
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
        setLocatingUser(false);
        toast.success('Centered on your live GPS location');
      },
      (err) => {
        setLocatingUser(false);
        toast.error(`Location error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Marker Color Resolver (Strict Semantic Colors)
  const getMarkerColor = (asset) => {
    if (colorMode === 'condition') {
      if (asset.conditionScore >= 80) return '#16a34a'; // Green
      if (asset.conditionScore >= 50) return '#d97706'; // Amber/Yellow
      return '#dc2626'; // Red
    }
    if (colorMode === 'category') {
      return ASSET_CATEGORIES[asset.category]?.color || '#d97706';
    }
    return ASSET_STATUSES[asset.status]?.color || '#64748b';
  };

  // Metrics summary
  const stats = useMemo(() => {
    const total = assets.length;
    const critical = assets.filter(a => a.conditionRating === 'CRITICAL' || a.conditionRating === 'POOR').length;
    const good = assets.filter(a => a.conditionRating === 'GOOD' || a.conditionRating === 'EXCELLENT').length;
    const byCategory = {};
    assets.forEach(a => {
      byCategory[a.category] = (byCategory[a.category] || 0) + 1;
    });
    return { total, critical, good, byCategory };
  }, [assets]);

  const activeTileConfig = TILE_LAYERS[selectedLayer] || TILE_LAYERS.streets;

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Gujarat GIS Infrastructure Map
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Geospatial tracking across Ahmedabad & Gujarat municipal circles ({filteredAssets.length} displayed of {stats.total})
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Layer Selector Pill */}
          <div className="inline-flex rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-[#1c1c1e] p-1 shadow-xs">
            {Object.entries(TILE_LAYERS).map(([key, layer]) => (
              <button
                key={key}
                onClick={() => setSelectedLayer(key)}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                  selectedLayer === key
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {layer.name}
              </button>
            ))}
          </div>

          {/* Locate Me GPS Button */}
          <button
            onClick={handleLocateMe}
            title="Locate my position (GPS)"
            className="btn-ghost flex items-center gap-1.5 text-xs py-1.5 font-semibold"
          >
            <Crosshair className={`w-3.5 h-3.5 text-amber-600 ${locatingUser ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Locate Me</span>
          </button>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-ghost text-xs flex items-center gap-1.5 py-1.5 font-semibold ${
              showFilters ? '!border-amber-500 !text-amber-600 dark:!text-amber-400' : ''
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
          </button>

          {/* Refresh */}
          <button
            onClick={fetchAssets}
            title="Refresh map telemetry"
            className="btn-ghost p-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick Filter Bar (Always Visible) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl glass-card">
        {/* Quick Filter Category Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => {
              setFilters({ ...filters, category: '', conditionRating: '', status: '' });
              setSelectedZone('');
              setSearchQuery('');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !filters.category && !filters.conditionRating && !filters.status && !selectedZone
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            All Assets ({stats.total})
          </button>

          <button
            onClick={() => setFilters({ ...filters, conditionRating: 'CRITICAL', category: '' })}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              filters.conditionRating === 'CRITICAL'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-900'
            }`}
          >
            <span>🚨 Critical Risks ({stats.critical})</span>
          </button>

          <button
            onClick={() => setFilters({ ...filters, category: 'BRIDGE', conditionRating: '' })}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              filters.category === 'BRIDGE'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-300'
            }`}
          >
            <span>🌉 Bridges & Flyovers</span>
          </button>

          <button
            onClick={() => setFilters({ ...filters, category: 'ROAD', conditionRating: '' })}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              filters.category === 'ROAD'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-300'
            }`}
          >
            <span>🛣️ Roads & Highways</span>
          </button>

          <button
            onClick={() => setFilters({ ...filters, category: 'WATER_PIPELINE', conditionRating: '' })}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              filters.category === 'WATER_PIPELINE'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-300'
            }`}
          >
            <span>💧 Water Pipelines</span>
          </button>
        </div>

        {/* Zone Dropdown & Search Input */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Zone Selector */}
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="input-field text-xs py-1.5 font-semibold cursor-pointer !w-auto"
          >
            <option value="">All Municipal Zones</option>
            <option value="Central">Central Ahmedabad</option>
            <option value="West">West Zone (Navrangpura/CG)</option>
            <option value="North">North Zone (Riverfront/Shahibaug)</option>
            <option value="North West">North-West (SG Highway)</option>
            <option value="Gandhinagar">Gandhinagar Capital Circle</option>
            <option value="South">South Zone (Narol/Vatva)</option>
            <option value="Sanand">Sanand Freight Corridor</option>
          </select>

          {/* Quick Search on Map */}
          <input
            type="text"
            placeholder="Search map assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field text-xs py-1.5 max-w-[170px]"
          />
        </div>
      </div>

      {/* Filter Ribbon */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-4"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="input-field text-xs py-1.5"
                >
                  <option value="">All Categories</option>
                  {Object.entries(ASSET_CATEGORIES).map(([k, v]) => (
                    <option key={k} value={k}>{v.icon} {v.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="input-field text-xs py-1.5"
                >
                  <option value="">All Statuses</option>
                  {Object.entries(ASSET_STATUSES).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Condition
                </label>
                <select
                  value={filters.conditionRating}
                  onChange={(e) => setFilters({ ...filters, conditionRating: e.target.value })}
                  className="input-field text-xs py-1.5"
                >
                  <option value="">All Conditions</option>
                  {Object.entries(CONDITION_RATINGS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Pin Scheme
                </label>
                <select
                  value={colorMode}
                  onChange={(e) => setColorMode(e.target.value)}
                  className="input-field text-xs py-1.5 font-semibold"
                >
                  <option value="condition">Condition (Traffic Light)</option>
                  <option value="category">Category</option>
                  <option value="status">Operational Status</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Map Viewport */}
      <div className="flex flex-col lg:flex-row gap-4" style={{ height: 'calc(100vh - 215px)', minHeight: 480 }}>
        {/* Map Container - Isolated stacking context so Leaflet tiles and panes never bleed over modals or header */}
        <div className="flex-1 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 relative z-0 isolate shadow-sm">
          {loading && (
            <div className="absolute inset-0 z-[1000] bg-white/70 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center">
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white dark:bg-[#1c1c1e] border border-black/10 dark:border-white/10 shadow-lg text-xs font-semibold text-slate-800 dark:text-white">
                <RefreshCw className="w-4 h-4 animate-spin text-primary-500" />
                Updating Gujarat infrastructure GIS...
              </div>
            </div>
          )}

          <MapContainer
            center={AHMEDABAD_CENTER}
            zoom={12}
            style={{ height: '100%', width: '100%', background: isDark ? '#161617' : '#f5f5f7' }}
            zoomControl={false}
          >
            <TileLayer
              key={selectedLayer}
              attribution={activeTileConfig.attribution}
              url={activeTileConfig.url}
              maxZoom={activeTileConfig.maxZoom}
            />

            <MapController
              assets={filteredAssets}
              focusCoords={focusCoords}
              userLocation={userLocation}
              hasInitialFitted={hasInitialFitted}
            />

            {/* User Live GPS Marker */}
            {userLocation && (
              <Marker position={userLocation} icon={createUserLocationIcon()}>
                <Popup>
                  <div className="p-2 text-center">
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      📍 Your Live Location
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      GPS fix: {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Asset GIS Markers */}
            {filteredAssets.map((asset) => {
              const markerColor = getMarkerColor(asset);
              const categoryIcon = ASSET_CATEGORIES[asset.category]?.icon || '📍';

              return (
                <Marker
                  key={asset.id}
                  position={[asset.latitude, asset.longitude]}
                  icon={createPinIcon(markerColor, categoryIcon)}
                  eventHandlers={{
                    click: () => setSelectedAsset(asset),
                  }}
                >
                  <Popup>
                    <div className="p-3 min-w-[220px]">
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-black/5 dark:border-white/10">
                        <span className="text-xl">{categoryIcon}</span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
                            {asset.name}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            {asset.assetCode}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10">
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 block mb-0.5">Condition</span>
                          <span
                            className="text-xs font-bold"
                            style={{ color: CONDITION_RATINGS[asset.conditionRating]?.color || '#34c759' }}
                          >
                            {asset.conditionRating} ({asset.conditionScore}%)
                          </span>
                        </div>

                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10">
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 block mb-0.5">Status</span>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {ASSET_STATUSES[asset.status]?.label || asset.status}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/assets/${asset.id}`)}
                        className="btn-primary w-full text-xs py-1.5 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Inspect Details
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Floating Category Pills on Top-Right */}
          <div className="absolute top-3 right-3 z-[1000] flex flex-wrap gap-1.5 max-w-sm justify-end pointer-events-none">
            {Object.entries(stats.byCategory).slice(0, 4).map(([cat, count]) => (
              <div
                key={cat}
                className="glass-card px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-100 shadow-sm flex items-center gap-1.5 pointer-events-auto rounded-full"
              >
                <span>{ASSET_CATEGORIES[cat]?.icon}</span>
                <span>{count}</span>
              </div>
            ))}
          </div>

          {/* Floating Color Legend on Bottom-Left */}
          <div className="absolute bottom-3 left-3 z-[1000] glass-card p-3 max-w-[210px] shadow-lg rounded-2xl">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
              Legend ({colorMode})
            </p>
            <div className="space-y-1.5">
              {colorMode === 'condition' && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#34c759]" />
                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">Good / Excellent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff9500]" />
                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">Fair / Warning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff3b30]" />
                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">Poor / Critical</span>
                  </div>
                </>
              )}
              {colorMode === 'category' && Object.entries(ASSET_CATEGORIES).slice(0, 4).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: v.color }} />
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">{v.label}</span>
                </div>
              ))}
              {colorMode === 'status' && Object.entries(ASSET_STATUSES).slice(0, 3).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: v.color }} />
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">{v.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Asset Slide-out Card with Comprehensive Civil Data */}
        {selectedAsset && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-88 glass-card p-4 overflow-y-auto shrink-0 shadow-lg flex flex-col justify-between rounded-2xl"
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wide">
                    Live Asset Telemetry
                  </span>
                </div>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {selectedAsset.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono font-bold text-slate-500 bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded">
                    {selectedAsset.assetCode}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {selectedAsset.ward || selectedAsset.zone || 'Ahmedabad Circle'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {selectedAsset.address || 'Ahmedabad Metropolitan Region'}
                </p>
              </div>

              {/* Status & Category Badges */}
              <div className="flex flex-wrap gap-1.5">
                <span className="badge badge-info">
                  {ASSET_CATEGORIES[selectedAsset.category]?.label || selectedAsset.category}
                </span>
                <span
                  className="badge"
                  style={{
                    backgroundColor: `${CONDITION_RATINGS[selectedAsset.conditionRating]?.color}15`,
                    color: CONDITION_RATINGS[selectedAsset.conditionRating]?.color,
                    border: `1px solid ${CONDITION_RATINGS[selectedAsset.conditionRating]?.color}30`,
                  }}
                >
                  {selectedAsset.conditionRating}
                </span>
                <span className="badge badge-warning">
                  {ASSET_STATUSES[selectedAsset.status]?.label || selectedAsset.status}
                </span>
              </div>

              {/* Condition Health Score Bar */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Health Condition Index</span>
                  <span className="font-bold font-mono" style={{ color: CONDITION_RATINGS[selectedAsset.conditionRating]?.color || '#16a34a' }}>
                    {selectedAsset.conditionScore || 80}/100
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${selectedAsset.conditionScore || 80}%`,
                      backgroundColor: CONDITION_RATINGS[selectedAsset.conditionRating]?.color || '#16a34a',
                    }}
                  />
                </div>
              </div>

              {/* Financial Valuation Metrics */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-amber-500" /> Capital Valuation:
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatIndianCurrency(selectedAsset.purchaseCost || 0)}
                  </span>
                </div>
                {selectedAsset.currentValue > 0 && (
                  <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                    <span>Current Book Value:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {formatIndianCurrency(selectedAsset.currentValue)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 pt-1 border-t border-black/5 dark:border-white/10">
                  <span>Criticality Classification:</span>
                  <span className="font-bold text-amber-500">Tier {selectedAsset.criticality || 3} of 5</span>
                </div>
              </div>

              {/* Operational Metadata & Assigned Officer */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Officer In-Charge:</span>
                  <span className="font-semibold">{selectedAsset.createdBy?.name || 'R&B Executive Staff'}</span>
                </div>
                {selectedAsset.installDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Commission Year:</span>
                    <span className="font-semibold">{new Date(selectedAsset.installDate).getFullYear()}</span>
                  </div>
                )}
                {selectedAsset.workOrders && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Active Work Orders:</span>
                    <span className={`font-bold ${selectedAsset.workOrders.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}`}>
                      {selectedAsset.workOrders.length} active
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">GPS Coordinates:</span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {selectedAsset.latitude?.toFixed(4)}, {selectedAsset.longitude?.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-black/5 dark:border-white/10 flex flex-col gap-2 mt-3">
              <button
                onClick={() => navigate(`/assets/${selectedAsset.id}`)}
                className="btn-primary w-full text-xs py-2 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                Inspect Complete Profile & Audit
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/work-orders?assetId=${selectedAsset.id}`)}
                  className="btn-ghost flex-1 text-xs py-2 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Wrench className="w-3 h-3 text-amber-500" />
                  Work Orders
                </button>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedAsset.latitude},${selectedAsset.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost flex-1 text-xs py-2 flex items-center justify-center gap-1"
                >
                  Google Maps
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
