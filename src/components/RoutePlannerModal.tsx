import React, { useState } from 'react';
import { GtaLocation, RouteAlternative, ThemeId } from '../types';
import { THEME_CONFIGS } from '../utils/themeConfig';
import { GTA_LOCATIONS } from '../data/gtaLocations';
import { generateRoutes } from '../utils/navigationEngine';
import { soundSys } from '../utils/audioSynth';

interface RoutePlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOrigin: GtaLocation;
  currentDest: GtaLocation;
  currentRoute: RouteAlternative | null;
  onSelectRoute: (route: RouteAlternative, origin: GtaLocation, dest: GtaLocation) => void;
  theme: ThemeId;
}

export const RoutePlannerModal: React.FC<RoutePlannerModalProps> = ({
  isOpen,
  onClose,
  currentOrigin,
  currentDest,
  currentRoute,
  onSelectRoute,
  theme
}) => {
  const currentTheme = THEME_CONFIGS[theme];
  const [selectedOrigin, setSelectedOrigin] = useState<GtaLocation>(currentOrigin);
  const [selectedDest, setSelectedDest] = useState<GtaLocation>(currentDest);
  const [activeCityFilter, setActiveCityFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRouteOption, setSelectedRouteOption] = useState<RouteAlternative | null>(currentRoute);

  // Generate alternatives based on current selections
  const routes = React.useMemo(() => {
    return generateRoutes(selectedOrigin, selectedDest);
  }, [selectedOrigin, selectedDest]);

  // Set default route option if not set
  React.useEffect(() => {
    if (routes.length > 0 && !selectedRouteOption) {
      setSelectedRouteOption(routes[0]);
    }
  }, [routes, selectedRouteOption]);

  if (!isOpen) return null;

  const filteredLocations = GTA_LOCATIONS.filter((loc) => {
    const matchesCity = activeCityFilter === 'All' || loc.city === activeCityFilter;
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          loc.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesSearch;
  });

  const handleStartNav = () => {
    soundSys.playCheckpoint();
    if (selectedRouteOption) {
      onSelectRoute(selectedRouteOption, selectedOrigin, selectedDest);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-4xl max-h-[92vh] rounded-3xl border p-4 md:p-8 backdrop-blur-2xl shadow-2xl flex flex-col justify-between overflow-hidden"
        style={{ 
          backgroundColor: currentTheme.panelBg,
          borderColor: currentTheme.borderGlow 
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div>
            <span className="text-[10px] font-hud uppercase tracking-widest text-slate-400">CARPLAY ROTA PLANLAYICI</span>
            <h2 className="text-xl md:text-2xl font-black font-hud text-white tracking-tight">
              YENİ ROTA & HEDEF SEÇİMİ
            </h2>
          </div>
          <button
            onClick={() => {
              soundSys.playClick();
              onClose();
            }}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white active:scale-95"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {/* Origin & Destination Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Origin */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-hud text-slate-400">
                <span>BAŞLANGIÇ NOKTASI (A)</span>
                <span className="text-emerald-400 font-bold">{selectedOrigin.city}</span>
              </div>
              <div className="font-hud font-bold text-lg text-white truncate">
                {selectedOrigin.name}
              </div>
              <div className="text-xs text-slate-300 truncate">
                {selectedOrigin.district} · {selectedOrigin.description}
              </div>
            </div>

            {/* Destination */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-hud text-slate-400">
                <span>VARIŞ HEDEFİ (B)</span>
                <span className="text-amber-400 font-bold">{selectedDest.city}</span>
              </div>
              <div className="font-hud font-bold text-lg text-white truncate">
                {selectedDest.name}
              </div>
              <div className="text-xs text-slate-300 truncate">
                {selectedDest.district} · {selectedDest.description}
              </div>
            </div>
          </div>

          {/* Quick POI & City Search Bar */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-hud font-bold text-slate-300 uppercase">
                HEDEF LİSTESİNDEN SEÇ:
              </span>

              {/* City filter tabs */}
              <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/10">
                {['All', 'Vice City', 'Los Santos', 'Istanbul'].map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      soundSys.playClick();
                      setActiveCityFilter(city);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-hud transition-colors ${
                      activeCityFilter === city 
                        ? 'bg-white text-black font-bold shadow' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {city === 'All' ? 'Tümü' : city}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {filteredLocations.map((loc) => {
                const isOrigin = loc.id === selectedOrigin.id;
                const isDest = loc.id === selectedDest.id;

                return (
                  <div
                    key={loc.id}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      isDest 
                        ? 'border-amber-400 bg-amber-950/40' 
                        : isOrigin 
                        ? 'border-emerald-400 bg-emerald-950/40' 
                        : 'border-white/10 bg-black/30 hover:bg-white/10'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-hud text-slate-400">
                        <span>{loc.city}</span>
                        <span className="uppercase">{loc.type}</span>
                      </div>
                      <div className="font-hud font-bold text-sm text-white truncate mt-1">
                        {loc.name}
                      </div>
                      <div className="text-[11px] text-slate-300 truncate">
                        {loc.district}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10">
                      <button
                        onClick={() => {
                          soundSys.playClick();
                          setSelectedOrigin(loc);
                        }}
                        className={`flex-1 py-1 rounded text-[10px] font-hud font-bold transition-all ${
                          isOrigin ? 'bg-emerald-500 text-black' : 'bg-white/10 text-slate-200 hover:bg-white/20'
                        }`}
                      >
                        {isOrigin ? '✓ Başlangıç' : 'A Yap'}
                      </button>
                      <button
                        onClick={() => {
                          soundSys.playClick();
                          setSelectedDest(loc);
                        }}
                        className={`flex-1 py-1 rounded text-[10px] font-hud font-bold transition-all ${
                          isDest ? 'bg-amber-400 text-black' : 'bg-white/10 text-slate-200 hover:bg-white/20'
                        }`}
                      >
                        {isDest ? '✓ Hedef' : 'B Yap'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Route Alternatives Selection */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <span className="text-xs font-hud font-bold text-slate-300 uppercase">
              ÖNERİLEN ROTA ALTERNATİFLERİ:
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {routes.map((rt) => {
                const isSelected = selectedRouteOption?.id === rt.id;
                return (
                  <div
                    key={rt.id}
                    onClick={() => {
                      soundSys.playClick();
                      setSelectedRouteOption(rt);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected 
                        ? 'border-white bg-white/15 shadow-xl scale-[1.01]' 
                        : 'border-white/10 bg-black/40 hover:bg-white/5 opacity-80'
                    }`}
                    style={{
                      borderColor: isSelected ? currentTheme.primaryColor : undefined
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-hud font-bold px-2 py-0.5 rounded text-black bg-white">
                          {rt.tag}
                        </span>
                        <span className="text-xs font-hud font-bold text-slate-400">
                          {rt.trafficDelayMin > 0 ? `+${rt.trafficDelayMin} dk Trafik` : 'Akıcı'}
                        </span>
                      </div>

                      <h4 className="font-hud font-black text-base text-white mt-2">
                        {rt.name}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 leading-snug">
                        {rt.summary}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between font-hud">
                      <span className="text-xl font-black text-white tabular-nums">
                        {rt.durationMin} <span className="text-xs font-normal text-slate-400">dakika</span>
                      </span>
                      <span className="text-sm font-bold text-slate-300 tabular-nums">
                        {rt.distanceKm} km
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between shrink-0 gap-4">
          <div className="text-xs font-hud text-slate-400">
            Seçilen Rota: <b className="text-white">{selectedRouteOption?.name || 'Seçilmedi'}</b> · Toplam: <b className="text-emerald-400">{selectedRouteOption?.durationMin} dk</b>
          </div>

          <button
            onClick={handleStartNav}
            className="px-8 py-3.5 rounded-2xl text-black font-hud font-black text-sm tracking-wide shadow-2xl active:scale-95 transition-all"
            style={{ backgroundColor: currentTheme.secondaryColor }}
          >
            NAVİGASYONU BAŞLAT 🏁
          </button>
        </div>
      </div>
    </div>
  );
};
