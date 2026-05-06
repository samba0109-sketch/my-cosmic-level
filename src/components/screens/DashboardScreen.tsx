import { ArrowUpRight, Building2, Check, Globe, MapPin, Plane, Route, Sparkles } from "lucide-react";
import { useExploration } from "@/context/ExplorationContext";
import type { RecordsView } from "@/components/screens/RecordsScreen";

interface Props {
  onStart: () => void;
  onOpenRecords: (opts?: { view?: RecordsView; city?: string }) => void;
}

const StatRow = ({ label, value, suffix }: { label: string; value: string; suffix?: string }) => (
  <div className="flex items-baseline justify-between border-b border-border py-3 last:border-0">
    <span className="text-[13px] text-muted-foreground">{label}</span>
    <span className="text-[18px] font-bold tracking-tight text-foreground">
      {value}
      {suffix && <span className="ml-1 text-[12px] font-medium text-muted-foreground">{suffix}</span>}
    </span>
  </div>
);

const DashboardScreen = ({ onStart, onOpenRecords }: Props) => {
  const { stats, photos } = useExploration();

  // build top cities from photos
  const cityMap = new Map<string, number>();
  photos.forEach((p) => {
    if (p.city) cityMap.set(p.city, (cityMap.get(p.city) ?? 0) + 1);
  });
  const topCities = [...cityMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const maxCount = topCities[0]?.[1] ?? 1;

  // 탐사 유형 → 다음 행선지 행성 매핑
  const types = [
    {
      key: "city",
      icon: Building2,
      name: "도시 콜렉터",
      planet: "Neonova",
      desc: "네온이 빛나는 메트로폴리스 행성",
      current: stats.citiesCount,
      goal: 5,
      unit: "도시",
    },
    {
      key: "country",
      icon: Globe,
      name: "글로벌 모험가",
      planet: "Pangea-7",
      desc: "다문화가 공존하는 다양성의 행성",
      current: stats.countriesCount,
      goal: 3,
      unit: "국가",
    },
    {
      key: "continent",
      icon: Sparkles,
      name: "대륙 정복자",
      planet: "Gondwana",
      desc: "거대한 대륙들이 펼쳐진 행성",
      current: stats.continentsCount,
      goal: 3,
      unit: "대륙",
    },
    {
      key: "distance",
      icon: Route,
      name: "장거리 탐험가",
      planet: "Outer-Reach",
      desc: "은하 변경에 자리한 미지의 행성",
      current: stats.distanceKm,
      goal: 10000,
      unit: "km",
    },
    {
      key: "record",
      icon: Plane,
      name: "기록 매니아",
      planet: "Memorium",
      desc: "모든 기록이 보관된 아카이브 행성",
      current: photos.length,
      goal: 20,
      unit: "장",
    },
  ];

  return (
    <div className="animate-fade-up flex min-h-[calc(100dvh-3.5rem)] flex-col gap-5 px-5 pb-32 pt-2">
      {/* Score ring */}
      <section className="flex flex-col items-center pt-4">
        <div className="relative h-56 w-56">
          <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
            <circle cx="100" cy="100" r="88" fill="none" stroke="hsl(var(--secondary))" strokeWidth="10" />
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${(stats.coverage / 100) * 553} 553`}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[11px] font-semibold tracking-widest text-muted-foreground">EXPLORATION SCORE</span>
            <span className="mt-1 text-[44px] font-bold leading-none tracking-tight text-foreground">
              {stats.coverage.toLocaleString()}
              <span className="ml-1 text-[20px] text-muted-foreground">점</span>
            </span>
            <span className="mt-1 text-[12px] text-muted-foreground">나의 탐사 점수</span>
          </div>
        </div>
      </section>

      {/* Quick stats */}
      <section className="mono-card">
        <StatRow label="총 탐사 도시" value={String(stats.citiesCount)} suffix="Cities" />
        <StatRow label="탐사한 거리" value={stats.distanceKm.toLocaleString()} suffix="km" />
        <StatRow label="방문 국가" value={String(stats.countriesCount)} suffix="Countries" />
        <StatRow label="글로벌 랭킹" value={`#${stats.globalRank.toLocaleString()}`} suffix={`top ${stats.topPercent}%`} />
      </section>

      {/* Top cities */}
      <section className="mono-card">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[14px] font-bold text-foreground">내가 탐사한 도시</p>
          <button
            onClick={() => onOpenRecords({ view: "grid" })}
            className="flex items-center gap-0.5 text-[12px] font-medium text-muted-foreground"
          >
            모두 보기 <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
        {topCities.length === 0 ? (
          <p className="py-6 text-center text-[12px] text-muted-foreground">
            아직 기록이 없어요. 사진을 업로드해보세요.
          </p>
        ) : (
          <div className="space-y-3">
            {topCities.map(([city, count]) => {
              const pct = Math.round((count / maxCount) * 100);
              return (
                <button
                  key={city}
                  onClick={() => onOpenRecords({ view: "grid", city })}
                  className="block w-full text-left transition-opacity active:opacity-60"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-[13px] font-semibold text-foreground">{city}</span>
                    </div>
                    <span className="text-[12px] font-medium text-muted-foreground">{count}장</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Exploration types → 다음 행선지 */}
      <section className="mono-card">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground">NEXT DESTINATIONS</p>
            <p className="mt-0.5 text-[14px] font-bold text-foreground">나의 탐사 유형 · 행선지 행성</p>
          </div>
          <button
            onClick={onStart}
            className="text-[11px] font-bold text-primary"
          >
            보딩 카운터로
          </button>
        </div>
        <div className="space-y-3">
          {types.map((t) => {
            const Icon = t.icon;
            const pct = Math.min(100, Math.round((t.current / t.goal) * 100));
            const achieved = t.current >= t.goal;
            return (
              <div
                key={t.key}
                className={`rounded-xl border p-3 transition-colors ${
                  achieved ? "border-primary/40 bg-primary/5" : "border-border"
                }`}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        achieved ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                      }`}
                    >
                      {achieved ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-[13px] font-bold text-foreground">{t.name}</p>
                        <span className="rounded bg-secondary px-1.5 py-px text-[9px] font-bold tracking-wider text-muted-foreground">
                          → {t.planet.toUpperCase()}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{t.desc}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-[11px] font-bold text-muted-foreground">
                    {t.current.toLocaleString()}/{t.goal.toLocaleString()}{t.unit}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      achieved ? "bg-primary" : "bg-foreground/60"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default DashboardScreen;
