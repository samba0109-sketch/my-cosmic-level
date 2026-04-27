import { Camera, Trophy, Sparkles, ChevronRight } from "lucide-react";
import heroPlanet from "@/assets/hero-planet.png";
import StarField from "@/components/StarField";

interface Props {
  onStart: () => void;
}

const HomeScreen = ({ onStart }: Props) => {
  return (
    <div className="animate-fade-up flex flex-col">
      {/* Cosmic hero */}
      <section className="relative overflow-hidden bg-gradient-night px-5 pb-10 pt-4">
        <StarField count={50} />
        <div className="relative z-10 flex flex-col items-center text-center">
          <p className="mb-1 text-xs font-medium tracking-wider text-white/60">
            YOUEARTH · 행성탐사 게임
          </p>
          <h2 className="mb-1 text-[26px] font-bold leading-tight text-white text-balance">
            나의 지구 탐사<br />레벨을 확인해보세요
          </h2>
          <p className="mb-6 text-[13px] text-white/70">
            사진 한 장이면 우주인 등급이 정해져요
          </p>

          <div className="relative mb-2 h-[220px] w-[220px]">
            <div className="absolute inset-0 rounded-full bg-gradient-cosmic opacity-50 blur-3xl animate-pulse-glow" />
            <img
              src={heroPlanet}
              alt="지구 행성 일러스트"
              width={440}
              height={440}
              className="relative h-full w-full object-contain animate-float drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="-mt-6 rounded-t-[28px] bg-background px-5 pt-7 pb-32">
        {/* Primary CTA */}
        <button
          onClick={onStart}
          className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl bg-gradient-cosmic p-5 text-left shadow-button transition-transform active:scale-[0.98]"
        >
          <div className="relative z-10">
            <p className="mb-1 text-[11px] font-medium tracking-wider text-white/80">
              지금 시작하기
            </p>
            <p className="text-[18px] font-bold text-white">탐사 기록 업로드 →</p>
          </div>
          <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 backdrop-blur">
            <Camera className="h-6 w-6 text-white" />
          </div>
          <Sparkles className="absolute right-20 top-3 h-4 w-4 text-white/40" />
          <Sparkles className="absolute right-32 bottom-4 h-3 w-3 text-white/30" />
        </button>

        {/* Stat row */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-secondary p-4">
            <p className="text-[12px] text-muted-foreground">현재 내 레벨</p>
            <p className="mt-1 text-[20px] font-bold text-foreground">Lv. 7</p>
            <p className="mt-0.5 text-[11px] text-cosmic font-semibold">은하계 탐험가</p>
          </div>
          <div className="rounded-2xl bg-secondary p-4">
            <p className="text-[12px] text-muted-foreground">글로벌 랭킹</p>
            <p className="mt-1 text-[20px] font-bold text-foreground">상위 12%</p>
            <p className="mt-0.5 text-[11px] text-primary font-semibold">#1,347</p>
          </div>
        </div>

        {/* How it works */}
        <h3 className="mt-8 mb-3 text-[15px] font-bold text-foreground">
          이렇게 진행돼요
        </h3>
        <ol className="space-y-3">
          {[
            { n: "1", t: "사진 업로드", d: "여행·자연 사진을 골라주세요" },
            { n: "2", t: "AI 탐사 분석", d: "장소·요소·희귀도를 측정해요" },
            { n: "3", t: "레벨 & 리포트", d: "나만의 우주인 타입을 받아요" },
          ].map((s) => (
            <li
              key={s.n}
              className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-soft"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[14px] font-bold text-primary">
                {s.n}
              </span>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-foreground">{s.t}</p>
                <p className="text-[12px] text-muted-foreground">{s.d}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </li>
          ))}
        </ol>

        {/* Recent rankers */}
        <div className="mt-6 rounded-2xl bg-gradient-soft p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-cosmic" />
              <p className="text-[13px] font-bold text-foreground">이번 주 탐험가</p>
            </div>
            <button className="text-[12px] text-muted-foreground">전체 보기</button>
          </div>
          <div className="space-y-2">
            {[
              { r: 1, n: "코스모스러버", lv: "Lv.42", e: "🪐" },
              { r: 2, n: "지구지킴이", lv: "Lv.39", e: "🌍" },
              { r: 3, n: "별보는소년", lv: "Lv.37", e: "✨" },
            ].map((u) => (
              <div key={u.r} className="flex items-center gap-3 rounded-xl bg-background/60 px-3 py-2.5">
                <span className="w-4 text-[12px] font-bold text-muted-foreground">
                  {u.r}
                </span>
                <span className="text-lg">{u.e}</span>
                <p className="flex-1 text-[13px] font-semibold text-foreground">{u.n}</p>
                <span className="text-[12px] font-bold text-cosmic">{u.lv}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeScreen;
