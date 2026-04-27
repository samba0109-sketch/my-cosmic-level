import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { computeStats, extractPhotoMeta, type ExplorationStats, type PhotoRecord } from "@/lib/exploration";

interface Ctx {
  photos: PhotoRecord[];
  stats: ExplorationStats;
  addFiles: (files: FileList | File[]) => Promise<PhotoRecord[]>;
  removePhoto: (id: string) => void;
  clear: () => void;
}

const ExplorationCtx = createContext<Ctx | null>(null);

export const ExplorationProvider = ({ children }: { children: ReactNode }) => {
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files);
    const recs = await Promise.all(arr.map(extractPhotoMeta));
    setPhotos((prev) => {
      const seen = new Set(prev.map((p) => p.id));
      return [...prev, ...recs.filter((r) => !seen.has(r.id))];
    });
    return recs;
  }, []);

  const removePhoto = useCallback((id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clear = useCallback(() => setPhotos([]), []);

  const stats = useMemo(() => computeStats(photos), [photos]);

  const value = useMemo(
    () => ({ photos, stats, addFiles, removePhoto, clear }),
    [photos, stats, addFiles, removePhoto, clear]
  );

  return <ExplorationCtx.Provider value={value}>{children}</ExplorationCtx.Provider>;
};

export function useExploration() {
  const ctx = useContext(ExplorationCtx);
  if (!ctx) throw new Error("useExploration must be used inside ExplorationProvider");
  return ctx;
}
