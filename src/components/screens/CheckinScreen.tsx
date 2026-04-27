import { useRef, useState } from "react";
import { FilePlus2, MapPin, Rocket, Sparkles, X } from "lucide-react";
import { useExploration } from "@/context/ExplorationContext";

const CheckinScreen = () => {
  const { photos, addFiles, removePhoto, stats } = useExploration();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handle = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      await addFiles(files);
    } finally {
      setBusy(false);
    }
  };

  const recent = [...photos].slice(-3).reverse();
  const last = photos[photos.length - 1];

  return (
    <div className="animate-fade-up flex min-h-[calc(100dvh-3.5rem)] flex-col px-5 pb-32 pt-2">
      <div className="mb-3 text-center">
        <p className="text-[10px] font-bold tracking-[0.3em] text-accent">NEW MISSION</p>
        <h2 className="font-display mt-1 text-[26px] font-bold leading-tight text-foreground">
          사진으로 체크인
        </h2>
      </div>

      {/* Launch button — orbital rings */}
      <div className="my-4 flex flex-col items-center">
        <div className="relative flex h-60 w-60 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-primary/20" />
          <div className="absolute inset-3 rounded-full border border-dashed border-accent/30 animate-spin-slow" />
          <div className="absolute inset-6 rounded-full border border-primary/15" />
          {/* Orbit dot */}
          <div className="absolute inset-0 animate-orbit">
            <span className="absolute left-1/2 top-1 -translate-x-1/2">
              <Sparkles className="h-3 w-3 text-accent" />
            </span>
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="relative z-10 flex h-36 w-36 flex-col items-center justify-center gap-1.5 rounded-full bg-gradient-violet text-primary-foreground shadow-glow-violet transition-transform active:scale-[0.96] disabled:opacity-70 animate-glow-pulse"
          >
            <Rocket className="h-7 w-7" />
            <span className="font-display text-[14px] font-bold tracking-[0.2em]">
              {busy ? "SYNCING..." : "LAUNCH"}
            </span>
          </button>
        </div>
        <p className="mt-3 text-[10px] font-bold tracking-[0.25em] text-accent">
          ORBITAL SYNC: {Math.min(98, 60 + stats.coverage)}%
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handle(e.target.files)}
      />

      {/* Recent strip */}
      <section className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[12px] font-bold tracking-widest text-foreground">TODAY'S LOG</p>
          <button
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1 text-[10px] font-bold tracking-widest text-primary"
          >
            ADD NEW <FilePlus2 className="h-3 w-3" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {recent.map((p) => (
            <div key={p.id} className="relative aspect-square overflow-hidden rounded-xl border border-border bg-secondary">
              <img src={p.url} alt={p.fileName} className="h-full w-full object-cover" />
              <button
                onClick={() => removePhoto(p.id)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white"
                aria-label="삭제"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 2 - recent.length) }).map((_, i) => (
            <button
              key={i}
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square items-center justify-center rounded-xl border border-border bg-secondary/40 text-muted-foreground"
            >
              <FilePlus2 className="h-5 w-5" />
            </button>
          ))}
          <button
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-primary/40 text-primary"
          >
            <FilePlus2 className="h-4 w-4" />
            <span className="text-[10px] font-bold tracking-widest">BROWSE</span>
          </button>
        </div>
      </section>

      {/* Current location */}
      <section className="mono-card">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft">
            <MapPin className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <p className="text-[9px] font-bold tracking-[0.25em] text-muted-foreground">CURRENT LOCATION</p>
            <p className="font-display text-[15px] font-bold text-foreground">{last?.city ?? "—"}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div>
            <p className="text-[9px] font-bold tracking-widest text-muted-foreground">LATITUDE</p>
            <p className="font-display text-[15px] font-bold tracking-tight text-accent">
              {last?.lat != null ? `${last.lat.toFixed(4)}°` : "—"}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-bold tracking-widest text-muted-foreground">LONGITUDE</p>
            <p className="font-display text-[15px] font-bold tracking-tight text-accent">
              {last?.lon != null ? `${last.lon.toFixed(4)}°` : "—"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CheckinScreen;
