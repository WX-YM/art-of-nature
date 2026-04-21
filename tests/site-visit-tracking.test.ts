import test from 'node:test';
import assert from 'node:assert/strict';
import { markVisitTracked, shouldTrackVisit, VISIT_TRACK_WINDOW_MS } from '../src/app/lib/siteVisitTracking';

function createStorage(initial: Record<string, string> = {}) {
  const values = new Map<string, string>(Object.entries(initial));

  return {
    getItem(key: string) {
      return values.has(key) ? values.get(key)! : null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  };
}

test('shouldTrackVisit returns true when no previous timestamp exists', () => {
  const storage = createStorage();
  const now = Date.now();

  assert.equal(shouldTrackVisit(storage, now), true);
});

test('markVisitTracked stores timestamp and shouldTrackVisit enforces window', () => {
  const storage = createStorage();
  const now = Date.now();

  markVisitTracked(storage, now);

  assert.equal(shouldTrackVisit(storage, now + VISIT_TRACK_WINDOW_MS - 1), false);
  assert.equal(shouldTrackVisit(storage, now + VISIT_TRACK_WINDOW_MS), true);
});
