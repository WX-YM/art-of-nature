import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, Server } from 'node:http';
import { Script } from 'node:vm';

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-db';

import mongoose from 'mongoose';
import { app, vite } from '../server/index';
import { connectToDatabase } from '../server/db';
import { UserModel } from '../server/models/User';
import { sha256Hex } from '../server/http-utils';

let server: Server;
let baseUrl: string;

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

test('admin dashboard script parses successfully and renders per-image gallery and journal controls', async () => {
  await UserModel.findOneAndUpdate(
    { email: 'kekomhgad@gmail.com' },
    {
      user: 'keko',
      email: 'kekomhgad@gmail.com',
      hashedPassword: sha256Hex('keko2009'),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const loginResponse = await fetch(`${baseUrl}/api/contact/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      name: 'keko',
      email: 'kekomhgad@gmail.com',
      phone: '01000000000',
      projectType: 'Admin',
      message: 'keko2009',
    }),
    redirect: 'manual',
  });

  assert.equal(loginResponse.status, 303);
  const cookieHeader = loginResponse.headers.get('set-cookie');
  assert.ok(cookieHeader, 'Expected admin login to set a session cookie');

  const adminResponse = await fetch(`${baseUrl}/admin`, {
    headers: {
      cookie: cookieHeader!,
    },
  });

  assert.equal(adminResponse.status, 200);

  const html = await adminResponse.text();
  assert.match(html, /data-image-upload-form/);
  assert.match(html, /data-upload-journal-field=/);
  assert.match(html, /\/api\/uploads\/tree/);
  assert.match(html, /\/api\/uploads\/files/);
  assert.match(html, /\/api\/uploads\/folders/);
  assert.doesNotMatch(html, /fetch\('\/api\/uploads'/);
  assert.doesNotMatch(html, /fetch\('\/api\/uploads\?/);

  const scriptMatch = html.match(/<script>\s*\(function \(\) \{([\s\S]*)\}\)\(\);\s*<\/script>/);
  assert.ok(scriptMatch, 'Expected inline admin script to be present');

  const scriptSource = `(function () {${scriptMatch![1]}})();`;
  assert.doesNotThrow(() => new Script(scriptSource));

  const galleryResponse = await fetch(`${baseUrl}/admin?tab=gallery`, {
    headers: {
      cookie: cookieHeader!,
    },
  });
  assert.equal(galleryResponse.status, 200);
  const galleryHtml = await galleryResponse.text();
  assert.match(galleryHtml, /data-remove-gallery-image=/);
  assert.match(galleryHtml, /data-move-gallery-image=/);
  assert.match(galleryHtml, /data-edit-gallery-image=/);
  assert.match(galleryHtml, /data-add-gallery-image-url/);
  assert.match(galleryHtml, /data-focus-upload-field="newImageUrl"/);
  assert.match(galleryHtml, /name="gallerySubcategories:/);
  assert.match(galleryHtml, /Replace frame|Edit frame/);
  assert.match(galleryHtml, /Use as cover/);
  assert.match(galleryHtml, /Move left/);
  assert.match(galleryHtml, /Move right/);
  assert.match(galleryHtml, /Remove image/);

  const journalResponse = await fetch(`${baseUrl}/admin?tab=journal`, {
    headers: {
      cookie: cookieHeader!,
    },
  });
  assert.equal(journalResponse.status, 200);
  const journalHtml = await journalResponse.text();
  assert.match(journalHtml, /data-remove-journal-image=/);
  assert.match(journalHtml, /data-move-journal-image=/);
  assert.match(journalHtml, /data-edit-journal-image=/);
  assert.match(journalHtml, /data-add-journal-image-url/);
  assert.match(journalHtml, /data-focus-upload-field="newGalleryImageUrl"/);
});
