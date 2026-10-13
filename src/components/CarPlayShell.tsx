import React from 'react';
import { CarPlayView, ThemeId, UserCarPlaySettings } from '../types';
import { THEME_CONFIGS } from '../utils/themeConfig';
import { soundSys } from '../utils/audioSynth';

interface CarPlayShellProps {
  currentView: CarPlayView;
  onChangeView: (view: CarPlayView) => void;
  theme: ThemeId;
  settings: UserCarPlaySettings;
  children: React.ReactNode;
  onOpenRoutePlanner: () => void;
  onOpenCustomizer: () => void;
  isDriving: boolean;
  onToggleDriving: () => void;
  simSpeed: number;
  onChangeSimSpeed: (s: number) => void;
}

export const CarPlayShell: React.FC<CarPlayShellProps> = ({
  currentView,
  onChangeView,
  theme,
  settings,
  children,
  onOpenRoutePlanner,
  onOpenCustomizer,
  isDriving,
  onToggleDriving,
  simSpeed,
  onChangeSimSpeed
}) => {
  const currentTheme = THEME_CONFIGS[theme];
  const [currentTime, setCurrentTime] = React.useState<string>('12:48');

  // Clock update
  React.useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleNavClick = (v: CarPlayView) => {
    soundSys.playClick();
    onChangeView(v);
  };

  return (
    <div className="relative w-screen h-screen bg-black flex overflow-hidden select-none">
      {/* ----------------- CARPLAY LEFT DOCK ----------------- */}
      <aside 
        className="w-16 md:w-20 h-full flex flex-col justify-between items-center py-4 px-2 border-r z-30 shrink-0 backdrop-blur-2xl transition-all"
        style={{ 
          backgroundColor: 'rgba(5, 5, 10, 0.95)',
          borderColor: currentTheme.borderGlow 
        }}
      >
        {/* Top: CarPlay Clock & Connectivity */}
        <div className="flex flex-col items-center gap-1">
          <span className="font-hud font-bold text-sm md:text-base text-white tracking-tight tabular-nums">
            {currentTime}
          </span>
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <span className="font-bold text-emerald-400">5G</span>
            <span>📶</span>
          </div>
          <div className="w-4 h-2 rounded border border-slate-500 flex items-center p-0.5">
            <div className="w-full h-full bg-emerald-400 rounded-xs" />
          </div>
        </div>

        {/* Center: Quick App Switcher Icons */}
        <nav className="flex flex-col items-center gap-3 my-auto">
          {/* 1. Full Nav Map */}
          <button
            onClick={() => handleNavClick('nav')}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              currentView === 'nav' 
                ? 'shadow-lg scale-105 border-2 border-white text-white' 
                : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10'
            }`}
            style={{
              backgroundColor: currentView === 'nav' ? currentTheme.primaryColor : undefined
            }}
            title="Tam Ekran Harita"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </button>

          {/* 2. Split Screen Dashboard */}
          <button
            onClick={() => handleNavClick('split')}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              currentView === 'split' 
                ? 'shadow-lg scale-105 border-2 border-white text-white' 
                : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10'
            }`}
            style={{
              backgroundColor: currentView === 'split' ? currentTheme.primaryColor : undefined
            }}
            title="CarPlay Çoklu Gösterge (Split-View)"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>

          {/* 3. Cockpit Cluster */}
          <button
            onClick={() => handleNavClick('cluster')}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              currentView === 'cluster' 
                ? 'shadow-lg scale-105 border-2 border-white text-white' 
                : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10'
            }`}
            style={{
              backgroundColor: currentView === 'cluster' ? currentTheme.primaryColor : undefined
            }}
            title="Dijital Kokpit & Göstergeler"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>

          {/* 4. GTA Radio Player */}
          <button
            onClick={() => handleNavClick('radio')}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              currentView === 'radio' 
                ? 'shadow-lg scale-105 border-2 border-white text-white' 
                : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10'
            }`}
            style={{
              backgroundColor: currentView === 'radio' ? currentTheme.primaryColor : undefined
            }}
            title="GTA Radyo Sistemi"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </button>

          {/* 5. Arcade Games */}
          <button
            onClick={() => handleNavClick('arcade')}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              currentView === 'arcade' 
                ? 'shadow-lg scale-105 border-2 border-white text-white' 
                : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10'
            }`}
            style={{
              backgroundColor: currentView === 'arcade' ? currentTheme.primaryColor : undefined
            }}
            title="Arcade Oyunlar"
          >
            <span className="text-xl">🎮</span>
          </button>

          {/* 6. YouTube Streaming Video Hub */}
          <button
            onClick={() => handleNavClick('media')}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              currentView === 'media' 
                ? 'shadow-lg scale-105 border-2 border-white text-white' 
                : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10'
            }`}
            style={{
              backgroundColor: currentView === 'media' ? currentTheme.primaryColor : undefined
            }}
            title="YouTube İzleme Modu"
          >
            <svg className="w-6 h-6 text-rose-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </button>

          {/* 7. CarPlay Web Browser */}
          <button
            onClick={() => handleNavClick('browser')}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              currentView === 'browser' 
                ? 'shadow-lg scale-105 border-2 border-white text-white' 
                : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10'
            }`}
            style={{
              backgroundColor: currentView === 'browser' ? currentTheme.primaryColor : undefined
            }}
            title="CarPlay Güvenli İnternet Tarayıcısı"
          >
            <svg className="w-6 h-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </button>
        </nav>

        {/* Bottom: Customizer & Home */}
        <div className="flex flex-col items-center gap-3">
          {/* Customizer */}
          <button
            onClick={() => {
              soundSys.playClick();
              onOpenCustomizer();
            }}
            className="w-11 h-11 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 flex items-center justify-center text-lg active:scale-95"
            title="Temalar ve Araç Özelleştirme"
          >
            🎨
          </button>

          {/* CarPlay Home Button */}
          <button
            onClick={() => handleNavClick('split')}
            className="w-11 h-11 rounded-2xl bg-slate-900 border-2 border-white/30 hover:border-white text-white flex items-center justify-center active:scale-95 shadow-md"
            title="CarPlay Ana Ekran"
          >
            <div className="w-4 h-4 rounded-full border-2 border-white" />
          </button>
        </div>
      </aside>

      {/* ----------------- MAIN VIEWPORT CONTAINER ----------------- */}
      <main className="flex-1 h-full relative flex flex-col overflow-hidden bg-black">
        {/* Top Ambient Bar with Quick Drive Controls */}
        <header className="h-14 px-4 border-b border-white/10 bg-slate-950/80 backdrop-blur-md flex items-center justify-between shrink-0 z-30">
          {/* Left: Driver Badge & License Plate */}
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 font-hud font-black text-xs text-amber-400 tracking-wider">
              {settings.licensePlate}
            </span>
            <span className="text-xs font-hud font-bold text-slate-300 hidden sm:inline">
              {settings.driverName}
            </span>
            <span className="text-slate-600 hidden sm:inline">/</span>
            <span className="text-xs font-hud text-slate-400 hidden sm:inline uppercase">
              {currentTheme.name}
            </span>
          </div>

          {/* Center / Right: Driving Simulation Controls & Route Button */}
          <div className="flex items-center gap-2">
            {/* Speed Multiplier */}
            <div className="hidden md:flex items-center gap-1 p-1 bg-black/60 rounded-xl border border-white/10 text-xs font-hud">
              {[1, 2, 5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => onChangeSimSpeed(spd)}
                  className={`px-2 py-0.5 rounded-lg transition-colors ${
                    simSpeed === spd ? 'bg-white text-black font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Toggle Drive Simulation */}
            <button
              onClick={onToggleDriving}
              className={`px-3 md:px-4 py-2 rounded-xl text-xs font-hud font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shadow-lg ${
                isDriving 
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <span>{isDriving ? '⏹ SÜRÜŞÜ DURDUR' : '▶ TEST SÜRÜŞÜ BAŞLAT'}</span>
            </button>

            {/* Open Route Planner */}
            <button
              onClick={() => {
                soundSys.playClick();
                onOpenRoutePlanner();
              }}
              className="px-3 md:px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-hud font-bold text-white flex items-center gap-1.5 active:scale-95 transition-all shadow"
            >
              <span>📍 YENİ ROTA</span>
            </button>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 w-full h-[calc(100%-3.5rem)] relative overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};
