import { ThemeId } from '../types';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  gameTitle: string;
  yearEra: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgDark: string;
  panelBg: string;
  borderGlow: string;
  routeColor: string;
  radarRingColor: string;
  starsActiveColor: string;
  badgeBg: string;
  vibe: string;
}

export const THEME_CONFIGS: Record<ThemeId, ThemeDefinition> = {
  vice_city: {
    id: 'vice_city',
    name: 'Vice City (1986 Neon)',
    gameTitle: 'GTA VICE CITY',
    yearEra: '1986',
    primaryColor: '#ff2aa2',
    secondaryColor: '#00f0ff',
    accentColor: '#fbbf24',
    bgDark: '#080412',
    panelBg: 'rgba(23, 10, 38, 0.88)',
    borderGlow: 'rgba(255, 42, 162, 0.4)',
    routeColor: '#ff00aa',
    radarRingColor: '#ff2aa2',
    starsActiveColor: '#fde047',
    badgeBg: '#ff2aa2',
    vibe: '80ler Palmiye, Pastel Pembe, Synthwave & Okyanus Sahili'
  },
  los_santos: {
    id: 'los_santos',
    name: 'Los Santos (Modern GPS)',
    gameTitle: 'GTA V LOS SANTOS',
    yearEra: '2013-2026',
    primaryColor: '#22c55e',
    secondaryColor: '#eab308',
    accentColor: '#38bdf8',
    bgDark: '#090d14',
    panelBg: 'rgba(15, 23, 42, 0.88)',
    borderGlow: 'rgba(34, 197, 94, 0.4)',
    routeColor: '#22c55e',
    radarRingColor: '#22c55e',
    starsActiveColor: '#ef4444',
    badgeBg: '#15803d',
    vibe: 'Modern Askeri Taktik Radar, Maze Bank & Vinewood'
  },
  san_andreas: {
    id: 'san_andreas',
    name: 'San Andreas (1992 Vintage)',
    gameTitle: 'GTA SAN ANDREAS',
    yearEra: '1992',
    primaryColor: '#f59e0b',
    secondaryColor: '#16a34a',
    accentColor: '#fb923c',
    bgDark: '#0d0a06',
    panelBg: 'rgba(28, 20, 10, 0.88)',
    borderGlow: 'rgba(245, 158, 11, 0.4)',
    routeColor: '#f59e0b',
    radarRingColor: '#f59e0b',
    starsActiveColor: '#e11d48',
    badgeBg: '#b45309',
    vibe: '90lar Altın Amber CRT Radar, Grove St & Saygınlık'
  },
  liberty_city: {
    id: 'liberty_city',
    name: 'Liberty City (Gritty Noir)',
    gameTitle: 'GTA IV LIBERTY CITY',
    yearEra: '2008',
    primaryColor: '#38bdf8',
    secondaryColor: '#fb923c',
    accentColor: '#e2e8f0',
    bgDark: '#0a0d12',
    panelBg: 'rgba(17, 24, 39, 0.88)',
    borderGlow: 'rgba(56, 189, 248, 0.35)',
    routeColor: '#38bdf8',
    radarRingColor: '#64748b',
    starsActiveColor: '#f87171',
    badgeBg: '#0284c7',
    vibe: 'Karanlık Asfalt, Soğuk Sarı Sokak Lambaları & Köprüler'
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Night City Matrix (2077)',
    gameTitle: 'CYBER GTA 2077',
    yearEra: '2077',
    primaryColor: '#f43f5e',
    secondaryColor: '#00f0ff',
    accentColor: '#facc15',
    bgDark: '#030308',
    panelBg: 'rgba(10, 8, 20, 0.92)',
    borderGlow: 'rgba(244, 63, 94, 0.45)',
    routeColor: '#f43f5e',
    radarRingColor: '#00f0ff',
    starsActiveColor: '#ff0055',
    badgeBg: '#e11d48',
    vibe: 'Neon Kırmızı & Siyan Vektör HUD, Yüksek Hızlı Gelecek'
  }
};
