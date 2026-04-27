import exifr from "exifr";

export interface PhotoRecord {
  id: string;
  url: string;
  fileName: string;
  takenAt?: number; // epoch ms
  lat?: number;
  lon?: number;
  city?: string;
  country?: string;
  continent?: string;
}

export interface ExplorationStats {
  level: number;          // 1..100
  coverage: number;       // 0..100 (%)
  citiesCount: number;
  countriesCount: number;
  continentsCount: number;
  distanceKm: number;
  globalRank: number;     // mock rank
  topPercent: number;     // mock top %
}

/* ---------- EXIF extraction ---------- */
export async function extractPhotoMeta(file: File): Promise<PhotoRecord> {
  const url = URL.createObjectURL(file);
  const id = `${file.name}-${file.size}-${file.lastModified}`;
  let lat: number | undefined;
  let lon: number | undefined;
  let takenAt: number | undefined;

  try {
    const data = await exifr.parse(file, { gps: true, tiff: true, exif: true });
    if (data) {
      if (typeof data.latitude === "number") lat = data.latitude;
      if (typeof data.longitude === "number") lon = data.longitude;
      const dt = data.DateTimeOriginal || data.CreateDate || data.ModifyDate;
      if (dt instanceof Date) takenAt = dt.getTime();
    }
  } catch {
    /* ignore */
  }

  const rec: PhotoRecord = { id, url, fileName: file.name, lat, lon, takenAt };
  if (lat != null && lon != null) {
    const geo = reverseGeocode(lat, lon);
    rec.city = geo.city;
    rec.country = geo.country;
    rec.continent = geo.continent;
  }
  return rec;
}

/* ---------- Lightweight offline reverse geocoding ----------
 * No network. Picks the nearest known city from a small seed list,
 * within a 400km radius. Otherwise falls back to a continent guess
 * by latitude/longitude bounding box.
 */
interface SeedCity {
  city: string;
  country: string;
  continent: string;
  lat: number;
  lon: number;
}

const SEED_CITIES: SeedCity[] = [
  { city: "서울", country: "대한민국", continent: "아시아", lat: 37.5665, lon: 126.978 },
  { city: "부산", country: "대한민국", continent: "아시아", lat: 35.1796, lon: 129.0756 },
  { city: "제주", country: "대한민국", continent: "아시아", lat: 33.4996, lon: 126.5312 },
  { city: "도쿄", country: "일본", continent: "아시아", lat: 35.6762, lon: 139.6503 },
  { city: "오사카", country: "일본", continent: "아시아", lat: 34.6937, lon: 135.5023 },
  { city: "베이징", country: "중국", continent: "아시아", lat: 39.9042, lon: 116.4074 },
  { city: "상하이", country: "중국", continent: "아시아", lat: 31.2304, lon: 121.4737 },
  { city: "방콕", country: "태국", continent: "아시아", lat: 13.7563, lon: 100.5018 },
  { city: "싱가포르", country: "싱가포르", continent: "아시아", lat: 1.3521, lon: 103.8198 },
  { city: "발리", country: "인도네시아", continent: "아시아", lat: -8.4095, lon: 115.1889 },
  { city: "두바이", country: "UAE", continent: "아시아", lat: 25.2048, lon: 55.2708 },
  { city: "런던", country: "영국", continent: "유럽", lat: 51.5074, lon: -0.1278 },
  { city: "파리", country: "프랑스", continent: "유럽", lat: 48.8566, lon: 2.3522 },
  { city: "로마", country: "이탈리아", continent: "유럽", lat: 41.9028, lon: 12.4964 },
  { city: "바르셀로나", country: "스페인", continent: "유럽", lat: 41.3851, lon: 2.1734 },
  { city: "베를린", country: "독일", continent: "유럽", lat: 52.52, lon: 13.405 },
  { city: "암스테르담", country: "네덜란드", continent: "유럽", lat: 52.3676, lon: 4.9041 },
  { city: "이스탄불", country: "튀르키예", continent: "유럽", lat: 41.0082, lon: 28.9784 },
  { city: "뉴욕", country: "미국", continent: "북아메리카", lat: 40.7128, lon: -74.006 },
  { city: "로스앤젤레스", country: "미국", continent: "북아메리카", lat: 34.0522, lon: -118.2437 },
  { city: "샌프란시스코", country: "미국", continent: "북아메리카", lat: 37.7749, lon: -122.4194 },
  { city: "토론토", country: "캐나다", continent: "북아메리카", lat: 43.6532, lon: -79.3832 },
  { city: "멕시코시티", country: "멕시코", continent: "북아메리카", lat: 19.4326, lon: -99.1332 },
  { city: "리우데자네이루", country: "브라질", continent: "남아메리카", lat: -22.9068, lon: -43.1729 },
  { city: "부에노스아이레스", country: "아르헨티나", continent: "남아메리카", lat: -34.6037, lon: -58.3816 },
  { city: "리마", country: "페루", continent: "남아메리카", lat: -12.0464, lon: -77.0428 },
  { city: "케이프타운", country: "남아프리카공화국", continent: "아프리카", lat: -33.9249, lon: 18.4241 },
  { city: "카이로", country: "이집트", continent: "아프리카", lat: 30.0444, lon: 31.2357 },
  { city: "나이로비", country: "케냐", continent: "아프리카", lat: -1.2921, lon: 36.8219 },
  { city: "시드니", country: "호주", continent: "오세아니아", lat: -33.8688, lon: 151.2093 },
  { city: "오클랜드", country: "뉴질랜드", continent: "오세아니아", lat: -36.8485, lon: 174.7633 },
];

