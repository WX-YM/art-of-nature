const fs = require('fs');
const { PNG } = require('pngjs');

function run(inputPath, outputPath, rimWidth = 6, whiteThreshold = 240) {
  fs.createReadStream(inputPath)
    .pipe(new PNG())
    .on('parsed', function () {
      const png = this;
      const w = png.width;
      const h = png.height;
      const size = w * h;

      const isSolid = new Uint8Array(size);
      const isWhite = new Uint8Array(size);

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (w * y + x) << 2;
          const a = png.data[idx + 3];
          const r = png.data[idx];
          const g = png.data[idx + 1];
          const b = png.data[idx + 2];
          const pos = y * w + x;
          if (a === 0) continue;
          const white = r >= whiteThreshold && g >= whiteThreshold && b >= whiteThreshold;
          if (white) {
            isWhite[pos] = 1;
          } else {
            isSolid[pos] = 1;
          }
        }
      }

      // If no solid pixels found, nothing to preserve; make no changes
      let anySolid = false;
      for (let i = 0; i < size; i++) if (isSolid[i]) { anySolid = true; break; }
      if (!anySolid) {
        console.warn('No non-white solid pixels found; aborting inner-white removal.');
        png.pack().pipe(fs.createWriteStream(outputPath));
        return;
      }

      // BFS distance from solid pixels (Manhattan distance)
      const dist = new Int32Array(size).fill(-1);
      const qx = new Uint32Array(size);
      const qy = new Uint32Array(size);
      let qh = 0, qt = 0;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const pos = y * w + x;
          if (isSolid[pos]) {
            dist[pos] = 0;
            qx[qt] = x;
            qy[qt] = y;
            qt++;
          }
        }
      }

      const neigh = [[1,0],[-1,0],[0,1],[0,-1]];
      while (qh < qt) {
        const x = qx[qh];
        const y = qy[qh];
        qh++;
        const curPos = y * w + x;
        const cd = dist[curPos];
        for (const [dx, dy] of neigh) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
          const npos = ny * w + nx;
          if (dist[npos] === -1) {
            dist[npos] = cd + 1;
            qx[qt] = nx;
            qy[qt] = ny;
            qt++;
          }
        }
      }

      // Remove interior white pixels that are farther than rimWidth from any solid pixel
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const pos = y * w + x;
          if (!isWhite[pos]) continue;
          const d = dist[pos];
          if (d === -1 || d > rimWidth) {
            const idx = (w * y + x) << 2;
            png.data[idx + 3] = 0; // make transparent
          }
        }
      }

      png.pack().pipe(fs.createWriteStream(outputPath)).on('finish', () => {
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
    console.error('Usage: node remove-inner-white.cjs <input.png> <output.png> [rimWidth] [whiteThreshold]');
    process.exit(2);
  }
  const input = args[0];
  const output = args[1];
  const rimWidth = args[2] ? parseInt(args[2], 10) : 6;
  const whiteThreshold = args[3] ? parseInt(args[3], 10) : 240;
  run(input, output, rimWidth, whiteThreshold);
}
