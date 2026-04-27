import { Radio } from "lucide-react";
import { useExploration } from "@/context/ExplorationContext";

const PlanetScreen = ({ onAddRecord }: { onAddRecord: () => void }) => {
  const { photos, stats } = useExploration();

  // place up to 8 unique cities as dots on a 2D "planet"
  const cityMap = new Map<string, { lat: number; lon: number; count: number }>();
  photos.forEach((p) => {
    if (p.city && p.lat != null && p.lon != null) {
      const cur = cityMap.get(p.city);
      if (cur) cur.count++;
      else cityMap.set(p.city, { lat: p.lat, lon: p.lon, count: 1 });
    }
  });
  const cities = [...cityMap.entries()].slice(0, 8);

  return (
    <div className="animate-fade-up flex min-h-[calc(100dvh-3.5rem)] flex-col px-5 pb-36 pt-2">
      <div className="mb-2 text-center">
        <p className="text-[11px] font-semibold tracking-widest text-muted-foreground">PLANET VIEW</p>
        <h2 className="mt-1 text-[22px] font-bold leading-tight text-foreground">나의 탐사 행성</h2>
      </div>

      <div className="relative mx-auto my-2 aspect-square w-full max-w-[340px]">
        {/* Concentric circles */}
        <div className="absolute inset-0 rounded-full border border-border" />
        <div className="absolute inset-4 rounded-full border border-border" />
        <div className="absolute inset-10 rounded-full border border-border bg-secondary/60" />
        <div className="absolute inset-16 rounded-full border border-border bg-surface-3" />
        {/* dots */}
        {cities.map(([city, info]) => {
          // map lat/lon to dot positions in [10%..90%]
          const x = ((info.lon + 180) / 360) * 80 + 10;
          const y = ((90 - info.lat) / 180) * 80 + 10;
          return (
            <div
              key={city}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div className="relative">
                <span className="absolute inset-0 -m-1 animate-pulse-soft rounded-full bg-foreground/20" />
                <span className="relative block h-2.5 w-2.5 rounded-full bg-foreground" />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-primary-foreground">
                  {city.toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}
        {cities.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-center text-[12px] text-muted-foreground">
              GPS 정보가 있는 사진을<br />업로드하면 표시돼요
            </p>
          </div>
        )}
      </div>

      {/* CTA card */}
      <section className="mt-2 rounded-2xl bg-card hairline p-4 shadow-card">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-foreground" />
            <p className="text-[11px] font-semibold tracking-widest text-muted-foreground">SIGNAL STRENGTH</p>
          </div>
          <span className="text-[14px] font-bold text-foreground">{stats.coverage}%</span>
        </div>
        <div className="mb-3 flex items-end gap-1">
          {Array.from({ length: 14 }).map((_, i) => {
            const filled = i < Math.round((stats.coverage / 100) * 14);
            return (
              <span
                key={i}
                className={`w-2 rounded-sm ${filled ? "bg-foreground" : "bg-secondary"}`}
                style={{ height: `${10 + i * 1.5}px` }}
              />
            );
          })}
        </div>
        <button
          onClick={onAddRecord}
          className="w-full rounded-xl bg-primary py-3.5 text-[14px] font-bold text-primary-foreground shadow-button transition-transform active:scale-[0.98]"
        >
          새로운 탐사 기록하기
        </button>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">오늘의 탐사 기록을 등록하세요!</p>
      </section>
    </div>
  );
};

export default PlanetScreen;
