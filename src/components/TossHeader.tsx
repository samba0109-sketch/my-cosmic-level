import { ArrowLeft, Share2 } from "lucide-react";

interface Props {
  title?: string;
  onBack?: () => void;
  onShare?: () => void;
  showShare?: boolean;
}

const TossHeader = ({ title = "유어스 행성탐사", onBack, onShare, showShare = true }: Props) => (
  <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-background/80 px-4 backdrop-blur-xl">
    <button
      onClick={onBack}
      className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
      aria-label="뒤로"
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
    <h1 className="text-[15px] font-semibold text-foreground">{title}</h1>
    {showShare ? (
      <button
        onClick={onShare}
        className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
        aria-label="공유"
      >
        <Share2 className="h-5 w-5" />
      </button>
    ) : (
      <div className="h-10 w-10" />
    )}
  </header>
);

export default TossHeader;
