#!/usr/bin/env node
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const srcDir = path.resolve('uploads/banana-bee-font/AON-high-resolution-logo/AON-high-resolution-logo');
const srcFile = path.join(srcDir, 'AON-high-resolution-logo-transparent.png');

if (!fs.existsSync(srcFile)) {
  console.error('Source transparent logo not found at', srcFile);
  process.exit(1);
}

const sizes = [48, 96, 192];

async function generate() {
  for (const size of sizes) {
    const outPng = path.join(srcDir, `AON-high-resolution-logo-transparent-${size}.png`);
    const outWebp = path.join(srcDir, `AON-high-resolution-logo-transparent-${size}.webp`);

    await sharp(srcFile)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(outPng);

    await sharp(srcFile)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 90 })
      .toFile(outWebp);

    console.log('Wrote', outPng, 'and', outWebp);
  }
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
