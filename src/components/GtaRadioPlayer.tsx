import React, { useState, useEffect } from 'react';
import { RadioStation, ThemeId } from '../types';
import { RADIO_STATIONS } from '../data/gtaLocations';
import { THEME_CONFIGS } from '../utils/themeConfig';
import { soundSys } from '../utils/audioSynth';

interface GtaRadioPlayerProps {
  currentStation: RadioStation;
  onChangeStation: (st: RadioStation) => void;
  theme: ThemeId;
  isCompact?: boolean;
}

export const GtaRadioPlayer: React.FC<GtaRadioPlayerProps> = ({
  currentStation,
  onChangeStation,
  theme,
  isCompact = false
}) => {
  const currentTheme = THEME_CONFIGS[theme];
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(80);

  // Auto start synth radio when station changes
  useEffect(() => {
    if (isPlaying) {
      soundSys.playRadioStatic();
      setTimeout(() => {
        soundSys.startRadioMusic(currentStation.bpm, currentStation.genre);
      }, 120);
    } else {
      soundSys.stopRadioMusic();
    }

    return () => {
      soundSys.stopRadioMusic();
    };
  }, [currentStation, isPlaying]);

  const togglePlay = () => {
    soundSys.playClick();
    if (isPlaying) {
      soundSys.stopRadioMusic();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      soundSys.startRadioMusic(currentStation.bpm, currentStation.genre);
    }
  };

  const nextStation = () => {
    soundSys.playRadioStatic();
    const curIdx = RADIO_STATIONS.findIndex(s => s.id === currentStation.id);
    const nextIdx = (curIdx + 1) % RADIO_STATIONS.length;
    onChangeStation(RADIO_STATIONS[nextIdx]);
  };

  const prevStation = () => {
    soundSys.playRadioStatic();
    const curIdx = RADIO_STATIONS.findIndex(s => s.id === currentStation.id);
    const prevIdx = (curIdx - 1 + RADIO_STATIONS.length) % RADIO_STATIONS.length;
    onChangeStation(RADIO_STATIONS[prevIdx]);
  };

  // Compact widget for CarPlay Split Screen
  if (isCompact) {
    return (
      <div 
        className="rounded-2xl border p-4 backdrop-blur-xl flex items-center justify-between gap-3 shadow-lg"
        style={{ 
          backgroundColor: currentTheme.panelBg,
          borderColor: currentTheme.borderGlow 
        }}
      >
        {/* Left: Station Vinyl/Cassette Icon */}
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/20 shadow"
          style={{ backgroundColor: currentStation.accentColor }}
        >
          <svg className={`w-6 h-6 text-white ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
        </div>

        {/* Center: Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-hud font-bold text-base text-white truncate">
              {currentStation.name}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-hud">
              {currentStation.frequency}
            </span>
          </div>
          <div className="text-xs text-slate-300 truncate">
            DJ {currentStation.dj} · {currentStation.genre}
          </div>
        </div>

        {/* Right: Quick Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button 
            onClick={prevStation}
            className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-white active:scale-95"
            title="Önceki İstasyon"
          >
            ⏮
          </button>
          <button 
            onClick={togglePlay}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow active:scale-95"
            style={{ backgroundColor: currentTheme.primaryColor }}
            title={isPlaying ? 'Durdur' : 'Çal'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button 
            onClick={nextStation}
            className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-white active:scale-95"
            title="Sonraki İstasyon"
          >
            ⏭
          </button>
        </div>
      </div>
    );
  }

  // Full Screen / Radio App Mode
  return (
    <div className="w-full h-full p-6 flex flex-col justify-between overflow-y-auto max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <span className="text-xs font-hud uppercase tracking-widest text-slate-400">GTA CARPLAY RADYO SİSTEMİ</span>
          <h2 className="text-2xl md:text-3xl font-black font-hud tracking-tight text-white">
            {currentTheme.gameTitle} RADYO İSTASYONLARI
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-hud px-3 py-1 rounded-full bg-white/10 border border-white/20 text-slate-200">
            STEREO FM TUNER
          </span>
        </div>
      </div>

      {/* Main Tuner Box & Cassette Deck Visualizer */}
      <div 
        className="my-6 rounded-3xl border p-6 md:p-8 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
        style={{ 
          backgroundColor: currentTheme.panelBg,
          borderColor: currentTheme.borderGlow 
        }}
      >
        {/* Ambient Glow */}
        <div 
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-25 pointer-events-none"
          style={{ backgroundColor: currentStation.accentColor }}
        />

        {/* Cassette / Turntable Graphic */}
        <div className="relative shrink-0 flex flex-col items-center">
          <div 
            className="w-48 h-48 md:w-56 md:h-56 rounded-full border-4 border-white/20 flex items-center justify-center shadow-2xl relative"
            style={{ 
              background: `radial-gradient(circle, #1e1b4b 20%, #030712 80%)`,
              boxShadow: `0 0 35px ${currentStation.accentColor}66`
            }}
          >
            {/* Spinning Groove Lines */}
            <div className={`absolute inset-4 rounded-full border border-dashed border-white/20 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
            <div className={`absolute inset-10 rounded-full border border-white/10 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
            
            {/* Center Station Sticker */}
            <div 
              className="w-24 h-24 rounded-full flex flex-col items-center justify-center text-center p-2 text-white font-hud shadow-inner"
              style={{ backgroundColor: currentStation.accentColor }}
            >
              <span className="text-[10px] font-bold tracking-widest leading-none">GTA FM</span>
              <span className="text-xs font-black leading-tight">{currentStation.name}</span>
              <span className="text-[9px] opacity-80">{currentStation.frequency}</span>
            </div>
          </div>

          {/* Equalizer Waveform Bars */}
          <div className="flex items-end gap-1.5 mt-4 h-8">
            {[40, 75, 95, 60, 85, 100, 70, 50, 90, 65, 80, 45].map((h, i) => (
              <div 
                key={i}
                className="w-1.5 rounded-full transition-all duration-200"
                style={{ 
                  height: isPlaying ? `${Math.max(15, Math.round(h * Math.random()))}%` : '20%',
                  backgroundColor: currentStation.accentColor
                }}
              />
            ))}
          </div>
        </div>

        {/* Station Details & Player Controls */}
        <div className="flex-1 flex flex-col justify-between w-full">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-lg text-xs font-hud font-bold text-white uppercase shadow" style={{ backgroundColor: currentStation.accentColor }}>
                {currentStation.frequency}
              </span>
              <span className="text-xs font-hud text-slate-400 uppercase tracking-wider">
                CANLI YAYIN FREKANSI
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black font-hud text-white mt-2 tracking-tight">
              {currentStation.name}
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-1">
              {currentStation.tagline}
            </p>

            <div className="mt-4 flex flex-wrap gap-4 text-xs font-hud text-slate-300">
              <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                🎙️ SUNUCU: <span className="text-white font-bold">{currentStation.dj}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                🎸 TÜR: <span className="text-white font-bold">{currentStation.genre}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                ⚡ TEMPO: <span className="text-white font-bold">{currentStation.bpm} BPM</span>
              </div>
            </div>
          </div>

          {/* Audio Controls Bar */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={prevStation}
                className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white text-lg active:scale-95 transition-all shadow"
                title="Önceki İstasyon"
              >
                ⏮
              </button>

              <button
                onClick={togglePlay}
                className="px-6 h-12 rounded-2xl flex items-center justify-center gap-2 text-white font-hud font-black text-base shadow-xl active:scale-95 transition-all"
                style={{ backgroundColor: currentTheme.primaryColor }}
              >
                {isPlaying ? (
                  <><span>⏸</span> <span>DURDUR</span></>
                ) : (
                  <><span>▶</span> <span>RADYOYU ÇAL</span></>
                )}
              </button>

              <button
                onClick={nextStation}
                className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white text-lg active:scale-95 transition-all shadow"
                title="Sonraki İstasyon"
              >
                ⏭
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-hud">SES:</span>
              <input 
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  setVolume(v);
                  soundSys.setMuted(v === 0);
                }}
                className="w-28 accent-pink-500 cursor-pointer"
              />
              <span className="text-xs font-hud text-slate-200 tabular-nums w-8">{volume}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of all 6 stations for quick tuning */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {RADIO_STATIONS.map((station) => {
          const isSelected = station.id === currentStation.id;
          return (
            <button
              key={station.id}
              onClick={() => onChangeStation(station)}
              className={`p-3 rounded-2xl border text-left transition-all active:scale-95 flex flex-col justify-between ${
                isSelected 
                  ? 'border-white bg-white/20 shadow-xl' 
                  : 'border-white/10 bg-black/40 hover:bg-white/10'
              }`}
              style={{
                borderColor: isSelected ? station.accentColor : undefined
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-hud text-slate-400">{station.frequency}</span>
                {isSelected && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: station.accentColor }} />}
              </div>
              <div className="mt-2 font-hud font-bold text-sm text-white truncate">
                {station.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {station.genre}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
