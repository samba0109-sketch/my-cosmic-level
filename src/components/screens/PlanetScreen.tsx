import { useMemo, useRef, useState } from "react";
import { Download, Minus, Plus, RotateCcw, Search, X, MapPin } from "lucide-react";
import { useExploration } from "@/context/ExplorationContext";
import { reverseGeocode } from "@/lib/exploration";
import type { PhotoRecord } from "@/lib/exploration";

/* ── constants ───────────────────────────────────────────────── */
const SVG_W = 320, SVG_H = 300;
const MIN_ZOOM = 0.4, MAX_ZOOM = 15;
const STAR_R = 3; // base star size in SVG units (screen-stable)

/* ── types ───────────────────────────────────────────────────── */
interface Bounds { minLat: number; maxLat: number; minLon: number; maxLon: number }
interface Pt { x: number; y: number }
interface Transform { zoom: number; panX: number; panY: number }
interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

/* ── geo helpers ─────────────────────────────────────────────── */
function computeBounds(pts: { lat: number; lon: number }[]): Bounds {
  if (pts.length === 0) return { minLat: -45, maxLat: 45, minLon: -90, maxLon: 90 };
  if (pts.length === 1) return {
    minLat: pts[0].lat - 20, maxLat: pts[0].lat + 20,
    minLon: pts[0].lon - 20, maxLon: pts[0].lon + 20,
  };
  const lats = pts.map(p => p.lat), lons = pts.map(p => p.lon);
  const padLat = Math.max((Math.max(...lats) - Math.min(...lats)) * 0.3, 8);
  const padLon = Math.max((Math.max(...lons) - Math.min(...lons)) * 0.3, 8);
  return {
    minLat: Math.min(...lats) - padLat, maxLat: Math.max(...lats) + padLat,
    minLon: Math.min(...lons) - padLon, maxLon: Math.max(...lons) + padLon,
  };
}

function project(lat: number, lon: number, b: Bounds, w: number, h: number): Pt {
  return {
    x: ((lon - b.minLon) / (b.maxLon - b.minLon || 1)) * w,
    y: ((b.maxLat - lat) / (b.maxLat - b.minLat || 1)) * h,
  };
}

/** Seeded LCG for deterministic background stars */
function genBgStars(count: number, w: number, h: number) {
  let seed = 2026;
  const rng = () => { seed = (seed * 1664525 + 1013904223) & 0x7fffffff; return seed / 0x7fffffff; };
  return Array.from({ length: count }, (_, i) => ({
    x: rng() * w, y: rng() * h,
    r: rng() * 0.85 + 0.2,
    o: rng() * 0.45 + 0.1,
    sparkle: i % 7 === 0, // every 7th bg star is a mini sparkle
  }));
}

function getConstellationName(n: number) {
  if (n === 0) return "미지의 별자리";
  if (n === 1) return "외톨이별자리";
  if (n <= 3) return "나그네자리";
  if (n <= 6) return "탐험가자리";
  if (n <= 12) return "은하수자리";
  return "대항해자자리";
}

const PLANET_TYPES = [
  { key: "city",      name: "도시 콜렉터",   planet: "Neonova",    color: "#6EE7B7" },
  { key: "country",   name: "글로벌 모험가",  planet: "Pangea-7",   color: "#93C5FD" },
  { key: "continent", name: "대륙 정복자",    planet: "Gondwana",   color: "#FDE68A" },
  { key: "distance",  name: "장거리 탐험가",  planet: "Outer-Reach", color: "#F9A8D4" },
  { key: "record",    name: "기록 매니아",    planet: "Memorium",   color: "#A78BFA" },
];

