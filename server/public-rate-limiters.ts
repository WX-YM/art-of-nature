import { createIpRateLimiter } from './http-utils';

export const gallerySummaryRateLimit = createIpRateLimiter(60 * 1000, 120);
export const galleryPieceDetailRateLimit = createIpRateLimiter(60 * 1000, 180);
export const publicImageVariantRateLimit = createIpRateLimiter(60 * 1000, 240);
