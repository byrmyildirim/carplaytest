import { GtaLocation, RouteAlternative, TurnManeuver } from '../types';

/**
 * Calculates bearing angle (0-360) between two coordinates
 */
export function calculateBearing(startLat: number, startLng: number, endLat: number, endLng: number): number {
  const rad = Math.PI / 180;
  const lat1 = startLat * rad;
  const lat2 = endLat * rad;
  const dLng = (endLng - startLng) * rad;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const brng = Math.atan2(y, x) * (180 / Math.PI);
  return (brng + 360) % 360;
}

/**
 * Calculate distance in km between two lat/lng points using Haversine formula
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Interpolates smooth waypoints between two points with realistic curves
 */
function generateRoadCurve(
  p1: [number, number],
  p2: [number, number],
  variance: number,
  steps: number = 8
): [number, number][] {
  const points: [number, number][] = [];
  const midLat = (p1[0] + p2[0]) / 2 + (Math.random() - 0.5) * variance;
  const midLng = (p1[1] + p2[1]) / 2 + (Math.random() - 0.5) * variance;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Quadratic bezier curve
    const lat = (1 - t) * (1 - t) * p1[0] + 2 * (1 - t) * t * midLat + t * t * p2[0];
    const lng = (1 - t) * (1 - t) * p1[1] + 2 * (1 - t) * t * midLng + t * t * p2[1];
    points.push([lat, lng]);
  }
  return points;
}

/**
 * Generate 3 realistic route alternatives between origin and destination
 */
