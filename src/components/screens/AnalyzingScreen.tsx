import { useEffect, useState } from "react";
import StarField from "@/components/StarField";

const STEPS = [
  "사진을 우주선에 싣는 중",
  "지구 좌표를 분석하는 중",
  "탐사 요소를 측정하는 중",
  "당신의 우주인 등급을 계산하는 중",
];

interface Props {
  onDone: () => void;
}

const AnalyzingScreen = ({ onDone }: Props) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = STEPS.map((_, i) =>
      setTimeout(() => setStep(i), i * 900)
    );
    const done = setTimeout(onDone, STEPS.length * 900 + 500);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [onDone]);

  return (
    <div className="relative flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center overflow-hidden bg-gradient-night px-6">
      <StarField count={80} />

      <div className="relative z-10 flex flex-col items-center">
        {/* Orbit */}
        <div className="relative mb-10 h-48 w-48">
          <div className="absolute inset-0 animate-spin-slow rounded-full border border-white/10" />
          <div className="absolute inset-4 animate-spin-slow rounded-full border border-white/15" style={{ animationDuration: "20s", animationDirection: "reverse" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute h-32 w-32 animate-pulse-glow rounded-full bg-gradient-cosmic blur-2xl opacity-70" />
            <span className="relative animate-float text-7xl">🌍</span>
          </div>
          {/* satellite */}
          <div className="absolute inset-0 animate-spin-slow" style={{ animationDuration: "8s" }}>
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-2xl">🛰️</span>
          </div>
        </div>

        <p className="mb-2 text-[12px] font-semibold tracking-wider text-white/50">
          ANALYZING · {Math.min(step + 1, STEPS.length)}/{STEPS.length}
        </p>
        <h2 className="text-[20px] font-bold text-white text-center text-balance min-h-[60px]">
          {STEPS[step]}…
        </h2>

        {/* Progress dots */}
        <div className="mt-8 flex gap-2">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i <= step ? "w-8 bg-white" : "w-1.5 bg-white/25"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyzingScreen;
