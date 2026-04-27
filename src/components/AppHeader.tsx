import { Settings } from "lucide-react";

interface Props {
  title?: string;
  subtitle?: string;
}

const AppHeader = ({ title = "Youearth", subtitle }: Props) => (
  <header className="sticky top-0 z-20 flex h-14 items-center justify-between bg-background/85 px-5 backdrop-blur-xl">
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <span className="text-[11px] font-bold">Y</span>
      </div>
      <div className="leading-tight">
        <p className="text-[15px] font-bold tracking-tight text-foreground">{title}</p>
        {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
    <button
      className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
      aria-label="설정"
    >
      <Settings className="h-[18px] w-[18px]" />
    </button>
  </header>
);

export default AppHeader;
