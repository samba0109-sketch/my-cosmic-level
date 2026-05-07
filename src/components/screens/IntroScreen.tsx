import { ChevronLeft, X } from "lucide-react";

interface Props {
  onStart: () => void;
}

const steps = [
  {
    emoji: "📸",
    title: "사진으로 별 모으기",
    desc: "오늘의 사진을 업로드하고 나만의 별자리를 그려보세요.",
  },
  {
    emoji: "✨",
    title: "나만의 별자리 운세",
    desc: "모은 사진으로 그려진 별자리가 오늘의 운세를 알려드려요.",
  },
  {
    emoji: "🌟",
    title: "행운의 별 조각 도감 완성",
    desc: "모은 별 조각을 도감에 기록하고 공유해보세요.",
  },
];

const IntroScreen = ({ onStart }: Props) => (
  <div className="flex min-h-dvh flex-col bg-black text-white">
    {/* Top bar */}
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between bg-black/85 px-3 backdrop-blur-xl">
      <button
        className="flex h-10 w-10 items-center justify-center rounded-full text-white/80"
        aria-label="뒤로가기"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <img
        src="/youearth-logo.png"
        alt="Youearth"
        className="h-4 w-auto brightness-0 invert"
      />
      <button
        className="flex h-10 w-10 items-center justify-center rounded-full text-white/80"
        aria-label="닫기"
      >
        <X className="h-5 w-5" />
      </button>
    </header>

    {/* Hero */}
    <section className="flex flex-col items-center px-6 pt-10 text-center">
      <h1 className="text-[28px] font-bold leading-tight tracking-tight text-white">
        Welcome aboard,
        <br />
        탐사자님
      </h1>
      <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-zinc-400">
        잠시 후, 당신의 별자리 탐사가 시작됩니다.
        <br />
        당신이 찍은 사진이 오늘의 별자리를 결정합니다.
      </p>

      <div className="my-8 w-full max-w-[340px] -rotate-2">
        <img
          src="/boarding-pass.png"
          alt="Intergalactic Boarding Pass"
          className="w-full rounded-xl shadow-card ring-1 ring-white/10"
        />
      </div>
    </section>

    {/* Steps */}
    <section className="flex-1 px-6">
      <ol className="space-y-5">
        {steps.map((s, i) => (
          <li key={i} className="relative flex gap-3">
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-[24px]">
                <span role="img" aria-label={s.title}>{s.emoji}</span>
              </div>
              {i < steps.length - 1 && <div className="mt-1 h-6 w-px bg-white/15" />}
            </div>
            <div className="flex-1 pt-1.5">
              <div className="mb-0.5 flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-black">
                  {i + 1}
                </span>
                <p className="text-[15px] font-bold text-white">{s.title}</p>
              </div>
              <p className="text-[12px] leading-snug text-zinc-400">{s.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>

    {/* CTA */}
    <div className="sticky bottom-0 mt-6 bg-gradient-to-t from-black via-black to-transparent px-5 pb-6 pt-4">
      <button
        onClick={onStart}
        className="flex h-14 w-full items-center justify-center rounded-2xl bg-white text-[16px] font-bold text-black transition-transform active:scale-[0.98]"
      >
        보딩패스 발급받기
      </button>
    </div>
  </div>
);

export default IntroScreen;