async function searchNominatim(q: string): Promise<NominatimResult[]> {
  if (!q.trim()) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&accept-language=ko`,
    );
    return res.ok ? res.json() : [];
  } catch { return []; }
}

/* ── StarBurst SVG component ─────────────────────────────────── */
// Renders a 4-pointed starburst (✦) centered at (0,0).
// r is already adjusted for zoom so the star stays pixel-stable.
function StarBurst({ r, active }: { r: number; active: boolean }) {
  const s  = r * 4.2;   // primary spike half-length
  const ds = r * 2.1;   // diagonal spike half-length
  const ew = r * 0.42;  // primary spike half-width (ellipse minor axis)
  const dw = r * 0.24;  // diagonal spike half-width

  return (
    <g>
      {/* Outer soft glow */}
      <circle r={r * 5.5} fill={active ? "rgba(190,215,255,0.14)" : "rgba(255,255,255,0.06)"} />
      <circle r={r * 3.0} fill={active ? "rgba(190,215,255,0.22)" : "rgba(255,255,255,0.11)"} />

      {/* Primary horizontal spike */}
      <ellipse rx={s} ry={ew} fill="white" opacity={0.92} />
      {/* Primary vertical spike */}
      <ellipse rx={ew} ry={s} fill="white" opacity={0.92} />

      {/* Diagonal accent spikes (shorter, dimmer) */}
      <ellipse rx={ds} ry={dw} fill="rgba(255,255,255,0.52)" transform="rotate(45)" />
      <ellipse rx={ds} ry={dw} fill="rgba(255,255,255,0.52)" transform="rotate(-45)" />

      {/* Bright center core */}
      <circle r={r * 1.1} fill="white" />
    </g>
  );
}

/** Tiny sparkle for background decoration */
function MiniSparkle({ r, o }: { r: number; o: number }) {
  return (
    <g opacity={o}>
      <ellipse rx={r * 3} ry={r * 0.35} fill="white" />
      <ellipse rx={r * 0.35} ry={r * 3} fill="white" />
      <circle r={r} fill="white" />
    </g>
  );
}

/* ── main component ──────────────────────────────────────────── */
const PlanetScreen = ({ onAddRecord }: { onAddRecord: () => void }) => {
  const { photos, stats, updatePhoto } = useExploration();

  /* ── transform state ── */
  const [tr, setTr] = useState<Transform>({ zoom: 1, panX: 0, panY: 0 });
  const svgRef  = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ sx: number; sy: number; bx: number; by: number } | null>(null);
  const pinchRef = useRef<{ dist: number; mx: number; my: number } | null>(null);
  const didDrag = useRef(false);

  /* ── active star popup ── */
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  /* ── GPS registration modal ── */
  const [gpsTarget, setGpsTarget] = useState<PhotoRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── data ── */
  // Per-photo GPS points sorted chronologically
  const photoPts = useMemo(
    () => photos.filter(p => p.lat != null && p.lon != null)
      .sort((a, b) => (a.takenAt ?? 0) - (b.takenAt ?? 0)),
    [photos],
  );

  // Photos without GPS
  const noGpsPts = useMemo(() => photos.filter(p => p.lat == null || p.lon == null), [photos]);

  const bounds  = useMemo(() => computeBounds(photoPts as { lat: number; lon: number }[]), [photoPts]);
  const svgPts  = useMemo<Pt[]>(() => photoPts.map(p => project(p.lat!, p.lon!, bounds, SVG_W, SVG_H)), [photoPts, bounds]);
  const bgStars = useMemo(() => genBgStars(100, SVG_W, SVG_H), []);

  const dominantType = useMemo(() => {
    const scored = [
      { ...PLANET_TYPES[0], pct: stats.citiesCount / 5 },
      { ...PLANET_TYPES[1], pct: stats.countriesCount / 3 },
      { ...PLANET_TYPES[2], pct: stats.continentsCount / 3 },
      { ...PLANET_TYPES[3], pct: stats.distanceKm / 10000 },
      { ...PLANET_TYPES[4], pct: photos.length / 20 },
    ];
    return scored.reduce((a, b) => (a.pct >= b.pct ? a : b));
  }, [stats, photos.length]);

  const constellationName = getConstellationName(photoPts.length);

  /* ── interaction helpers ── */
  const toSVGPt = (clientX: number, clientY: number): Pt => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: SVG_W / 2, y: SVG_H / 2 };
    return { x: ((clientX - rect.left) / rect.width) * SVG_W, y: ((clientY - rect.top) / rect.height) * SVG_H };
  };

  const zoomAt = (factor: number, px: number, py: number) => {
    setTr(prev => {
      const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev.zoom * factor));
      const f = z / prev.zoom;
      return { zoom: z, panX: px - (px - prev.panX) * f, panY: py - (py - prev.panY) * f };
    });
  };

  /* mouse */
  const onMouseDown = (e: React.MouseEvent) => {
    didDrag.current = false;
    dragRef.current = { sx: e.clientX, sy: e.clientY, bx: tr.panX, by: tr.panY };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return;
    didDrag.current = true;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const { sx, sy, bx, by } = dragRef.current;
    setTr(p => ({ ...p, panX: bx + (e.clientX - sx) * SVG_W / rect.width, panY: by + (e.clientY - sy) * SVG_H / rect.height }));
  };
  const onMouseUp = () => { dragRef.current = null; };
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const { x, y } = toSVGPt(e.clientX, e.clientY);
    zoomAt(e.deltaY < 0 ? 1.18 : 0.85, x, y);
  };

  /* touch */
  const onTouchStart = (e: React.TouchEvent) => {
    didDrag.current = false;
    if (e.touches.length === 2) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      const mid = toSVGPt((e.touches[0].clientX + e.touches[1].clientX) / 2, (e.touches[0].clientY + e.touches[1].clientY) / 2);
      pinchRef.current = { dist: Math.hypot(dx, dy), mx: mid.x, my: mid.y };
      dragRef.current = null;
    } else {
      dragRef.current = { sx: e.touches[0].clientX, sy: e.touches[0].clientY, bx: tr.panX, by: tr.panY };
      pinchRef.current = null;
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2 && pinchRef.current) {
      didDrag.current = true;
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      const d = Math.hypot(dx, dy);
      zoomAt(d / pinchRef.current.dist, pinchRef.current.mx, pinchRef.current.my);
      pinchRef.current.dist = d;
    } else if (e.touches.length === 1 && dragRef.current) {
      didDrag.current = true;
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const { sx, sy, bx, by } = dragRef.current;
      setTr(p => ({ ...p, panX: bx + (e.touches[0].clientX - sx) * SVG_W / rect.width, panY: by + (e.touches[0].clientY - sy) * SVG_H / rect.height }));
    }
  };
  const onTouchEnd = () => { dragRef.current = null; pinchRef.current = null; };

  /* button zoom */
  const btnIn    = () => zoomAt(1.6, SVG_W / 2, SVG_H / 2);
  const btnOut   = () => zoomAt(1 / 1.6, SVG_W / 2, SVG_H / 2);
  const btnReset = () => { setTr({ zoom: 1, panX: 0, panY: 0 }); };

  /* star size (pixel-stable: divide by zoom so after scale it stays constant) */
  const r = STAR_R / tr.zoom;

  /* ── GPS search ── */
  const handleSearchInput = (q: string) => {
    setSearchQuery(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!q.trim()) { setSearchResults([]); return; }
    setIsSearching(true);
    searchTimer.current = setTimeout(async () => {
      const results = await searchNominatim(q);
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  };

  const handleAssignGPS = async (result: NominatimResult) => {
    if (!gpsTarget) return;
    setIsAssigning(true);
    const lat = parseFloat(result.lat), lon = parseFloat(result.lon);
    const geo = await reverseGeocode(lat, lon);
    updatePhoto(gpsTarget.id, { lat, lon, city: geo.city, country: geo.country, continent: geo.continent });
    setGpsTarget(null);
    setSearchQuery("");
    setSearchResults([]);
    setIsAssigning(false);
  };

  const closeModal = () => {
    setGpsTarget(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  /* ── canvas card download (same as before) ── */
  const downloadCard = () => {
    const CW = 700, CH = 980;
    const canvas = document.createElement("canvas");
    canvas.width = CW; canvas.height = CH;
    const ctx = canvas.getContext("2d")!;

    const bgGrad = ctx.createLinearGradient(0, 0, CW * 0.6, CH);
    bgGrad.addColorStop(0, "#03070f"); bgGrad.addColorStop(0.55, "#0a1525"); bgGrad.addColorStop(1, "#03070f");
    ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, CW, CH);
    ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 1.5;
    roundRect(ctx, 24, 24, CW - 48, CH - 48, 24); ctx.stroke();

    genBgStars(140, CW, CH).forEach(s => {
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.o})`; ctx.fill();
    });

    ctx.fillStyle = "rgba(255,255,255,0.28)"; ctx.font = "bold 15px 'Courier New', monospace";
    ctx.textAlign = "center"; ctx.fillText("✦  YOUEARTH AIRLINES  ✦", CW / 2, 74);
    ctx.fillStyle = "#ffffff"; ctx.font = "bold 40px sans-serif"; ctx.fillText(constellationName, CW / 2, 132);

    const badgeText = `→ ${dominantType.planet.toUpperCase()}`;
    ctx.font = "bold 15px 'Courier New', monospace";
    const bw = ctx.measureText(badgeText).width + 32, bx2 = (CW - bw) / 2;
    ctx.fillStyle = dominantType.color + "33"; ctx.strokeStyle = dominantType.color + "88"; ctx.lineWidth = 1;
    roundRect(ctx, bx2, 148, bw, 28, 14); ctx.fill(); ctx.stroke();
    ctx.fillStyle = dominantType.color; ctx.fillText(badgeText, CW / 2, 167);

    const MAP_W = 560, MAP_H = 360, ox = (CW - MAP_W) / 2, oy = 210;
    const cb = computeBounds(photoPts as { lat: number; lon: number }[]);
    const mapPts = photoPts.map(p => { const pt = project(p.lat!, p.lon!, cb, MAP_W, MAP_H); return { x: pt.x + ox, y: pt.y + oy }; });

    if (mapPts.length > 1) {
      ctx.strokeStyle = "rgba(147,197,253,0.3)"; ctx.lineWidth = 1.5; ctx.setLineDash([5, 8]);
      ctx.beginPath(); ctx.moveTo(mapPts[0].x, mapPts[0].y);
      mapPts.slice(1).forEach(p => ctx.lineTo(p.x, p.y)); ctx.stroke(); ctx.setLineDash([]);
    }
    mapPts.forEach(p => {
      const cr = 5;
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, cr * 4);
      grd.addColorStop(0, "rgba(255,255,255,0.95)"); grd.addColorStop(0.3, "rgba(147,197,253,0.5)"); grd.addColorStop(1, "transparent");
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(p.x, p.y, cr * 4, 0, Math.PI * 2); ctx.fill();
      // cross spikes
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fillRect(p.x - cr * 3.5, p.y - cr * 0.3, cr * 7, cr * 0.6);
      ctx.fillRect(p.x - cr * 0.3, p.y - cr * 3.5, cr * 0.6, cr * 7);
      ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(p.x, p.y, cr * 0.8, 0, Math.PI * 2); ctx.fill();
    });

    ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(60, 615); ctx.lineTo(CW - 60, 615); ctx.stroke();
    const statCols = [{ label: "STARS", value: String(photoPts.length) }, { label: "COUNTRIES", value: String(stats.countriesCount) }, { label: "SCORE", value: stats.score.toLocaleString() + "P" }];
    const colW = CW / statCols.length;
    statCols.forEach((col, i) => {
      const cx = colW * i + colW / 2;
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 34px sans-serif"; ctx.textAlign = "center"; ctx.fillText(col.value, cx, 666);
      ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.font = "bold 12px 'Courier New', monospace"; ctx.fillText(col.label, cx, 688);
    });
    ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = "16px sans-serif"; ctx.fillText(dominantType.name, CW / 2, 730);
    ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.font = "13px 'Courier New', monospace"; ctx.fillText("youearth.app  ·  MY CONSTELLATION CARD", CW / 2, CH - 44);

    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob); const a = document.createElement("a");
      a.href = url; a.download = `youearth-constellation-${Date.now()}.png`; a.click(); URL.revokeObjectURL(url);
    }, "image/png");
  };

  /* ── render ──────────────────────────────────────────────────── */
  return (
    <div className="animate-fade-up flex min-h-[calc(100dvh-3.5rem)] flex-col pb-32 pt-2">
      {/* Header */}
      <div className="mb-4 px-5 text-center">
        <p className="text-[11px] font-semibold tracking-widest text-muted-foreground">MY CONSTELLATION</p>
        <h2 className="mt-0.5 text-[22px] font-bold text-foreground">나의 별자리</h2>
      </div>

      {/* ── Star Map ── */}
      <div className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-2xl bg-[#03070f]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full touch-none select-none"
          style={{ cursor: dragRef.current ? "grabbing" : "grab" }}
          onWheel={onWheel}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
          onClick={() => { if (!didDrag.current) setActiveIdx(null); }}
        >
          {/* Fixed background micro-stars */}
          {bgStars.map((s, i) =>
            s.sparkle ? (
              <g key={i} transform={`translate(${s.x}, ${s.y})`}>
                <MiniSparkle r={s.r * 1.4} o={s.o * 0.7} />
              </g>
            ) : (
              <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.o} />
            )
          )}

          {/* Zoomable / pannable group */}
          <g transform={`translate(${tr.panX}, ${tr.panY}) scale(${tr.zoom})`}>

            {/* Constellation lines — connect photos chronologically */}
            {svgPts.length > 1 && svgPts.map((p, i) =>
              i < svgPts.length - 1 ? (
                <line
                  key={i}
                  x1={p.x} y1={p.y} x2={svgPts[i + 1].x} y2={svgPts[i + 1].y}
                  stroke="rgba(180,210,255,0.35)"
                  strokeWidth={1.2 / tr.zoom}
                  strokeDasharray={`${4 / tr.zoom} ${5 / tr.zoom}`}
                  strokeLinecap="round"
                />
              ) : null
            )}

            {/* Photo stars (one per photo at exact GPS) */}
            {svgPts.map((p, i) => {
              const isActive = activeIdx === i;
              return (
                <g
                  key={photoPts[i].id}
                  transform={`translate(${p.x}, ${p.y})`}
                  onClick={e => { e.stopPropagation(); if (!didDrag.current) setActiveIdx(isActive ? null : i); }}
                  style={{ cursor: "pointer" }}
                >
                  <StarBurst r={r} active={isActive} />

                  {/* City popup on tap */}
                  {isActive && (() => {
                    const label = (photoPts[i].city ?? `${photoPts[i].lat?.toFixed(2)}, ${photoPts[i].lon?.toFixed(2)}`).toUpperCase();
                    const fs = 8 / tr.zoom;
                    const lw = label.length * fs * 0.68 + 18 / tr.zoom;
                    const lh = 18 / tr.zoom;
                    const lx = -lw / 2;
                    const ly = -(r * 6 + lh + 4 / tr.zoom);
                    return (
                      <g>
                        <rect x={lx} y={ly} width={lw} height={lh} rx={4 / tr.zoom}
                          fill="rgba(5,14,35,0.92)" stroke="rgba(255,255,255,0.2)" strokeWidth={0.5 / tr.zoom} />
                        <text x={0} y={ly + lh * 0.68}
                          textAnchor="middle" fill="white" fontSize={fs}
                          fontFamily="'Courier New', monospace" fontWeight="bold"
                        >
                          {label}
                        </text>
                      </g>
                    );
                  })()}
                </g>
              );
            })}

            {/* Empty state */}
            {svgPts.length === 0 && (
              <text x={SVG_W / 2} y={SVG_H / 2} textAnchor="middle"
                fill="rgba(255,255,255,0.25)" fontSize="11" fontFamily="sans-serif">
                GPS 사진을 올리면 별자리가 그려져요
              </text>
            )}
          </g>
        </svg>

        {/* Zoom controls */}
        <div className="absolute bottom-9 right-2 flex flex-col gap-1">
          {[{ icon: <Plus className="h-3.5 w-3.5" />, fn: btnIn }, { icon: <RotateCcw className="h-3 w-3" />, fn: btnReset }, { icon: <Minus className="h-3.5 w-3.5" />, fn: btnOut }].map((btn, i) => (
            <button key={i} onClick={btn.fn}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur-sm transition-colors hover:bg-white/20 active:bg-white/30">
              {btn.icon}
            </button>
          ))}
        </div>

        {tr.zoom !== 1 && (
          <div className="absolute left-2 top-2 rounded bg-black/40 px-1.5 py-0.5 text-[10px] font-bold text-white/50 backdrop-blur-sm">
            {tr.zoom.toFixed(1)}×
          </div>
        )}

        {photoPts.length > 0 && (
          <p className="pb-1.5 text-center text-[10px] text-white/25">
            드래그·핀치 탐색 &nbsp;·&nbsp; 별 탭 = 위치 확인
          </p>
        )}
      </div>

      {/* ── Info Card ── */}
      <div className="mt-4 space-y-3 px-5">
        <div className="mono-card">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[10px] font-semibold tracking-widest text-muted-foreground">CONSTELLATION NAME</p>
              <p className="mt-0.5 text-[22px] font-bold text-foreground">{constellationName}</p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="rounded px-2 py-0.5 text-[10px] font-bold tracking-wider"
                  style={{ backgroundColor: dominantType.color + "30", color: dominantType.color }}>
                  → {dominantType.planet.toUpperCase()}
                </span>
                <span className="text-[11px] text-muted-foreground">{dominantType.name}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[38px] font-bold leading-none text-foreground">{photoPts.length}</p>
              <p className="text-[10px] font-semibold tracking-wider text-muted-foreground">STARS</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 divide-x divide-border rounded-xl border border-border">
            {[{ v: stats.citiesCount, l: "도시" }, { v: stats.countriesCount, l: "국가" }, { v: stats.score.toLocaleString(), l: "점수" }].map(({ v, l }) => (
              <div key={l} className="flex flex-col items-center py-3">
                <p className="text-[20px] font-bold text-foreground">{v}</p>
                <p className="text-[10px] text-muted-foreground">{l}</p>
              </div>
            ))}
          </div>

          <button onClick={downloadCard}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-[13px] font-semibold text-foreground transition-colors active:bg-secondary">
            <Download className="h-4 w-4" />
            별자리 카드 저장
          </button>
        </div>

        {/* ── No-GPS Photos Section ── */}
        {noGpsPts.length > 0 && (
          <div className="mono-card">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold tracking-widest text-muted-foreground">GPS UNREGISTERED</p>
                <p className="mt-0.5 text-[14px] font-bold text-foreground">
                  위치 미등록 사진 <span className="text-primary">{noGpsPts.length}장</span>
                </p>
              </div>
              <MapPin className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {noGpsPts.slice(0, 6).map(p => (
                <button
                  key={p.id}
                  onClick={() => { setGpsTarget(p); setSearchQuery(""); setSearchResults([]); }}
                  className="group relative aspect-square overflow-hidden rounded-xl bg-secondary"
                >
                  <img src={p.url} alt={p.fileName} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 to-transparent p-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="text-[9px] font-bold text-white">위치 등록</span>
                  </div>
                  <div className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5">
                    <MapPin className="h-3 w-3 text-white/80" />
                  </div>
                </button>
              ))}
              {noGpsPts.length > 6 && (
                <div className="flex aspect-square items-center justify-center rounded-xl bg-secondary">
                  <p className="text-[12px] font-bold text-muted-foreground">+{noGpsPts.length - 6}</p>
                </div>
              )}
            </div>

            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              사진을 탭해서 위치를 등록하면 별자리에 추가돼요
            </p>
          </div>
        )}

        {/* CTA */}
        <button onClick={onAddRecord}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[14px] font-bold text-primary-foreground shadow-button transition-transform active:scale-[0.98]">
          <Plus className="h-4 w-4" />
          새로운 탐사 기록하기
        </button>
      </div>

      {/* ── GPS Search Modal ── */}
      {gpsTarget && (
        <div className="fixed inset-0 z-[200] flex items-end">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />

          {/* sheet */}
          <div className="relative w-full rounded-t-3xl bg-background px-5 pb-28 pt-5 shadow-card">
            {/* handle */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />

            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold tracking-widest text-muted-foreground">REGISTER LOCATION</p>
                <p className="mt-0.5 text-[18px] font-bold text-foreground">위치 등록</p>
              </div>
              <button onClick={closeModal} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* photo preview */}
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-border p-3">
              <img src={gpsTarget.url} alt={gpsTarget.fileName} className="h-14 w-14 rounded-lg object-cover" />
              <div>
                <p className="text-[13px] font-semibold text-foreground">{gpsTarget.fileName}</p>
                <p className="text-[11px] text-muted-foreground">GPS 정보 없음</p>
              </div>
            </div>

            {/* search input */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className="h-11 w-full rounded-xl border border-border bg-secondary pl-9 pr-4 text-[14px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                placeholder="도시, 장소, 주소 검색..."
                value={searchQuery}
                onChange={e => handleSearchInput(e.target.value)}
                autoFocus
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-foreground" />
                </div>
              )}
            </div>

            {/* results */}
            <div className="max-h-64 overflow-y-auto space-y-1.5">
              {searchResults.length === 0 && searchQuery && !isSearching && (
                <p className="py-4 text-center text-[13px] text-muted-foreground">검색 결과가 없어요</p>
              )}
              {searchResults.map(result => (
                <button
                  key={result.place_id}
                  disabled={isAssigning}
                  onClick={() => handleAssignGPS(result)}
                  className="flex w-full items-start gap-2.5 rounded-xl border border-border p-3 text-left transition-colors hover:bg-secondary active:bg-secondary disabled:opacity-50"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <p className="text-[13px] text-foreground line-clamp-2">{result.display_name}</p>
                </button>
              ))}
            </div>

            {isAssigning && (
              <p className="mt-3 text-center text-[12px] text-muted-foreground">위치 등록 중...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── canvas util ─────────────────────────────────────────────── */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

export default PlanetScreen;
