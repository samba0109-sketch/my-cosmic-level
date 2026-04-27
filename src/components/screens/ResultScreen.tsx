import { Share2, RotateCcw, Trophy, Leaf, Mountain, Waves } from "lucide-react";
import StarField from "@/components/StarField";
import { toast } from "sonner";

interface Props {
  onRestart: () => void;
}

const ResultScreen = ({ onRestart }: Props) => {
  const handleShare = async () => {
    const text = "나의 지구 탐사 레벨은 Lv.7 은하계 탐험가! 🌍✨ 너도 측정해봐";
    if (navigator.share) {
      try {
        await navigator.share({ title: "유어스 행성탐사", text, url: window.location.href });
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      toast.success("링크가 복사되었어요");
    }
  };

  return (
    <div className="animate-fade-up pb-32">
      {/* Hero result */}
      <section className="relative overflow-hidden bg-gradient-night px-6 pb-12 pt-6 text-center">
        <StarField count={60} />
        <div className="relative z-10">
          <p className="mb-2 text-[12px] font-semibold tracking-wider text-white/60">
            YOUR ASTRONAUT TYPE
          </p>
          <div className="mb-3 inline-flex animate-scale-in items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur">
            <span className="text-base">🪐</span>
            <span className="text-[13px] font-bold text-white">은하계 탐험가</span>
          </div>
          <h2 className="mb-1 animate-fade-up text-[40px] font-extrabold leading-tight text-white">
            Lv. 7
          </h2>
          <p className="animate-fade-up text-[14px] text-white/80 text-balance">
            지구의 깊은 곳까지 호기심 가득한<br />중급 우주 탐험가예요
          </p>

          {/* Score gauge */}
          <div className="mx-auto mt-6 max-w-xs animate-fade-up rounded-2xl bg-white/10 p-4 backdrop-blur">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-[12px] text-white/70">탐사 지수</span>
              <span className="text-[18px] font-bold text-white">
                724<span className="text-[12px] text-white/60"> / 1000</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/15">
              <div className="h-full w-[72%] rounded-full bg-gradient-aurora" />
            </div>
            <p className="mt-2 text-left text-[11px] text-white/60">
              상위 12% · 다음 레벨까지 76점
            </p>
          </div>
        </div>
      </section>

      {/* Report */}
      <section className="-mt-6 rounded-t-[28px] bg-background px-5 pt-7">
        <h3 className="mb-3 text-[15px] font-bold text-foreground">나의 탐사 리포트</h3>

        <div className="grid grid-cols-3 gap-2.5">
          {[
            { icon: Leaf, label: "자연", v: 92, bg: "bg-earth/10", fg: "text-earth" },
            { icon: Mountain, label: "지형", v: 78, bg: "bg-cosmic/10", fg: "text-cosmic" },
            { icon: Waves, label: "바다", v: 64, bg: "bg-primary/10", fg: "text-primary" },
          ].map((m) => (
            <div key={m.label} className="rounded-2xl bg-card p-3 shadow-soft">
              <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full ${m.bg}`}>
                <m.icon className={`h-4 w-4 ${m.fg}`} />
              </div>
              <p className="text-[11px] text-muted-foreground">{m.label}</p>
              <p className="text-[18px] font-bold text-foreground">{m.v}</p>
            </div>
          ))}
        </div>

        {/* Description card */}
        <div className="mt-4 rounded-2xl bg-gradient-soft p-5">
          <p className="mb-2 text-[12px] font-bold text-cosmic">EXPLORER PROFILE</p>
          <p className="text-[14px] leading-relaxed text-foreground">
            당신은 <b>자연 친화형 탐험가</b>예요. 도시보다 들과 산, 숲에서 지구의
            맥박을 느끼는 타입. 다음에는 <b>해양 생태</b> 탐사에 도전해보세요!
          </p>
        </div>

        {/* Ranking */}
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-card p-4 shadow-soft">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cosmic-soft">
            <Trophy className="h-5 w-5 text-cosmic" />
          </div>
          <div className="flex-1">
            <p className="text-[12px] text-muted-foreground">글로벌 탐사 랭킹</p>
            <p className="text-[16px] font-bold text-foreground">#1,347 위</p>
          </div>
          <span className="rounded-full bg-earth/10 px-2.5 py-1 text-[11px] font-bold text-earth">
            ▲ 28
          </span>
        </div>

        <button
          onClick={onRestart}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary py-3.5 text-[14px] font-semibold text-foreground transition-colors hover:bg-muted"
        >
          <RotateCcw className="h-4 w-4" />
          다시 탐사하기
        </button>
      </section>

      {/* Bottom share */}
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[440px] bg-gradient-to-t from-background via-background to-transparent px-5 pb-6 pt-8">
        <button
          onClick={handleShare}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-cosmic py-[18px] text-[16px] font-bold text-white shadow-button transition-transform active:scale-[0.98]"
        >
          <Share2 className="h-5 w-5" />
          내 레벨 공유하기
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;
