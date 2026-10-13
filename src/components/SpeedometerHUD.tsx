import React from 'react';
import { DriveTelemetry, ThemeId, UserCarPlaySettings } from '../types';
import { THEME_CONFIGS } from '../utils/themeConfig';

interface SpeedometerHUDProps {
  telemetry: DriveTelemetry;
  theme: ThemeId;
  settings: UserCarPlaySettings;
  currentStreetName: string;
  onNitroBoost?: () => void;
  onToggleWanted?: () => void;
}

export const SpeedometerHUD: React.FC<SpeedometerHUDProps> = ({
  telemetry,
  theme,
  settings,
  currentStreetName,
  onNitroBoost,
  onToggleWanted
}) => {
  const currentTheme = THEME_CONFIGS[theme];
  const isMph = settings.speedUnit === 'mph';
  const displayedSpeed = Math.round(isMph ? telemetry.speedKmh * 0.621371 : telemetry.speedKmh);
  const unitLabel = isMph ? 'MPH' : 'KM/S';

  return (
    <div className="flex flex-col gap-2">
      {/* Wanted Stars Row (Iconic GTA 5-Star System) */}
      <div 
        onClick={onToggleWanted}
        title="Polis Aranma Seviyesini Değiştir"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10 cursor-pointer shadow-lg select-none self-start"
        style={{ backgroundColor: currentTheme.panelBg }}
      >
        <span className="text-[10px] font-hud font-bold tracking-wider text-slate-400 mr-1">WANTED</span>
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = star <= telemetry.wantedStars;
          return (
            <svg
              key={star}
              className={`w-5 h-5 transition-all ${
                isActive 
                  ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse' 
                  : 'text-slate-700'
              }`}
              viewBox="0 0 24 24"
              fill={isActive ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          );
        })}
      </div>

      {/* Main Cluster Card */}
      <div 
        className="rounded-2xl backdrop-blur-xl border p-4 shadow-2xl flex flex-col gap-3 min-w-[220px]"
        style={{ 
          backgroundColor: currentTheme.panelBg,
          borderColor: currentTheme.borderGlow
        }}
      >
        {/* Speedometer Display */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-hud font-black text-5xl tracking-tighter text-white tabular-nums drop-shadow">
              {displayedSpeed}
            </span>
            <span className="font-hud text-xs font-bold text-slate-400 uppercase tracking-widest">
              {unitLabel}
            </span>
          </div>

          {/* Current Gear */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 font-hud">VİTES</span>
            <span className="font-hud font-black text-2xl text-emerald-400">
              {telemetry.speedKmh === 0 ? 'P' : telemetry.gear}
            </span>
          </div>
        </div>

        {/* RPM Bar */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[10px] font-hud text-slate-400">
            <span>RPM DEVİR</span>
            <span>{Math.round(telemetry.rpm)}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
            <div 
              className="h-full transition-all duration-150"
              style={{ 
                width: `${Math.min(100, (telemetry.rpm / 8000) * 100)}%`,
                backgroundColor: telemetry.rpm > 6500 ? '#ef4444' : currentTheme.primaryColor
              }}
            />
          </div>
        </div>

        {/* GTA V Style Health (Fuel/Battery) and Armor (Motor) Gauges */}
        <div className="grid grid-cols-2 gap-2">
          {/* Armor / Engine */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-hud text-slate-400">
              <span>ZIRH / MOTOR</span>
              <span>{Math.round(telemetry.engineHealthPercent)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-sky-400 transition-all"
                style={{ width: `${telemetry.engineHealthPercent}%` }}
              />
            </div>
          </div>

          {/* Health / Fuel */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-hud text-slate-400">
              <span>SAĞLIK / YAKIT</span>
              <span>{Math.round(telemetry.fuelPercent)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${telemetry.fuelPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Street Name Badge */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
          <div className="truncate max-w-[150px] font-hud">
            📍 {currentStreetName || 'Bilinmeyen Cadde'}
          </div>

          {/* Nitro Boost Button */}
          {onNitroBoost && (
            <button
              onClick={onNitroBoost}
              disabled={telemetry.nitroRemaining <= 0}
              className="px-2.5 py-1 rounded-lg text-[10px] font-hud font-bold uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 to-blue-600 active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed shadow"
            >
              NITRO 🔥
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
