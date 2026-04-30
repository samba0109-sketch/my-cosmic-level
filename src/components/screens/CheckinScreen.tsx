import { useRef, useState } from "react";
import { FilePlus2, MapPin, Plane, X } from "lucide-react";
import { toast } from "sonner";
import { useExploration } from "@/context/ExplorationContext";

const MAX_PENDING = 30;

const CheckinScreen = () => {
  const { pending, stageFiles, removePending, commitPending, stats } = useExploration();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = MAX_PENDING - pending.length;
    if (remaining <= 0) {
      toast(`최대 ${MAX_PENDING}장까지 등록할 수 있어요`);
      return;
    }
    const arr = Array.from(files).slice(0, remaining);
    setBusy(true);
    try {
      const added = await stageFiles(arr);
      if (added.length > 0) {
        toast.success(`${added.length}장의 사진이 등록되었습니다`);
      }
      if (files.length > arr.length) {
        toast(`${files.length - arr.length}장은 한도 초과로 제외되었습니다 (최대 ${MAX_PENDING}장)`);
      }
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
    toast.success("탐사 기록이 저장되었습니다", {
      description: `${committed.length}장의 사진이 추가되었어요`,
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
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[14px] font-bold text-foreground">오늘의 탐사 기록</p>
          <span className="text-[11px] font-medium text-muted-foreground">
            {pending.length}/{MAX_PENDING}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {recent.map((p) => (
            <div key={p.id} className="relative aspect-square overflow-hidden rounded-xl bg-secondary">
              <img src={p.url} alt={p.fileName} className="h-full w-full object-cover" />
              <button
                onClick={() => removePending(p.id)}
                className="absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                aria-label="삭제"
              >
                <X className="h-3 w-3" />
              </button>
              <div className="absolute inset-x-0 top-0 z-[5] bg-gradient-to-b from-black/70 to-transparent px-1.5 py-1 text-white">
                <div className="flex items-center gap-0.5 truncate text-[10px] font-bold leading-tight">
                  <MapPin className="h-2.5 w-2.5 shrink-0" />
                  <span className="truncate">{p.city ?? "위치 없음"}</span>
                </div>
                {p.lat != null && p.lon != null && (
                  <p className="mt-0.5 text-[8px] font-medium leading-tight opacity-90">
                    {p.lat.toFixed(3)}°, {p.lon.toFixed(3)}°
                  </p>
                )}
              </div>
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
    </div>
  );
};

export default CheckinScreen;
