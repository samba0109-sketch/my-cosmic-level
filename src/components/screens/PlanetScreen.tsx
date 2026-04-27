import { Radio, Rocket } from "lucide-react";
import { useExploration } from "@/context/ExplorationContext";
import earthImg from "@/assets/earth.png";

const PlanetScreen = ({ onAddRecord }: { onAddRecord: () => void }) => {
  const { photos, stats } = useExploration();

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
      <div className="mb-3 text-center">
        <p className="text-[10px] font-bold tracking-[0.3em] text-accent">PLANET VIEW</p>
        <h2 className="font-display mt-1 text-[24px] font-bold tracking-tight text-foreground">
          나의 탐사 행성
        </h2>
      </div>

      {/* Earth with orbit + dots */}
      <div className="relative mx-auto my-2 aspect-square w-full max-w-[340px]">
        {/* Outer orbits */}
        <div className="absolute inset-0 rounded-full border border-primary/15" />
        <div className="absolute inset-3 rounded-full border border-dashed border-primary/20 animate-spin-slow" />

        {/* Earth image */}
        <div className="absolute inset-8 overflow-hidden rounded-full shadow-glow-cyan">
          <img src={earthImg} alt="Earth" loading="lazy" width={1024} height={1024} className="h-full w-full object-cover" />
        </div>

        {/* Orbiting marker */}
        <div className="absolute inset-0 animate-orbit">
          <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
            <span className="block h-2 w-2 rounded-full bg-primary shadow-glow-violet" />
          </span>
        </div>

        {/* City dots */}
        {cities.map(([city, info]) => {
          const x = ((info.lon + 180) / 360) * 70 + 15;
          const y = ((90 - info.lat) / 180) * 70 + 15;
          return (
            <div
              key={city}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div className="relative">
                <span className="absolute inset-0 -m-1 animate-pulse-soft rounded-full bg-accent/30" />
                <span className="relative block h-2 w-2 rounded-full bg-accent shadow-glow-cyan" />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded border border-accent/40 bg-card/80 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-accent backdrop-blur">
                  {city.toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}

        {cities.length === 0 && (
          <div className="absolute inset-x-6 bottom-2">
            <div className="rounded-xl border border-border bg-card/80 px-3 py-2 text-center backdrop-blur">
              <p className="text-[11px] text-muted-foreground">
                GPS가 있는 사진을 업로드하면<br />여기에 표시돼요
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CTA card */}
      <section className="mt-2 rounded-2xl border border-primary/30 bg-gradient-card p-4 shadow-card">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-accent animate-pulse-soft" />
            <p className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground">SIGNAL STRENGTH</p>
          </div>
          <span className="font-display text-[14px] font-bold text-accent">{stats.coverage}%</span>
        </div>
        <div className="mb-3 flex items-end gap-1">
          {Array.from({ length: 14 }).map((_, i) => {
            const filled = i < Math.round((stats.coverage / 100) * 14);
            return (
              <span
                key={i}
                className={`w-2 rounded-sm ${filled ? "bg-gradient-to-t from-primary to-accent" : "bg-secondary"}`}
                style={{ height: `${10 + i * 1.5}px` }}
              />
            );
          })}
        </div>
        <button
          onClick={onAddRecord}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-violet py-3.5 text-[13px] font-bold tracking-wide text-primary-foreground shadow-button transition-transform active:scale-[0.98]"
        >
          <Rocket className="h-4 w-4" />
          새로운 탐사 기록하기
        </button>
        <p className="mt-2 text-center text-[10px] tracking-widest text-muted-foreground">
          UPLOAD A PHOTO TO LAUNCH
        </p>
      </section>
    </div>
  );
};

export default PlanetScreen;
