/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  CarPlayView, 
  GtaLocation, 
  RouteAlternative, 
  UserCarPlaySettings, 
  DriveTelemetry, 
  RadioStation,
  WeatherState,
  WeatherCondition,
  ThemeId
} from './types';
import { GTA_LOCATIONS, RADIO_STATIONS } from './data/gtaLocations';
import { generateRoutes, calculateBearing, calculateDistanceKm } from './utils/navigationEngine';
import { soundSys } from './utils/audioSynth';
import confetti from 'canvas-confetti';

import { CarPlayShell } from './components/CarPlayShell';
import { CarPlayMap } from './components/CarPlayMap';
import { TurnByTurnBanner } from './components/TurnByTurnBanner';
import { SpeedometerHUD } from './components/SpeedometerHUD';
import { CarPlaySplitView } from './components/CarPlaySplitView';
import { InstrumentClusterView } from './components/InstrumentClusterView';
import { GtaRadioPlayer } from './components/GtaRadioPlayer';
import { ArcadeGames } from './components/ArcadeGames';
import { CarPlayYouTube } from './components/CarPlayYouTube';
import { CarPlayBrowser } from './components/CarPlayBrowser';
import { RoutePlannerModal } from './components/RoutePlannerModal';
import { ThemeCustomizerModal } from './components/ThemeCustomizerModal';

// Helper to determine weather based on theme and mode
function computeWeather(theme: ThemeId, mode: WeatherCondition | 'auto'): WeatherState {
  const cond: WeatherCondition = mode === 'auto' ? (
    theme === 'vice_city' ? 'sunset_haze' :
    theme === 'liberty_city' ? 'rain' :
    theme === 'san_andreas' ? 'sunny' :
    theme === 'cyberpunk' ? 'thunderstorm' : 'sunny'
  ) : mode;

  switch (cond) {
    case 'rain':
      return { condition: 'rain', intensity: 0.7, tempCelsius: 16, wipersActive: true, label: 'Yağmurlu Asfalt', icon: '🌧️' };
    case 'thunderstorm':
      return { condition: 'thunderstorm', intensity: 1.0, tempCelsius: 14, wipersActive: true, label: 'Gök Gürültülü Fırtına', icon: '⛈️' };
    case 'fog':
      return { condition: 'fog', intensity: 0.8, tempCelsius: 12, wipersActive: false, label: 'Yoğun Sis & Düşük Görüş', icon: '🌫️' };
    case 'sunset_haze':
      return { condition: 'sunset_haze', intensity: 0.5, tempCelsius: 31, wipersActive: false, label: 'Vice Tropikal Haze', icon: '🌆' };
    default:
      return { condition: 'sunny', intensity: 0.3, tempCelsius: 28, wipersActive: false, label: 'Açık Sahil Güneşi', icon: '☀️' };
  }
}

