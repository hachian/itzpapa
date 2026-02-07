import { remark } from 'remark';
import remarkWikilink from '../../src/plugins/remark-wikilink/index.js';
import { performance } from 'perf_hooks';

const ITERATIONS = 20;
const PARAGRAPHS = 5000;
const LIST_ITEMS = 5000;

function generateDocument() {
  let doc = '# Benchmark Document\n\n';

  // Add many paragraphs
  for (let i = 0; i < PARAGRAPHS; i++) {
    doc += `This is paragraph ${i}. It contains some text but no wikilinks to focus on traversal overhead.\n\n`;
  }

  // Add many list items
  doc += '## List\n\n';
  for (let i = 0; i < LIST_ITEMS; i++) {
    doc += `- List item ${i}\n`;
  }

  return doc;
}

const content = generateDocument();
const processor = remark().use(remarkWikilink);

console.log(`Benchmarking with ${PARAGRAPHS} paragraphs and ${LIST_ITEMS} list items.`);
console.log(`Running ${ITERATIONS} iterations...`);

const start = performance.now();

for (let i = 0; i < ITERATIONS; i++) {
  processor.runSync(processor.parse(content));
}

const end = performance.now();
const duration = end - start;
const avg = duration / ITERATIONS;

console.log(`Total duration: ${duration.toFixed(2)}ms`);
console.log(`Average per iteration: ${avg.toFixed(2)}ms`);
