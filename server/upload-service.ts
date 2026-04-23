import { mkdir, readdir, writeFile, stat, rm } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.resolve(__dirname, '..', 'uploads');
export const maxUploadSizeBytes = 8 * 1024 * 1024;

export const allowedImageMimeToExtension: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

export type UploadRequestBody = {
  fileName?: string;
  folder?: string;
  mimeType?: string;
  base64Data?: string;
};

export type UploadListEntry = {
  name: string;
  path: string;
  folder: string;
  url: string;
  size: number;
  uploadedAt: string;
};

const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const jpegSignature = Buffer.from([0xff, 0xd8, 0xff]);
const gif87aSignature = Buffer.from('GIF87a', 'ascii');
const gif89aSignature = Buffer.from('GIF89a', 'ascii');
const riffSignature = Buffer.from('RIFF', 'ascii');
const webpSignature = Buffer.from('WEBP', 'ascii');
const ftypSignature = Buffer.from('ftyp', 'ascii');
const avifBrands = new Set(['avif', 'avis']);

function bufferStartsWith(buffer: Buffer, signature: Buffer) {
  return buffer.length >= signature.length && buffer.subarray(0, signature.length).equals(signature);
}

function bufferContainsSignature(buffer: Buffer, signature: Buffer, start: number) {
  return buffer.length >= start + signature.length && buffer.subarray(start, start + signature.length).equals(signature);
}

function hasExpectedImageSignature(buffer: Buffer, mimeType: string) {
  switch (mimeType) {
    case 'image/png':
      return bufferStartsWith(buffer, pngSignature);
    case 'image/jpeg':
      return bufferStartsWith(buffer, jpegSignature);
    case 'image/gif':
      return bufferStartsWith(buffer, gif87aSignature) || bufferStartsWith(buffer, gif89aSignature);
    case 'image/webp':
      return bufferStartsWith(buffer, riffSignature) && bufferContainsSignature(buffer, webpSignature, 8);
    case 'image/avif':
      return (
        bufferContainsSignature(buffer, ftypSignature, 4) &&
        avifBrands.has(buffer.subarray(8, 12).toString('ascii'))
      );
    default:
      return false;
  }
}

function normalizeRelativePath(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  const normalized = value.replace(/\\/g, '/').trim();
  const segments = normalized
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.some((segment) => segment === '..')) {
    throw new Error('Invalid path.');
  }

  return segments.join('/');
}

function resolveUploadDirectory(relativeFolder: unknown, rootDir: string) {
  const normalizedFolder = normalizeRelativePath(relativeFolder);
  if (!normalizedFolder) {
    return rootDir;
  }

  const resolved = path.resolve(rootDir, normalizedFolder);
  const relative = path.relative(rootDir, resolved);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Invalid target folder.');
  }

  return resolved;
}

function resolveUploadFilePath(relativePath: unknown, rootDir: string) {
  const normalizedPath = normalizeRelativePath(relativePath);
  if (!normalizedPath) {
    throw new Error('Missing path.');
  }

  const resolved = path.resolve(rootDir, normalizedPath);
  const relative = path.relative(rootDir, resolved);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Invalid path.');
  }

  return resolved;
}

function generateUploadFileName(extension: string, originalName?: string) {
  const safeBase = typeof originalName === 'string'
    ? path.basename(originalName).replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '')
    : '';

  const uniqueSuffix = `${Date.now()}-${randomBytes(8).toString('hex')}`;
  const cleanBase = safeBase ? `${safeBase}-${uniqueSuffix}` : uniqueSuffix;
  return `${cleanBase}.${extension}`;
}

export async function saveUploadedImage(
  body: unknown,
  targetDir: string = uploadsDir,
  maxSize: number = maxUploadSizeBytes
) {
  const payload = body as UploadRequestBody;
  const mimeType = typeof payload?.mimeType === 'string' ? payload.mimeType.trim().toLowerCase() : '';
  const extension = allowedImageMimeToExtension[mimeType];

  if (!extension) {
    throw new Error('Invalid file type.');
  }

  const base64Data = typeof payload.base64Data === 'string' ? payload.base64Data.trim() : '';
  if (!base64Data) {
    throw new Error('Missing image data.');
  }

  const fileBuffer = Buffer.from(base64Data, 'base64');
  if (!fileBuffer.length || fileBuffer.length > maxSize) {
    throw new Error('Invalid image size.');
  }

  if (!hasExpectedImageSignature(fileBuffer, mimeType)) {
    throw new Error('Invalid image data.');
  }

  const uploadDir = resolveUploadDirectory(payload?.folder, targetDir);
  const uploadedName = generateUploadFileName(extension, payload?.fileName);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.resolve(uploadDir, uploadedName), fileBuffer);

  const relativePath = path.relative(targetDir, path.resolve(uploadDir, uploadedName)).split(path.sep).join('/');

  return {
    url: `/uploads/${relativePath}`,
  };
}

export async function listUploads(targetDir: string = uploadsDir, options?: { path?: unknown }) {
  const rootDir = resolveUploadDirectory(options?.path, targetDir);
  await mkdir(rootDir, { recursive: true });

  const files: Array<UploadListEntry> = [];

  async function walk(currentDir: string): Promise<void> {
    const names = await readdir(currentDir);

    await Promise.all(
      names.map(async (name) => {
        const fullPath = path.resolve(currentDir, name);
        const fileStats = await stat(fullPath);
        const relativePath = path.relative(targetDir, fullPath).split(path.sep).join('/');
        const folderPath = path.dirname(relativePath).split(path.sep).join('/');

        if (fileStats.isDirectory()) {
          await walk(fullPath);
          return;
        }

        files.push({
          name: path.basename(relativePath),
          path: relativePath,
          folder: folderPath === '.' ? '' : folderPath,
          url: `/uploads/${relativePath
            .split('/')
            .map((segment) => encodeURIComponent(segment))
            .join('/')}`,
          size: fileStats.size,
          uploadedAt: fileStats.mtime.toISOString(),
        });
      })
    );
  }

  await walk(rootDir);

  return files.sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
}

export async function createUploadFolder(relativeFolder: unknown, targetDir: string = uploadsDir) {
  const folderPath = resolveUploadDirectory(relativeFolder, targetDir);
  await mkdir(folderPath, { recursive: true });
  return {
    path: path.relative(targetDir, folderPath).split(path.sep).join('/'),
  };
}

export async function deleteUpload(relativePath: unknown, targetDir: string = uploadsDir) {
  const fullPath = resolveUploadFilePath(relativePath, targetDir);
  const fileStats = await stat(fullPath).catch(() => null);

  if (!fileStats || !fileStats.isFile()) {
    throw new Error('File not found.');
  }

  await rm(fullPath);
}
