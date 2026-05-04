import { useMemo, useRef, useState, useEffect } from "react";
import { Download, Minus, Plus, RotateCcw, RefreshCw, Search, X, MapPin } from "lucide-react";
import { useExploration } from "@/context/ExplorationContext";
import { reverseGeocode } from "@/lib/exploration";
import type { PhotoRecord } from "@/lib/exploration";

/* ── constants ───────────────────────────────────────────────── */
const SVG_W = 320, SVG_H = 290;
const MIN_ZOOM = 0.4, MAX_ZOOM = 15;
const BASE_R = 3.8;          // base star radius (SVG units)
const STEP_S = 0.38;         // seconds between each star reveal

/* ── types ───────────────────────────────────────────────────── */
interface Bounds { minLat: number; maxLat: number; minLon: number; maxLon: number }
interface Pt { x: number; y: number }
interface Transform { zoom: number; panX: number; panY: number }
interface NominatimResult { place_id: number; display_name: string; lat: string; lon: string }


/* ── geo helpers ─────────────────────────────────────────────── */
function computeBounds(pts: { lat: number; lon: number }[]): Bounds {
  if (pts.length === 0) return { minLat: -45, maxLat: 45, minLon: -90, maxLon: 90 };
  if (pts.length === 1) return { minLat: pts[0].lat-20, maxLat: pts[0].lat+20, minLon: pts[0].lon-20, maxLon: pts[0].lon+20 };
  const lats = pts.map(p => p.lat), lons = pts.map(p => p.lon);
  const pLat = Math.max((Math.max(...lats)-Math.min(...lats))*0.3, 8);
  const pLon = Math.max((Math.max(...lons)-Math.min(...lons))*0.3, 8);
  return { minLat: Math.min(...lats)-pLat, maxLat: Math.max(...lats)+pLat, minLon: Math.min(...lons)-pLon, maxLon: Math.max(...lons)+pLon };
}

function project(lat: number, lon: number, b: Bounds, w: number, h: number): Pt {
  return {
    x: ((lon-b.minLon)/(b.maxLon-b.minLon||1))*w,
    y: ((b.maxLat-lat)/(b.maxLat-b.minLat||1))*h,
  };
}

function genBgStars(n: number, w: number, h: number) {
  let s = 2026;
  const rng = () => { s = (s*1664525+1013904223)&0x7fffffff; return s/0x7fffffff; };
  return Array.from({ length: n }, (_, i) => ({
    x: rng()*w, y: rng()*h, r: rng()*0.9+0.2, o: rng()*0.45+0.1,
    sp: i%6===0, sv: Math.floor(rng()*3), // sparkle variant 0-2
  }));
}

function getConstellationName(n: number) {
  if (n===0) return "미지의 별자리";
  if (n===1) return "외톨이별자리";
  if (n<=3)  return "나그네자리";
  if (n<=6)  return "탐험가자리";
  if (n<=12) return "은하수자리";
  return "대항해자자리";
}

