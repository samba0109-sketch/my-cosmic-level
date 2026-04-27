import { useState } from "react";
import { Copy, Radio, Share2 } from "lucide-react";
import { useExploration } from "@/context/ExplorationContext";

const Toggle = ({ label, sub, defaultChecked }: { label: string; sub?: string; defaultChecked?: boolean }) => {
  const [on, setOn] = useState(!!defaultChecked);
  return (
    <div className="flex items-center justify-between py-2.5">
      <div>
        <p className="text-[13px] font-semibold text-foreground">{label}</p>
        {sub && <p className="text-[10px] tracking-wider text-muted-foreground">{sub}</p>}
      </div>
      <button
        onClick={() => setOn((v) => !v)}
        className={`relative h-6 w-10 rounded-full transition-colors ${on ? "bg-gradient-violet shadow-glow-violet" : "bg-secondary"}`}
        aria-pressed={on}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow-soft transition-transform ${
            on ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
};

const CrewScreen = () => {
  const { stats } = useExploration();
  const code = "UX-NEBULA-772";

  const crew = [
    { name: "유송은", role: "ORBITAL NAVIGATION" },
    { name: "이가현", role: "DEEP SPACE SCANNING" },
    { name: "지드래곤", role: "EXTRACTION OPS" },
  ];

  return (
    <div className="animate-fade-up flex min-h-[calc(100dvh-3.5rem)] flex-col gap-4 px-5 pb-32 pt-2">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-card p-5">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-violet opacity-30 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-accent/30 opacity-30 blur-3xl" />
        <div className="relative">
          <p className="text-[10px] font-bold tracking-[0.3em] text-accent">FLEET / CREW</p>
          <p className="font-display mt-1 text-[40px] font-bold leading-none tracking-tight text-foreground">
            Nebula-7
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="rounded-md border border-primary/40 bg-primary-soft px-2 py-1 text-[9px] font-bold tracking-[0.2em] text-primary">
              우리만의 행성
            </span>
            <span className="text-[10px] tracking-widest text-muted-foreground">EST. 2024.08.12</span>
          </div>
        </div>
      </section>

      {/* Level */}
      <section className="mono-card">
        <p className="text-[10px] font-bold tracking-[0.25em] text-accent">EXPLORATION LEVEL</p>
        <div className="mt-1 flex items-end justify-between">
          <p className="text-[16px] font-bold leading-tight text-foreground">
            Nebula-7의<br />탐사 레벨
          </p>
          <p className="font-display text-[40px] font-bold leading-none tracking-tight text-accent">
            {stats.coverage}%
          </p>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-violet transition-all"
            style={{ width: `${stats.coverage}%` }}
          />
        </div>
      </section>

      {/* Crew */}
      <section className="mono-card">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[12px] font-bold tracking-widest text-foreground">CREW MEMBERS</p>
          <span className="rounded-md border border-border bg-secondary/60 px-2 py-0.5 text-[10px] font-medium tracking-widest text-muted-foreground">
            12 명
          </span>
        </div>
        <div className="space-y-2">
          {crew.map((m) => (
            <div key={m.name} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-3 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-violet text-[12px] font-bold text-primary-foreground shadow-glow-violet">
                {m.name[0]}
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-foreground">{m.name}</p>
                <p className="text-[9px] font-bold tracking-[0.2em] text-accent">{m.role}</p>
              </div>
              <Radio className="h-3.5 w-3.5 text-mission animate-pulse-soft" />
            </div>
          ))}
        </div>
      </section>

      {/* Invite */}
      <section className="mono-card">
        <p className="text-[12px] font-bold tracking-widest text-foreground">INVITATION CODE</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          새로운 우주인을 탐사에 초대하고 싶다면, 아래 초대 코드를 공유하세요.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex flex-1 items-center justify-between rounded-xl border border-primary/30 bg-primary-soft/40 px-3 py-2.5">
            <span className="font-display text-[14px] font-bold tracking-[0.2em] text-primary">{code}</span>
            <button onClick={() => navigator.clipboard?.writeText(code)} aria-label="복사">
              <Copy className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <button
            onClick={() => navigator.share?.({ title: "Youearth", text: `초대코드: ${code}` }).catch(() => {})}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-violet text-primary-foreground shadow-glow-violet"
            aria-label="공유"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Settings */}
      <section className="mono-card">
        <p className="mb-1 text-[12px] font-bold tracking-widest text-foreground">SETTINGS</p>
        <Toggle label="Stealth Mode" sub="HIDE FLEET FROM PUBLIC MAPS" defaultChecked />
        <div className="border-t border-border" />
        <Toggle label="외부 행성에 노출" sub="다른 행성의 우주인이 우리 행성을 볼 수 있음" />
        <div className="border-t border-border" />
        <Toggle label="활동 로그 자동 저장" sub="모든 탐사기록이 자동으로 저장됨" defaultChecked />
      </section>
    </div>
  );
};

export default CrewScreen;
