import React from 'react';
import { DriveTelemetry, ThemeId, UserCarPlaySettings, VehicleModel } from '../types';
import { THEME_CONFIGS } from '../utils/themeConfig';
import { VEHICLE_SPECS } from '../data/gtaLocations';

interface InstrumentClusterViewProps {
  telemetry: DriveTelemetry;
  theme: ThemeId;
  settings: UserCarPlaySettings;
  vehicle: VehicleModel;
  onAccelerate?: () => void;
  onBrake?: () => void;
  onNitro?: () => void;
  onToggleWanted?: () => void;
}

export const InstrumentClusterView: React.FC<InstrumentClusterViewProps> = ({
  telemetry,
  theme,
  settings,
  vehicle,
  onAccelerate,
  onBrake,
  onNitro,
  onToggleWanted
}) => {
  const currentTheme = THEME_CONFIGS[theme];
  const vehicleSpec = VEHICLE_SPECS[vehicle];
  const isMph = settings.speedUnit === 'mph';
  const displayedSpeed = Math.round(isMph ? telemetry.speedKmh * 0.621371 : telemetry.speedKmh);
  const unitLabel = isMph ? 'MPH' : 'KM/H';

  // Tachometer angle calculation (0 to 8000 RPM -> -120deg to 120deg)
  const rpmRatio = Math.min(1, telemetry.rpm / 8000);
  const needleAngle = -120 + rpmRatio * 240;

  return (
    <div className="w-full h-full p-4 md:p-8 flex flex-col justify-between overflow-y-auto max-w-6xl mx-auto">
      {/* Top Banner: Vehicle Spec & Wanted Stars */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center font-hud font-black text-white text-base shadow"
            style={{ backgroundColor: vehicleSpec.color }}
          >
            GT
          </div>
          <div>
            <h2 className="font-hud font-black text-xl md:text-2xl text-white tracking-tight">
              {vehicleSpec.name}
            </h2>
            <div className="text-xs text-slate-400 font-hud">
              {vehicleSpec.category} · {vehicleSpec.handling}
            </div>
          </div>
        </div>

        {/* Wanted Level Stars Indicator */}
        <div 
          onClick={onToggleWanted}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-black/60 border border-white/10 cursor-pointer shadow-lg hover:border-amber-400/50"
        >
          <span className="text-xs font-hud font-bold text-slate-400 mr-1">ARANMA SEVİYESİ</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <span 
              key={star} 
              className={`text-lg md:text-xl transition-all ${
                star <= telemetry.wantedStars ? 'text-amber-400 animate-pulse drop-shadow' : 'text-slate-700'
              }`}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      {/* Center Cockpit Gauges Cluster */}
      <div className="my-auto py-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Left Gauge: G-Force Meter & Drift Angle */}
        <div 
          className="rounded-3xl border p-6 backdrop-blur-2xl flex flex-col items-center justify-between shadow-2xl h-80"
          style={{ 
            backgroundColor: currentTheme.panelBg,
            borderColor: currentTheme.borderGlow 
          }}
        >
          <div className="w-full flex items-center justify-between text-xs font-hud text-slate-400">
            <span>YANAL G-KUVVETİ</span>
            <span className="text-white font-bold">{telemetry.gForce.toFixed(2)} G</span>
          </div>

          {/* Crosshair G-force Circle */}
          <div className="relative w-44 h-44 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
            <div className="absolute inset-8 rounded-full border border-white/10" />
            <div className="w-1.5 h-full bg-white/10 absolute" />
            <div className="h-1.5 w-full bg-white/10 absolute" />
            {/* Dynamic G-ball */}
            <div 
              className="w-5 h-5 rounded-full border-2 border-white shadow-xl transition-all duration-150"
              style={{ 
                backgroundColor: currentTheme.primaryColor,
                transform: `translate(${telemetry.driftAngle * 1.2}px, ${(telemetry.gForce - 1) * -35}px)`
              }}
            />
          </div>

          <div className="w-full flex justify-between text-xs font-hud text-slate-400">
            <span>DRİFT AÇISI: <b className="text-amber-400">{telemetry.driftAngle}°</b></span>
            <span>ÇEKİŞ: <b className="text-emerald-400">AKTİF</b></span>
          </div>
        </div>

        {/* Center Main Dial: Tachometer + Big Speedometer */}
        <div 
          className="rounded-3xl border p-8 backdrop-blur-2xl flex flex-col items-center justify-center shadow-2xl relative h-96"
          style={{ 
            backgroundColor: currentTheme.panelBg,
            borderColor: currentTheme.borderGlow 
          }}
        >
          {/* Radial Tachometer Dial (SVG) */}
          <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              {/* Background Arc */}
              <circle
                cx="100"
                cy="100"
                r="82"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="12"
                fill="none"
                strokeDasharray="360 160"
              />
              {/* Active RPM Arc */}
              <circle
                cx="100"
                cy="100"
                r="82"
                stroke={telemetry.rpm > 6500 ? '#ef4444' : currentTheme.primaryColor}
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${rpmRatio * 360} 500`}
                strokeLinecap="round"
                className="transition-all duration-100"
              />
            </svg>

            {/* Needle */}
            <div 
              className="absolute w-1 h-32 origin-bottom transition-all duration-100"
              style={{ 
                transform: `rotate(${needleAngle}deg)`,
                bottom: '50%',
                background: `linear-gradient(to top, transparent, #ffffff, #ef4444)`
              }}
            />

            {/* Speed Center Hub */}
            <div className="absolute inset-16 rounded-full bg-black/90 border border-white/20 flex flex-col items-center justify-center shadow-2xl">
              <span className="font-hud font-black text-5xl md:text-6xl text-white tabular-nums drop-shadow tracking-tighter">
                {displayedSpeed}
              </span>
              <span className="text-xs font-hud font-bold text-slate-400 uppercase tracking-widest">
                {unitLabel}
              </span>
              <span className="text-xs font-hud font-bold text-emerald-400 mt-1">
                {telemetry.speedKmh === 0 ? 'P' : `VİTES ${telemetry.gear}`}
              </span>
            </div>
          </div>

          <div className="mt-2 text-xs font-hud text-slate-400 flex items-center gap-4">
            <span>MOTOR: <b className="text-white">{Math.round(telemetry.rpm)} RPM</b></span>
            <span>SON HIZ: <b className="text-amber-400">{vehicleSpec.topSpeedKmh} KM/S</b></span>
          </div>
        </div>

        {/* Right Gauge: Temperatures, Fuel, Turbo Boost */}
        <div 
          className="rounded-3xl border p-6 backdrop-blur-2xl flex flex-col justify-between shadow-2xl h-80"
          style={{ 
            backgroundColor: currentTheme.panelBg,
            borderColor: currentTheme.borderGlow 
          }}
        >
          <div className="text-xs font-hud text-slate-400">TELEMETRİ & ENERJİ</div>

          {/* Engine Health Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-hud">
              <span className="text-slate-400">MOTOR SAĞLIĞI</span>
              <span className="text-sky-400 font-bold">{Math.round(telemetry.engineHealthPercent)}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-sky-400 transition-all" style={{ width: `${telemetry.engineHealthPercent}%` }} />
            </div>
          </div>

          {/* Fuel / Battery Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-hud">
              <span className="text-slate-400">YAKIT / BATARYA</span>
              <span className="text-emerald-400 font-bold">{Math.round(telemetry.fuelPercent)}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${telemetry.fuelPercent}%` }} />
            </div>
          </div>

          {/* Nitro Tank */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-hud">
              <span className="text-slate-400">NOS NİTRO GAZI</span>
              <span className="text-pink-400 font-bold">{Math.round(telemetry.nitroRemaining)}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-pink-500 transition-all" style={{ width: `${telemetry.nitroRemaining}%` }} />
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex justify-between text-xs font-hud text-slate-400">
            <span>YAĞ SICAKLIĞI: <b className="text-white">96°C</b></span>
            <span>BASINÇ: <b className="text-white">1.4 BAR</b></span>
          </div>
        </div>
      </div>

      {/* Bottom Interactive Pedals (Cockpit Touch Accelerator / Brake / Nitro) */}
      <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-4">
        {onBrake && (
          <button
            onClick={onBrake}
            className="px-6 py-3.5 rounded-2xl bg-rose-700/80 hover:bg-rose-600 text-white font-hud font-bold text-sm shadow-xl active:scale-95 transition-all flex items-center gap-2 border border-rose-500/50"
          >
            🛑 FREN YAP
          </button>
        )}

        {onAccelerate && (
          <button
            onClick={onAccelerate}
            className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-hud font-bold text-sm shadow-xl active:scale-95 transition-all flex items-center gap-2 border border-emerald-400/50"
          >
            🏎️ GAZA BAS (HIZLAN)
          </button>
        )}

        {onNitro && (
          <button
            onClick={onNitro}
            disabled={telemetry.nitroRemaining <= 0}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-hud font-bold text-sm shadow-xl active:scale-95 transition-all flex items-center gap-2 border border-pink-400/50 disabled:opacity-40"
          >
            🔥 NOS NİTRO ATEŞLE
          </button>
        )}
      </div>
    </div>
  );
};
