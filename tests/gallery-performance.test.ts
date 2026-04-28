import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, Server } from 'node:http';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-db';

import mongoose from 'mongoose';
import { app, vite } from '../server/index';
import { connectToDatabase } from '../server/db';
import { uploadsDir } from '../server/upload-service';

let server: Server;
let baseUrl: string;

async function findExistingUploadUrl(currentDir: string = uploadsDir): Promise<string | null> {
  const entries = await readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.resolve(currentDir, entry.name);

    if (entry.isDirectory()) {
      const nestedMatch = await findExistingUploadUrl(fullPath);
      if (nestedMatch) {
        return nestedMatch;
      }
      continue;
    }

    const fileStats = await stat(fullPath);
    if (!fileStats.isFile()) {
      continue;
    }

    const relativePath = path.relative(uploadsDir, fullPath).split(path.sep).join('/');
    return `/uploads/${relativePath.split('/').map(encodeURIComponent).join('/')}`;
  }

  return null;
}

before(async () => {
  await connectToDatabase();

  server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));

  const address = server.address();
  if (typeof address === 'object' && address !== null) {
    baseUrl = `http://localhost:${address.port}`;
  }
});

after(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  if (vite) {
    await vite.close();
  }
  await mongoose.disconnect();
});

test('public gallery summary excludes full image arrays', async () => {
  const response = await fetch(`${baseUrl}/api/gallery/summary`);
  assert.equal(response.status, 200);

  const summary = (await response.json()) as {
    categories: Array<{
      leadPiece: Record<string, unknown> | null;
      subcategories: Array<{ pieces: Array<Record<string, unknown>> }>;
    }>;
  };

  assert.ok(Array.isArray(summary.categories));
  assert.ok(summary.categories.length > 0);
  const firstPiece = summary.categories[0]?.subcategories[0]?.pieces[0];
  assert.ok(firstPiece);
  assert.equal('images' in firstPiece, false);
  assert.ok(summary.categories[0]?.leadPiece);
  assert.equal(summary.categories[0]?.leadPiece ? 'images' in summary.categories[0].leadPiece : false, false);
});

test('public gallery piece detail returns full frame data for one piece', async () => {
  const summaryResponse = await fetch(`${baseUrl}/api/gallery/summary`);
  const summary = (await summaryResponse.json()) as {
    categories: Array<{ subcategories: Array<{ pieces: Array<{ id: string; archiveCount: number }> }> }>;
  };
  const piece = summary.categories[0]?.subcategories[0]?.pieces[0];

  assert.ok(piece);

  const detailResponse = await fetch(`${baseUrl}/api/gallery/pieces/${encodeURIComponent(piece.id)}`);
  assert.equal(detailResponse.status, 200);

  const detail = (await detailResponse.json()) as { id: string; images: Array<unknown>; archiveCount: number };
  assert.equal(detail.id, piece.id);
  assert.ok(Array.isArray(detail.images));
  assert.equal(detail.images.length, detail.archiveCount);
});

test('public image variant endpoint rejects invalid parameters and serves optimized assets', async () => {
  const badResponse = await fetch(`${baseUrl}/media/uploads?path=/uploads/example.jpg&w=20&format=webp`);
  assert.equal(badResponse.status, 400);

  const coverSrc = await findExistingUploadUrl();
  assert.ok(coverSrc, 'Expected at least one upload image to exist on disk');

  const imageResponse = await fetch(
    `${baseUrl}/media/uploads?path=${encodeURIComponent(coverSrc)}&w=640&q=72&format=webp`
  );

  assert.equal(imageResponse.status, 200);
  assert.equal(imageResponse.headers.get('content-type'), 'image/webp');
  assert.match(imageResponse.headers.get('cache-control') ?? '', /immutable/);
});

test('gallery summary endpoint is rate limited', async () => {
  let lastResponse: Response | null = null;

  for (let attempt = 0; attempt < 121; attempt += 1) {
    lastResponse = await fetch(`${baseUrl}/api/gallery/summary`, {
      headers: {
        'X-Forwarded-For': '203.0.113.5',
      },
    });
  }

  assert.ok(lastResponse);
  assert.equal(lastResponse.status, 429);
  assert.equal(lastResponse.headers.get('x-ratelimit-limit'), '120');
});

test('gallery route SSR no longer embeds the full gallery archive payload', async () => {
  const response = await fetch(`${baseUrl}/gallery`);
  assert.equal(response.status, 200);

  const html = await response.text();

  assert.ok(html.includes('window.__INITIAL_GALLERY_SHELL__'));
  assert.ok(!html.includes('window.__INITIAL_GALLERY__='));
  assert.ok(!html.includes('"images":['));
  assert.ok(html.includes('Loading gallery'));
});
