import { GtaLocation, RadioStation, VehicleModel } from '../types';

export interface VehicleSpec {
  id: VehicleModel;
  name: string;
  category: string;
  topSpeedKmh: number;
  acceleration: string;
  handling: string;
  description: string;
  color: string;
}

export const VEHICLE_SPECS: Record<VehicleModel, VehicleSpec> = {
  infernus: {
    id: 'infernus',
    name: 'Pegassi Infernus',
    category: 'Supercar',
    topSpeedKmh: 315,
    acceleration: '2.8s 0-100',
    handling: 'Traction AWD',
    description: 'V12 ortadan motorlu, efsanevi Vice City süper otomobili.',
    color: '#ff007f'
  },
  banshee: {
    id: 'banshee',
    name: 'Bravado Banshee',
    category: 'Muscle Sport',
    topSpeedKmh: 285,
    acceleration: '3.3s 0-100',
    handling: 'Drift RWD',
    description: 'İkonik çift şeritli, safkan V10 Amerikan canavarı.',
    color: '#00d2ff'
  },
  cheetah: {
    id: 'cheetah',
    name: 'Grotti Cheetah',
    category: 'Exotic Classic',
    topSpeedKmh: 298,
    acceleration: '3.1s 0-100',
    handling: 'Agile Mid-Engine',
    description: '80ler İtalyan kama tasarımı, yüksek devirli V8.',
    color: '#f59e0b'
  },
  comet: {
    id: 'comet',
    name: 'Pfister Comet S2',
    category: 'Track Sport',
    topSpeedKmh: 290,
    acceleration: '3.0s 0-100',
    handling: 'Rear Engine Precision',
    description: 'Hassas viraj hakimiyeti ve turbo şarjlı boksör motor.',
    color: '#10b981'
  },
  sanchez: {
    id: 'sanchez',
    name: 'Maibatsu Sanchez',
    category: 'Off-Road Enduro',
    topSpeedKmh: 180,
    acceleration: '3.7s 0-100',
    handling: 'Extreme Offroad',
    description: 'Trafik sıkışıklıklarını ve dağ yollarını yaran tek teker canavarı.',
    color: '#ec4899'
  },
  cruiser: {
    id: 'cruiser',
    name: 'Vapid Police Cruiser',
    category: 'Pursuit Interceptor',
    topSpeedKmh: 260,
    acceleration: '4.2s 0-100',
    handling: 'Heavy Duty Police Tuned',
    description: 'Telsiz tarayıcı ve siren donanımlı resmi devriye aracı.',
    color: '#3b82f6'
  }
};

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'flash_fm',
    name: 'Flash FM',
    frequency: '102.9 FM',
    genre: '80s Synthwave & Pop',
    dj: 'Toni',
    tagline: 'Vice City’nin en parlak retro synth melodileri',
    accentColor: '#ec4899',
    bpm: 118
  },
  {
    id: 'radio_los_santos',
    name: 'Radio Los Santos',
    frequency: '92.5 FM',
    genre: 'West Coast Hip-Hop & Trap',
    dj: 'Big Boy',
    tagline: 'Sokakların ritmi, saf ritim ve düşük frekans',
    accentColor: '#f59e0b',
    bpm: 96
  },
  {
    id: 'v_rock',
    name: 'V-Rock 104.2',
    frequency: '104.2 FM',
    genre: 'Hard Rock & Heavy Metal',
    dj: 'Lazlow Jones',
    tagline: 'Otoyolda gaza sonuna kadar basman için sert gitar riffleri',
    accentColor: '#ef4444',
    bpm: 132
  },
  {
    id: 'wave_103',
    name: 'Wave 103',
    frequency: '103.1 FM',
    genre: 'New Wave & Dark Synth',
    dj: 'Adam First',
    tagline: 'Gece sürüşleri ve okyanus sahil yolu için karanlık synth',
    accentColor: '#06b6d4',
    bpm: 124
  },
  {
    id: 'k_dst',
    name: 'K-DST The Dust',
    frequency: '91.1 FM',
    genre: 'Classic Road Rock',
    dj: 'Tommy "The Nightmare" Smith',
    tagline: 'Çöl otoyolları ve uzun rotalar için kesintisiz klasik rock',
    accentColor: '#84cc16',
    bpm: 108
  },
  {
    id: 'night_city_beats',
    name: 'Cyber Pulse 107',
    frequency: '107.7 FM',
    genre: 'Darksynth & Industrial Bass',
    dj: 'V-Operator',
    tagline: 'Geleceğin otoyol savaşçıları için yüksek tempolu baslar',
    accentColor: '#8b5cf6',
    bpm: 136
  }
];

