import { Plus } from "lucide-react";

interface Props {
  title?: string;
  subtitle?: string;
}

const AppHeader = ({ title = "YOURS", subtitle }: Props) => (
  <header className="sticky top-0 z-20 flex h-14 items-center justify-between bg-background/70 px-5 backdrop-blur-xl">
    <div className="flex items-baseline gap-2">
      <p className="font-display text-[15px] font-bold tracking-[0.22em] text-primary">{title}</p>
      {subtitle && (
        <p className="text-[10px] font-medium tracking-widest text-muted-foreground">· {subtitle}</p>
      )}
    </div>
    <button
      className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/40 text-primary transition-all hover:shadow-glow-violet"
      aria-label="추가"
    >
      <Plus className="h-4 w-4" />
    </button>
  </header>
);

export default AppHeader;
