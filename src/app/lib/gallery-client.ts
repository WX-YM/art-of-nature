import type { PublicGalleryPieceDetail, PublicGallerySummary } from './gallery-public';

let cachedSummary: PublicGallerySummary | null = null;
let pendingSummaryRequest: Promise<PublicGallerySummary> | null = null;

const pieceDetailsById = new Map<string, PublicGalleryPieceDetail>();
const pendingPieceRequests = new Map<string, Promise<PublicGalleryPieceDetail>>();

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchGallerySummary(options?: { signal?: AbortSignal; force?: boolean }) {
  if (!options?.force && cachedSummary) {
    return cachedSummary;
  }

  if (!options?.force && pendingSummaryRequest) {
    return pendingSummaryRequest;
  }

  const request = fetch('/api/gallery/summary', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal: options?.signal,
  })
    .then((response) => parseJsonResponse<PublicGallerySummary>(response))
    .then((summary) => {
      cachedSummary = summary;
      return summary;
    })
    .finally(() => {
      pendingSummaryRequest = null;
    });

  pendingSummaryRequest = request;
  return request;
}

export async function fetchGalleryPieceDetail(pieceId: string, options?: { signal?: AbortSignal; force?: boolean }) {
  if (!options?.force) {
    const cachedDetail = pieceDetailsById.get(pieceId);
    if (cachedDetail) {
      return cachedDetail;
    }

    const pendingRequest = pendingPieceRequests.get(pieceId);
    if (pendingRequest) {
      return pendingRequest;
    }
  }

  const request = fetch(`/api/gallery/pieces/${encodeURIComponent(pieceId)}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal: options?.signal,
  })
    .then((response) => parseJsonResponse<PublicGalleryPieceDetail>(response))
    .then((detail) => {
      pieceDetailsById.set(pieceId, detail);
      return detail;
    })
    .finally(() => {
      pendingPieceRequests.delete(pieceId);
    });

  pendingPieceRequests.set(pieceId, request);
  return request;
}

export function primeGalleryPieceDetail(detail: PublicGalleryPieceDetail) {
  pieceDetailsById.set(detail.id, detail);
}
