/* ── 별 조각 획득 로직 (문서 기반) ── */

export interface ZodiacInfo {
  id: string;
  name: string;         // 게자리
  character: string;    // 집콩이
  symbol: string;       // ♋
  dates: string;        // 6.22~7.22
  keywords: string;
  message: string;
  luckyColor: string;
  luckyNumber: number;
  luckyTime: string;
  image: string;        // /zodiac/{id}.png (없으면 /byeolkong.png 폴백)
}

export const ZODIACS: ZodiacInfo[] = [
  {
    id: "aries", name: "양자리", character: "활콩이", symbol: "♈", dates: "3.21~4.19",
    keywords: "용감/직진/선두",
    message: "오늘은 망설이지 말고 첫걸음을 내디뎌요",
    luckyColor: "빨강", luckyNumber: 7, luckyTime: "오전",
    image: "/zodiac/aries.png",
  },
  {
    id: "taurus", name: "황소자리", character: "뿔콩이", symbol: "♉", dates: "4.20~5.20",
    keywords: "묵묵/단단/신중",
    message: "서두르지 않아도 괜찮아요. 천천히 가도 도착해요",
    luckyColor: "초록", luckyNumber: 4, luckyTime: "저녁",
    image: "/zodiac/taurus.png",
  },
  {
    id: "gemini", name: "쌍둥이자리", character: "둘콩이", symbol: "♊", dates: "5.21~6.21",
    keywords: "발랄/호기심/양면",
    message: "오늘 누군가가 새로운 이야기를 들려줄 거예요",
    luckyColor: "노랑", luckyNumber: 3, luckyTime: "점심",
    image: "/zodiac/gemini.png",
  },
  {
    id: "cancer", name: "게자리", character: "집콩이", symbol: "♋", dates: "6.22~7.22",
    keywords: "따뜻/가정적/다정",
    message: "소중한 사람에게 안부를 전해보세요",
    luckyColor: "은색", luckyNumber: 2, luckyTime: "새벽",
    image: "/zodiac/cancer.png",
  },
  {
    id: "leo", name: "사자자리", character: "갈기콩이", symbol: "♌", dates: "7.23~8.22",
    keywords: "당당/빛남/리더",
    message: "당신의 빛을 숨기지 마세요. 오늘은 주인공이에요",
    luckyColor: "금색", luckyNumber: 1, luckyTime: "정오",
    image: "/zodiac/leo.png",
  },
  {
    id: "virgo", name: "처녀자리", character: "꽃콩이", symbol: "♍", dates: "8.23~9.22",
    keywords: "섬세/차분/완벽",
    message: "작은 것 하나가 큰 차이를 만드는 날이에요",
    luckyColor: "베이지", luckyNumber: 6, luckyTime: "오전",
    image: "/zodiac/virgo.png",
  },
  {
    id: "libra", name: "천칭자리", character: "저울콩이", symbol: "♎", dates: "9.23~10.22",
    keywords: "우아/조화/평온",
    message: "서로 다른 두 마음 사이에서 균형을 찾아보세요",
    luckyColor: "핑크", luckyNumber: 5, luckyTime: "오후",
    image: "/zodiac/libra.png",
  },
  {
    id: "scorpio", name: "전갈자리", character: "꼬리콩이", symbol: "♏", dates: "10.23~11.21",
    keywords: "신비/깊이/통찰",
    message: "직감을 믿어요. 오늘 당신의 감은 정확해요",
    luckyColor: "검정", luckyNumber: 8, luckyTime: "밤",
    image: "/zodiac/scorpio.png",
  },
  {
    id: "sagittarius", name: "사수자리", character: "화살콩이", symbol: "♐", dates: "11.22~12.21",
    keywords: "자유/낙천/모험",
    message: "멀리 떠나고 싶다면, 오늘이 그 시작이에요",
    luckyColor: "보라", luckyNumber: 9, luckyTime: "늦은오후",
    image: "/zodiac/sagittarius.png",
  },
  {
    id: "capricorn", name: "염소자리", character: "산콩이", symbol: "♑", dates: "12.22~1.19",
    keywords: "성실/야망/묵직",
    message: "한 걸음씩 쌓아온 것이 빛나는 날이에요",
    luckyColor: "갈색", luckyNumber: 10, luckyTime: "새벽",
    image: "/zodiac/capricorn.png",
  },
  {
    id: "aquarius", name: "물병자리", character: "물병콩이", symbol: "♒", dates: "1.20~2.18",
    keywords: "독창/자유/미래",
    message: "남들과 다른 길도 괜찮아요. 그게 당신만의 별자리예요",
    luckyColor: "하늘색", luckyNumber: 11, luckyTime: "한밤",
    image: "/zodiac/aquarius.png",
  },
  {
    id: "pisces", name: "물고기자리", character: "지느러미콩이", symbol: "♓", dates: "2.19~3.20",
    keywords: "꿈꾸는/다정/직관",
    message: "마음이 향하는 곳에 답이 있어요",
    luckyColor: "청록", luckyNumber: 12, luckyTime: "저녁",
    image: "/zodiac/pisces.png",
  },
];

