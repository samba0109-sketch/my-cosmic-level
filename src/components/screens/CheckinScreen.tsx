import { useRef, useState } from "react";
import { FilePlus2, MapPin, Plane, X } from "lucide-react";
import { toast } from "sonner";
import { useExploration } from "@/context/ExplorationContext";

const CheckinScreen = () => {
  const { pending, stageFiles, removePending, commitPending, stats } = useExploration();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const MAX_PENDING = 10;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = MAX_PENDING - pending.length;
    if (remaining <= 0) {
      toast(`최대 ${MAX_PENDING}장까지 등록할 수 있어요`);
      return;
    }
    const arr = Array.from(files).slice(0, remaining);
    if (files.length > arr.length) {
      toast(`${arr.length}장만 추가됩니다 (최대 ${MAX_PENDING}장)`);
    }
    setBusy(true);
    try {
      await stageFiles(arr);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleLaunch = () => {
    if (pending.length === 0) {
      toast("탐사 기록을 위한 사진을 등록해주세요");
      return;
    }
    const committed = commitPending();
    toast.success("탐사 기록이 저장되었습니다.", {
      description: `${committed.length}장의 사진이 추가되었어요.`,
    });
  };

  const recent = [...pending].slice(-MAX_PENDING).reverse();
  const last = pending[pending.length - 1];

  return (
    <div className="animate-fade-up flex min-h-[calc(100dvh-3.5rem)] flex-col px-5 pb-32 pt-2">
      <div className="mb-3 text-center">
        <p className="text-[11px] font-semibold tracking-widest text-muted-foreground">새로운 탐사 기록</p>
        <h2 className="mt-1 text-[26px] font-bold leading-tight text-foreground">사진으로 체크인</h2>
      </div>

      {/* Launch button */}
      <div className="my-4 flex flex-col items-center">
        <div className="relative flex h-56 w-56 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-border" />
          <div className="absolute inset-3 rounded-full border border-dashed border-border animate-spin-slow" />
          <button
            onClick={handleLaunch}
            disabled={busy}
            className="relative z-10 flex h-36 w-36 flex-col items-center justify-center gap-1.5 rounded-full bg-primary text-primary-foreground shadow-button transition-transform active:scale-[0.96] disabled:opacity-70"
          >
            <Plane className="h-7 w-7" />
            <span className="text-[14px] font-bold tracking-wide">{busy ? "ANALYZING..." : "LAUNCH"}</span>
          </button>
        </div>
        <p className="mt-2 text-[11px] font-semibold tracking-widest text-muted-foreground">
          ORBITAL SYNC: {Math.min(98, 60 + stats.coverage)}%
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Recent strip */}
      <section className="mb-4">
        <p className="mb-2 text-[14px] font-bold text-foreground">오늘의 탐사 기록</p>
        <div className="grid grid-cols-3 gap-2">
          {recent.map((p) => (
            <div key={p.id} className="relative aspect-square overflow-hidden rounded-xl bg-secondary">
              <img src={p.url} alt={p.fileName} className="h-full w-full object-cover" />
              <button
                onClick={() => removePending(p.id)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                aria-label="삭제"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {pending.length < MAX_PENDING && (
            <button
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-muted-foreground"
            >
              <FilePlus2 className="h-4 w-4" />
              <span className="text-[10px] font-bold">BROWSE</span>
            </button>
          )}
        </div>
      </section>

      {/* Current location */}
      <section className="mono-card">
        <div className="mb-2 flex items-center gap-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary">
            <MapPin className="h-3.5 w-3.5 text-foreground" />
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-muted-foreground">현재 위치</p>
            <p className="text-[14px] font-bold text-foreground">{last?.city ?? "기록 없음"}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div>
            <p className="text-[10px] text-muted-foreground">위도</p>
            <p className="text-[15px] font-bold tracking-tight text-foreground">
              {last?.lat != null ? `${last.lat.toFixed(4)}°` : "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">경도</p>
            <p className="text-[15px] font-bold tracking-tight text-foreground">
              {last?.lon != null ? `${last.lon.toFixed(4)}°` : "—"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CheckinScreen;
