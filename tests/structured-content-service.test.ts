import test from 'node:test';
import assert from 'node:assert/strict';
import {
  deleteGalleryCategoryRecord,
  deriveStructuredContentSeedFromDefaults,
  getRankedGalleryCategories,
  normalizeGalleryCategoryPayload,
  upsertGalleryCategoryRecord,
} from '../server/structured-content-service';
import { GalleryCategoryRecordModel } from '../server/models/GalleryCategoryRecord';
import { GallerySubcategoryRecordModel } from '../server/models/GallerySubcategoryRecord';
import { GalleryItemRecordModel } from '../server/models/GalleryItemRecord';
import { defaultGalleryContent } from '../src/app/lib/gallery';
import { defaultJournalContent } from '../src/app/lib/journal';

test('deriveStructuredContentSeedFromDefaults maps lib defaults into ranked collections', () => {
  const seed = deriveStructuredContentSeedFromDefaults();

  assert.equal(seed.categories.length, defaultGalleryContent.categories.length);
  assert.equal(seed.subcategories.length, defaultGalleryContent.categories.reduce((sum, category) => sum + category.subcategories.length, 0));
  assert.equal(seed.galleryItems.length, defaultGalleryContent.pieces.length);
  assert.equal(seed.journalPosts.length, defaultJournalContent.posts.length);

  assert.equal(seed.categories[0].rank, 0);
  assert.equal(seed.categories[0].name, defaultGalleryContent.categories[0].name);
  assert.equal(seed.subcategories[0].rank, 0);
  assert.equal(seed.galleryItems[0].rank, 0);
  assert.equal(seed.galleryItems[0].key, defaultGalleryContent.pieces[0].id);
  assert.equal(seed.journalPosts[0].rank, 0);
  assert.equal(seed.journalPosts[0].key, defaultJournalContent.posts[0].id);
});

test('normalizeGalleryCategoryPayload trims values and derives slug/key', () => {
  const normalized = normalizeGalleryCategoryPayload({
    name: '  Dining Room  ',
    eyebrow: '  Gallery II  ',
    description: '  Hosting pieces.  ',
    rank: 4,
  });

  assert.deepEqual(normalized, {
    key: 'dining-room',
    slug: 'dining-room',
    name: 'Dining Room',
    eyebrow: 'Gallery II',
    description: 'Hosting pieces.',
    rank: 4,
  });
});

test('getRankedGalleryCategories sorts ranked categories ascending', async () => {
  const originalFind = GalleryCategoryRecordModel.find;

  (GalleryCategoryRecordModel as unknown as {
    find: typeof GalleryCategoryRecordModel.find;
  }).find = (() => ({
    sort: () => ({
      lean: async () => [{ key: 'a', rank: 0 }, { key: 'b', rank: 1 }],
    }),
  })) as typeof GalleryCategoryRecordModel.find;

  try {
    const result = await getRankedGalleryCategories();
    assert.deepEqual(result, [{ key: 'a', rank: 0 }, { key: 'b', rank: 1 }]);
  } finally {
    (GalleryCategoryRecordModel as unknown as {
      find: typeof GalleryCategoryRecordModel.find;
    }).find = originalFind;
  }
});

test('upsertGalleryCategoryRecord persists a normalized ranked category', async () => {
  const originalCountDocuments = GalleryCategoryRecordModel.countDocuments;
  const originalFindOneAndUpdate = GalleryCategoryRecordModel.findOneAndUpdate;

  (GalleryCategoryRecordModel as unknown as {
    countDocuments: typeof GalleryCategoryRecordModel.countDocuments;
  }).countDocuments = (async () => 6) as typeof GalleryCategoryRecordModel.countDocuments;

  (GalleryCategoryRecordModel as unknown as {
    findOneAndUpdate: typeof GalleryCategoryRecordModel.findOneAndUpdate;
  }).findOneAndUpdate = ((filter: unknown, update: unknown, options: unknown) => {
    assert.deepEqual(filter, { key: 'restroom' });
    assert.deepEqual(options, { upsert: true, new: true, setDefaultsOnInsert: true, lean: true });
    assert.deepEqual(update, {
      key: 'restroom',
      slug: 'restroom',
      name: 'Restroom',
      eyebrow: 'Gallery IV',
      description: 'Compact interventions.',
      rank: 6,
    });
    return Promise.resolve(update);
  }) as typeof GalleryCategoryRecordModel.findOneAndUpdate;

  try {
    const result = await upsertGalleryCategoryRecord({
      name: 'Restroom',
      eyebrow: 'Gallery IV',
      description: 'Compact interventions.',
    });

    assert.equal(result.rank, 6);
    assert.equal(result.slug, 'restroom');
  } finally {
    (GalleryCategoryRecordModel as unknown as {
      countDocuments: typeof GalleryCategoryRecordModel.countDocuments;
      findOneAndUpdate: typeof GalleryCategoryRecordModel.findOneAndUpdate;
    }).countDocuments = originalCountDocuments;
    (GalleryCategoryRecordModel as unknown as {
      findOneAndUpdate: typeof GalleryCategoryRecordModel.findOneAndUpdate;
    }).findOneAndUpdate = originalFindOneAndUpdate;
  }
});

test('deleteGalleryCategoryRecord removes the category and cascades to subcategories and items', async () => {
  const originalFindOneAndDelete = GalleryCategoryRecordModel.findOneAndDelete;
  const originalDeleteSubcategories = GallerySubcategoryRecordModel.deleteMany;
  const originalDeleteItems = GalleryItemRecordModel.deleteMany;

  (GalleryCategoryRecordModel as unknown as {
    findOneAndDelete: typeof GalleryCategoryRecordModel.findOneAndDelete;
  }).findOneAndDelete = (() => ({
    lean: async () => ({ key: 'living-room', slug: 'living-room', name: 'Living Room' }),
  })) as typeof GalleryCategoryRecordModel.findOneAndDelete;

  (GallerySubcategoryRecordModel as unknown as {
    deleteMany: typeof GallerySubcategoryRecordModel.deleteMany;
  }).deleteMany = ((filter: unknown) => {
    assert.deepEqual(filter, { categoryKey: 'living-room' });
    return Promise.resolve({ acknowledged: true, deletedCount: 3 });
  }) as typeof GallerySubcategoryRecordModel.deleteMany;

  (GalleryItemRecordModel as unknown as {
    deleteMany: typeof GalleryItemRecordModel.deleteMany;
  }).deleteMany = ((filter: unknown) => {
    assert.deepEqual(filter, { categoryKey: 'living-room' });
    return Promise.resolve({ acknowledged: true, deletedCount: 9 });
  }) as typeof GalleryItemRecordModel.deleteMany;

  try {
    const deleted = await deleteGalleryCategoryRecord('Living Room');
    assert.equal(deleted.key, 'living-room');
  } finally {
    (GalleryCategoryRecordModel as unknown as {
      findOneAndDelete: typeof GalleryCategoryRecordModel.findOneAndDelete;
    }).findOneAndDelete = originalFindOneAndDelete;
    (GallerySubcategoryRecordModel as unknown as {
      deleteMany: typeof GallerySubcategoryRecordModel.deleteMany;
    }).deleteMany = originalDeleteSubcategories;
    (GalleryItemRecordModel as unknown as {
      deleteMany: typeof GalleryItemRecordModel.deleteMany;
    }).deleteMany = originalDeleteItems;
  }
});