const zodiacById = new Map(ZODIACS.map((z) => [z.id, z]));

/* ── 시간대 → 후보 2개 ── */
function getTimeCandidates(hour: number): [string, string] {
  if (hour < 6)  return ["cancer", "capricorn"];
  if (hour < 11) return ["aries", "virgo"];
  if (hour < 14) return ["gemini", "leo"];
  if (hour < 18) return ["libra", "sagittarius"];
  if (hour < 21) return ["taurus", "pisces"];
  return ["scorpio", "aquarius"];
}

/* ── 위치 → 가중치 맵 ── */
function getLocationWeights(lat?: number | null, lon?: number | null, city?: string | null): Map<string, number> {
  const w = new Map<string, number>();
  if (lat == null) return w;

  // 해안·강 (위도별 간단 판별 + 주요 해안도시)
  const coastalCities = ["부산", "인천", "제주", "속초", "강릉", "여수", "통영", "거제", "목포"];
  const isCoastal = coastalCities.some((c) => city?.includes(c));
  if (isCoastal) {
    ["cancer", "pisces", "aquarius"].forEach((id) => w.set(id, (w.get(id) ?? 0) + 1));
  }

  // 산·자연 (위도 기준 도시 외곽 추정)
  const mountainCities = ["강릉", "평창", "인제", "양양", "설악", "지리산", "한라"];
  const isMountain = mountainCities.some((c) => city?.includes(c));
  if (isMountain) {
    ["capricorn", "taurus"].forEach((id) => w.set(id, (w.get(id) ?? 0) + 1));
  }

  // 도시 중심 (기본값)
  if (!isCoastal && !isMountain) {
    ["leo", "gemini"].forEach((id) => w.set(id, (w.get(id) ?? 0) + 1));
  }

  return w;
}

/* ── 계절 → 가중치 맵 ── */
function getSeasonWeights(month: number): Map<string, number> {
  const w = new Map<string, number>();
  let seasonal: string[];
  if (month >= 3 && month <= 5)       seasonal = ["aries", "taurus", "gemini"];
  else if (month >= 6 && month <= 8)  seasonal = ["cancer", "leo", "virgo"];
  else if (month >= 9 && month <= 11) seasonal = ["libra", "scorpio", "sagittarius"];
  else                                seasonal = ["capricorn", "aquarius", "pisces"];
  seasonal.forEach((id) => w.set(id, (w.get(id) ?? 0) + 1));
  return w;
}

/* ── 메인: 별 조각 결정 ── */
export function computeZodiac(
  takenAt?: number | null,
  lat?: number | null,
  lon?: number | null,
  city?: string | null,
  collectedIds: string[] = [],
): ZodiacInfo {
  const date = takenAt ? new Date(takenAt) : new Date();
  const hour = date.getHours();
  const month = date.getMonth() + 1;

  const [c1, c2] = getTimeCandidates(hour);
  const candidates = [c1, c2];

  // 수집 안 된 별자리 우선
  const uncollected = candidates.filter((id) => !collectedIds.includes(id));
  if (uncollected.length === 1) {
    return zodiacById.get(uncollected[0])!;
  }

  // 가중치 산출
  const scores = new Map<string, number>([[c1, 0], [c2, 0]]);
  const locW = getLocationWeights(lat, lon, city);
  const seaW = getSeasonWeights(month);

  for (const [id, score] of [...locW, ...seaW]) {
    if (scores.has(id)) scores.set(id, (scores.get(id) ?? 0) + score);
  }

  // 높은 쪽 선택 (동점이면 c1 우선 or 미수집 우선)
  const s1 = scores.get(c1) ?? 0;
  const s2 = scores.get(c2) ?? 0;

  let winner: string;
  if (s1 > s2) winner = c1;
  else if (s2 > s1) winner = c2;
  else winner = uncollected.length > 0 ? uncollected[0] : c1;

  return zodiacById.get(winner)!;
}
