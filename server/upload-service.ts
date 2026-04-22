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

  const uploadedName = `${Date.now()}-${randomBytes(8).toString('hex')}.${extension}`;
  await mkdir(targetDir, { recursive: true });
  await writeFile(path.resolve(targetDir, uploadedName), fileBuffer);

  return {
    url: `/uploads/${uploadedName}`,
  };
}

export async function listUploads(targetDir: string = uploadsDir) {
  await mkdir(targetDir, { recursive: true });
  const names = await readdir(targetDir);

  const files = await Promise.all(
    names.map(async (name) => {
      const fullPath = path.resolve(targetDir, name);
      const fileStats = await stat(fullPath);

      return {
        name,
        url: `/uploads/${name}`,
        size: fileStats.size,
        uploadedAt: fileStats.mtime.toISOString(),
      };
    })
  );

  return files.sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
}
