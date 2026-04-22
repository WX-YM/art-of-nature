import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { saveUploadedImage, listUploads } from '../server/upload-service';

function generateRandomDir() {
  return path.resolve(process.cwd(), '.temp-test-uploads', randomBytes(8).toString('hex'));
}

test('saveUploadedImage rejects missing inputs', async () => {
  const dir = generateRandomDir();
  await assert.rejects(
    async () => saveUploadedImage(null, dir),
    { message: 'Invalid file type.' }
  );
  await assert.rejects(
    async () => saveUploadedImage({ mimeType: 'image/jpeg' }, dir),
    { message: 'Missing image data.' }
  );
});

test('saveUploadedImage rejects unsupported types and oversized data', async () => {
  const dir = generateRandomDir();
  await assert.rejects(
    async () => saveUploadedImage({ mimeType: 'application/json', base64Data: 'eyd9' }, dir),
    { message: 'Invalid file type.' }
  );

  // 1-byte limit
  await assert.rejects(
    async () => saveUploadedImage({ mimeType: 'image/jpeg', base64Data: Buffer.from('abc').toString('base64') }, dir, 1),
    { message: 'Invalid image size.' }
  );
});

test('saveUploadedImage saves file successfully and listUploads retrieves it', async () => {
  const dir = generateRandomDir();
  const fileData = Buffer.from('fake-image-bytes');

  const result = await saveUploadedImage(
    {
      mimeType: 'image/png',
      base64Data: fileData.toString('base64'),
    },
    dir
  );

  assert.match(result.url, /^\/uploads\/\d+-[a-f0-9]+.png$/);

  const uploads = await listUploads(dir);
  assert.equal(uploads.length, 1);
  assert.equal(uploads[0].size, fileData.length);
  assert.match(uploads[0].name, /^\d+-[a-f0-9]+.png$/);
  assert.equal(uploads[0].url, result.url);

  // cleanup
  await rm(dir, { recursive: true, force: true });
});

test('listUploads sorts files by modified date descending', async () => {
  const dir = generateRandomDir();
  await mkdir(dir, { recursive: true });

  // Save first file
  await saveUploadedImage(
    { mimeType: 'image/jpeg', base64Data: Buffer.from('file1').toString('base64') },
    dir
  );

  // Short delay to ensure distinct mtime
  await new Promise(resolve => setTimeout(resolve, 50));

  // Save second file
  await saveUploadedImage(
    { mimeType: 'image/jpeg', base64Data: Buffer.from('file2').toString('base64') },
    dir
  );

  const uploads = await listUploads(dir);
  assert.equal(uploads.length, 2);
  // newer file (file2) comes first
  assert.ok(uploads[0].uploadedAt > uploads[1].uploadedAt);

  // cleanup
  await rm(dir, { recursive: true, force: true });
});
