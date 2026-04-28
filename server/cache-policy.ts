import type express from 'express';

const oneMinuteSeconds = 60;
const fiveMinutesSeconds = 5 * oneMinuteSeconds;
const oneHourSeconds = 60 * oneMinuteSeconds;
const oneYearSeconds = 365 * 24 * oneHourSeconds;

export const cacheDurations = {
  pageShell: oneMinuteSeconds,
  pageShellStale: fiveMinutesSeconds,
  gallerySummary: fiveMinutesSeconds,
  gallerySummaryStale: 15 * oneMinuteSeconds,
  galleryPieceDetail: fiveMinutesSeconds,
  galleryPieceDetailStale: 15 * oneMinuteSeconds,
  imageVariant: oneYearSeconds,
} as const;

export function setNoStore(res: express.Response) {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
}

export function setPublicSsrCache(res: express.Response) {
  res.set(
    'Cache-Control',
    `public, max-age=${cacheDurations.pageShell}, stale-while-revalidate=${cacheDurations.pageShellStale}`
  );
}

export function setPublicJsonCache(
  res: express.Response,
  maxAgeSeconds: number,
  staleWhileRevalidateSeconds: number
) {
  res.set('Cache-Control', `public, max-age=${maxAgeSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`);
  res.set('Vary', 'Accept-Encoding');
}

export function setImmutableImageCache(res: express.Response) {
  res.set('Cache-Control', `public, max-age=${cacheDurations.imageVariant}, immutable`);
}
