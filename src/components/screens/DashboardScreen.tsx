import { ArrowUpRight, MapPin, Plane, Trophy } from "lucide-react";
import { useExploration } from "@/context/ExplorationContext";

interface Props {
  onStart: () => void;
  onOpenRecords: () => void;
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

  return (
    <div className="animate-fade-up flex min-h-[calc(100dvh-3.5rem)] flex-col gap-5 px-5 pb-32 pt-2">
      {/* Coverage ring */}
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
            <span className="text-[11px] font-semibold tracking-widest text-muted-foreground">COVERAGE</span>
            <span className="mt-1 text-[44px] font-bold leading-none tracking-tight text-foreground">
              {stats.coverage}
              <span className="text-[20px] text-muted-foreground">%</span>
            </span>
            <span className="mt-1 text-[12px] text-muted-foreground">나의 탐사 레벨</span>
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
          <button onClick={onOpenRecords} className="flex items-center gap-0.5 text-[12px] font-medium text-muted-foreground">
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
                <div key={city}>
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
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-ink p-5 text-primary-foreground">
        <div className="relative z-10">
          <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold tracking-widest opacity-70">
            <Trophy className="h-3.5 w-3.5" /> NEW EXPLORATION
          </p>
          <h3 className="text-[20px] font-bold leading-tight">새로운 행성 탐사하기</h3>
          <p className="mt-1 text-[12px] opacity-70">사진을 업로드해 탐사 지수를 올려보세요.</p>
          <button
            onClick={onStart}
            className="mt-4 inline-flex items-center gap-1 rounded-xl bg-primary-foreground px-4 py-2 text-[13px] font-bold text-foreground transition-transform active:scale-[0.97]"
          >
            <Plane className="h-3.5 w-3.5" />새 탐사 시작하기
          </button>
        </div>
      </section>
    </div>
  );
};

export default DashboardScreen;
