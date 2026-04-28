import { createHash } from 'node:crypto';
import { access, mkdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { getUploadFile, uploadsDir } from './upload-service';

const imageVariantCacheDir = path.resolve(uploadsDir, '..', '.cache', 'public-image-variants');

const allowedFormats = new Set(['webp', 'avif', 'jpeg', 'png'] as const);

export type PublicImageVariantFormat = 'webp' | 'avif' | 'jpeg' | 'png';

export type PublicImageVariantRequest = {
  relativePath: string;
  width: number;
  quality: number;
  format: PublicImageVariantFormat;
};

const mimeTypesByFormat: Record<PublicImageVariantFormat, string> = {
  webp: 'image/webp',
  avif: 'image/avif',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

function normalizeRelativePath(rawPath: string) {
  const withoutPrefix = rawPath.startsWith('/uploads/') ? rawPath.slice('/uploads/'.length) : rawPath;
  const trimmedPath = withoutPrefix.replace(/^\/+/, '');

  try {
    return decodeURIComponent(trimmedPath);
  } catch {
    return trimmedPath;
  }
}

export function parsePublicImageVariantRequest(query: Record<string, unknown>): PublicImageVariantRequest {
  const rawPath = typeof query.path === 'string' ? query.path.trim() : '';
  if (!rawPath) {
    throw new Error('Missing path.');
  }

  const relativePath = normalizeRelativePath(rawPath);
  if (!relativePath) {
    throw new Error('Invalid path.');
  }

  const width = Number(typeof query.w === 'string' ? query.w : '');
  if (!Number.isFinite(width) || width < 64 || width > 2400) {
    throw new Error('Invalid width.');
  }

  const qualityValue = Number(typeof query.q === 'string' ? query.q : '72');
  if (!Number.isFinite(qualityValue) || qualityValue < 20 || qualityValue > 90) {
    throw new Error('Invalid quality.');
  }

  const requestedFormat = typeof query.format === 'string' ? query.format.trim().toLowerCase() : 'webp';
  if (!allowedFormats.has(requestedFormat as PublicImageVariantFormat)) {
    throw new Error('Invalid format.');
  }

  return {
    relativePath,
    width: Math.trunc(width),
    quality: Math.trunc(qualityValue),
    format: requestedFormat as PublicImageVariantFormat,
  };
}

function getVariantCacheFilePath(request: PublicImageVariantRequest) {
  const hash = createHash('sha1')
    .update(JSON.stringify(request))
    .digest('hex');

  return path.resolve(imageVariantCacheDir, `${hash}.${request.format}`);
}

async function ensureFileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function resolvePublicImageVariant(request: PublicImageVariantRequest) {
  const sourceFile = await getUploadFile(request.relativePath, uploadsDir);
  const cacheFilePath = getVariantCacheFilePath(request);

  if (!(await ensureFileExists(cacheFilePath))) {
    await mkdir(imageVariantCacheDir, { recursive: true });

    const transformer = sharp(sourceFile.absolutePath, { failOn: 'none' })
      .rotate()
      .resize({
        width: request.width,
        withoutEnlargement: true,
      });

    switch (request.format) {
      case 'avif':
        await transformer.avif({ quality: request.quality }).toFile(cacheFilePath);
        break;
      case 'jpeg':
        await transformer.jpeg({ quality: request.quality, mozjpeg: true }).toFile(cacheFilePath);
        break;
      case 'png':
        await transformer.png({ quality: request.quality, compressionLevel: 9 }).toFile(cacheFilePath);
        break;
      default:
        await transformer.webp({ quality: request.quality }).toFile(cacheFilePath);
        break;
    }
  }

  const fileStats = await stat(cacheFilePath);

  return {
    absolutePath: cacheFilePath,
    size: fileStats.size,
    mimeType: mimeTypesByFormat[request.format],
  };
}

export async function clearPublicImageVariantCache() {
  await rm(imageVariantCacheDir, { recursive: true, force: true });
  await mkdir(imageVariantCacheDir, { recursive: true });
}
