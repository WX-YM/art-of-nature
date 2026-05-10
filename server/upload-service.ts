import { mkdir, readdir, writeFile, stat, rm } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.resolve(__dirname, '..', 'uploads');
export const maxUploadSizeBytes = Number.MAX_SAFE_INTEGER;

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

export type UploadDirectoryEntry = {
  type: 'directory';
  name: string;
  path: string;
  folder: string;
  itemCount: number;
  uploadedAt: string;
};

export type UploadFileEntry = UploadListEntry & {
  type: 'file';
  mimeType: string;
};

export type UploadEntry = UploadDirectoryEntry | UploadFileEntry;

export type UploadFileRecord = {
  absolutePath: string;
  name: string;
  path: string;
  folder: string;
  url: string;
  size: number;
  uploadedAt: string;
  mimeType: string;
};

const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const jpegSignature = Buffer.from([0xff, 0xd8, 0xff]);
const gif87aSignature = Buffer.from('GIF87a', 'ascii');
const gif89aSignature = Buffer.from('GIF89a', 'ascii');
const riffSignature = Buffer.from('RIFF', 'ascii');
const webpSignature = Buffer.from('WEBP', 'ascii');
const ftypSignature = Buffer.from('ftyp', 'ascii');
const avifBrands = new Set(['avif', 'avis']);
const extensionToMimeType: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
};

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

function toRelativeUploadPath(rootDir: string, targetPath: string) {
  return path.relative(rootDir, targetPath).split(path.sep).join('/');
}

function buildUploadUrl(relativePath: string) {
  return `/uploads/${relativePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')}`;
}

function getFolderLabel(relativePath: string) {
  const folderPath = path.dirname(relativePath).split(path.sep).join('/');
  return folderPath === '.' ? '' : folderPath;
}

function getMimeTypeFromFileName(fileName: string) {
  const extension = path.extname(fileName).slice(1).toLowerCase();
  return extensionToMimeType[extension] ?? 'application/octet-stream';
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

  const relativePath = toRelativeUploadPath(targetDir, path.resolve(uploadDir, uploadedName));

  return {
    url: buildUploadUrl(relativePath),
  };
}

export async function listUploadEntries(
  targetDir: string = uploadsDir,
  options?: { path?: unknown }
): Promise<UploadEntry[]> {
  const rootDir = resolveUploadDirectory(options?.path, targetDir);
  await mkdir(rootDir, { recursive: true });

  const names = await readdir(rootDir);
  const entries = await Promise.all(
    names.map(async (name) => {
      const fullPath = path.resolve(rootDir, name);
      const fileStats = await stat(fullPath);
      const relativePath = toRelativeUploadPath(targetDir, fullPath);
      const folder = getFolderLabel(relativePath);

      if (fileStats.isDirectory()) {
        const childNames = await readdir(fullPath);

        return {
          type: 'directory' as const,
          name,
          path: relativePath,
          folder,
          itemCount: childNames.length,
          uploadedAt: fileStats.mtime.toISOString(),
        };
      }

      return {
        type: 'file' as const,
        name,
        path: relativePath,
        folder,
        url: buildUploadUrl(relativePath),
        size: fileStats.size,
        uploadedAt: fileStats.mtime.toISOString(),
        mimeType: getMimeTypeFromFileName(name),
      };
    })
  );

  return entries.sort((left, right) => {
    if (left.type !== right.type) {
      return left.type === 'directory' ? -1 : 1;
    }

    return left.name.localeCompare(right.name, undefined, { sensitivity: 'base' });
  });
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
        const relativePath = toRelativeUploadPath(targetDir, fullPath);
        const folderPath = getFolderLabel(relativePath);

        if (fileStats.isDirectory()) {
          await walk(fullPath);
          return;
        }

        files.push({
          name: path.basename(relativePath),
          path: relativePath,
          folder: folderPath,
          url: buildUploadUrl(relativePath),
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
    path: toRelativeUploadPath(targetDir, folderPath),
  };
}

export async function getUploadFile(relativePath: unknown, targetDir: string = uploadsDir): Promise<UploadFileRecord> {
  const fullPath = resolveUploadFilePath(relativePath, targetDir);
  const fileStats = await stat(fullPath).catch(() => null);

  if (!fileStats || !fileStats.isFile()) {
    throw new Error('File not found.');
  }

  const normalizedPath = toRelativeUploadPath(targetDir, fullPath);
  const name = path.basename(normalizedPath);

  return {
    absolutePath: fullPath,
    name,
    path: normalizedPath,
    folder: getFolderLabel(normalizedPath),
    url: buildUploadUrl(normalizedPath),
    size: fileStats.size,
    uploadedAt: fileStats.mtime.toISOString(),
    mimeType: getMimeTypeFromFileName(name),
  };
}

export async function deleteUpload(relativePath: unknown, targetDir: string = uploadsDir) {
  const file = await getUploadFile(relativePath, targetDir);

  await rm(file.absolutePath);
}

export async function deleteUploadFolder(relativeFolder: unknown, targetDir: string = uploadsDir) {
  const normalizedFolder = normalizeRelativePath(relativeFolder);

  if (!normalizedFolder) {
    throw new Error('Missing path.');
  }

  const folderPath = resolveUploadDirectory(normalizedFolder, targetDir);
  const folderStats = await stat(folderPath).catch(() => null);

  if (!folderStats || !folderStats.isDirectory()) {
    throw new Error('Folder not found.');
  }

  await rm(folderPath, { recursive: true, force: false });
}
