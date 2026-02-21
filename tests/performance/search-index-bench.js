import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectBlogPosts } from '../../src/integrations/search-index/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_DIR = path.join(__dirname, 'temp-blog-bench');

async function createDummyPosts(count) {
  await fs.mkdir(TEMP_DIR, { recursive: true });
  const tasks = [];
  for (let i = 0; i < count; i++) {
    tasks.push(async () => {
      const slug = `post-${i}`;
      const dir = path.join(TEMP_DIR, slug);
      await fs.mkdir(dir, { recursive: true });
      const content = `---
title: "Post ${i}"
pubDate: "2023-01-01"
---
This is the content of post ${i}.
`;
      await fs.writeFile(path.join(dir, 'index.md'), content, 'utf-8');
    });
  }

  // Execute in parallel chunks to speed up setup
  const chunkSize = 50;
  for (let i = 0; i < tasks.length; i += chunkSize) {
    await Promise.all(tasks.slice(i, i + chunkSize).map(t => t()));
  }
}

async function cleanup() {
  await fs.rm(TEMP_DIR, { recursive: true, force: true });
}

async function runBenchmark() {
  const POST_COUNT = 1000;
  console.log(`Setting up ${POST_COUNT} dummy posts...`);
  await cleanup(); // Ensure clean start
  await createDummyPosts(POST_COUNT);

  console.log('Running benchmark...');
  const start = performance.now();
  try {
    const entries = await collectBlogPosts(TEMP_DIR);
    const end = performance.now();

    console.log(`Time taken: ${(end - start).toFixed(2)}ms`);
    console.log(`Entries found: ${entries.length}`);

    if (entries.length !== POST_COUNT) {
      console.error(`Error: Expected ${POST_COUNT} entries, found ${entries.length}`);
    }
  } catch (error) {
    console.error('Benchmark failed:', error);
  } finally {
    await cleanup();
  }
}

runBenchmark().catch(console.error);