export const GTA_LOCATIONS: GtaLocation[] = [
  // Vice City
  {
    id: 'vc_malibu',
    name: 'Malibu Club',
    city: 'Vice City',
    district: 'Vice Point',
    lat: 25.7907,
    lng: -80.1300,
    type: 'safehouse',
    description: 'VIP teras, neon aydınlatma ve gizli toplantı odaları.'
  },
  {
    id: 'vc_ocean_beach',
    name: 'Ocean View Hotel',
    city: 'Vice City',
    district: 'Ocean Beach',
    lat: 25.7781,
    lng: -80.1313,
    type: 'safehouse',
    description: 'Sahil boyu caddesi, palmiyeler ve okyanus manzaralı başlangıç noktası.'
  },
  {
    id: 'vc_starfish',
    name: 'Starfish Island Malikânesi',
    city: 'Vice City',
    district: 'Starfish Island',
    lat: 25.7820,
    lng: -80.1550,
    type: 'safehouse',
    description: 'Helikopter pisti, havuz ve tam güvenlikli özel ada malikânesi.'
  },
  {
    id: 'vc_spray_point',
    name: 'Pay \'n\' Spray Vice Point',
    city: 'Vice City',
    district: 'Vice Point',
    lat: 25.7960,
    lng: -80.1280,
    type: 'spray',
    description: 'Aracı boya, hasarı onar ve polis aranma seviyesini anında sıfırla.'
  },
  {
    id: 'vc_ammu_downtown',
    name: 'Ammu-Nation Downtown',
    city: 'Vice City',
    district: 'Downtown',
    lat: 25.7995,
    lng: -80.1880,
    type: 'ammu',
    description: 'Taktik ekipman, zırh yelekleri ve atış poligonu.'
  },
  {
    id: 'vc_escobar',
    name: 'Escobar International Airport',
    city: 'Vice City',
    district: 'Little Haiti / Airport',
    lat: 25.7933,
    lng: -80.2089,
    type: 'airport',
    description: 'Özel jet pistleri, hangarlar ve kargo lojistik merkezi.'
  },

  // Los Santos
  {
    id: 'ls_maze_bank',
    name: 'Maze Bank Kulesi',
    city: 'Los Santos',
    district: 'Downtown LS',
    lat: 34.0522,
    lng: -118.2537,
    type: 'landmark',
    description: 'Şehrin en yüksek gökdeleni ve çatı helikopter iniş sahası.'
  },
  {
    id: 'ls_grove_st',
    name: 'Grove Street Çıkmazı',
    city: 'Los Santos',
    district: 'Ganton',
    lat: 33.9350,
    lng: -118.2450,
    type: 'safehouse',
    description: 'Mahallenin kalbi, efsanevi yeşil aile sığınağı.'
  },
  {
    id: 'ls_customs',
    name: 'Los Santos Customs',
    city: 'Los Santos',
    district: 'Burton / Carcer Way',
    lat: 34.0736,
    lng: -118.3750,
    type: 'spray',
    description: 'Turbo yükseltmeleri, gövde kiti modifiyeleri ve renk değişimi.'
  },
  {
    id: 'ls_del_perro',
    name: 'Del Perro İskelesi & Dönme Dolap',
    city: 'Los Santos',
    district: 'Del Perro',
    lat: 34.0102,
    lng: -118.4965,
    type: 'landmark',
    description: 'Pasifik Okyanusu kıyısı ve sahil gezi bulvarı.'
  },
  {
    id: 'ls_vinewood_bowl',
    name: 'Vinewood Tepesi & Yazısı',
    city: 'Los Santos',
    district: 'Vinewood Hills',
    lat: 34.1341,
    lng: -118.3215,
    type: 'race',
    description: 'Virajlı dağ geçitleri ve gece drag yarışları başlangıcı.'
  },

  // Istanbul & International Real World Presets
  {
    id: 'ist_bosphorus',
    name: '15 Temmuz Şehitler Köprüsü',
    city: 'Istanbul',
    district: 'Boğaziçi',
    lat: 41.0458,
    lng: 29.0344,
    type: 'landmark',
    description: 'Kıtalararası otoyol geçişi, yüksek hız koridoru.'
  },
  {
    id: 'ist_kadikoy',
    name: 'Kadıköy Rıhtım & Moda Sahil',
    city: 'Istanbul',
    district: 'Kadıköy',
    lat: 40.9904,
    lng: 29.0253,
    type: 'safehouse',
    description: 'Anadolu yakası merkezi ve sahil sürüş rotası.'
  },
  {
    id: 'ist_levent_plaza',
    name: 'Levent & Maslak Finans Merkezi',
    city: 'Istanbul',
    district: 'Levent',
    lat: 41.0822,
    lng: 29.0125,
    type: 'landmark',
    description: 'Gökdelenler vadisi ve otoyol bağlantı kavşağı.'
  },
  {
    id: 'ist_paynspray_sanayi',
    name: 'Maslak Oto Sanayi (Pay \'n\' Spray)',
    city: 'Istanbul',
    district: 'Maslak',
    lat: 41.1120,
    lng: 29.0240,
    type: 'spray',
    description: 'Usta ellerde motor remap, tampon düzeltme ve hızlı plaka değişimi.'
  }
];

export const SPEED_TRAPS = [
  { id: 'trap_1', lat: 25.7850, lng: -80.1380, limit: 90, name: 'Ocean Highway Radar Kamera' },
  { id: 'trap_2', lat: 25.7940, lng: -80.1700, limit: 110, name: 'Venetian Causeway EDS Sistemi' },
  { id: 'trap_3', lat: 34.0550, lng: -118.2700, limit: 100, name: 'Del Perro Freeway Hız Tuzağı' },
  { id: 'trap_4', lat: 41.0500, lng: 29.0320, limit: 80, name: 'Köprü Girişi Ortalama Hız Koridoru' }
];