function continentFromCoords(lat: number, lon: number): string {
  if (lat > 35 && lon > -10 && lon < 60) return "유럽";
  if (lat > -10 && lat < 55 && lon >= 60 && lon < 180) return "아시아";
  if (lat > 15 && lon < -50) return "북아메리카";
  if (lat <= 15 && lat > -60 && lon < -30) return "남아메리카";
  if (lat < 35 && lon > -20 && lon < 55) return "아프리카";
  if (lat < 0 && lon > 110) return "오세아니아";
  return "기타";
}

export function reverseGeocode(lat: number, lon: number) {
  let best: SeedCity | null = null;
  let bestDist = Infinity;
  for (const c of SEED_CITIES) {
    const d = haversineKm(lat, lon, c.lat, c.lon);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  if (best && bestDist <= 400) {
    return { city: best.city, country: best.country, continent: best.continent };
  }
  return {
    city: `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
    country: "—",
    continent: continentFromCoords(lat, lon),
  };
}

/* ---------- Distance ---------- */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/* ---------- Coverage scoring ----------
 * Combines unique cities, country diversity, continent diversity, and total distance.
 */
export function computeStats(photos: PhotoRecord[]): ExplorationStats {
  const located = photos.filter((p) => p.lat != null && p.lon != null);
  const cities = new Set(located.map((p) => p.city).filter(Boolean) as string[]);
  const countries = new Set(located.map((p) => p.country).filter(Boolean) as string[]);
  const continents = new Set(located.map((p) => p.continent).filter(Boolean) as string[]);

  // total distance: sum nearest-neighbor distances ordered by takenAt
  const ordered = [...located].sort((a, b) => (a.takenAt ?? 0) - (b.takenAt ?? 0));
  let distanceKm = 0;
  for (let i = 1; i < ordered.length; i++) {
    distanceKm += haversineKm(ordered[i - 1].lat!, ordered[i - 1].lon!, ordered[i].lat!, ordered[i].lon!);
  }

  // Coverage: weighted, capped 0..100
  const cityScore = Math.min(cities.size / 20, 1) * 35;        // up to 35
  const countryScore = Math.min(countries.size / 10, 1) * 25;  // up to 25
  const continentScore = Math.min(continents.size / 6, 1) * 25;// up to 25
  const distScore = Math.min(distanceKm / 40000, 1) * 15;      // up to 15
  const coverage = Math.round(cityScore + countryScore + continentScore + distScore);

  const level = Math.max(1, Math.min(100, Math.round(coverage)));
  // Mock global rank inversely correlated with coverage
  const globalRank = Math.max(1, Math.round(50000 * (1 - coverage / 100) + 50));
  const topPercent = Math.max(1, Math.round(100 - coverage));

  return {
    level,
    coverage,
    citiesCount: cities.size,
    countriesCount: countries.size,
    continentsCount: continents.size,
    distanceKm: Math.round(distanceKm),
    globalRank,
    topPercent,
  };
}
