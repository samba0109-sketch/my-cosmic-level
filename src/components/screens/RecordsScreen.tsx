import { useEffect, useMemo, useState } from "react";
import { Clock, Film, ImageIcon, LayoutGrid, List, MapPin, User } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useExploration } from "@/context/ExplorationContext";
import { reverseGeocode, type PhotoRecord } from "@/lib/exploration";
import { toast } from "sonner";

const formatTs = (ts?: number) => {
  if (!ts) return "—";
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export type RecordsView = "timeline" | "grid" | "feed";

interface RecordsScreenProps {
  initialView?: RecordsView;
  initialCity?: string;
}

const RecordsScreen = ({ initialView, initialCity }: RecordsScreenProps = {}) => {
  const { photos, updatePhoto } = useExploration();
  const [view, setView] = useState<RecordsView>(initialView ?? "timeline");
  const [feedStartIndex, setFeedStartIndex] = useState(0);

  useEffect(() => {
    if (!initialCity) return;
    const id = window.requestAnimationFrame(() => {
      const el = document.getElementById(`city-${encodeURIComponent(initialCity)}`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(id);
  }, [initialCity]);

  const oldestFirst = useMemo(
    () => [...photos].sort((a, b) => (a.takenAt ?? 0) - (b.takenAt ?? 0)),
    [photos],
  );

  // Grid: group by city
  const groupedByCity = useMemo(() => {
    const groups = new Map<string, PhotoRecord[]>();
    for (const p of oldestFirst) {
      const key = p.city ?? "위치 정보 없음";
      const arr = groups.get(key) ?? [];
      arr.push(p);
      groups.set(key, arr);
    }
    return Array.from(groups.entries());
  }, [oldestFirst]);

  const openFeedAt = (id: string) => {
    const idx = oldestFirst.findIndex((p) => p.id === id);
    setFeedStartIndex(idx >= 0 ? idx : 0);
    setView("feed");
  };

  const handleRegisterGps = async (p: PhotoRecord) => {
    const input = window.prompt("GPS 좌표를 입력하세요 (위도, 경도)\n예) 37.5665, 126.978");
    if (!input) return;
    const m = input.match(/-?\d+(\.\d+)?/g);
    if (!m || m.length < 2) {
      toast.error("좌표 형식이 올바르지 않습니다");
      return;
    }
    const lat = Number(m[0]);
    const lon = Number(m[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      toast.error("좌표 범위를 벗어났습니다");
      return;
    }
    const geo = await reverseGeocode(lat, lon);
    updatePhoto(p.id, { lat, lon, city: geo.city, country: geo.country, continent: geo.continent });
    toast.success("GPS가 등록되었습니다", { description: geo.city });
  };

  const subtitle: Record<ViewMode, string> = {
    timeline: "CHRONOLOGICAL",
    grid: "BY REGION",
    feed: "FEED",
  };

  return (
    <div className="animate-fade-up flex min-h-[calc(100dvh-3.5rem)] flex-col px-5 pb-32 pt-2">
      <div className="mb-4 flex items-end justify-between gap-2">
        <div>
          <p className="mb-1 text-[11px] font-semibold tracking-widest text-muted-foreground">{subtitle[view]}</p>
          <h2 className="text-[28px] font-bold leading-none tracking-tight text-foreground">행성 기록</h2>
        </div>
        <div className="flex rounded-xl bg-secondary p-1">
          <button
            onClick={() => setView("timeline")}
            className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold ${
              view === "timeline" ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"
            }`}
          >
            <List className="h-3.5 w-3.5" /> 타임라인
          </button>
          <button
            onClick={() => setView("grid")}
            className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold ${
              view === "grid" ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> 그리드
          </button>
          <button
            onClick={() => setView("feed")}
            className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold ${
              view === "feed" ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"
            }`}
          >
            <Film className="h-3.5 w-3.5" /> 피드
          </button>
        </div>
      </div>

      {oldestFirst.length === 0 && (
        <div className="mt-12 flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-[14px] font-semibold text-foreground">아직 기록이 없어요</p>
          <p className="text-[12px] text-muted-foreground">체크인 탭에서 사진을 업로드해보세요.</p>
        </div>
      )}

      {view === "timeline" && oldestFirst.length > 0 && (
        <div className="relative pl-6">
          <div className="absolute bottom-2 left-2 top-2 w-px bg-border" />
          <div className="space-y-4">
            {oldestFirst.map((p) => (
              <div key={p.id} className="relative">
                <span className="absolute -left-[18px] top-3 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                <div className="overflow-hidden rounded-2xl bg-card hairline shadow-soft">
                  <button
                    onClick={() => openFeedAt(p.id)}
                    className="relative block h-40 w-full bg-secondary"
                  >
                    <img src={p.url} alt={p.fileName} className="h-full w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-left text-white">
                      <p className="text-[10px] font-semibold tracking-widest opacity-80">LOCATION</p>
                      <p className="text-[16px] font-bold">{p.city ?? "위치 정보 없음"}</p>
                    </div>
                  </button>
                  <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                    {p.lat != null ? (
                      <span className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">
                        GPS 인식 완료
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRegisterGps(p)}
                        className="rounded-md bg-foreground px-2 py-1 text-[10px] font-bold text-primary-foreground"
                      >
                        GPS 등록
                      </button>
                    )}
                    <span className="text-[11px] font-medium text-muted-foreground">{formatTs(p.takenAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 border-t border-border px-3 py-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">
                      {p.lat != null ? `${p.lat.toFixed(3)}, ${p.lon!.toFixed(3)}` : "좌표 없음"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "grid" && oldestFirst.length > 0 && (
        <div className="space-y-5">
          {groupedByCity.map(([city, items]) => (
            <section key={city} id={`city-${encodeURIComponent(city)}`}>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-foreground" />
                  <p className="text-[14px] font-bold text-foreground">{city}</p>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">{items.length}장</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {items.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => openFeedAt(p.id)}
                    className="relative aspect-square overflow-hidden rounded-xl bg-secondary"
                  >
                    <img src={p.url} alt={p.fileName} className="h-full w-full object-cover" />
                    {p.lat == null && (
                      <span className="absolute left-1 top-1 rounded bg-foreground/80 px-1 py-0.5 text-[8px] font-bold text-primary-foreground">
                        NO GPS
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {view === "feed" && oldestFirst.length > 0 && (
        <FeedView
          photos={oldestFirst}
          startIndex={feedStartIndex}
          onRegisterGps={handleRegisterGps}
        />
      )}
    </div>
  );
};

const FeedView = ({
  photos,
  startIndex,
  onRegisterGps,
}: {
  photos: PhotoRecord[];
  startIndex: number;
  onRegisterGps: (p: PhotoRecord) => void;
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ startIndex, loop: false });
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCurrent(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-[11px] font-semibold tracking-widest text-muted-foreground">
        {current + 1} / {photos.length}
      </p>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {photos.map((p) => (
            <div key={p.id} className="min-w-0 flex-[0_0_100%] px-1">
              <div className="overflow-hidden rounded-2xl bg-card hairline shadow-soft">
                <div className="relative aspect-square bg-secondary">
                  <img src={p.url} alt={p.fileName} className="h-full w-full object-cover" />
                  {p.lat != null ? (
                    <span className="absolute right-2.5 top-2.5 rounded-md bg-white/90 px-2 py-1 text-[10px] font-bold text-foreground">
                      GPS 인식 완료
                    </span>
                  ) : (
                    <button
                      onClick={() => onRegisterGps(p)}
                      className="absolute right-2.5 top-2.5 rounded-md bg-foreground px-2 py-1 text-[10px] font-bold text-primary-foreground"
                    >
                      GPS 등록
                    </button>
                  )}
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-foreground" />
                    <p className="text-[16px] font-bold text-foreground">{p.city ?? "위치 정보 없음"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-t border-border pt-2">
                    <div>
                      <p className="text-[10px] text-muted-foreground">위도</p>
                      <p className="text-[13px] font-bold text-foreground">
                        {p.lat != null ? `${p.lat.toFixed(4)}°` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">경도</p>
                      <p className="text-[13px] font-bold text-foreground">
                        {p.lon != null ? `${p.lon.toFixed(4)}°` : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatTs(p.takenAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      <span>나</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecordsScreen;
