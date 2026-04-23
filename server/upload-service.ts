import { mkdir, readdir, writeFile, stat } from 'node:fs/promises';
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
  mimeType?: string;
  base64Data?: string;
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

export async function saveUploadedImage(body: unknown, targetDir: string = uploadsDir, maxSize: number = maxUploadSizeBytes) {
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

  const uploadedName = `${Date.now()}-${randomBytes(8).toString('hex')}.${extension}`;
  await mkdir(targetDir, { recursive: true });
  await writeFile(path.resolve(targetDir, uploadedName), fileBuffer);

  return {
    url: `/uploads/${uploadedName}`,
  };
}

export async function listUploads(targetDir: string = uploadsDir) {
  await mkdir(targetDir, { recursive: true });
  const files: Array<{ name: string; url: string; size: number; uploadedAt: string }> = [];

  async function walk(currentDir: string, relativeDir: string = ''): Promise<void> {
    const names = await readdir(currentDir);

    await Promise.all(
      names.map(async (name) => {
        const fullPath = path.resolve(currentDir, name);
        const fileStats = await stat(fullPath);
        const relativePath = relativeDir ? `${relativeDir}/${name}` : name;

        if (fileStats.isDirectory()) {
          await walk(fullPath, relativePath);
          return;
        }

        files.push({
          name: relativePath,
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

  await walk(targetDir);

  return files.sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
}
