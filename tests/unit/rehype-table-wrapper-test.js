/**
 * Rehype Table Wrapper Plugin Unit Test Suite
 *
 * Tests the rehype-table-wrapper plugin with node:test runner
 * Covers: wrapping tables, nested tables, already wrapped tables, etc.
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { rehype } from 'rehype';
import rehypeTableWrapper from '../../src/plugins/rehype-table-wrapper/index.js';

// Helper: Process HTML with rehype-table-wrapper (returns string)
async function processHtml(html) {
  const file = await rehype()
    .data('settings', { fragment: true })
    .use(rehypeTableWrapper)
    .process(html);
  return String(file);
}

describe('rehype-table-wrapper Plugin', () => {
  describe('Basic Table Wrapping', () => {
    test('wraps a simple table in a div.table-wrapper', async () => {
      const input = '<table><tbody><tr><td>Cell</td></tr></tbody></table>';
      const output = await processHtml(input);
      // Check for the wrapper
      assert.ok(output.includes('<div class="table-wrapper">'), 'Output should contain wrapper div');
      assert.ok(output.includes('<table>'), 'Output should contain table');
      assert.ok(output.includes('</div>'), 'Output should contain closing div');
    });

    test('wraps table with attributes', async () => {
      const input = '<table class="data"><thead><tr><th>Header</th></tr></thead></table>';
      const output = await processHtml(input);
      assert.ok(output.includes('<div class="table-wrapper">'), 'Output should contain wrapper div');
      assert.ok(output.includes('<table class="data">'), 'Output should contain table with attributes');
    });
  });

  describe('Already Wrapped Tables', () => {
    test('does not double wrap an already wrapped table', async () => {
      const input = '<div class="table-wrapper"><table><tbody><tr><td>Cell</td></tr></tbody></table></div>';
      const output = await processHtml(input);
      // Count occurrences of table-wrapper
      const wrapperCount = (output.match(/class="table-wrapper"/g) || []).length;
      assert.strictEqual(wrapperCount, 1, 'Should only have one wrapper');
    });

    test('does not double wrap if wrapper has multiple classes including table-wrapper', async () => {
      const input = '<div class="other-class table-wrapper"><table><tbody><tr><td>Cell</td></tr></tbody></table></div>';
      const output = await processHtml(input);
      const wrapperCount = (output.match(/class="other-class table-wrapper"/g) || []).length;
      assert.strictEqual(wrapperCount, 1, 'Should preserve existing wrapper with multiple classes');
      // Ensure no new wrapper added inside
      const innerWrapper = output.match(/<div class="table-wrapper">/g);
      assert.strictEqual(innerWrapper, null, 'Should not add new wrapper inside');
    });
  });

  describe('Multiple Tables', () => {
    test('wraps multiple tables in the same document', async () => {
      const input = `
        <p>Text</p>
        <table><tbody><tr><td>1</td></tr></tbody></table>
        <p>More text</p>
        <table><tbody><tr><td>2</td></tr></tbody></table>
      `;
      const output = await processHtml(input);
      const wrapperCount = (output.match(/class="table-wrapper"/g) || []).length;
      assert.strictEqual(wrapperCount, 2, 'Should wrap both tables');
    });
  });

  describe('Non-Table Elements', () => {
    test('does not wrap non-table elements', async () => {
      const input = '<div><p>Content</p></div>';
      const output = await processHtml(input);
      assert.ok(!output.includes('class="table-wrapper"'), 'Should not add wrapper to non-tables');
    });
  });
});

console.log('🧪 Running Rehype Table Wrapper Plugin Unit Tests...');
