import { ArrowRight, MapPin, Rocket, Sparkles } from "lucide-react";
import { useExploration } from "@/context/ExplorationContext";
import earthImg from "@/assets/earth.png";

interface Props {
  onStart: () => void;
  onOpenRecords: () => void;
}

const StatRow = ({ label, value, suffix }: { label: string; value: string; suffix?: string }) => (
  <div className="flex items-baseline justify-between border-b border-border/60 py-3 last:border-0">
    <span className="text-[11px] font-semibold tracking-widest text-muted-foreground">{label}</span>
    <span className="font-display text-[18px] font-bold tracking-tight text-foreground">
      {value}
      {suffix && <span className="ml-1 text-[11px] font-medium text-muted-foreground">{suffix}</span>}
    </span>
  </div>
);

const DashboardScreen = ({ onStart, onOpenRecords }: Props) => {
  const { stats, photos } = useExploration();

  const cityMap = new Map<string, number>();
  photos.forEach((p) => {
    if (p.city) cityMap.set(p.city, (cityMap.get(p.city) ?? 0) + 1);
  });
  const topCities = [...cityMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const maxCount = topCities[0]?.[1] ?? 1;

  return (
    <div className="animate-fade-up flex min-h-[calc(100dvh-3.5rem)] flex-col gap-5 px-5 pb-32 pt-2">
      {/* HERO — Yours Earth */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-deep">
        <div className="relative aspect-[4/5] w-full">
          <img
            src={earthImg}
            alt="Earth"
            width={1024}
            height={1024}
            className="absolute inset-0 h-full w-full object-cover opacity-90"
          />
          {/* Orbit ring */}
          <div className="absolute inset-x-6 bottom-12 top-20 rounded-full border border-primary/30 animate-spin-slow" style={{ borderTopColor: "transparent", borderLeftColor: "transparent" }} />
          {/* Sparkle */}
          <Sparkles className="absolute right-12 top-12 h-4 w-4 text-primary animate-twinkle" />

          {/* Top-left brand */}
          <div className="absolute inset-x-5 top-5">
            <p className="font-display text-[11px] font-semibold tracking-[0.3em] text-primary">YOURS</p>
            <h1 className="font-display mt-1 text-[44px] font-bold leading-none tracking-tight text-foreground">
              EARTH<span className="text-primary">.</span>
            </h1>
            <p className="mt-1 text-[10px] font-medium tracking-[0.25em] text-muted-foreground">
              OUR HOME. YOURS.
            </p>
          </div>

          {/* Bottom meta */}
          <div className="absolute inset-x-5 bottom-5">
            <div className="mb-3 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-mission animate-pulse-soft" />
              <span className="text-[10px] font-bold tracking-[0.25em] text-mission">PLANET 01</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-[10px]">
              <div>
                <p className="font-semibold tracking-widest text-muted-foreground">CITIES</p>
                <p className="font-display mt-0.5 text-[15px] font-bold text-foreground">{stats.citiesCount}</p>
              </div>
              <div>
                <p className="font-semibold tracking-widest text-muted-foreground">DISTANCE</p>
                <p className="font-display mt-0.5 text-[15px] font-bold text-foreground">
                  {stats.distanceKm.toLocaleString()}<span className="ml-0.5 text-[10px] text-muted-foreground">km</span>
                </p>
              </div>
              <div>
                <p className="font-semibold tracking-widest text-muted-foreground">COVERAGE</p>
                <p className="font-display mt-0.5 text-[15px] font-bold text-accent">{stats.coverage}%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA buttons row */}
      <div className="flex items-center justify-center gap-3">
        <button onClick={onStart} className="neon-btn-violet">
          EXPLORE <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <button onClick={onOpenRecords} className="neon-btn-mission">
          MISSION
        </button>
      </div>

      {/* Coverage ring detail */}
      <section className="mono-card flex items-center gap-4">
        <div className="relative h-24 w-24 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--secondary))" strokeWidth="6" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="url(#g1)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(stats.coverage / 100) * 264} 264`}
              className="transition-all duration-700"
            />
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--accent))" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-[20px] font-bold leading-none text-foreground">{stats.coverage}%</span>
            <span className="text-[8px] font-semibold tracking-widest text-muted-foreground">COVERAGE</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-semibold tracking-widest text-accent">THE BLUE PLANET</p>
          <p className="font-display mt-1 text-[16px] font-bold leading-tight text-foreground">A world of life.</p>
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
            지구는 우주에서 생명이 확인된 유일한 행성. 당신만의 탐사를 기록하세요.
          </p>
        </div>
      </section>

      {/* Quick stats */}
      <section className="mono-card">
        <StatRow label="DISTANCE" value={stats.distanceKm.toLocaleString()} suffix="km" />
        <StatRow label="COUNTRIES" value={String(stats.countriesCount)} suffix="visited" />
        <StatRow label="CONTINENTS" value={String(stats.continentsCount)} suffix="/ 7" />
        <StatRow label="GLOBAL RANK" value={`#${stats.globalRank.toLocaleString()}`} suffix={`top ${stats.topPercent}%`} />
      </section>

      {/* Top cities */}
      <section className="mono-card">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[12px] font-bold tracking-widest text-foreground">EXPLORED CITIES</p>
          <button onClick={onOpenRecords} className="text-[10px] font-semibold tracking-widest text-primary">
            VIEW ALL →
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
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-accent" />
                      <span className="text-[12px] font-semibold text-foreground">{city}</span>
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">{count} shots</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-gradient-violet transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Mission CTA */}
      <button
        onClick={onStart}
        className="group relative overflow-hidden rounded-2xl border border-primary/40 bg-gradient-card p-5 text-left shadow-card transition-all hover:shadow-glow-violet"
      >
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-gradient-violet opacity-20 blur-2xl" />
        <div className="relative">
          <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.25em] text-accent">
            <Rocket className="h-3 w-3" /> NEW MISSION
          </p>
          <p className="font-display mt-2 text-[20px] font-bold leading-tight text-foreground">
            새로운 행성 탐사하기
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">사진을 업로드해 탐사 지수를 올려보세요.</p>
          <div className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-primary">
            START <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </button>
    </div>
  );
};

export default DashboardScreen;
