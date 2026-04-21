export const VISIT_TRACK_STORAGE_KEY = 'site_visit_last_tracked_at';
export const VISIT_TRACK_WINDOW_MS = 60 * 60 * 1000;

type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export function shouldTrackVisit(storage: StorageLike, now: number, windowMs: number = VISIT_TRACK_WINDOW_MS): boolean {
  const lastTrackedRaw = storage.getItem(VISIT_TRACK_STORAGE_KEY);

  if (!lastTrackedRaw) {
    return true;
  }

  const lastTracked = Number(lastTrackedRaw);

  if (!Number.isFinite(lastTracked) || lastTracked <= 0) {
    return true;
  }

  return now - lastTracked >= windowMs;
}

export function markVisitTracked(storage: StorageLike, now: number): void {
  storage.setItem(VISIT_TRACK_STORAGE_KEY, String(now));
}
