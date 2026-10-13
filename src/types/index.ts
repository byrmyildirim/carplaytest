export type ThemeId = 'vice_city' | 'los_santos' | 'san_andreas' | 'liberty_city' | 'cyberpunk';

export type CarPlayView = 'nav' | 'split' | 'cluster' | 'arcade' | 'radio' | 'customizer' | 'media' | 'browser';

export type WeatherCondition = 'sunny' | 'rain' | 'fog' | 'thunderstorm' | 'sunset_haze';

export interface WeatherState {
  condition: WeatherCondition;
  intensity: number; // 0 to 1
  tempCelsius: number;
  wipersActive: boolean;
  label: string;
  icon: string;
}

export type VehicleModel = 'infernus' | 'banshee' | 'cheetah' | 'comet' | 'sanchez' | 'cruiser';

export type LocationType = 'safehouse' | 'spray' | 'ammu' | 'fastfood' | 'gas' | 'airport' | 'race' | 'landmark' | 'custom';

export interface GtaLocation {
  id: string;
  name: string;
  city: 'Vice City' | 'Los Santos' | 'Liberty City' | 'San Andreas' | 'Istanbul' | 'Miami' | 'Los Angeles';
  district: string;
  lat: number;
  lng: number;
  type: LocationType;
  description: string;
}

export interface TurnManeuver {
  id: string;
  instruction: string;
  distanceMeters: number;
  action: 'straight' | 'left' | 'right' | 'slight_left' | 'slight_right' | 'u_turn' | 'roundabout' | 'arrival';
  streetName: string;
  speedLimit: number;
}

export interface RouteAlternative {
  id: string;
  name: string;
  tag: string;
  summary: string;
  distanceKm: number;
  durationMin: number;
  tollFree: boolean;
  policeRisk: 'Low' | 'Medium' | 'High';
  trafficDelayMin: number;
  coordinates: [number, number][]; // [lat, lng]
  maneuvers: TurnManeuver[];
}

export interface RadioStation {
  id: string;
  name: string;
  frequency: string;
  genre: string;
  dj: string;
  tagline: string;
  accentColor: string;
  bpm: number;
}

export interface UserCarPlaySettings {
  theme: ThemeId;
  vehicle: VehicleModel;
  speedUnit: 'kmh' | 'mph';
  voiceLanguage: 'tr' | 'en';
  voiceStyle: 'vice_dj' | 'tactical_cop' | 'cj_san_andreas' | 'classic_gps';
  soundFxEnabled: boolean;
  voicePromptEnabled: boolean;
  speedLimitAlert: boolean;
  wantedLevelSystem: boolean;
  licensePlate: string;
  driverName: string;
  radarZoom: number;
  weatherMode: WeatherCondition | 'auto';
}

export interface DriveTelemetry {
  speedKmh: number;
  rpm: number;
  gear: number;
  fuelPercent: number;
  engineHealthPercent: number;
  driftAngle: number;
  gForce: number;
  wantedStars: number;
  headlightsOn: boolean;
  nitroRemaining: number;
}