export default function App() {
  // 1. Settings & UI State
  const [currentView, setCurrentView] = useState<CarPlayView>('split');
  const [isRoutePlannerOpen, setIsRoutePlannerOpen] = useState<boolean>(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(2);

  const [settings, setSettings] = useState<UserCarPlaySettings>({
    theme: 'vice_city',
    vehicle: 'infernus',
    speedUnit: 'kmh',
    voiceLanguage: 'tr',
    voiceStyle: 'vice_dj',
    soundFxEnabled: true,
    voicePromptEnabled: true,
    speedLimitAlert: true,
    wantedLevelSystem: true,
    licensePlate: 'VICE 86',
    driverName: 'Tommy Vercetti',
    radarZoom: 15,
    weatherMode: 'auto'
  });

  // Dynamic Weather State
  const [weather, setWeather] = useState<WeatherState>(() => computeWeather('vice_city', 'auto'));

  // Sync weather with settings theme or weatherMode change
  useEffect(() => {
    setWeather(computeWeather(settings.theme, settings.weatherMode));
  }, [settings.theme, settings.weatherMode]);

  const handleToggleWipers = () => {
    soundSys.playClick();
    setWeather(w => ({ ...w, wipersActive: !w.wipersActive }));
  };

  const handleChangeWeather = (newCondition: WeatherCondition) => {
    soundSys.playClick();
    setSettings(s => ({ ...s, weatherMode: newCondition }));
  };

  // 2. Locations & Route State
  const [origin, setOrigin] = useState<GtaLocation>(GTA_LOCATIONS[1]); // Ocean View Hotel
  const [destination, setDestination] = useState<GtaLocation>(GTA_LOCATIONS[2]); // Starfish Island
  const [activeRoute, setActiveRoute] = useState<RouteAlternative | null>(null);

  // 3. Navigation Position & Maneuver Progress
  const [currentPos, setCurrentPos] = useState<[number, number]>([origin.lat, origin.lng]);
  const [bearing, setBearing] = useState<number>(45);
  const [currentManeuverIndex, setCurrentManeuverIndex] = useState<number>(0);
  const [distanceToManeuver, setDistanceToManeuver] = useState<number>(350);
  const [totalDistanceRemainingKm, setTotalDistanceRemainingKm] = useState<number>(4.2);
  const [totalTimeRemainingMin, setTotalTimeRemainingMin] = useState<number>(6);

  // 4. Drive Telemetry & Simulation
  const [isDriving, setIsDriving] = useState<boolean>(false);
  const coordIndexRef = useRef<number>(0);
  const [telemetry, setTelemetry] = useState<DriveTelemetry>({
    speedKmh: 0,
    rpm: 900,
    gear: 1,
    fuelPercent: 94,
    engineHealthPercent: 100,
    driftAngle: 0,
    gForce: 1.0,
    wantedStars: 0,
    headlightsOn: true,
    nitroRemaining: 100
  });

  // 5. Radio
  const [currentStation, setCurrentStation] = useState<RadioStation>(RADIO_STATIONS[0]); // Flash FM

  // Initialize Route on startup
  useEffect(() => {
    const generated = generateRoutes(origin, destination);
    if (generated.length > 0) {
      setActiveRoute(generated[0]);
      setCurrentPos([origin.lat, origin.lng]);
      coordIndexRef.current = 0;
      setCurrentManeuverIndex(0);
      setDistanceToManeuver(generated[0].maneuvers[0]?.distanceMeters || 300);
      setTotalDistanceRemainingKm(generated[0].distanceKm);
      setTotalTimeRemainingMin(generated[0].durationMin);
    }
  }, [origin, destination]);

  // Voice navigation trigger function
  const triggerVoiceDirection = useCallback((instruction: string) => {
    if (isVoiceMuted || !settings.voicePromptEnabled) return;
    soundSys.speakDirection(instruction, settings.voiceLanguage, settings.voiceStyle);
  }, [isVoiceMuted, settings.voicePromptEnabled, settings.voiceLanguage, settings.voiceStyle]);

  // Maneuvers
  const currentManeuver = activeRoute?.maneuvers[currentManeuverIndex] || null;
  const nextManeuver = activeRoute?.maneuvers[currentManeuverIndex + 1] || null;

  // --------------------------------------------------------------------------
  // DRIVE SIMULATION LOOP
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isDriving || !activeRoute || activeRoute.coordinates.length < 2) {
      // Idle state
      setTelemetry(prev => ({
        ...prev,
        speedKmh: 0,
        rpm: 900,
        gear: 0,
        driftAngle: 0,
        gForce: 1.0
      }));
      return;
    }

    const intervalTime = Math.max(80, 280 / simSpeed);

    const timer = setInterval(() => {
      const coords = activeRoute.coordinates;
      const nextIdx = coordIndexRef.current + 1;

      if (nextIdx >= coords.length) {
        // Reached Destination!
        setIsDriving(false);
        soundSys.playCheckpoint();
        confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
        triggerVoiceDirection(settings.voiceLanguage === 'tr' ? 'Hedefe ulaştınız! Park edildi.' : 'You have arrived at your destination!');
        return;
      }

      const curCoord = coords[coordIndexRef.current];
      const targetCoord = coords[nextIdx];
      coordIndexRef.current = nextIdx;

      // Calculate new bearing & distance
      const newBearing = calculateBearing(curCoord[0], curCoord[1], targetCoord[0], targetCoord[1]);
      setCurrentPos(targetCoord);
      setBearing(newBearing);

      // Realistic speed fluctuation
      const targetSpeed = 70 + Math.random() * 35;
      const gear = targetSpeed < 30 ? 1 : targetSpeed < 55 ? 2 : targetSpeed < 80 ? 3 : targetSpeed < 105 ? 4 : targetSpeed < 140 ? 5 : 6;
      const rpm = 2500 + (targetSpeed % 30) * 120 + Math.random() * 200;
      const gForce = 1.0 + (Math.abs(newBearing - bearing) > 15 ? 0.35 : 0.05);
      const driftAngle = Math.abs(newBearing - bearing) > 25 ? Math.round((Math.random() * 18 + 5)) : 0;

      // Update remaining distance
      const progressFraction = nextIdx / coords.length;
      const distRem = Math.max(0, activeRoute.distanceKm * (1 - progressFraction));
      const timeRem = Math.max(1, Math.round(activeRoute.durationMin * (1 - progressFraction)));
      setTotalDistanceRemainingKm(distRem);
      setTotalTimeRemainingMin(timeRem);

      // Decrease distance to current maneuver
      setDistanceToManeuver(prev => {
        const nextDist = prev - (35 * simSpeed);
        if (nextDist <= 60 && currentManeuverIndex < activeRoute.maneuvers.length - 1) {
          // Advance maneuver!
          const nextIndex = currentManeuverIndex + 1;
          setCurrentManeuverIndex(nextIndex);
          soundSys.playTurnCue();
          const nextMan = activeRoute.maneuvers[nextIndex];
          if (nextMan) {
            triggerVoiceDirection(nextMan.instruction);
          }
          return activeRoute.maneuvers[nextIndex]?.distanceMeters || 400;
        }
        return Math.max(0, nextDist);
      });

      // Speed camera warning check
      if (Math.random() < 0.08) {
        soundSys.playSpeedCameraWarning();
      }

      // Wanted level check if exceeding limits
      let wanted = telemetry.wantedStars;
      if (settings.wantedLevelSystem && targetSpeed > (currentManeuver?.speedLimit || 90) + 20 && Math.random() < 0.05) {
        wanted = Math.min(5, wanted + 1);
        soundSys.playWantedStarSound(wanted);
      }

      setTelemetry(prev => ({
        ...prev,
        speedKmh: Math.round(targetSpeed),
        rpm: Math.round(rpm),
        gear,
        gForce,
        driftAngle,
        wantedStars: wanted,
        fuelPercent: Math.max(15, prev.fuelPercent - 0.02 * simSpeed)
      }));

    }, intervalTime);

    return () => clearInterval(timer);
  }, [isDriving, activeRoute, simSpeed, currentManeuverIndex, bearing, currentManeuver, settings.wantedLevelSystem, settings.voiceLanguage, telemetry.wantedStars, triggerVoiceDirection]);

  // Nitro Boost
  const handleNitroBoost = () => {
    if (telemetry.nitroRemaining <= 0) return;
    soundSys.playNitroSound();
    setTelemetry(prev => ({
      ...prev,
      speedKmh: Math.min(320, prev.speedKmh + 65),
      rpm: 7800,
      nitroRemaining: Math.max(0, prev.nitroRemaining - 25)
    }));
  };

  // Toggle Wanted Level
  const handleToggleWanted = () => {
    soundSys.playClick();
    setTelemetry(prev => {
      const nextStars = (prev.wantedStars + 1) % 6;
      soundSys.playWantedStarSound(nextStars);
      return { ...prev, wantedStars: nextStars };
    });
  };

  // Quick POI selection
  const handleQuickPoi = (poiType: string) => {
    soundSys.playClick();
    const candidate = GTA_LOCATIONS.find(l => l.type === poiType && l.id !== origin.id);
    if (candidate) {
      setDestination(candidate);
      const newRoutes = generateRoutes(origin, candidate);
      if (newRoutes.length > 0) {
        setActiveRoute(newRoutes[0]);
        setCurrentPos([origin.lat, origin.lng]);
        coordIndexRef.current = 0;
        setCurrentManeuverIndex(0);
        soundSys.playCheckpoint();
      }
    }
  };

  // Cockpit pedals
  const handleManualAccelerate = () => {
    soundSys.playClick();
    setTelemetry(prev => ({
      ...prev,
      speedKmh: Math.min(300, prev.speedKmh + 22),
      rpm: Math.min(7600, prev.rpm + 900),
      gear: Math.min(6, Math.max(1, prev.gear + 1))
    }));
  };

  const handleManualBrake = () => {
    soundSys.playClick();
    setTelemetry(prev => ({
      ...prev,
      speedKmh: Math.max(0, prev.speedKmh - 35),
      rpm: Math.max(900, prev.rpm - 1200),
      gear: prev.speedKmh <= 35 ? 1 : Math.max(1, prev.gear - 1)
    }));
  };

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        handleNitroBoost();
      } else if (e.key === 'b' || e.key === 'B') {
        handleManualBrake();
      } else if (e.key === '1') {
        setCurrentView('nav');
      } else if (e.key === '2') {
        setCurrentView('split');
      } else if (e.key === '3') {
        setCurrentView('cluster');
      } else if (e.key === '4') {
        setCurrentView('radio');
      } else if (e.key === '5') {
        setCurrentView('arcade');
      } else if (e.key === '6') {
        setCurrentView('media');
      } else if (e.key === '7') {
        setCurrentView('browser');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [telemetry.nitroRemaining]);

  return (
    <CarPlayShell
      currentView={currentView}
      onChangeView={setCurrentView}
      theme={settings.theme}
      settings={settings}
      onOpenRoutePlanner={() => setIsRoutePlannerOpen(true)}
      onOpenCustomizer={() => setIsCustomizerOpen(true)}
      isDriving={isDriving}
      onToggleDriving={() => {
        soundSys.playClick();
        setIsDriving(!isDriving);
        if (!isDriving && currentManeuver) {
          triggerVoiceDirection(currentManeuver.instruction);
        }
      }}
      simSpeed={simSpeed}
      onChangeSimSpeed={setSimSpeed}
    >
      {/* 1. Full Navigation Map View */}
      {currentView === 'nav' && (
        <div className="w-full h-full relative">
          <CarPlayMap
            currentPos={currentPos}
            bearing={bearing}
            activeRoute={activeRoute}
            origin={origin}
            destination={destination}
            allLocations={GTA_LOCATIONS}
            theme={settings.theme}
            vehicle={settings.vehicle}
            telemetry={telemetry}
            isDriving={isDriving}
            weather={weather}
            onToggleWipers={handleToggleWipers}
            onChangeWeather={handleChangeWeather}
            onSelectLocation={(loc) => {
              setDestination(loc);
              setIsRoutePlannerOpen(true);
            }}
          />

          {/* Top Turn Guidance Banner */}
          {activeRoute && currentManeuver && (
            <div className="absolute top-4 left-4 right-16 z-20 pointer-events-auto">
              <TurnByTurnBanner
                currentManeuver={currentManeuver}
                nextManeuver={nextManeuver}
                activeRoute={activeRoute}
                distanceToManeuverMeters={distanceToManeuver}
                totalDistanceRemainingKm={totalDistanceRemainingKm}
                totalTimeRemainingMin={totalTimeRemainingMin}
                theme={settings.theme}
                isVoiceMuted={isVoiceMuted}
                onToggleVoice={() => setIsVoiceMuted(!isVoiceMuted)}
                onEndRoute={() => {
                  setIsDriving(false);
                  setActiveRoute(null);
                }}
              />
            </div>
          )}

          {/* Bottom Left Speedometer HUD */}
          <div className="absolute bottom-4 left-4 z-20">
            <SpeedometerHUD
              telemetry={telemetry}
              theme={settings.theme}
              settings={settings}
              currentStreetName={currentManeuver?.streetName || origin.name}
              onNitroBoost={handleNitroBoost}
              onToggleWanted={handleToggleWanted}
            />
          </div>
        </div>
      )}

      {/* 2. CarPlay Split-Screen Dashboard View */}
      {currentView === 'split' && (
        <CarPlaySplitView
          currentPos={currentPos}
          bearing={bearing}
          activeRoute={activeRoute}
          origin={origin}
          destination={destination}
          allLocations={GTA_LOCATIONS}
          currentManeuver={currentManeuver}
          nextManeuver={nextManeuver}
          distanceToManeuverMeters={distanceToManeuver}
          totalDistanceRemainingKm={totalDistanceRemainingKm}
          totalTimeRemainingMin={totalTimeRemainingMin}
          telemetry={telemetry}
          theme={settings.theme}
          vehicle={settings.vehicle}
          settings={settings}
          currentStation={currentStation}
          onChangeStation={setCurrentStation}
          isDriving={isDriving}
          isVoiceMuted={isVoiceMuted}
          onToggleVoice={() => setIsVoiceMuted(!isVoiceMuted)}
          onEndRoute={() => {
            setIsDriving(false);
            setActiveRoute(null);
          }}
          onNitroBoost={handleNitroBoost}
          onToggleWanted={handleToggleWanted}
          onQuickPoi={handleQuickPoi}
          weather={weather}
          onToggleWipers={handleToggleWipers}
          onChangeWeather={handleChangeWeather}
        />
      )}

      {/* 3. Cockpit Instrument Cluster View */}
      {currentView === 'cluster' && (
        <InstrumentClusterView
          telemetry={telemetry}
          theme={settings.theme}
          settings={settings}
          vehicle={settings.vehicle}
          onAccelerate={handleManualAccelerate}
          onBrake={handleManualBrake}
          onNitro={handleNitroBoost}
          onToggleWanted={handleToggleWanted}
        />
      )}

      {/* 4. GTA Radio Player View */}
      {currentView === 'radio' && (
        <GtaRadioPlayer
          currentStation={currentStation}
          onChangeStation={setCurrentStation}
          theme={settings.theme}
          isCompact={false}
        />
      )}

      {/* 5. Arcade Games View */}
      {currentView === 'arcade' && (
        <ArcadeGames
          theme={settings.theme}
          vehicle={settings.vehicle}
        />
      )}

      {/* 6. YouTube Video Streaming View */}
      {currentView === 'media' && (
        <CarPlayYouTube
          theme={settings.theme}
          isDriving={isDriving}
        />
      )}

      {/* 7. CarPlay Web Browser View */}
      {currentView === 'browser' && (
        <CarPlayBrowser
          theme={settings.theme}
        />
      )}

      {/* Route Planner Dialog Modal */}
      <RoutePlannerModal
        isOpen={isRoutePlannerOpen}
        onClose={() => setIsRoutePlannerOpen(false)}
        currentOrigin={origin}
        currentDest={destination}
        currentRoute={activeRoute}
        onSelectRoute={(route, orig, dest) => {
          setOrigin(orig);
          setDestination(dest);
          setActiveRoute(route);
          setCurrentPos([orig.lat, orig.lng]);
          coordIndexRef.current = 0;
          setCurrentManeuverIndex(0);
          setDistanceToManeuver(route.maneuvers[0]?.distanceMeters || 350);
          setTotalDistanceRemainingKm(route.distanceKm);
          setTotalTimeRemainingMin(route.durationMin);
          triggerVoiceDirection(route.maneuvers[0]?.instruction || 'Rotaya başlandı.');
        }}
        theme={settings.theme}
      />

      {/* Theme & Vehicle Customizer Dialog Modal */}
      <ThemeCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />
    </CarPlayShell>
  );
}
