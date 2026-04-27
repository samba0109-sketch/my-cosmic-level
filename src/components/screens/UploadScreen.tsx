import { useRef, useState } from "react";
import { Camera, Plus, X, ImageIcon } from "lucide-react";

interface Props {
  onSubmit: () => void;
}

const UploadScreen = ({ onSubmit }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  const handlePick = (files: FileList | null) => {
    if (!files) return;
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setPhotos((p) => [...p, ...urls].slice(0, 9));
  };

  const remove = (i: number) => setPhotos((p) => p.filter((_, idx) => idx !== i));

  return (
    <div className="animate-fade-up flex min-h-[calc(100dvh-3.5rem)] flex-col px-5 pb-32 pt-2">
      <div className="mb-6">
        <p className="mb-1 text-[12px] font-semibold tracking-wider text-cosmic">
          STEP 1 · 탐사 기록
        </p>
        <h2 className="text-[24px] font-bold leading-tight text-foreground text-balance">
          탐사한 지구의<br />사진을 올려주세요
        </h2>
        <p className="mt-2 text-[13px] text-muted-foreground">
          여행·자연·동식물 사진을 1장 이상 골라주세요. (최대 9장)
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handlePick(e.target.files)}
      />

      {photos.length === 0 ? (
        <button
          onClick={() => inputRef.current?.click()}
          className="flex flex-1 min-h-[280px] flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border bg-secondary/50 transition-colors hover:bg-secondary"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-cosmic shadow-glow">
            <Camera className="h-7 w-7 text-white" />
          </div>
          <div className="text-center">
            <p className="text-[15px] font-semibold text-foreground">사진 추가하기</p>
            <p className="mt-1 text-[12px] text-muted-foreground">탭해서 갤러리에서 선택</p>
          </div>
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((src, i) => (
            <div key={i} className="relative aspect-square animate-scale-in overflow-hidden rounded-2xl bg-secondary">
              <img src={src} alt={`업로드 ${i + 1}`} className="h-full w-full object-cover" />
              <button
                onClick={() => remove(i)}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur"
                aria-label="삭제"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {photos.length < 9 && (
            <button
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-border bg-secondary/50 text-muted-foreground transition-colors hover:bg-secondary"
            >
              <Plus className="h-5 w-5" />
              <span className="text-[11px] font-medium">추가</span>
            </button>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="mt-5 rounded-2xl bg-primary-soft p-4">
        <div className="mb-1.5 flex items-center gap-1.5">
          <ImageIcon className="h-4 w-4 text-primary" />
          <p className="text-[12px] font-bold text-primary">탐사 팁</p>
        </div>
        <p className="text-[12px] leading-relaxed text-foreground/80">
          자연·동물·풍경 사진이 많을수록 탐사 점수가 높아져요. 같은 장소 여러 컷도 좋아요.
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[440px] bg-gradient-to-t from-background via-background to-transparent px-5 pb-6 pt-8">
        <button
          onClick={onSubmit}
          disabled={photos.length === 0}
          className="w-full rounded-2xl bg-primary py-[18px] text-[16px] font-bold text-primary-foreground shadow-button transition-all active:scale-[0.98] disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
        >
          {photos.length === 0 ? "사진을 추가해주세요" : `${photos.length}장으로 분석 시작하기`}
        </button>
      </div>
    </div>
  );
};

export default UploadScreen;
