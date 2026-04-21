import test from 'node:test';
import assert from 'node:assert/strict';
import { SiteVisitModel } from '../server/models/SiteVisit';
import { getVisitCount, incrementVisitCount } from '../server/site-visit-service';

test('getVisitCount returns 0 when no visit document exists', async () => {
  const originalFindOne = SiteVisitModel.findOne;

  (SiteVisitModel as unknown as { findOne: (...args: unknown[]) => { lean: () => Promise<unknown> } }).findOne =
    () => ({
      lean: async () => null,
    });

  try {
    const count = await getVisitCount();
    assert.equal(count, 0);
  } finally {
    (SiteVisitModel as unknown as { findOne: typeof SiteVisitModel.findOne }).findOne = originalFindOne;
  }
});

test('incrementVisitCount increments and returns the new total', async () => {
  const originalFindOneAndUpdate = SiteVisitModel.findOneAndUpdate;

  (SiteVisitModel as unknown as {
    findOneAndUpdate: (...args: unknown[]) => { lean: () => Promise<unknown> };
  }).findOneAndUpdate = (filter: unknown, update: unknown, options: unknown) => {
    assert.deepEqual(filter, { key: 'site-visits-total' });
    assert.deepEqual(update, {
      $inc: { count: 1 },
      $setOnInsert: { key: 'site-visits-total' },
    });
    assert.deepEqual(options, { upsert: true, new: true, setDefaultsOnInsert: true });

    return {
      lean: async () => ({ key: 'site-visits-total', count: 12 }),
    };
  };

  try {
    const count = await incrementVisitCount();
    assert.equal(count, 12);
  } finally {
    (SiteVisitModel as unknown as { findOneAndUpdate: typeof SiteVisitModel.findOneAndUpdate }).findOneAndUpdate =
      originalFindOneAndUpdate;
  }
});
