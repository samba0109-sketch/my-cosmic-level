import { Compass, Globe2, Plane, BookOpen, Users } from "lucide-react";
import type { ComponentType } from "react";

export type TabKey = "dashboard" | "records" | "checkin" | "planet" | "crew";

interface Props {
  active: TabKey;
  onChange: (k: TabKey) => void;
}

const TABS: { key: TabKey; label: string; Icon: ComponentType<{ className?: string }> }[] = [
  { key: "dashboard", label: "EARTH", Icon: Globe2 },
  { key: "records", label: "LOG", Icon: Compass },
  { key: "checkin", label: "SYNC", Icon: Plane },
  { key: "planet", label: "PLANET", Icon: BookOpen },
  { key: "crew", label: "FLEET", Icon: Users },
];

const BottomNav = ({ active, onChange }: Props) => (
  <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[440px]">
    <div className="mx-3 mb-3 flex items-center justify-between rounded-2xl border border-border bg-card/85 px-2 py-2 backdrop-blur-xl shadow-card">
      {TABS.map(({ key, label, Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className="flex flex-1 flex-col items-center gap-1 py-1.5"
            aria-label={label}
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                isActive
                  ? "bg-gradient-violet text-primary-foreground shadow-glow-violet"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
            </div>
            <span
              className={`text-[9px] font-bold tracking-widest ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  </nav>
);

export default BottomNav;
