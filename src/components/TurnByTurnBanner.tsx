import React from 'react';
import { TurnManeuver, RouteAlternative, ThemeId } from '../types';
import { THEME_CONFIGS } from '../utils/themeConfig';

interface TurnByTurnBannerProps {
  currentManeuver: TurnManeuver | null;
  nextManeuver: TurnManeuver | null;
  activeRoute: RouteAlternative | null;
  distanceToManeuverMeters: number;
  totalDistanceRemainingKm: number;
  totalTimeRemainingMin: number;
  theme: ThemeId;
  isVoiceMuted: boolean;
  onToggleVoice: () => void;
  onEndRoute: () => void;
}

export const TurnByTurnBanner: React.FC<TurnByTurnBannerProps> = ({
  currentManeuver,
  nextManeuver,
  activeRoute,
  distanceToManeuverMeters,
  totalDistanceRemainingKm,
  totalTimeRemainingMin,
  theme,
  isVoiceMuted,
  onToggleVoice,
  onEndRoute
}) => {
  const currentTheme = THEME_CONFIGS[theme];

  if (!activeRoute || !currentManeuver) {
    return null;
  }

  // Format distance
  const formatMeters = (m: number) => {
    if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
    return `${Math.round(m)} m`;
  };

  // Turn arrow icons
  const renderTurnIcon = (action: TurnManeuver['action']) => {
    switch (action) {
      case 'left':
        return (
          <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="19" x2="19" y2="10" />
            <path d="M19 10H8" />
            <polyline points="12 6 8 10 12 14" />
          </svg>
        );
      case 'right':
        return (
          <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="19" x2="5" y2="10" />
            <path d="M5 10h11" />
            <polyline points="12 6 16 10 12 14" />
          </svg>
        );
      case 'slight_left':
        return (
          <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="16" y1="19" x2="10" y2="7" />
            <polyline points="6 10 10 7 14 7" />
          </svg>
        );
      case 'slight_right':
        return (
          <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="19" x2="14" y2="7" />
            <polyline points="10 7 14 7 18 10" />
          </svg>
        );
      case 'u_turn':
        return (
          <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 10v7" />
            <path d="M15 17V8a4 4 0 0 0-8 0v9" />
            <polyline points="5 13 9 17 13 13" />
          </svg>
        );
      case 'roundabout':
        return (
          <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <polyline points="12 2 12 7 15 5" />
          </svg>
        );
      case 'arrival':
        return (
          <svg className="w-10 h-10 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      default: // straight
        return (
          <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="6 11 12 5 18 11" />
          </svg>
        );
    }
  };

  // ETA Calculation
  const now = new Date();
  const etaDate = new Date(now.getTime() + totalTimeRemainingMin * 60000);
  const etaString = etaDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Primary Navigation Guidance Card */}
      <div 
        className="rounded-2xl border backdrop-blur-xl p-4 shadow-2xl flex items-center justify-between gap-4 transition-all"
        style={{ 
          backgroundColor: currentTheme.panelBg,
          borderColor: currentTheme.borderGlow
        }}
      >
        {/* Left: Huge Turn Direction Icon */}
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border border-white/20"
          style={{ backgroundColor: currentTheme.primaryColor }}
        >
          {renderTurnIcon(currentManeuver.action)}
        </div>

        {/* Center: Maneuver Distance & Street Name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-hud font-black text-3xl md:text-4xl tracking-tight text-white tabular-nums">
              {formatMeters(distanceToManeuverMeters)}
            </span>
            <span className="text-xs uppercase tracking-wider text-slate-300 font-semibold truncate">
              sonra
            </span>
          </div>
          <div className="text-lg md:text-xl font-bold text-white truncate font-hud">
            {currentManeuver.streetName}
          </div>
          <div className="text-xs text-slate-300 truncate">
            {currentManeuver.instruction}
          </div>
        </div>

        {/* Right: Speed Limit & Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Speed Limit Sign */}
          <div className="w-11 h-11 rounded-full border-3 border-rose-600 bg-white flex flex-col items-center justify-center shadow-md">
            <span className="text-[9px] font-bold text-slate-600 leading-none">LIMIT</span>
            <span className="font-hud font-black text-sm text-black leading-none">{currentManeuver.speedLimit}</span>
          </div>

          {/* Voice Mute Toggle */}
          <button
            onClick={onToggleVoice}
            className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-colors ${
              isVoiceMuted ? 'bg-rose-950/80 border-rose-500/50 text-rose-300' : 'bg-slate-800/80 border-white/20 text-white'
            }`}
            title={isVoiceMuted ? 'Sesli Rehber Kapalı' : 'Sesli Rehber Açık'}
          >
            {isVoiceMuted ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>

          {/* End Route Cancel Button */}
          <button
            onClick={onEndRoute}
            className="w-11 h-11 rounded-xl bg-rose-600/90 hover:bg-rose-500 border border-rose-400/50 flex items-center justify-center text-white font-bold transition-all"
            title="Rotayı Sonlandır"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Bottom Sub-strip: Next Maneuver Preview + Trip Stats */}
      <div className="flex items-center justify-between px-3 py-1.5 mt-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-xs">
        {/* Next Maneuver preview */}
        <div className="flex items-center gap-2 truncate text-slate-300">
          <span className="text-[10px] uppercase font-bold text-slate-400">Sonra:</span>
          {nextManeuver ? (
            <span className="truncate">{nextManeuver.streetName}</span>
          ) : (
            <span>Hedefe Yaklaştınız</span>
          )}
        </div>

        {/* ETA & Distance Remaining */}
        <div className="flex items-center gap-3 shrink-0 font-hud text-slate-200">
          <span className="text-emerald-400 font-bold">{etaString} ETA</span>
          <span>·</span>
          <span>{totalTimeRemainingMin} dk</span>
          <span>·</span>
          <span>{totalDistanceRemainingKm.toFixed(1)} km</span>
        </div>
      </div>
    </div>
  );
};
