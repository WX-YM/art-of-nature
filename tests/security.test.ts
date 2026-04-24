import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, Server } from 'node:http';

// Set test environment so server/index.ts doesn't start the real DB or port
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-db';

import { app, vite } from '../server/index';
import { connectToDatabase } from '../server/db';
import mongoose from 'mongoose';

describe('Admin Security Protections', () => {
  let server: Server;
  let baseUrl: string;

  before(async () => {
    // connect to database locally
    await connectToDatabase();

    // Start the express app on an ephemeral port
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

  const protectedEndpoints = [
    { method: 'GET', url: '/admin' },
    { method: 'POST', url: '/admin/content/hero' },
    { method: 'POST', url: '/admin/content/about' },
    { method: 'POST', url: '/admin/content/journal' },
    { method: 'POST', url: '/admin/content/contact' },
    { method: 'POST', url: '/admin/content/craftsmanship' },
    { method: 'POST', url: '/admin/content/reset' },
    { method: 'GET', url: '/api/uploads/tree' },
    { method: 'GET', url: '/api/uploads/image?path=test.jpg' },
    { method: 'POST', url: '/api/uploads/files' },
    { method: 'DELETE', url: '/api/uploads/files?path=test.jpg' },
    { method: 'POST', url: '/api/uploads/folders' },
    { method: 'DELETE', url: '/api/uploads/folders?path=test-folder' },
    { method: 'GET', url: '/api/visits' },
    { method: 'PUT', url: '/api/about' },
    { method: 'PUT', url: '/api/journal' },
    { method: 'PUT', url: '/api/hero' },
    { method: 'PUT', url: '/api/contact' },
    { method: 'PUT', url: '/api/craftsmanship' },
    { method: 'PUT', url: '/api/gallery/categories' },
    { method: 'DELETE', url: '/api/gallery/categories/test-category' },
    { method: 'POST', url: '/api/cache/invalidate' }
  ];

  for (const { method, url } of protectedEndpoints) {
    test(`${method} ${url} fully hides the route returning exactly 404 Not Found without a session`, async () => {
      const response = await fetch(`${baseUrl}${url}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          // explicitly explicitly no x-cache-token 
        },
        body: method !== 'GET' ? JSON.stringify({}) : undefined,
      });

      const text = await response.text();

      assert.equal(
        response.status,
        404,
        `Expected ${url} to return 404 but got ${response.status}`
      );
      assert.equal(
        text,
        'Not Found',
        `Expected ${url} to return simple "Not Found" string but got ${text}`
      );
      assert.equal(
        response.headers.get('content-type'),
        'text/plain; charset=utf-8',
        `Expected ${url} to return text/plain but got ${response.headers.get('content-type')}`
      );
    });
  }

  test('Public GET /api/about remains accessible', async () => {
    const response = await fetch(`${baseUrl}/api/about`);
    assert.equal(response.status, 200);
  });

  test('Public GET /api/contact remains accessible', async () => {
    const response = await fetch(`${baseUrl}/api/contact`);
    assert.equal(response.status, 200);
  });

  test('Public GET /api/journal remains accessible', async () => {
    const response = await fetch(`${baseUrl}/api/journal`);
    assert.equal(response.status, 200);
  });

  test('Public GET /api/gallery/categories remains accessible', async () => {
    const response = await fetch(`${baseUrl}/api/gallery/categories`);
    assert.equal(response.status, 200);
  });

  test('Public GET /api/craftsmanship remains accessible', async () => {
    const response = await fetch(`${baseUrl}/api/craftsmanship`);
    assert.equal(response.status, 200);
  });

  test('Public GET /api/hero remains accessible', async () => {
    const response = await fetch(`${baseUrl}/api/hero`);
    assert.equal(response.status, 200);
  });
});
