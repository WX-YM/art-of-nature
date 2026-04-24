#!/usr/bin/env node
import Jimp from 'jimp';
import path from 'path';
import fs from 'fs';

// Paths (relative to repo root)
const srcPath = path.resolve('uploads/banana-bee-font/AON-high-resolution-logo/AON-high-resolution-logo/AON-high-resolution-logo.png');
const outPath = path.resolve('uploads/banana-bee-font/AON-high-resolution-logo/AON-high-resolution-logo/AON-high-resolution-logo-transparent.png');

async function makeTransparent() {
  if (!fs.existsSync(srcPath)) {
    console.error('Source logo not found at', srcPath);
    process.exit(1);
  }

  const image = await Jimp.read(srcPath);

  // Convert near-white background pixels to fully transparent.
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    const a = this.bitmap.data[idx + 3];

    // If pixel is near-white and opaque, make it transparent.
    if (a > 0 && r >= 240 && g >= 240 && b >= 240) {
      this.bitmap.data[idx + 3] = 0; // set alpha to 0
    }
  });

  await image.writeAsync(outPath);
  console.log('Wrote transparent logo to', outPath);
}

makeTransparent().catch((err) => {
  console.error(err);
  process.exit(1);
});
