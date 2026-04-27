import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { computeStats, extractPhotoMeta, type ExplorationStats, type PhotoRecord } from "@/lib/exploration";

interface Ctx {
  photos: PhotoRecord[];
  pending: PhotoRecord[];
  stats: ExplorationStats;
  addFiles: (files: FileList | File[]) => Promise<PhotoRecord[]>;
  stageFiles: (files: FileList | File[]) => Promise<PhotoRecord[]>;
  commitPending: () => PhotoRecord[];
  removePending: (id: string) => void;
  clearPending: () => void;
  removePhoto: (id: string) => void;
  clear: () => void;
}

const ExplorationCtx = createContext<Ctx | null>(null);

export const ExplorationProvider = ({ children }: { children: ReactNode }) => {
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [pending, setPending] = useState<PhotoRecord[]>([]);

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files);
    const recs = await Promise.all(arr.map(extractPhotoMeta));
    setPhotos((prev) => {
      const seen = new Set(prev.map((p) => p.id));
      return [...prev, ...recs.filter((r) => !seen.has(r.id))];
    });
    return recs;
  }, []);

  const stageFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files);
    const recs = await Promise.all(arr.map(extractPhotoMeta));
    setPending((prev) => {
      const seen = new Set(prev.map((p) => p.id));
      return [...prev, ...recs.filter((r) => !seen.has(r.id))];
    });
    return recs;
  }, []);

  const commitPending = useCallback(() => {
    let committed: PhotoRecord[] = [];
    setPhotos((prev) => {
      const seen = new Set(prev.map((p) => p.id));
      committed = pending.filter((r) => !seen.has(r.id));
      return [...prev, ...committed];
    });
    setPending([]);
    return committed;
  }, [pending]);

  const removePending = useCallback((id: string) => {
    setPending((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clearPending = useCallback(() => setPending([]), []);

  const removePhoto = useCallback((id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clear = useCallback(() => {
    setPhotos([]);
    setPending([]);
  }, []);

  const stats = useMemo(() => computeStats(photos), [photos]);

  const value = useMemo(
    () => ({
      photos,
      pending,
      stats,
      addFiles,
      stageFiles,
      commitPending,
      removePending,
      clearPending,
      removePhoto,
      clear,
    }),
    [photos, pending, stats, addFiles, stageFiles, commitPending, removePending, clearPending, removePhoto, clear]
  );

  return <ExplorationCtx.Provider value={value}>{children}</ExplorationCtx.Provider>;
};

export function useExploration() {
  const ctx = useContext(ExplorationCtx);
  if (!ctx) throw new Error("useExploration must be used inside ExplorationProvider");
  return ctx;
}
