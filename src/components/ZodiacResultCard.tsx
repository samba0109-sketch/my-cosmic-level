import { useState } from "react";
import { X, BookOpen } from "lucide-react";
import type { ZodiacInfo } from "@/lib/zodiac";

interface Props {
  zodiac: ZodiacInfo;
  onClose: () => void;
  onViewCollection: () => void;
}

const LUCKY_COLOR_MAP: Record<string, string> = {
  빨강: "bg-red-400",
  초록: "bg-green-400",
  노랑: "bg-yellow-300",
  은색: "bg-slate-300",
  금색: "bg-yellow-400",
  베이지: "bg-amber-200",
  핑크: "bg-pink-300",
  검정: "bg-zinc-800",
  보라: "bg-purple-400",
  갈색: "bg-amber-700",
  하늘색: "bg-sky-300",
  청록: "bg-teal-400",
};

export default function ZodiacResultCard({ zodiac, onClose, onViewCollection }: Props) {
  const [imgError, setImgError] = useState(false);
  const dotColor = LUCKY_COLOR_MAP[zodiac.luckyColor] ?? "bg-primary";

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Card */}
      <div
        className="animate-slide-up mx-auto w-full max-w-[440px] overflow-hidden rounded-t-3xl bg-card pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        {/* Close */}
        <div className="flex justify-end px-4 pt-1">
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 획득 뱃지 */}
        <p className="text-center text-[11px] font-bold tracking-[0.2em] text-primary">✦ 별 조각 획득 ✦</p>

        {/* 캐릭터 이미지 */}
        <div className="relative mx-auto mt-3 flex h-44 w-44 items-center justify-center">
          {/* 링 */}
          <div className="absolute inset-0 rounded-full border-2 border-primary/30" />
          <div className="absolute inset-3 animate-spin-slow rounded-full border border-dashed border-primary/20" />
          {/* 이미지 */}
          <img
            src={imgError ? "/byeolkong.png" : zodiac.image}
            alt={zodiac.character}
            onError={() => setImgError(true)}
            className="relative z-10 h-32 w-32 object-contain drop-shadow-lg"
          />
        </div>

        {/* 이름 + 별자리 */}
        <div className="mt-4 text-center">
          <p className="text-[32px] font-bold leading-none tracking-tight text-foreground">
            {zodiac.character}
          </p>
          <p className="mt-1.5 text-[14px] font-semibold text-muted-foreground">
            {zodiac.symbol} {zodiac.name} · {zodiac.dates}
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">{zodiac.keywords}</p>
        </div>

        {/* 운세 메시지 */}
        <div className="mx-5 mt-5 rounded-2xl bg-secondary px-4 py-4">
          <p className="mb-1 text-[10px] font-bold tracking-widest text-muted-foreground">TODAY'S MESSAGE</p>
          <p className="text-[15px] font-semibold leading-snug text-foreground">
            "{zodiac.message}"
          </p>
        </div>

        {/* 행운 정보 */}
        <div className="mx-5 mt-3 grid grid-cols-3 gap-2">
          {/* 색 */}
          <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border py-3">
            <div className={`h-5 w-5 rounded-full ${dotColor}`} />
            <p className="text-[10px] text-muted-foreground">행운의 색</p>
            <p className="text-[13px] font-bold text-foreground">{zodiac.luckyColor}</p>
          </div>
          {/* 숫자 */}
          <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border py-3">
            <p className="text-[20px] font-bold leading-none text-primary">{zodiac.luckyNumber}</p>
            <p className="text-[10px] text-muted-foreground">행운의 숫자</p>
            <p className="text-[13px] font-bold text-foreground">No.{zodiac.luckyNumber}</p>
          </div>
          {/* 시간 */}
          <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border py-3">
            <p className="text-[18px] leading-none">⏰</p>
            <p className="text-[10px] text-muted-foreground">행운의 시간</p>
            <p className="text-[13px] font-bold text-foreground">{zodiac.luckyTime}</p>
          </div>
        </div>

        {/* 버튼 */}
        <div className="mx-5 mt-4 flex gap-2">
          <button
            onClick={onViewCollection}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-primary py-3.5 text-[14px] font-bold text-primary-foreground"
          >
            <BookOpen className="h-4 w-4" />
            별 도감에서 확인하기
          </button>
          <button
            onClick={onClose}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
