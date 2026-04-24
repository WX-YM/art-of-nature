const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function distanceSq(a, b) {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return dr * dr + dg * dg + db * db;
}

function sampleBackgroundColor(png) {
  // sample four corners and average
  const w = png.width;
  const h = png.height;
  const corners = [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1],
  ];
  const cols = [];
  for (const [x, y] of corners) {
    const idx = (png.width * y + x) << 2;
    cols.push([png.data[idx], png.data[idx + 1], png.data[idx + 2]]);
  }
  const avg = [0, 0, 0];
  for (const c of cols) {
    avg[0] += c[0];
    avg[1] += c[1];
    avg[2] += c[2];
  }
  avg[0] = Math.round(avg[0] / cols.length);
  avg[1] = Math.round(avg[1] / cols.length);
  avg[2] = Math.round(avg[2] / cols.length);
  return avg;
}

function removeBackground(inputPath, outputPath, opts = {}) {
  const thresh = opts.threshold || 60; // color distance threshold
  const matchCorners = opts.matchCorners !== false;

  fs.createReadStream(inputPath)
    .pipe(new PNG())
    .on('parsed', function () {
      const png = this;
      const bg = sampleBackgroundColor(png);
      const threshSq = thresh * thresh;

      // mark pixels as transparent if close to background color
      for (let y = 0; y < png.height; y++) {
        for (let x = 0; x < png.width; x++) {
          const idx = (png.width * y + x) << 2;
          const rgb = [png.data[idx], png.data[idx + 1], png.data[idx + 2]];
          if (distanceSq(rgb, bg) <= threshSq) {
            png.data[idx + 3] = 0;
          }
        }
      }

      // compute bounding box of non-transparent pixels
      let minX = png.width,
        minY = png.height,
        maxX = 0,
        maxY = 0;
      for (let y = 0; y < png.height; y++) {
        for (let x = 0; x < png.width; x++) {
          const idx = (png.width * y + x) << 2;
          if (png.data[idx + 3] !== 0) {
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (maxX < minX || maxY < minY) {
        console.error('Result is fully transparent — nothing to crop. Writing full image.');
        png.pack().pipe(fs.createWriteStream(outputPath));
        return;
      }

      const outW = maxX - minX + 1;
      const outH = maxY - minY + 1;
      const outPng = new PNG({ width: outW, height: outH });

      for (let y = 0; y < outH; y++) {
        for (let x = 0; x < outW; x++) {
          const srcIdx = (png.width * (minY + y) + (minX + x)) << 2;
          const dstIdx = (outW * y + x) << 2;
          outPng.data[dstIdx] = png.data[srcIdx];
          outPng.data[dstIdx + 1] = png.data[srcIdx + 1];
          outPng.data[dstIdx + 2] = png.data[srcIdx + 2];
          outPng.data[dstIdx + 3] = png.data[srcIdx + 3];
        }
      }

      outPng.pack().pipe(fs.createWriteStream(outputPath)).on('finish', () => {
        console.log('WROTE', outputPath);
      });
    })
    .on('error', (err) => {
      console.error('ERROR reading PNG:', err);
    });
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node remove-bg.js <input.png> <output.png> [threshold]');
    process.exit(2);
  }
  const input = args[0];
  const output = args[1];
  const threshold = args[2] ? parseInt(args[2], 10) : undefined;
  removeBackground(input, output, { threshold });
}
