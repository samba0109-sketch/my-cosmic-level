import { ArrowUpRight, MapPin } from "lucide-react";
import { useExploration } from "@/context/ExplorationContext";
import type { RecordsView } from "@/components/screens/RecordsScreen";

interface Props {
  onStart: () => void;
  onOpenRecords: (opts?: { view?: RecordsView; city?: string }) => void;
}

const DashboardScreen = ({ onStart, onOpenRecords }: Props) => {
  const { stats, photos } = useExploration();

  // build top cities from photos
  const cityMap = new Map<string, number>();
  photos.forEach((p) => {
    if (p.city) cityMap.set(p.city, (cityMap.get(p.city) ?? 0) + 1);
  });
  const topCities = [...cityMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const maxCount = topCities[0]?.[1] ?? 1;

  const coveragePct = Math.min(100, stats.coverage);

  return (
    <div className="animate-fade-up flex min-h-[calc(100dvh-3.5rem)] flex-col gap-5 px-5 pb-32 pt-2">

      {/* 별콩이 서사 + 링 */}
      <section className="flex flex-col items-center pt-4">
        {/* 서사 텍스트 */}
        <p className="mb-1 text-[11px] font-semibold tracking-widest text-muted-foreground">
          길 잃은 아가별
        </p>
        <p className="mb-5 text-[15px] font-bold text-foreground">
          별콩이와 함께 별자리를 만들어가요!
        </p>

        {/* 원형 링 + 별콩이 */}
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
              strokeDasharray={`${(coveragePct / 100) * 553} 553`}
              className="transition-all duration-700"
            />
          </svg>
          {/* 별콩이 이미지 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/byeolkong.png"
              alt="별콩이"
              className="h-36 w-36 object-contain drop-shadow-md"
            />
          </div>
        </div>
      </section>

      {/* Quick stats */}
      <section className="mono-card">
        {/* 총 탐사 도시 */}
        <div className="flex items-baseline justify-between border-b border-border py-3">
          <span className="text-[13px] text-muted-foreground">총 탐사 도시</span>
          <span className="text-[18px] font-bold tracking-tight text-foreground">
            {stats.citiesCount}
            <span className="ml-1 text-[12px] font-medium text-muted-foreground">Cities</span>
          </span>
        </div>
        {/* 탐사한 거리 */}
        <div className="flex items-baseline justify-between border-b border-border py-3">
          <span className="text-[13px] text-muted-foreground">탐사한 거리</span>
          <span className="text-[18px] font-bold tracking-tight text-foreground">
            {stats.distanceKm.toLocaleString()}
            <span className="ml-1 text-[12px] font-medium text-muted-foreground">km</span>
          </span>
        </div>
        {/* 방문 국가 */}
        <div className="flex items-baseline justify-between border-b border-border py-3">
          <span className="text-[13px] text-muted-foreground">방문 국가</span>
          <span className="text-[18px] font-bold tracking-tight text-foreground">
            {stats.countriesCount}
            <span className="ml-1 text-[12px] font-medium text-muted-foreground">Countries</span>
          </span>
        </div>
        {/* 별자리 완성도 + 별도감 버튼 */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-muted-foreground">별자리 완성도</span>
            <button
              onClick={() => onOpenRecords({ view: "grid" })}
              className="flex items-center gap-0.5 rounded-lg bg-secondary px-2 py-1 text-[11px] font-bold text-foreground"
            >
              내가 모은 별자리 보기 <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <span className="text-[18px] font-bold tracking-tight text-foreground">
            {coveragePct}
            <span className="ml-1 text-[12px] font-medium text-muted-foreground">%</span>
          </span>
        </div>
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
    </div>
  );
};

export default DashboardScreen;
