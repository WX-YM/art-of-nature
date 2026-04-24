import mongoose from 'mongoose';
import { connectToDatabase } from '../server/db';
import { seedStructuredContent } from '../server/structured-content-service';

function hasFlag(flag: string) {
  return process.argv.includes(flag);
}

async function run() {
  const reset = hasFlag('--reset');
  const collectionsOnly = hasFlag('--collections-only');

  await connectToDatabase();

  const seeded = await seedStructuredContent({
    reset,
    syncLegacyContent: !collectionsOnly,
  });

  console.log(
    [
      reset ? 'Structured content reset and seeded.' : 'Structured content seeded.',
      `Categories: ${seeded.categories.length}`,
      `Subcategories: ${seeded.subcategories.length}`,
      `Gallery items: ${seeded.galleryItems.length}`,
      `Journal posts: ${seeded.journalPosts.length}`,
      collectionsOnly ? 'Legacy content docs were skipped.' : 'Legacy content docs were synced.',
    ].join(' ')
  );
}

run()
  .catch((error) => {
    console.error('Failed to initialize content:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
