/**
 * Rehype Trailing Slash Plugin Unit Test Suite
 *
 * Tests the rehype-trailing-slash plugin with node:test runner
 * Covers: basic trailing slashes, existing slashes, external links, anchors, extensions, etc.
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { rehype } from 'rehype';
import rehypeTrailingSlash from '../../src/plugins/rehype-trailing-slash/index.js';

// Helper: Process HTML with rehype-trailing-slash (returns string)
async function processHtml(html) {
  const file = await rehype()
    .data('settings', { fragment: true })
    .use(rehypeTrailingSlash)
    .process(html);
  return String(file);
}

// Helper: Extract href from processed HTML string
function getHref(html) {
  const match = html.match(/href="([^"]*)"/);
  return match ? match[1] : null;
}

describe('rehype-trailing-slash Plugin', () => {
  describe('Basic Trailing Slash Addition', () => {
    test('adds trailing slash to simple path', async () => {
      const input = '<a href="/path">Link</a>';
      const output = await processHtml(input);
      assert.strictEqual(getHref(output), '/path/');
    });

    test('adds trailing slash to nested path', async () => {
      const input = '<a href="/blog/post">Link</a>';
      const output = await processHtml(input);
      assert.strictEqual(getHref(output), '/blog/post/');
    });

    test('adds trailing slash to path with special characters', async () => {
      const input = '<a href="/path-with-dashes">Link</a>';
      const output = await processHtml(input);
      assert.strictEqual(getHref(output), '/path-with-dashes/');
    });
  });

  describe('Existing Trailing Slash', () => {
    test('does not modify path with existing trailing slash', async () => {
      const input = '<a href="/path/">Link</a>';
      const output = await processHtml(input);
      assert.strictEqual(getHref(output), '/path/');
    });

    test('does not modify nested path with existing trailing slash', async () => {
      const input = '<a href="/blog/post/">Link</a>';
      const output = await processHtml(input);
      assert.strictEqual(getHref(output), '/blog/post/');
    });
  });

  describe('External Links and Protocols', () => {
    test('ignores http links', async () => {
      const input = '<a href="http://example.com">Link</a>';
      const output = await processHtml(input);
      assert.strictEqual(getHref(output), 'http://example.com');
    });

    test('ignores https links', async () => {
      const input = '<a href="https://example.com">Link</a>';
      const output = await processHtml(input);
      assert.strictEqual(getHref(output), 'https://example.com');
    });

    test('ignores mailto links', async () => {
      const input = '<a href="mailto:user@example.com">Link</a>';
      const output = await processHtml(input);
      assert.strictEqual(getHref(output), 'mailto:user@example.com');
    });

    test('ignores tel links', async () => {
      const input = '<a href="tel:+1234567890">Link</a>';
      const output = await processHtml(input);
      assert.strictEqual(getHref(output), 'tel:+1234567890');
    });
  });

  describe('Anchors and Hashes', () => {
    test('ignores anchor-only links', async () => {
      const input = '<a href="#top">Link</a>';
      const output = await processHtml(input);
      assert.strictEqual(getHref(output), '#top');
    });

    test('adds trailing slash before hash in path', async () => {
      const input = '<a href="/path#hash">Link</a>';
      const output = await processHtml(input);
      assert.strictEqual(getHref(output), '/path/#hash');
    });

    test('does not duplicate slash before hash if exists', async () => {
      const input = '<a href="/path/#hash">Link</a>';
      const output = await processHtml(input);
      assert.strictEqual(getHref(output), '/path/#hash');
    });
  });

  describe('File Extensions', () => {
    test('ignores paths with allowed extensions (images)', async () => {
      const input = '<a href="/image.png">Link</a>';
      const output = await processHtml(input);
      assert.strictEqual(getHref(output), '/image.png');
    });

    test('ignores paths with allowed extensions (pdf)', async () => {
      const input = '<a href="/doc.pdf">Link</a>';
      const output = await processHtml(input);
      assert.strictEqual(getHref(output), '/doc.pdf');
    });

    test('ignores paths with .html extension', async () => {
      const input = '<a href="/page.html">Link</a>';
      const output = await processHtml(input);
      assert.strictEqual(getHref(output), '/page.html');
    });

    test('ignores paths with .htm extension', async () => {
      const input = '<a href="/page.htm">Link</a>';
      const output = await processHtml(input);
      assert.strictEqual(getHref(output), '/page.htm');
    });

    test('adds trailing slash to path with dot but not in last segment', async () => {
      const input = '<a href="/v1.0/doc">Link</a>';
      const output = await processHtml(input);
      assert.strictEqual(getHref(output), '/v1.0/doc/');
    });

    test('adds trailing slash if extension is not in skip list', async () => {
      const input = '<a href="/page.php">Link</a>';
      const output = await processHtml(input);
      assert.strictEqual(getHref(output), '/page.php/');
    });
  });

  describe('Index Handling (Obsidian Compatibility)', () => {
    test('removes index from path end, leaving trailing slash', async () => {
      const input = '<a href="/path/index">Link</a>';
      const output = await processHtml(input);
      assert.strictEqual(getHref(output), '/path/');
    });

    test('removes index with hash, leaving trailing slash', async () => {
      const input = '<a href="/path/index#hash">Link</a>';
      const output = await processHtml(input);
      assert.strictEqual(getHref(output), '/path/#hash');
    });

    test('does not remove index if not preceded by slash (e.g. myindex)', async () => {
      const input = '<a href="/myindex">Link</a>';
      const output = await processHtml(input);
      assert.strictEqual(getHref(output), '/myindex/');
    });

    test('handles /index as root /', async () => {
      const input = '<a href="/index">Link</a>';
      const output = await processHtml(input);
      assert.strictEqual(getHref(output), '/');
    });
  });

  describe('Edge Cases', () => {
    test('ignores non-anchor elements', async () => {
      const input = '<div>Div</div>';
      const output = await processHtml(input);
      assert.ok(output.includes('<div>Div</div>'));
    });

    test('ignores anchor without href', async () => {
      const input = '<a>Link</a>';
      const output = await processHtml(input);
      assert.ok(output.includes('<a>Link</a>'));
    });

    test('ignores empty path', async () => {
      const input = '<a href="">Link</a>';
      const output = await processHtml(input);
      // Empty href usually results in same page link, but code says if (!path) return.
      // path = href. So if href is empty, path is empty.
      assert.strictEqual(getHref(output), '');
    });

    test('handles root path /', async () => {
      const input = '<a href="/">Link</a>';
      const output = await processHtml(input);
      assert.strictEqual(getHref(output), '/');
    });
  });
});

console.log('🧪 Running Rehype Trailing Slash Plugin Unit Tests...');
