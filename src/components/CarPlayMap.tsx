import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { GtaLocation, RouteAlternative, VehicleModel, DriveTelemetry, WeatherState, WeatherCondition } from '../types';
import { THEME_CONFIGS } from '../utils/themeConfig';
import { ThemeId } from '../types';
import { VEHICLE_SPECS, SPEED_TRAPS } from '../data/gtaLocations';
import { WeatherOverlay } from './WeatherOverlay';

interface CarPlayMapProps {
  currentPos: [number, number];
  bearing: number;
  activeRoute: RouteAlternative | null;
  origin: GtaLocation;
  destination: GtaLocation;
  allLocations: GtaLocation[];
  theme: ThemeId;
  vehicle: VehicleModel;
  telemetry: DriveTelemetry;
  isDriving: boolean;
  weather: WeatherState;
  onToggleWipers?: () => void;
  onChangeWeather?: (condition: WeatherCondition) => void;
  onSelectLocation?: (loc: GtaLocation) => void;
  speedLimitAlert?: boolean;
}

export const CarPlayMap: React.FC<CarPlayMapProps> = ({
  currentPos,
  bearing,
  activeRoute,
  origin,
  destination,
  allLocations,
  theme,
  vehicle,
  telemetry,
  isDriving,
  weather,
  onToggleWipers,
  onChangeWeather,
  onSelectLocation
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const vehicleMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const routeGlowPolylineRef = useRef<L.Polyline | null>(null);
  const poiLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const currentTheme = THEME_CONFIGS[theme];
  const vehicleSpec = VEHICLE_SPECS[vehicle];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: currentPos,
        zoom: 15,
        zoomControl: false,
        attributionControl: false
      });

      // CartoDB Dark Matter tiles (sleek, high-contrast, night automotive style)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      poiLayerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Recenter map on currentPos
  useEffect(() => {
    if (mapInstanceRef.current) {
      if (isDriving) {
        mapInstanceRef.current.panTo(currentPos, { animate: true, duration: 0.4 });
      }
    }
  }, [currentPos, isDriving]);

  // Update vehicle marker with rotation
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const carHtml = `
      <div style="transform: rotate(${bearing}deg); transition: transform 0.25s linear;" class="relative flex items-center justify-center w-12 h-12">
        <!-- Vehicle Pulse Halo -->
        <div class="absolute inset-0 rounded-full animate-ping opacity-25" style="background-color: ${currentTheme.primaryColor}"></div>
        <!-- Vehicle Body -->
        <div class="relative w-9 h-9 rounded-xl flex items-center justify-center shadow-xl border-2" 
             style="background: linear-gradient(135deg, ${vehicleSpec.color}, #0f172a); border-color: ${currentTheme.secondaryColor}; box-shadow: 0 0 15px ${currentTheme.primaryColor}88;">
          <svg class="w-6 h-6 text-white drop-shadow" viewBox="0 0 24 24" fill="currentColor">
            <!-- Sleek Sports Car Vector -->
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
          <!-- Headlight beams when driving -->
          <div class="absolute -top-3 w-7 h-5 bg-gradient-to-t from-yellow-300/60 to-transparent blur-xs pointer-events-none rounded-t-full"></div>
        </div>
      </div>
    `;

    const icon = L.divIcon({
      html: carHtml,
      className: 'car-custom-icon',
      iconSize: [48, 48],
      iconAnchor: [24, 24]
    });

    if (!vehicleMarkerRef.current) {
      vehicleMarkerRef.current = L.marker(currentPos, { icon, zIndexOffset: 1000 }).addTo(mapInstanceRef.current);
    } else {
      vehicleMarkerRef.current.setLatLng(currentPos);
      vehicleMarkerRef.current.setIcon(icon);
    }
  }, [currentPos, bearing, vehicle, theme, isDriving]);

  // Update Route Polyline
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (routePolylineRef.current) {
      mapInstanceRef.current.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }
    if (routeGlowPolylineRef.current) {
      mapInstanceRef.current.removeLayer(routeGlowPolylineRef.current);
      routeGlowPolylineRef.current = null;
    }

    if (activeRoute && activeRoute.coordinates.length > 0) {
      // Outer glow line
      routeGlowPolylineRef.current = L.polyline(activeRoute.coordinates, {
        color: currentTheme.primaryColor,
        weight: 11,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(mapInstanceRef.current);

      // Core route line
      routePolylineRef.current = L.polyline(activeRoute.coordinates, {
        color: currentTheme.routeColor,
        weight: 6,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(mapInstanceRef.current);

      if (!isDriving) {
        mapInstanceRef.current.fitBounds(routePolylineRef.current.getBounds(), {
          padding: [60, 60],
          maxZoom: 16
        });
      }
    }
  }, [activeRoute, theme]);

  // Update POI blips and speed traps
  useEffect(() => {
    if (!mapInstanceRef.current || !poiLayerGroupRef.current) return;
    poiLayerGroupRef.current.clearLayers();

    // 1. Origin Marker
    const originIcon = L.divIcon({
      html: `
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 border-2 border-white text-black font-hud font-bold text-xs shadow-lg">
          A
        </div>
      `,
      className: 'poi-origin',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    L.marker([origin.lat, origin.lng], { icon: originIcon }).addTo(poiLayerGroupRef.current)
      .bindPopup(`<b style="font-family: 'Chakra Petch'">${origin.name}</b><br><span style="font-size:11px">${origin.district}</span>`);

    // 2. Destination Marker (GTA Iconic Blip)
    const destIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center w-10 h-10">
          <div class="absolute inset-0 rounded-full animate-ping opacity-50" style="background-color: ${currentTheme.accentColor}"></div>
          <div class="relative w-8 h-8 rounded-full flex items-center justify-center font-hud font-black text-xs text-black border-2 border-white shadow-2xl" style="background-color: ${currentTheme.accentColor}">
            ★
          </div>
        </div>
      `,
      className: 'poi-destination',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
    L.marker([destination.lat, destination.lng], { icon: destIcon }).addTo(poiLayerGroupRef.current)
      .bindPopup(`<b style="font-family: 'Chakra Petch'">${destination.name}</b><br><span style="font-size:11px">${destination.district}</span>`);

    // 3. Other POIs
    allLocations.forEach((loc) => {
      if (loc.id === origin.id || loc.id === destination.id) return;
      const getPoiBadge = () => {
        if (loc.type === 'spray') return { label: '🔧', bg: '#f59e0b', text: 'Pay \'n\' Spray' };
        if (loc.type === 'ammu') return { label: '🎯', bg: '#ef4444', text: 'Ammu-Nation' };
        if (loc.type === 'safehouse') return { label: '🏠', bg: '#3b82f6', text: 'Sığınak' };
        if (loc.type === 'race') return { label: '🏁', bg: '#8b5cf6', text: 'Yarış Noktası' };
        if (loc.type === 'airport') return { label: '✈️', bg: '#06b6d4', text: 'Havalimanı' };
        return { label: '📍', bg: '#64748b', text: 'Nokta' };
      };
      const badge = getPoiBadge();

      const poiIcon = L.divIcon({
        html: `
          <div class="flex items-center justify-center w-7 h-7 rounded-lg border border-white/60 text-xs shadow-md" style="background-color: ${badge.bg};">
            ${badge.label}
          </div>
        `,
        className: 'poi-item',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const m = L.marker([loc.lat, loc.lng], { icon: poiIcon }).addTo(poiLayerGroupRef.current!);
      m.on('click', () => {
        if (onSelectLocation) onSelectLocation(loc);
      });
      m.bindPopup(`<b style="font-family: 'Chakra Petch'">${loc.name}</b><br><span style="font-size:11px; color:#cbd5e1">${loc.description}</span>`);
    });

    // 4. Speed Traps (Radar Cameras)
    SPEED_TRAPS.forEach((trap) => {
      const trapIcon = L.divIcon({
        html: `
          <div class="flex items-center justify-center w-7 h-7 rounded-full bg-rose-600 border border-white text-white font-hud font-bold text-[10px] shadow-lg animate-pulse">
            📷
          </div>
        `,
        className: 'poi-trap',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
      L.marker([trap.lat, trap.lng], { icon: trapIcon }).addTo(poiLayerGroupRef.current!)
        .bindPopup(`<b>${trap.name}</b><br><span style="color:#ef4444;font-weight:bold">Hız Limiti: ${trap.limit} km/s</span>`);
    });
  }, [allLocations, origin, destination, currentTheme]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(currentPos, 16, { animate: true });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  return (
    <div className={`relative w-full h-full overflow-hidden theme-${theme}`}>
      {/* Leaflet DOM container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Dynamic Weather Particle & Atmosphere Overlay */}
      <WeatherOverlay weather={weather} theme={theme} showWipers={weather.wipersActive} />

      {/* GTA Radar CRT Scanline & Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.65)_100%)] z-10" />

      {/* Weather Info & Quick Toggle Pill (Top Left of Map) */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5">
        <div 
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl backdrop-blur-md border shadow-lg font-hud text-xs text-white"
          style={{ 
            backgroundColor: currentTheme.panelBg,
            borderColor: currentTheme.borderGlow 
          }}
        >
          <span className="text-base">{weather.icon}</span>
          <span className="font-bold">{weather.tempCelsius}°C</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-200 truncate">{weather.label}</span>

          {/* Wiper toggle button if rain */}
          {(weather.condition === 'rain' || weather.condition === 'thunderstorm') && onToggleWipers && (
            <button
              onClick={onToggleWipers}
              className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                weather.wipersActive ? 'bg-sky-500 text-black border-sky-300' : 'bg-white/10 text-slate-300 border-white/20'
              }`}
              title="Ön Cam Sileceklerini Aç/Kapat"
            >
              🌧️ SİLECEK: {weather.wipersActive ? 'AÇIK' : 'KAPALI'}
            </button>
          )}
        </div>

        {/* Quick weather selector buttons */}
        {onChangeWeather && (
          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 self-start">
            {[
              { cond: 'sunny' as WeatherCondition, icon: '☀️', name: 'Güneş' },
              { cond: 'sunset_haze' as WeatherCondition, icon: '🌆', name: 'Haze' },
              { cond: 'fog' as WeatherCondition, icon: '🌫️', name: 'Sis' },
              { cond: 'rain' as WeatherCondition, icon: '🌧️', name: 'Yağmur' },
              { cond: 'thunderstorm' as WeatherCondition, icon: '⛈️', name: 'Fırtına' }
            ].map(w => (
              <button
                key={w.cond}
                onClick={() => onChangeWeather(w.cond)}
                className={`px-2 py-1 rounded-lg text-[10px] font-hud transition-colors ${
                  weather.condition === w.cond ? 'bg-white text-black font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title={w.name}
              >
                {w.icon}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Top Right Map Floating Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        {/* Recenter Button */}
        <button
          onClick={handleRecenter}
          title="Araca Odaklan"
          className="w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20 text-white shadow-xl active:scale-95 transition-transform"
          style={{ backgroundColor: currentTheme.panelBg }}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          title="Yakınlaştır"
          className="w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20 text-white shadow-xl font-hud font-bold text-xl active:scale-95 transition-transform"
          style={{ backgroundColor: currentTheme.panelBg }}
        >
          +
        </button>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          title="Uzaklaştır"
          className="w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20 text-white shadow-xl font-hud font-bold text-xl active:scale-95 transition-transform"
          style={{ backgroundColor: currentTheme.panelBg }}
        >
          -
        </button>
      </div>

      {/* Compass Needle */}
      <div className="absolute bottom-6 right-4 z-20 flex flex-col items-center">
        <div 
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center shadow-lg backdrop-blur-md text-[11px] font-hud font-bold"
          style={{ 
            backgroundColor: currentTheme.panelBg,
            transform: `rotate(${-bearing}deg)`,
            transition: 'transform 0.25s linear'
          }}
        >
          <span className="text-rose-500 font-black">N</span>
        </div>
      </div>

      {/* Speed trap alert notification banner if close */}
      {telemetry.speedKmh > 110 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600/95 text-white border border-rose-300 font-hud tracking-wide shadow-2xl animate-bounce text-sm">
          <span>⚠️</span>
          <span className="font-bold">RADAR UYARISI: HIZ SINIRINI AŞTINIZ! ({telemetry.speedKmh} km/s)</span>
        </div>
      )}
    </div>
  );
};
