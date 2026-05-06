import { useMemo } from "react";

interface Props {
  subtitle?: string;
  onStarClick?: () => void;
}

/* ── star helpers (standalone, no PlanetScreen deps) ── */
function starPts(len: number, w: number): string {
  return `0,${-len} ${w},${-w} ${len},0 ${w},${w} 0,${len} ${-w},${w} ${-len},0 ${-w},${-w}`;
}

function HeaderStar({ variant }: { variant: number }) {
  const vb = 22;
  const r = 2.0; // base radius for a ~22-unit viewBox
  return (
    <svg
      width={20} height={20}
      viewBox={`${-vb / 2} ${-vb / 2} ${vb} ${vb}`}
      fill="none"
      aria-hidden
    >
      {variant === 1 && (
        <>
          <polygon points={starPts(r * 7.5, r * 0.16)} fill="currentColor" opacity={0.85} />
          <polygon points={starPts(r * 7.5, r * 0.16)} fill="currentColor" opacity={0.85}
            transform="rotate(90)" />
          <circle r={r * 0.9} fill="currentColor" />
        </>
      )}
      {variant === 2 && (
        <>
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * 45 - 90) * (Math.PI / 180);
            const len = i % 2 === 0 ? r * 5.8 : r * 3.2;
            return (
              <line key={i} x1={0} y1={0}
                x2={Math.cos(a) * len} y2={Math.sin(a) * len}
                stroke="currentColor" strokeWidth={i % 2 === 0 ? r * 0.20 : r * 0.12}
                strokeLinecap="round" opacity={i % 2 === 0 ? 0.9 : 0.5} />
            );
          })}
          <circle r={r * 0.9} fill="currentColor" />
        </>
      )}
      {variant === 3 && (
        <>
          <polygon points={starPts(r * 5.2, r * 0.85)} fill="currentColor" opacity={0.85} />
          <polygon points={starPts(r * 2.8, r * 0.55)} fill="currentColor" opacity={0.38}
            transform="rotate(45)" />
          <circle r={r * 1.0} fill="currentColor" />
        </>
      )}
      {variant === 4 && (
        <>
          <polygon points={starPts(r * 4.5, r * 0.22)} fill="currentColor" opacity={0.92} />
          <polygon points={starPts(r * 2.2, r * 0.15)} fill="currentColor" opacity={0.38}
            transform="rotate(45)" />
          <g transform={`translate(${r * 4.2},${-r * 4.0})`}>
            <polygon points={starPts(r * 1.6, r * 0.13)} fill="currentColor" opacity={0.65} />
          </g>
          <g transform={`translate(${-r * 3.2},${r * 3.8})`}>
            <polygon points={starPts(r * 1.0, r * 0.10)} fill="currentColor" opacity={0.45} />
          </g>
          <circle r={r * 0.9} fill="currentColor" />
        </>
      )}
      {variant === 5 && (
        <>
          <circle r={r * 4.5} fill="none" stroke="currentColor" strokeWidth={r * 0.20} opacity={0.3} />
          <polygon points={starPts(r * 3.8, r * 0.22)} fill="currentColor" opacity={0.88} />
          <polygon points={starPts(r * 1.9, r * 0.15)} fill="currentColor" opacity={0.38}
            transform="rotate(45)" />
          <circle r={r * 0.9} fill="currentColor" />
        </>
      )}
      {(variant === 0 || variant > 5) && (
        <>
          <polygon points={starPts(r * 3.0, r * 0.18)} fill="currentColor" opacity={0.40}
            transform="rotate(45)" />
          <polygon points={starPts(r * 5.8, r * 0.26)} fill="currentColor" opacity={0.92} />
          <circle r={r * 0.95} fill="currentColor" />
        </>
      )}
    </svg>
  );
}

const AppHeader = ({ subtitle, onStarClick }: Props) => {
  // Pick a random variant once per mount (stable for the session)
  const variant = useMemo(() => Math.floor(Math.random() * 6), []);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between bg-background/85 px-5 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <img src="/youearth-logo.png" alt="Youearth" className="h-4 w-auto" />
        {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
      </div>
      <button
        onClick={onStarClick}
        className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
        aria-label="별들에게 물어보세요"
      >
        <HeaderStar variant={variant} />
      </button>
    </header>
  );
};

export default AppHeader;
