import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';

test('db module throws when MONGODB_URI is missing', async () => {
  const previousUri = process.env.MONGODB_URI;
  const previousDatabaseUrl = process.env.DATABASE_URL;

  process.env.MONGODB_URI = '';
  process.env.DATABASE_URL = '';

  await assert.rejects(
    import(`../server/db.ts?missing-env=${Date.now()}`),
    /MONGODB_URI environment variable is required\./
  );

  if (previousUri === undefined) {
    delete process.env.MONGODB_URI;
  } else {
    process.env.MONGODB_URI = previousUri;
  }

  if (previousDatabaseUrl === undefined) {
    delete process.env.DATABASE_URL;
  } else {
    process.env.DATABASE_URL = previousDatabaseUrl;
  }
});

test('connectToDatabase reuses the same mongoose connection promise', async () => {
  const previousUri = process.env.MONGODB_URI;
  const originalConnect = mongoose.connect;

  process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/test-db';

  let connectCalls = 0;
  const fakeConnection = Promise.resolve(mongoose as unknown as typeof import('mongoose'));

  (mongoose as unknown as { connect: typeof mongoose.connect }).connect = ((uri: string) => {
    connectCalls += 1;
    assert.equal(uri, process.env.MONGODB_URI);
    return fakeConnection;
  }) as typeof mongoose.connect;

  const dbModule = await import(`../server/db.ts?connection-cache=${Date.now()}`);

  const first = dbModule.connectToDatabase();
  const second = dbModule.connectToDatabase();

  assert.equal(connectCalls, 1);
  assert.equal(first, second);
  await assert.doesNotReject(first);

  (mongoose as unknown as { connect: typeof mongoose.connect }).connect = originalConnect;

  if (previousUri === undefined) {
    delete process.env.MONGODB_URI;
  } else {
    process.env.MONGODB_URI = previousUri;
  }
});
