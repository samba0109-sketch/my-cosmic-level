import { useState } from "react";
import { ImageIcon, LayoutGrid, List, MapPin } from "lucide-react";
import { useExploration } from "@/context/ExplorationContext";

const formatTs = (ts?: number) => {
  if (!ts) return "—";
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const RecordsScreen = () => {
  const { photos } = useExploration();
  const [view, setView] = useState<"timeline" | "grid">("timeline");

  const sorted = [...photos].sort((a, b) => (b.takenAt ?? 0) - (a.takenAt ?? 0));

  return (
    <div className="animate-fade-up flex min-h-[calc(100dvh-3.5rem)] flex-col px-5 pb-32 pt-2">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="mb-1 text-[11px] font-semibold tracking-widest text-muted-foreground">CHRONOLOGICAL</p>
          <h2 className="text-[28px] font-bold leading-none tracking-tight text-foreground">행성 기록</h2>
        </div>
        <div className="flex rounded-xl bg-secondary p-1">
          <button
            onClick={() => setView("timeline")}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${
              view === "timeline" ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"
            }`}
          >
            <List className="h-3.5 w-3.5" /> TIMELINE
          </button>
          <button
            onClick={() => setView("grid")}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${
              view === "grid" ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> GRID
          </button>
        </div>
      </div>

      {sorted.length === 0 && (
        <div className="mt-12 flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-[14px] font-semibold text-foreground">아직 기록이 없어요</p>
          <p className="text-[12px] text-muted-foreground">체크인 탭에서 사진을 업로드해보세요.</p>
        </div>
      )}

      {view === "timeline" && sorted.length > 0 && (
        <div className="relative pl-6">
          <div className="absolute bottom-2 left-2 top-2 w-px bg-border" />
          <div className="space-y-4">
            {sorted.map((p) => (
              <div key={p.id} className="relative">
                <span className="absolute -left-[18px] top-3 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                <div className="overflow-hidden rounded-2xl bg-card hairline shadow-soft">
                  <div className="relative h-40 bg-secondary">
                    <img src={p.url} alt={p.fileName} className="h-full w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
                      <p className="text-[10px] font-semibold tracking-widest opacity-80">LOCATION</p>
                      <p className="text-[16px] font-bold">{p.city ?? "위치 정보 없음"}</p>
                    </div>
                    <span
                      className={`absolute right-2.5 top-2.5 rounded-md px-2 py-1 text-[10px] font-bold ${
                        p.lat != null
                          ? "bg-white/90 text-foreground"
                          : "bg-foreground/80 text-primary-foreground"
                      }`}
                    >
                      {p.lat != null ? "GPS SYNCED" : "NO GPS"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">
                        {p.lat != null ? `${p.lat.toFixed(3)}, ${p.lon!.toFixed(3)}` : "—"}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground">{formatTs(p.takenAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "grid" && sorted.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5">
          {sorted.map((p) => (
            <div key={p.id} className="relative aspect-square overflow-hidden rounded-xl bg-secondary">
              <img src={p.url} alt={p.fileName} className="h-full w-full object-cover" />
              {p.city && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 py-1 text-[10px] font-bold text-white">
                  {p.city}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecordsScreen;