export function generateRoutes(origin: GtaLocation, dest: GtaLocation): RouteAlternative[] {
  const baseDist = Math.max(1.8, calculateDistanceKm(origin.lat, origin.lng, dest.lat, dest.lng));
  const isVice = origin.city === 'Vice City' || dest.city === 'Vice City';
  const isLS = origin.city === 'Los Santos' || dest.city === 'Los Santos';

  // 1. Highway Express
  const highwayCoords = [
    ...generateRoadCurve([origin.lat, origin.lng], [(origin.lat + dest.lat)/2, (origin.lng + dest.lng)/2], 0.005, 12),
    ...generateRoadCurve([(origin.lat + dest.lat)/2, (origin.lng + dest.lng)/2], [dest.lat, dest.lng], 0.003, 12)
  ];

  // 2. Coastal / Scenic Route
  const coastalCoords = [
    ...generateRoadCurve([origin.lat, origin.lng], [(origin.lat + dest.lat)/2 + 0.015, (origin.lng + dest.lng)/2 + 0.012], 0.012, 14),
    ...generateRoadCurve([(origin.lat + dest.lat)/2 + 0.015, (origin.lng + dest.lng)/2 + 0.012], [dest.lat, dest.lng], 0.008, 14)
  ];

  // 3. Stealth Back-Alley Route
  const stealthCoords = [
    ...generateRoadCurve([origin.lat, origin.lng], [(origin.lat + dest.lat)/2 - 0.012, (origin.lng + dest.lng)/2 - 0.015], 0.015, 16),
    ...generateRoadCurve([(origin.lat + dest.lat)/2 - 0.012, (origin.lng + dest.lng)/2 - 0.015], [dest.lat, dest.lng], 0.01, 14)
  ];

  const streetNamesHighway = isVice 
    ? ['Ocean Drive Bulvarı', 'Bayshore Otoyolu', 'Starfish Köprüsü', 'Vice Point Caddesi']
    : isLS 
    ? ['Del Perro Freeway', 'Vinewood Otoyolu', 'San Andreas Bulvarı', 'Olympic Ave']
    : ['Büyükdere Caddesi', 'O-1 Çevre Yolu', 'Boğaziçi Bağlantısı', 'Sahil Yolu'];

  const streetNamesScenic = isVice
    ? ['Washington Ave Sahil Yolu', 'Palm Cove Gezinti Yolu', 'Marina Drive', 'Lighthouse Yolu']
    : isLS
    ? ['Pacific Coast Highway', 'Vespucci Boardwalk', 'Palomino Highlands', 'Tonga Tepesi']
    : ['Bebek Sahil Caddesi', 'Rumeli Hisarı Geçişi', 'Tarabya Koyu', 'İstinye Marina'];

  const maneuversHighway: TurnManeuver[] = [
    {
      id: 'm1',
      instruction: `${origin.name} çıkışından sağa ${streetNamesHighway[0]} yönüne dönün`,
      distanceMeters: 350,
      action: 'right',
      streetName: streetNamesHighway[0],
      speedLimit: 70
    },
    {
      id: 'm2',
      instruction: `${streetNamesHighway[1]} katılım kavşağına girin ve 3.2 km devam edin`,
      distanceMeters: 800,
      action: 'slight_right',
      streetName: streetNamesHighway[1],
      speedLimit: 120
    },
    {
      id: 'm3',
      instruction: `${streetNamesHighway[2]} çıkışından sola dönün`,
      distanceMeters: 3200,
      action: 'left',
      streetName: streetNamesHighway[2],
      speedLimit: 90
    },
    {
      id: 'm4',
      instruction: `Döner kavşaktan 2. çıkışı kullanarak ${streetNamesHighway[3]} yoluna bağlanın`,
      distanceMeters: 650,
      action: 'roundabout',
      streetName: streetNamesHighway[3],
      speedLimit: 60
    },
    {
      id: 'm5',
      instruction: `${dest.name} hedefine ulaştınız`,
      distanceMeters: 200,
      action: 'arrival',
      streetName: dest.name,
      speedLimit: 50
    }
  ];

  const maneuversScenic: TurnManeuver[] = [
    {
      id: 'm2_1',
      instruction: `${streetNamesScenic[0]} boyunca sahil hattına doğru ilerleyin`,
      distanceMeters: 500,
      action: 'straight',
      streetName: streetNamesScenic[0],
      speedLimit: 60
    },
    {
      id: 'm2_2',
      instruction: `${streetNamesScenic[1]} kavşağından sola virajlı yola girin`,
      distanceMeters: 1200,
      action: 'slight_left',
      streetName: streetNamesScenic[1],
      speedLimit: 70
    },
    {
      id: 'm2_3',
      instruction: `${streetNamesScenic[2]} boyunca deniz manzaralı virajları takip edin`,
      distanceMeters: 2400,
      action: 'straight',
      streetName: streetNamesScenic[2],
      speedLimit: 80
    },
    {
      id: 'm2_4',
      instruction: `${dest.name} giriş kapısına yanaşın`,
      distanceMeters: 400,
      action: 'arrival',
      streetName: dest.name,
      speedLimit: 40
    }
  ];

  const maneuversStealth: TurnManeuver[] = [
    {
      id: 'm3_1',
      instruction: 'Ana cadde yerine arka servis yoluna gizlice sapın',
      distanceMeters: 250,
      action: 'right',
      streetName: 'Arka Sokak Koridoru',
      speedLimit: 50
    },
    {
      id: 'm3_2',
      instruction: 'Polis radarını atlatmak için viyadük altından devam edin',
      distanceMeters: 900,
      action: 'slight_left',
      streetName: 'Viyadük Altı Sanayi Geçidi',
      speedLimit: 60
    },
    {
      id: 'm3_3',
      instruction: 'Sanayi depoları arasından hızlı u-dönüşü yapın',
      distanceMeters: 1600,
      action: 'u_turn',
      streetName: 'Lojistik Depolar Hattı',
      speedLimit: 60
    },
    {
      id: 'm3_4',
      instruction: `${dest.name} arka otoparkına güvenle giriş yapın`,
      distanceMeters: 300,
      action: 'arrival',
      streetName: dest.name,
      speedLimit: 40
    }
  ];

  return [
    {
      id: 'route_highway',
      name: 'Otoyol Ekspres Koridoru',
      tag: 'EN HIZLI',
      summary: 'Yüksek hız limiti, minimum dönüş, geniş otoyol şeritleri',
      distanceKm: parseFloat((baseDist * 1.1).toFixed(1)),
      durationMin: Math.max(4, Math.round(baseDist * 0.9)),
      tollFree: false,
      policeRisk: 'Medium',
      trafficDelayMin: 2,
      coordinates: highwayCoords,
      maneuvers: maneuversHighway
    },
    {
      id: 'route_scenic',
      name: 'Sahil Şeridi & Drift Rotası',
      tag: 'MANZARALI',
      summary: 'Geniş deniz manzarası, akıcı virajlar, ücretsiz geçiş',
      distanceKm: parseFloat((baseDist * 1.35).toFixed(1)),
      durationMin: Math.max(6, Math.round(baseDist * 1.3)),
      tollFree: true,
      policeRisk: 'Low',
      trafficDelayMin: 0,
      coordinates: coastalCoords,
      maneuvers: maneuversScenic
    },
    {
      id: 'route_stealth',
      name: 'Kaçış & Arka Sokaklar Rotası',
      tag: 'RADARSIZ GİZLİ',
      summary: 'EDS ve radar kameralarını baypas eder, düşük polis yoğunluğu',
      distanceKm: parseFloat((baseDist * 1.25).toFixed(1)),
      durationMin: Math.max(5, Math.round(baseDist * 1.15)),
      tollFree: true,
      policeRisk: 'Low',
      trafficDelayMin: 1,
      coordinates: stealthCoords,
      maneuvers: maneuversStealth
    }
  ];
}
