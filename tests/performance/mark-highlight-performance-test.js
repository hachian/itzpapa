import { remark } from 'remark';
import remarkMarkHighlight from '../../src/plugins/remark-mark-highlight/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper for color output
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`
};

// Generate document with many escaped mark highlights
function generateEscapedMarkDocument(count) {
  const lines = [];
  for (let i = 0; i < count; i++) {
    // Mix of escaped and real highlights
    // Heavy on escaped to trigger the performance issue
    lines.push(`Line ${i}: This is \\==escaped\\== and this is ==highlighted==. \\==more escaped\\==`);
  }
  // Create a single large paragraph to test processing of large text nodes
  return `# Performance Test Document\n\n${lines.join('\n')}`;
}

async function runBenchmark() {
  console.log(colors.bold('\n🚀 Mark Highlight Performance Test\n'));

  const iterations = 5;
  const lineCount = 5000; // Large enough to measure
  const content = generateEscapedMarkDocument(lineCount);

  console.log(`Document size: ${content.length} characters`);
  console.log(`Lines: ${lineCount}`);
  console.log(`Running ${iterations} iterations...`);

  let totalDuration = 0;

  for (let i = 0; i < iterations; i++) {
    // Increase maxInputLength to allow processing the large document
    const processor = remark().use(remarkMarkHighlight, { maxInputLength: 10000000 });

    global.gc && global.gc(); // Try to GC if exposed

    const startTime = performance.now();
    processor.runSync(processor.parse(content));
    const endTime = performance.now();

    const duration = endTime - startTime;
    totalDuration += duration;

    console.log(`  Iteration ${i + 1}: ${duration.toFixed(2)}ms`);
  }

  const avgDuration = totalDuration / iterations;
  console.log(colors.green(`\nAverage Duration: ${avgDuration.toFixed(2)}ms`));

  return avgDuration;
}

runBenchmark().catch(console.error);
