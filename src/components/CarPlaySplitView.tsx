import React from 'react';
import { 
  GtaLocation, 
  RouteAlternative, 
  TurnManeuver, 
  RadioStation, 
  ThemeId, 
  UserCarPlaySettings, 
  DriveTelemetry,
  VehicleModel,
  WeatherState,
  WeatherCondition
} from '../types';
import { CarPlayMap } from './CarPlayMap';
import { TurnByTurnBanner } from './TurnByTurnBanner';
import { SpeedometerHUD } from './SpeedometerHUD';
import { GtaRadioPlayer } from './GtaRadioPlayer';
import { THEME_CONFIGS } from '../utils/themeConfig';

interface CarPlaySplitViewProps {
  currentPos: [number, number];
  bearing: number;
  activeRoute: RouteAlternative | null;
  origin: GtaLocation;
  destination: GtaLocation;
  allLocations: GtaLocation[];
  currentManeuver: TurnManeuver | null;
  nextManeuver: TurnManeuver | null;
  distanceToManeuverMeters: number;
  totalDistanceRemainingKm: number;
  totalTimeRemainingMin: number;
  telemetry: DriveTelemetry;
  theme: ThemeId;
  vehicle: VehicleModel;
  settings: UserCarPlaySettings;
  currentStation: RadioStation;
  onChangeStation: (st: RadioStation) => void;
  isDriving: boolean;
  isVoiceMuted: boolean;
  onToggleVoice: () => void;
  onEndRoute: () => void;
  onNitroBoost?: () => void;
  onToggleWanted?: () => void;
  onQuickPoi?: (poiType: string) => void;
  weather: WeatherState;
  onToggleWipers?: () => void;
  onChangeWeather?: (c: WeatherCondition) => void;
}

export const CarPlaySplitView: React.FC<CarPlaySplitViewProps> = ({
  currentPos,
  bearing,
  activeRoute,
  origin,
  destination,
  allLocations,
  currentManeuver,
  nextManeuver,
  distanceToManeuverMeters,
  totalDistanceRemainingKm,
  totalTimeRemainingMin,
  telemetry,
  theme,
  vehicle,
  settings,
  currentStation,
  onChangeStation,
  isDriving,
  isVoiceMuted,
  onToggleVoice,
  onEndRoute,
  onNitroBoost,
  onToggleWanted,
  onQuickPoi,
  weather,
  onToggleWipers,
  onChangeWeather
}) => {
  const currentTheme = THEME_CONFIGS[theme];

  return (
    <div className="w-full h-full p-2 md:p-3 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
      {/* Left 60% (7 cols on lg): Live Interactive Map */}
      <div className="lg:col-span-7 h-64 lg:h-full relative rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <CarPlayMap
          currentPos={currentPos}
          bearing={bearing}
          activeRoute={activeRoute}
          origin={origin}
          destination={destination}
          allLocations={allLocations}
          theme={theme}
          vehicle={vehicle}
          telemetry={telemetry}
          isDriving={isDriving}
          weather={weather}
          onToggleWipers={onToggleWipers}
          onChangeWeather={onChangeWeather}
        />

        {/* Quick POI Floating Bar inside map */}
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 p-1 rounded-xl bg-black/75 backdrop-blur-md border border-white/10">
          <button
            onClick={() => onQuickPoi && onQuickPoi('spray')}
            className="px-2.5 py-1 rounded-lg text-[10px] font-hud font-bold text-amber-300 hover:bg-white/10 transition-colors"
            title="En Yakın Pay 'n' Spray Atölyesi"
          >
            🔧 Tamir / Boya
          </button>
          <span className="text-white/20">|</span>
          <button
            onClick={() => onQuickPoi && onQuickPoi('safehouse')}
            className="px-2.5 py-1 rounded-lg text-[10px] font-hud font-bold text-sky-300 hover:bg-white/10 transition-colors"
            title="Sığınağa Git"
          >
            🏠 Sığınak
          </button>
          <span className="text-white/20">|</span>
          <button
            onClick={() => onQuickPoi && onQuickPoi('race')}
            className="px-2.5 py-1 rounded-lg text-[10px] font-hud font-bold text-pink-300 hover:bg-white/10 transition-colors"
            title="Sokak Yarışı Başlangıcı"
          >
            🏁 Drag Yarışı
          </button>
        </div>
      </div>

      {/* Right 40% (5 cols on lg): Widgets Stack */}
      <div className="lg:col-span-5 h-full flex flex-col justify-between gap-3 overflow-y-auto pr-1">
        {/* Top: Turn Guidance Card */}
        {activeRoute && currentManeuver && (
          <TurnByTurnBanner
            currentManeuver={currentManeuver}
            nextManeuver={nextManeuver}
            activeRoute={activeRoute}
            distanceToManeuverMeters={distanceToManeuverMeters}
            totalDistanceRemainingKm={totalDistanceRemainingKm}
            totalTimeRemainingMin={totalTimeRemainingMin}
            theme={theme}
            isVoiceMuted={isVoiceMuted}
            onToggleVoice={onToggleVoice}
            onEndRoute={onEndRoute}
          />
        )}

        {/* Middle: Speedometer & GTA Health/Wanted HUD */}
        <SpeedometerHUD
          telemetry={telemetry}
          theme={theme}
          settings={settings}
          currentStreetName={currentManeuver?.streetName || origin.name}
          onNitroBoost={onNitroBoost}
          onToggleWanted={onToggleWanted}
        />

        {/* Bottom: Compact Radio Player Widget */}
        <GtaRadioPlayer
          currentStation={currentStation}
          onChangeStation={onChangeStation}
          theme={theme}
          isCompact={true}
        />
      </div>
    </div>
  );
};