async function searchNominatim(q: string): Promise<NominatimResult[]> {
  if (!q.trim()) return [];
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&accept-language=ko`);
    return r.ok ? r.json() : [];
  } catch { return []; }
}

/* ── Star shape helpers ──────────────────────────────────────── */
// 4-pointed polygon: 8 vertices (4 tips + 4 waists)
function starPts(len: number, w: number): string {
  return `0,${-len} ${w},${-w} ${len},0 ${w},${w} 0,${len} ${-w},${w} ${-len},0 ${-w},${-w}`;
}

// Deterministic variant 0-5 from photo ID (stable across re-renders)
const NUM_VARIANTS = 6;
function photoVariant(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(h, 31) + id.charCodeAt(i)) >>> 0;
  return h % NUM_VARIANTS;
}

/* ── StarBurst variants ──────────────────────────────────────── */
// All centered at (0,0) — place with <g transform="translate(x,y)">
// variant 0 : sharp 4-point   (#04-05 style)
// variant 1 : elongated cross (#06-08 style — very long thin spikes)
// variant 2 : 8-spike radiant (#13-14 style — alternating long/short lines)
// variant 3 : wide 4-point    (#21 style — broader, rounder arms)
// variant 4 : twinkle cluster (#22-23 style — main + satellite sparkles)
// variant 5 : ring + 4-point  (#56 style — circle outline + center star)
function StarBurst({ r, active = false, variant = 0 }: { r: number; active?: boolean; variant?: number }) {
  const glow = active ? 0.18 : 0.06;
  const halo = (
    <>
      <circle r={r * 5.5} fill={`rgba(255,255,255,${glow})`} />
      <circle r={r * 2.2} fill={`rgba(255,255,255,${glow * 2.5})`} />
    </>
  );

  if (variant === 1) {
    // Very elongated cross — two long thin needles at 0° and 90°
    const L = r * 7.5, W = r * 0.16;
    return (
      <g>
        {halo}
        <polygon points={starPts(L, W)} fill="white" opacity={0.92} />
        <polygon points={starPts(L, W)} fill="white" opacity={0.92} transform="rotate(90)" />
        <circle r={r * 0.9} fill="white" />
      </g>
    );
  }

  if (variant === 2) {
    // 8-spike radiant: 4 long + 4 short thin lines
    return (
      <g>
        {halo}
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * 45 - 90) * (Math.PI / 180);
          const len = i % 2 === 0 ? r * 5.8 : r * 3.2;
          const sw  = i % 2 === 0 ? r * 0.20 : r * 0.12;
          const op  = i % 2 === 0 ? 0.95 : 0.52;
          return (
            <line key={i}
              x1={0} y1={0}
              x2={Math.cos(a) * len} y2={Math.sin(a) * len}
              stroke="white" strokeWidth={sw} strokeLinecap="round" opacity={op}
            />
          );
        })}
        <circle r={r * 0.9} fill="white" />
      </g>
    );
  }

  if (variant === 3) {
    // Wide 4-point — broader arms, more diamond-like (#21 style)
    return (
      <g>
        {halo}
        <polygon points={starPts(r * 5.2, r * 0.85)} fill="white" opacity={0.88} />
        <polygon points={starPts(r * 2.8, r * 0.55)} fill="white" opacity={0.42} transform="rotate(45)" />
        <circle r={r * 1.0} fill="white" />
      </g>
    );
  }

  if (variant === 4) {
    // Main star + two satellite sparkles (#22-23 style)
    return (
      <g>
        {halo}
        <polygon points={starPts(r * 4.5, r * 0.22)} fill="white" opacity={0.95} />
        <polygon points={starPts(r * 2.2, r * 0.15)} fill="white" opacity={0.48} transform="rotate(45)" />
        {/* satellite top-right */}
        <g transform={`translate(${r * 4.2},${-r * 4.0})`}>
          <polygon points={starPts(r * 1.6, r * 0.13)} fill="white" opacity={0.72} />
        </g>
        {/* satellite bottom-left */}
        <g transform={`translate(${-r * 3.2},${r * 3.8})`}>
          <polygon points={starPts(r * 1.0, r * 0.10)} fill="white" opacity={0.50} />
        </g>
        <circle r={r * 0.9} fill="white" />
      </g>
    );
  }

  if (variant === 5) {
    // Circle ring + 4-point center (#56 style)
    return (
      <g>
        {halo}
        <circle r={r * 4.5} fill="none" stroke="white" strokeWidth={r * 0.20} opacity={0.36} />
        <polygon points={starPts(r * 3.8, r * 0.22)} fill="white" opacity={0.92} />
        <polygon points={starPts(r * 1.9, r * 0.15)} fill="white" opacity={0.42} transform="rotate(45)" />
        <circle r={r * 0.9} fill="white" />
      </g>
    );
  }

  // variant 0 (default): sharp 4-point (#04-05 style)
  return (
    <g>
      {halo}
      <polygon points={starPts(r * 3.0, r * 0.18)} fill="white" opacity={0.50} transform="rotate(45)" />
      <polygon points={starPts(r * 5.8, r * 0.26)} fill="white" opacity={0.96} />
      <circle r={r * 0.95} fill="white" />
    </g>
  );
}

// Background sparkle stars — mix of 4-point variants
function MiniSparkle({ r, o, variant = 0 }: { r: number; o: number; variant?: number }) {
  const L = r * 3.0, W = r * 0.20;
  if (variant === 1) {
    // elongated cross mini
    return (
      <g opacity={o}>
        <polygon points={starPts(L * 1.2, W * 0.7)} fill="white" opacity={0.90} />
        <polygon points={starPts(L * 1.2, W * 0.7)} fill="white" opacity={0.90} transform="rotate(90)" />
        <circle r={r * 0.6} fill="white" />
      </g>
    );
  }
  if (variant === 2) {
    // 4-line radiant mini
    return (
      <g opacity={o}>
        {[0, 45, 90, 135].map(a => {
          const rad = (a - 90) * Math.PI / 180;
          return <line key={a} x1={0} y1={0} x2={Math.cos(rad)*L} y2={Math.sin(rad)*L}
            stroke="white" strokeWidth={W * 0.8} strokeLinecap="round" />;
        })}
        <circle r={r * 0.6} fill="white" />
      </g>
    );
  }
  // default: sharp 4-point mini
  return (
    <g opacity={o}>
      <polygon points={starPts(L * 0.6, W * 0.8)} fill="white" opacity={0.5} transform="rotate(45)" />
      <polygon points={starPts(L, W)} fill="white" opacity={0.95} />
      <circle r={r * 0.7} fill="white" />
    </g>
  );
}

/* ── main component ──────────────────────────────────────────── */
const PlanetScreen = ({ onAddRecord }: { onAddRecord: () => void }) => {
  const { photos, stats, updatePhoto } = useExploration();

  /* transform */
  const [tr, setTr] = useState<Transform>({ zoom: 1, panX: 0, panY: 0 });
  const svgRef   = useRef<SVGSVGElement>(null);
  const dragRef  = useRef<{ sx: number; sy: number; bx: number; by: number } | null>(null);
  const pinchRef = useRef<{ dist: number; mx: number; my: number } | null>(null);
  const didDrag  = useRef(false);

  /* star popup */
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  /* animation: key increments to remount animated group → restart */
  const [animKey, setAnimKey] = useState(0);
  const animKeyRef = useRef(0);
  useEffect(() => {
    animKeyRef.current += 1;
    setAnimKey(animKeyRef.current);
  }, [photos.length]);

  /* GPS modal */
  const [gpsTarget,     setGpsTarget]     = useState<PhotoRecord | null>(null);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching,   setIsSearching]   = useState(false);
  const [isAssigning,   setIsAssigning]   = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── data ── */
  const photoPts = useMemo(
    () => photos.filter(p => p.lat != null && p.lon != null).sort((a,b) => (a.takenAt??0)-(b.takenAt??0)),
    [photos],
  );
  const noGpsPts = useMemo(() => photos.filter(p => p.lat==null||p.lon==null), [photos]);
  const bounds   = useMemo(() => computeBounds(photoPts as {lat:number;lon:number}[]), [photoPts]);
  const svgPts   = useMemo<Pt[]>(() => photoPts.map(p => project(p.lat!, p.lon!, bounds, SVG_W, SVG_H)), [photoPts, bounds]);
  const bgStars  = useMemo(() => genBgStars(110, SVG_W, SVG_H), []);

  /* star weights (size by nearby density) */
  const weights = useMemo(() => {
    const T = 0.008;
    return photoPts.map(p => {
      const near = photoPts.filter(q => q!==p && Math.abs((q.lat??0)-(p.lat??0))<T && Math.abs((q.lon??0)-(p.lon??0))<T).length;
      return Math.min(1 + near * 0.45, 2.8);
    });
  }, [photoPts]);

  /* line lengths (for stroke-dashoffset animation) */
  const lineLens = useMemo(() =>
    svgPts.map((p,i) => i < svgPts.length-1 ? Math.hypot(svgPts[i+1].x-p.x, svgPts[i+1].y-p.y) : 0),
    [svgPts],
  );

  /* journey date range */
  const dateRange = useMemo(() => {
    const dated = photoPts.filter(p => p.takenAt);
    if (dated.length === 0) return null;
    const fmt = (ms: number) => new Date(ms).toLocaleDateString("ko-KR", { year:"2-digit", month:"short", day:"numeric" });
    const first = dated[0].takenAt!, last = dated[dated.length-1].takenAt!;
    return first === last ? fmt(first) : `${fmt(first)} — ${fmt(last)}`;
  }, [photoPts]);

  /* most visited city */
  const topCity = useMemo(() => {
    const m = new Map<string, number>();
    photos.forEach(p => { if (p.city) m.set(p.city, (m.get(p.city)??0)+1); });
    return [...m.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0] ?? null;
  }, [photos]);

  /* animation timing */
  const totalDuration = 0.2 + photoPts.length * STEP_S + 0.75;

  /* ── interaction ── */
  const toSVGPt = (cx: number, cy: number): Pt => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: SVG_W/2, y: SVG_H/2 };
    return { x: ((cx-rect.left)/rect.width)*SVG_W, y: ((cy-rect.top)/rect.height)*SVG_H };
  };
  const zoomAt = (factor: number, px: number, py: number) => {
    setTr(prev => {
      const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev.zoom*factor));
      const f = z/prev.zoom;
      return { zoom: z, panX: px-(px-prev.panX)*f, panY: py-(py-prev.panY)*f };
    });
  };

  const onMouseDown = (e: React.MouseEvent) => { didDrag.current=false; dragRef.current={sx:e.clientX,sy:e.clientY,bx:tr.panX,by:tr.panY}; };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return; didDrag.current=true;
    const rect = svgRef.current?.getBoundingClientRect(); if (!rect) return;
    const { sx,sy,bx,by } = dragRef.current;
    setTr(p => ({ ...p, panX: bx+(e.clientX-sx)*SVG_W/rect.width, panY: by+(e.clientY-sy)*SVG_H/rect.height }));
  };
  const onMouseUp = () => { dragRef.current=null; };
  const onWheel = (e: React.WheelEvent) => { e.preventDefault(); const {x,y}=toSVGPt(e.clientX,e.clientY); zoomAt(e.deltaY<0?1.18:0.85,x,y); };
  const onTouchStart = (e: React.TouchEvent) => {
    didDrag.current=false;
    if (e.touches.length===2) {
      const dx=e.touches[1].clientX-e.touches[0].clientX, dy=e.touches[1].clientY-e.touches[0].clientY;
      const mid=toSVGPt((e.touches[0].clientX+e.touches[1].clientX)/2,(e.touches[0].clientY+e.touches[1].clientY)/2);
      pinchRef.current={dist:Math.hypot(dx,dy),mx:mid.x,my:mid.y}; dragRef.current=null;
    } else { dragRef.current={sx:e.touches[0].clientX,sy:e.touches[0].clientY,bx:tr.panX,by:tr.panY}; pinchRef.current=null; }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length===2 && pinchRef.current) {
      didDrag.current=true;
      const dx=e.touches[1].clientX-e.touches[0].clientX, dy=e.touches[1].clientY-e.touches[0].clientY;
      const d=Math.hypot(dx,dy); zoomAt(d/pinchRef.current.dist,pinchRef.current.mx,pinchRef.current.my); pinchRef.current.dist=d;
    } else if (e.touches.length===1 && dragRef.current) {
      didDrag.current=true;
      const rect=svgRef.current?.getBoundingClientRect(); if (!rect) return;
      const {sx,sy,bx,by}=dragRef.current;
      setTr(p=>({...p, panX:bx+(e.touches[0].clientX-sx)*SVG_W/rect.width, panY:by+(e.touches[0].clientY-sy)*SVG_H/rect.height}));
    }
  };
  const onTouchEnd = () => { dragRef.current=null; pinchRef.current=null; };

  const btnIn    = () => zoomAt(1.6, SVG_W/2, SVG_H/2);
  const btnOut   = () => zoomAt(1/1.6, SVG_W/2, SVG_H/2);
  const btnReset = () => setTr({ zoom:1, panX:0, panY:0 });
  const replayAnim = () => { animKeyRef.current++; setAnimKey(animKeyRef.current); };

  /* GPS search */
  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!q.trim()) { setSearchResults([]); return; }
    setIsSearching(true);
    searchTimer.current = setTimeout(async () => {
      setSearchResults(await searchNominatim(q));
      setIsSearching(false);
    }, 500);
  };
  const handleAssignGPS = async (result: NominatimResult) => {
    if (!gpsTarget) return;
    setIsAssigning(true);
    const lat = parseFloat(result.lat), lon = parseFloat(result.lon);
    const geo = await reverseGeocode(lat, lon);
    updatePhoto(gpsTarget.id, { lat, lon, city: geo.city, country: geo.country, continent: geo.continent });
    setGpsTarget(null); setSearchQuery(""); setSearchResults([]); setIsAssigning(false);
  };
  const closeModal = () => { setGpsTarget(null); setSearchQuery(""); setSearchResults([]); };

  /* Canvas card download — workout-record style */
  const downloadCard = async () => {
    const CW = 630, CH = 1120;
    const canvas = document.createElement("canvas");
    canvas.width = CW; canvas.height = CH;
    const ctx = canvas.getContext("2d")!;

    /* ── 1. Background ── */
    const firstPhoto = photoPts[0] ?? photos[0];
    let bgLoaded = false;
    if (firstPhoto?.url) {
      try {
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const iw = img.naturalWidth, ih = img.naturalHeight;
            const scale = Math.max(CW / iw, CH / ih);
            const sw = iw * scale, sh = ih * scale;
            ctx.filter = "blur(14px) brightness(0.32)";
            ctx.drawImage(img, (CW - sw) / 2, (CH - sh) / 2, sw, sh);
            ctx.filter = "none";
            bgLoaded = true;
            resolve();
          };
          img.onerror = reject;
          img.src = firstPhoto.url;
        });
      } catch { /* fall through to dark gradient */ }
    }
    if (!bgLoaded) {
      const bg = ctx.createLinearGradient(0, 0, 0, CH);
      bg.addColorStop(0, "#111111");
      bg.addColorStop(1, "#1a1a1a");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, CW, CH);
    }

    /* ── 2. Dark overlay ── */
    const ov = ctx.createLinearGradient(0, 0, 0, CH);
    ov.addColorStop(0,    "rgba(0,0,0,0.76)");
    ov.addColorStop(0.38, "rgba(0,0,0,0.52)");
    ov.addColorStop(0.62, "rgba(0,0,0,0.52)");
    ov.addColorStop(1,    "rgba(0,0,0,0.82)");
    ctx.fillStyle = ov; ctx.fillRect(0, 0, CW, CH);

    /* ── 3. Header ── */
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.42)";
    ctx.font = "300 12px 'Helvetica Neue',Arial,sans-serif";
    /* manual letter-spacing for "YOUEARTH" */
    const brand = "Y O U E A R T H";
    ctx.fillText(brand, CW / 2, 82);

    if (dateRange) {
      ctx.fillStyle = "rgba(255,255,255,0.28)";
      ctx.font = "300 11px 'Helvetica Neue',Arial,sans-serif";
      ctx.fillText(dateRange, CW / 2, 104);
    }

    /* hairline below header */
    const hairline = (y: number) => {
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.11)";
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(56, y); ctx.lineTo(CW - 56, y); ctx.stroke();
      ctx.restore();
    };
    hairline(124);

    /* ── 4. Three stats ── */
    const STATS_CY = 310; // vertical center of the number baseline
    const colW = CW / 3;
    const statRows = [
      { value: String(stats.citiesCount),                    label: "CITIES"    },
      { value: String(stats.countriesCount),                  label: "COUNTRIES" },
      { value: stats.distanceKm.toLocaleString(),             label: "KM"        },
    ];

    statRows.forEach((s, i) => {
      const cx = colW * i + colW / 2;

      /* number */
      const fontSize = i < 2 ? 88 : 74;
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${fontSize}px 'Helvetica Neue',Arial,sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(s.value, cx, STATS_CY);

      /* label */
      ctx.fillStyle = "rgba(255,255,255,0.36)";
      ctx.font = "300 11px 'Helvetica Neue',Arial,sans-serif";
      ctx.fillText(s.label, cx, STATS_CY + 30);

      /* vertical separator */
      if (i < 2) {
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.11)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(colW * (i + 1), STATS_CY - 76);
        ctx.lineTo(colW * (i + 1), STATS_CY + 42);
        ctx.stroke();
        ctx.restore();
      }
    });

    hairline(STATS_CY + 60);

    /* ── 5. Route visualization ── */
    if (photoPts.length > 0) {
      const RX = 64, RY = STATS_CY + 96, RW = CW - 128, RH = 450;
      const cb = computeBounds(photoPts as { lat: number; lon: number }[]);
      const rPts = photoPts.map(p => {
        const pt = project(p.lat!, p.lon!, cb, RW, RH);
        return { x: pt.x + RX, y: pt.y + RY, rec: p };
      });

      /* dashed connecting lines */
      if (rPts.length > 1) {
        ctx.save();
        ctx.setLineDash([4, 7]);
        ctx.strokeStyle = "rgba(255,255,255,0.20)";
        ctx.lineWidth = 1;
        rPts.forEach((pt, i) => {
          if (i >= rPts.length - 1) return;
          ctx.beginPath(); ctx.moveTo(pt.x, pt.y); ctx.lineTo(rPts[i + 1].x, rPts[i + 1].y); ctx.stroke();
        });
        ctx.restore();
      }

      /* dots */
      rPts.forEach((pt, i) => {
        const isEdge = i === 0 || i === rPts.length - 1;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, isEdge ? 5 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = isEdge ? "#ffffff" : "rgba(255,255,255,0.50)";
        ctx.fill();
      });

      /* start / end city labels */
      const drawCityLabel = (pt: { x: number; y: number; rec: PhotoRecord }, side: "left" | "right") => {
        const city = pt.rec.city ?? pt.rec.country ?? "";
        if (!city) return;
        ctx.textAlign = side;
        ctx.fillStyle = "rgba(255,255,255,0.65)";
        ctx.font = "500 10px 'Helvetica Neue',Arial,sans-serif";
        const ox = side === "left" ? 11 : -11;
        ctx.fillText(city.toUpperCase(), pt.x + ox, pt.y + 4);
      };
      if (rPts.length >= 1) drawCityLabel(rPts[0], "left");
      if (rPts.length >= 2) drawCityLabel(rPts[rPts.length - 1], "right");
    }

    /* ── 6. Footer ── */
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.16)";
    ctx.font = "300 10px 'Courier New',monospace";
    ctx.fillText("YOUEARTH.APP", CW / 2, CH - 38);

    /* ── Export ── */
    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `youearth-record-${Date.now()}.png`; a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  /* ── render ──────────────────────────────────────────────────── */
  return (
    <div className="animate-fade-up flex min-h-[calc(100dvh-3.5rem)] flex-col pb-32 pt-2">

      {/* Header */}
      <div className="mb-3 px-5 text-center">
        <p className="text-[11px] font-semibold tracking-widest text-muted-foreground">MY CONSTELLATION</p>
        <h2 className="mt-0.5 text-[22px] font-bold text-foreground">나의 별자리</h2>
        {dateRange && <p className="mt-0.5 text-[11px] text-muted-foreground">{dateRange}</p>}
      </div>

      {/* ── Star Map ── */}
      <div className="relative mx-auto w-full max-w-[420px] overflow-hidden rounded-2xl bg-[#03070f]">
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
          {/* Fixed bg micro-stars */}
          {bgStars.map((s, i) =>
            s.sp
              ? <g key={i} transform={`translate(${s.x},${s.y})`}><MiniSparkle r={s.r*1.3} o={s.o*0.65} variant={s.sv} /></g>
              : <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.o} />
          )}

          {/* Lines — inside zoom group so they scale with map */}
          <g transform={`translate(${tr.panX},${tr.panY}) scale(${tr.zoom})`}>
            <g key={`lines-${animKey}`}>
              {svgPts.map((p, i) => {
                if (i >= svgPts.length - 1) return null;
                const len = lineLens[i];
                const delay = STEP_S * 0.5 + i * STEP_S + 0.2;
                return (
                  <line
                    key={i}
                    className="line-anim"
                    x1={p.x} y1={p.y} x2={svgPts[i+1].x} y2={svgPts[i+1].y}
                    stroke="rgba(255,255,255,0.60)"
                    strokeWidth={1.5 / tr.zoom}
                    strokeLinecap="round"
                    strokeDasharray={len}
                    style={{ '--dl': len, animationDelay: `${delay}s` } as React.CSSProperties}
                  />
                );
              })}
            </g>
          </g>

          {/* Stars — positioned at screen coords (pixel-stable, outside zoom group) */}
          <g key={`stars-${animKey}`}>
            {svgPts.map((p, i) => {
              // Compute screen position from map coords + current transform
              const sx = p.x * tr.zoom + tr.panX;
              const sy = p.y * tr.zoom + tr.panY;
              const r  = BASE_R * weights[i]; // fixed pixel size
              const isActive = activeIdx === i;
              const delay = 0.2 + i * STEP_S;

              return (
                <g key={photoPts[i].id} transform={`translate(${sx},${sy})`}>
                  <g
                    className="star-anim"
                    style={{ animationDelay: `${delay}s`, cursor: "pointer" }}
                    onClick={e => { e.stopPropagation(); if (!didDrag.current) setActiveIdx(isActive ? null : i); }}
                  >
                    <StarBurst r={r} active={isActive} variant={photoVariant(photoPts[i].id)} />
                  </g>

                  {/* Popup */}
                  {isActive && (() => {
                    const label = (photoPts[i].city ?? `${photoPts[i].lat?.toFixed(2)},${photoPts[i].lon?.toFixed(2)}`).toUpperCase();
                    const fs = 8.5, lw = label.length * fs * 0.66 + 18, lh = 20;
                    const ly = -(r * 6.5 + lh + 4);
                    return (
                      <g>
                        <rect x={-lw/2} y={ly} width={lw} height={lh} rx={5}
                          fill="rgba(5,14,35,0.93)" stroke="rgba(255,255,255,0.25)" strokeWidth={0.7} />
                        <text x={0} y={ly+lh*0.67} textAnchor="middle" fill="white"
                          fontSize={fs} fontFamily="'Courier New',monospace" fontWeight="bold">{label}</text>
                      </g>
                    );
                  })()}
                </g>
              );
            })}

            {/* Completion ring - fires after all stars are done */}
            {photoPts.length > 1 && (() => {
              const cx = svgPts.reduce((s,p)=>s+p.x*tr.zoom+tr.panX, 0) / svgPts.length;
              const cy = svgPts.reduce((s,p)=>s+p.y*tr.zoom+tr.panY, 0) / svgPts.length;
              return (
                <circle key={`ring-${animKey}`} cx={cx} cy={cy} r={8} fill="none"
                  stroke="rgba(255,255,255,0.55)" strokeWidth={1.5}
                  style={{ animation: `completionRing 1.8s ease-out ${totalDuration}s both` }}
                />
              );
            })()}
          </g>

          {/* Empty state */}
          {svgPts.length === 0 && (
            <text x={SVG_W/2} y={SVG_H/2} textAnchor="middle"
              fill="rgba(255,255,255,0.22)" fontSize="11" fontFamily="sans-serif">
              GPS 사진을 올리면 별자리가 그려져요
            </text>
          )}
        </svg>

        {/* Zoom + replay controls */}
        <div className="absolute bottom-9 right-2 flex flex-col gap-1">
          {[
            { icon: <Plus className="h-3.5 w-3.5" />, fn: btnIn },
            { icon: <RotateCcw className="h-3 w-3" />, fn: btnReset },
            { icon: <Minus className="h-3.5 w-3.5" />, fn: btnOut },
          ].map((b, i) => (
            <button key={i} onClick={b.fn}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/65 backdrop-blur-sm transition-colors hover:bg-white/20 active:bg-white/30">
              {b.icon}
            </button>
          ))}
        </div>

        {/* Replay animation button */}
        {photoPts.length > 0 && (
          <button onClick={replayAnim}
            className="absolute left-2 bottom-9 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/65 backdrop-blur-sm transition-colors hover:bg-white/20 active:bg-white/30"
            title="애니메이션 다시 보기">
            <RefreshCw className="h-3 w-3" />
          </button>
        )}

        {tr.zoom !== 1 && (
          <div className="absolute left-2 top-2 rounded bg-black/40 px-1.5 py-0.5 text-[10px] font-bold text-white/50 backdrop-blur-sm">
            {tr.zoom.toFixed(1)}×
          </div>
        )}

        {photoPts.length > 0 && (
          <p className="pb-1.5 text-center text-[10px] text-white/22">
            드래그·핀치 탐색 &nbsp;·&nbsp; 별 탭 = 위치 확인
          </p>
        )}
      </div>

      {/* ── Info cards ── */}
      <div className="mt-4 space-y-3 px-5">

        {/* Constellation card */}
        <div className="mono-card">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[10px] font-semibold tracking-widest text-muted-foreground">CONSTELLATION</p>
              <p className="mt-0.5 text-[24px] font-bold text-foreground">{getConstellationName(photoPts.length)}</p>
              {topCity && (
                <p className="mt-0.5 flex items-center gap-1 text-[12px] text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  주요 탐사지 <span className="font-semibold text-foreground">{topCity}</span>
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-[42px] font-bold leading-none text-foreground">{photoPts.length}</p>
              <p className="text-[10px] font-semibold tracking-wider text-muted-foreground">STARS</p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 divide-x divide-border rounded-xl border border-border">
            {[
              { v: stats.citiesCount,   l: "도시" },
              { v: stats.countriesCount, l: "국가" },
              { v: `${stats.distanceKm.toLocaleString()}km`, l: "거리" },
            ].map(({ v, l }) => (
              <div key={l} className="flex flex-col items-center py-3">
                <p className="text-[18px] font-bold text-foreground">{v}</p>
                <p className="text-[10px] text-muted-foreground">{l}</p>
              </div>
            ))}
          </div>

          <button onClick={downloadCard}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-[13px] font-semibold text-foreground transition-colors active:bg-secondary">
            <Download className="h-4 w-4" />
            여행 기록 카드 저장
          </button>
        </div>

        {/* GPS 미등록 섹션 */}
        {noGpsPts.length > 0 && (
          <div className="mono-card">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold tracking-widest text-muted-foreground">GPS UNREGISTERED</p>
                <p className="mt-0.5 text-[14px] font-bold text-foreground">
                  위치 미등록 <span className="text-primary">{noGpsPts.length}장</span>
                </p>
              </div>
              <MapPin className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {noGpsPts.slice(0,6).map(p => (
                <button key={p.id}
                  onClick={() => { setGpsTarget(p); setSearchQuery(""); setSearchResults([]); }}
                  className="group relative aspect-square overflow-hidden rounded-xl bg-secondary">
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
                  <p className="text-[12px] font-bold text-muted-foreground">+{noGpsPts.length-6}</p>
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full rounded-t-3xl bg-background px-5 pb-28 pt-5 shadow-card">
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
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-border p-3">
              <img src={gpsTarget.url} alt={gpsTarget.fileName} className="h-14 w-14 rounded-lg object-cover" />
              <div>
                <p className="text-[13px] font-semibold text-foreground">{gpsTarget.fileName}</p>
                <p className="text-[11px] text-muted-foreground">GPS 정보 없음</p>
              </div>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className="h-11 w-full rounded-xl border border-border bg-secondary pl-9 pr-4 text-[14px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                placeholder="도시, 장소, 주소 검색..."
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                autoFocus
              />
              {isSearching && <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-border border-t-foreground" />}
            </div>
            <div className="max-h-52 space-y-1.5 overflow-y-auto">
              {searchResults.length === 0 && searchQuery && !isSearching && (
                <p className="py-4 text-center text-[13px] text-muted-foreground">검색 결과가 없어요</p>
              )}
              {searchResults.map(r => (
                <button key={r.place_id} disabled={isAssigning} onClick={() => handleAssignGPS(r)}
                  className="flex w-full items-start gap-2.5 rounded-xl border border-border p-3 text-left transition-colors hover:bg-secondary active:bg-secondary disabled:opacity-50">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <p className="line-clamp-2 text-[13px] text-foreground">{r.display_name}</p>
                </button>
              ))}
            </div>
            {isAssigning && <p className="mt-3 text-center text-[12px] text-muted-foreground">위치 등록 중...</p>}
          </div>
        </div>
      )}
    </div>
  );
};


export default PlanetScreen;
