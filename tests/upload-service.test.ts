import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import {
  saveUploadedImage,
  listUploads,
  listUploadEntries,
  getUploadFile,
  deleteUpload,
  createUploadFolder,
  deleteUploadFolder,
} from '../server/upload-service';

const minimalPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const minimalJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0xff, 0xd9]);

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

  await assert.rejects(
    async () => saveUploadedImage({ mimeType: 'image/png', base64Data: Buffer.from('not-an-image').toString('base64') }, dir),
    { message: 'Invalid image data.' }
  );

  // 1-byte limit
  await assert.rejects(
    async () => saveUploadedImage({ mimeType: 'image/jpeg', base64Data: minimalJpeg.toString('base64') }, dir, 1),
    { message: 'Invalid image size.' }
  );
});

test('saveUploadedImage saves file successfully and listUploads retrieves it', async () => {
  const dir = generateRandomDir();
  const fileData = minimalPng;

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
    { mimeType: 'image/jpeg', base64Data: minimalJpeg.toString('base64') },
    dir
  );

  // Short delay to ensure distinct mtime
  await new Promise(resolve => setTimeout(resolve, 50));

  // Save second file
  await saveUploadedImage(
    { mimeType: 'image/jpeg', base64Data: minimalJpeg.toString('base64') },
    dir
  );

  const uploads = await listUploads(dir);
  assert.equal(uploads.length, 2);
  // newer file (file2) comes first
  assert.ok(uploads[0].uploadedAt > uploads[1].uploadedAt);

  // cleanup
  await rm(dir, { recursive: true, force: true });
});

test('saveUploadedImage saves nested uploads into folders and deleteUpload removes them', async () => {
  const dir = generateRandomDir();
  const folder = 'nested/album';

  await createUploadFolder(folder, dir);

  const result = await saveUploadedImage(
    {
      folder: folder,
      mimeType: 'image/png',
      base64Data: minimalPng.toString('base64'),
    },
    dir
  );

  assert.ok(result.url.startsWith(`/uploads/${folder}/`));
  assert.ok(result.url.endsWith('.png'));

  const uploads = await listUploads(dir);
  assert.equal(uploads.length, 1);
  assert.equal(uploads[0].folder, folder);
  assert.equal(uploads[0].path.startsWith(folder + '/'), true);

  await deleteUpload(uploads[0].path, dir);
  const remaining = await listUploads(dir);
  assert.equal(remaining.length, 0);

  // cleanup
  await rm(dir, { recursive: true, force: true });
});

test('listUploadEntries returns folders and files for a target directory', async () => {
  const dir = generateRandomDir();
  await createUploadFolder('nested/album', dir);
  await saveUploadedImage(
    {
      folder: 'nested/album',
      fileName: 'preview.png',
      mimeType: 'image/png',
      base64Data: minimalPng.toString('base64'),
    },
    dir
  );

  const rootEntries = await listUploadEntries(dir);
  assert.equal(rootEntries.length, 1);
  assert.equal(rootEntries[0].type, 'directory');
  assert.equal(rootEntries[0].name, 'nested');

  const nestedEntries = await listUploadEntries(dir, { path: 'nested/album' });
  assert.equal(nestedEntries.length, 1);
  assert.equal(nestedEntries[0].type, 'file');
  assert.equal(nestedEntries[0].mimeType, 'image/png');
  assert.equal(nestedEntries[0].folder, 'nested/album');

  await rm(dir, { recursive: true, force: true });
});

test('getUploadFile returns file metadata for a stored image', async () => {
  const dir = generateRandomDir();
  const created = await saveUploadedImage(
    {
      folder: 'journal/covers',
      fileName: 'cover-image.jpeg',
      mimeType: 'image/jpeg',
      base64Data: minimalJpeg.toString('base64'),
    },
    dir
  );

  const relativePath = created.url.replace(/^\/uploads\//, '');
  const file = await getUploadFile(relativePath, dir);

  assert.equal(file.folder, 'journal/covers');
  assert.equal(file.mimeType, 'image/jpeg');
  assert.equal(file.url, created.url);
  assert.equal(file.path, relativePath);

  await rm(dir, { recursive: true, force: true });
});

test('deleteUploadFolder removes a nested folder recursively', async () => {
  const dir = generateRandomDir();
  await createUploadFolder('gallery/outdoor', dir);
  await saveUploadedImage(
    {
      folder: 'gallery/outdoor',
      mimeType: 'image/png',
      base64Data: minimalPng.toString('base64'),
    },
    dir
  );

  await deleteUploadFolder('gallery', dir);

  const entries = await listUploadEntries(dir);
  assert.equal(entries.length, 0);

  await rm(dir, { recursive: true, force: true });
});
