
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { deleteImages } from '../../src/integrations/image-hosting/index.js';

async function benchmark() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'delete-bench-'));
  const fileCount = 1000;

  console.log(`Preparing ${fileCount} files for benchmark...`);

  // Create files for baseline
  const baselineFiles = [];
  const baselineDir = path.join(tempDir, 'baseline');
  await fs.mkdir(baselineDir);
  for (let i = 0; i < fileCount; i++) {
    const filePath = path.join(baselineDir, `img-${i}.png`);
    await fs.writeFile(filePath, 'data');
    baselineFiles.push({ filePath });
  }

  // Create files for optimized
  const optimizedFiles = [];
  const optimizedDir = path.join(tempDir, 'optimized');
  await fs.mkdir(optimizedDir);
  for (let i = 0; i < fileCount; i++) {
    const filePath = path.join(optimizedDir, `img-${i}.png`);
    await fs.writeFile(filePath, 'data');
    optimizedFiles.push({ filePath });
  }

  // Sequential implementation for baseline
  const sequentialDeleteImages = async (images) => {
    for (const image of images) {
      try {
        await fs.unlink(image.filePath);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    }
  };

  console.log('Running baseline (sequential)...');
  const startBaseline = performance.now();
  await sequentialDeleteImages(baselineFiles);
  const endBaseline = performance.now();
  const baselineTime = endBaseline - startBaseline;
  console.log(`Baseline time: ${baselineTime.toFixed(2)}ms`);

  console.log('Running optimized (parallel)...');
  const startOptimized = performance.now();
  await deleteImages(optimizedFiles);
  const endOptimized = performance.now();
  const optimizedTime = endOptimized - startOptimized;
  console.log(`Optimized time: ${optimizedTime.toFixed(2)}ms`);

  const improvement = ((baselineTime - optimizedTime) / baselineTime) * 100;
  console.log(`Improvement: ${improvement.toFixed(2)}%`);

  // Cleanup
  await fs.rm(tempDir, { recursive: true, force: true });
}

benchmark().catch(console.error);
