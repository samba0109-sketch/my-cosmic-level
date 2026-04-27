import { useMemo } from "react";

interface Props {
  count?: number;
  className?: string;
}

const StarField = ({ count = 40, className = "" }: Props) => {
  const stars = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 3,
        opacity: Math.random() * 0.7 + 0.3,
      })),
    [count]
  );

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white animate-pulse-glow"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.opacity,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default StarField;
