import { Settings } from "lucide-react";

interface Props {
  subtitle?: string;
}

const AppHeader = ({ subtitle }: Props) => (
  <header className="sticky top-0 z-20 flex h-14 items-center justify-between bg-background/85 px-5 backdrop-blur-xl">
    <div className="flex items-center gap-2">
      <img src="/youearth-logo.png" alt="Youearth" className="h-4 w-auto" />
      {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
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
