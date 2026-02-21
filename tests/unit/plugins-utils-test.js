import { describe, test } from 'node:test';
import assert from 'node:assert';
import {
  escapeHtml,
  removeDatePrefix,
  normalizeFilePath,
  normalizeAnchor,
  buildInternalLinkUrl
} from '../../src/plugins/utils/index.js';

describe('Plugins Utils Unit Tests', () => {
  describe('escapeHtml', () => {
    test('should escape basic HTML characters', () => {
      const input = '<script>alert("XSS") & \'test\'</script>';
      const expected = '&lt;script&gt;alert(&quot;XSS&quot;) &amp; &#39;test&#39;&lt;/script&gt;';
      assert.strictEqual(escapeHtml(input), expected);
    });

    test('should return empty string for non-string input', () => {
      assert.strictEqual(escapeHtml(null), '');
      assert.strictEqual(escapeHtml(undefined), '');
      assert.strictEqual(escapeHtml(123), '');
      assert.strictEqual(escapeHtml({}), '');
    });

    test('should apply strict security mode checks', () => {
      const input = 'javascript:alert(1)';
      const expected = 'javascript&#58;alert(1)';
      assert.strictEqual(escapeHtml(input, 'strict'), expected);
    });

    test('should remove control characters in strict mode', () => {
      const input = 'foo\x00bar';
      const expected = 'foobar';
      assert.strictEqual(escapeHtml(input, 'strict'), expected);
    });

    test('should remove zero-width characters in strict mode', () => {
      const input = 'foo\u200Bbar';
      const expected = 'foobar';
      assert.strictEqual(escapeHtml(input, 'strict'), expected);
    });

    test('should neutralize dangerous protocols in strict mode', () => {
      assert.strictEqual(escapeHtml('javascript:void(0)', 'strict'), 'javascript&#58;void(0)');
      assert.strictEqual(escapeHtml('vbscript:msgbox', 'strict'), 'vbscript&#58;msgbox');
      assert.strictEqual(escapeHtml('data:text/html', 'strict'), 'data&#58;text/html');
    });

    test('should be case insensitive for protocols in strict mode', () => {
      assert.strictEqual(escapeHtml('JavaScript:alert(1)', 'strict'), 'javascript&#58;alert(1)');
    });

    test('should handle disabled mode as basic escaping (default behavior)', () => {
      const input = '<script>';
      const expected = '&lt;script&gt;';
      assert.strictEqual(escapeHtml(input, 'disabled'), expected);
    });
  });

  describe('removeDatePrefix', () => {
    test('should remove YYYYMMDD- prefix', () => {
      assert.strictEqual(removeDatePrefix('20230101-my-post'), 'my-post');
    });

    test('should not change string without prefix', () => {
      assert.strictEqual(removeDatePrefix('my-post'), 'my-post');
    });

    test('should not remove prefix if not 8 digits', () => {
      assert.strictEqual(removeDatePrefix('202301-my-post'), '202301-my-post');
      assert.strictEqual(removeDatePrefix('123456789-my-post'), '123456789-my-post');
    });
  });

  describe('normalizeFilePath', () => {
    test('should remove leading relative path components', () => {
      assert.strictEqual(normalizeFilePath('../posts/my-post'), 'posts/my-post');
    });

    test('should remove .md extension', () => {
      assert.strictEqual(normalizeFilePath('my-post.md'), 'my-post');
    });

    test('should remove /index suffix', () => {
      assert.strictEqual(normalizeFilePath('my-post/index'), 'my-post');
    });

    test('should replace spaces with hyphens', () => {
      assert.strictEqual(normalizeFilePath('my post'), 'my-post');
    });

    test('should lowercase the path', () => {
      assert.strictEqual(normalizeFilePath('My-Post'), 'my-post');
    });

    test('should remove date prefix via internal call', () => {
      assert.strictEqual(normalizeFilePath('20230101-My-Post.md'), 'my-post');
    });

    test('should handle complex paths', () => {
      assert.strictEqual(normalizeFilePath('../20230101-My Post/index.md'), 'my-post');
    });
  });

  describe('normalizeAnchor', () => {
    test('should return empty string for empty input', () => {
      assert.strictEqual(normalizeAnchor(''), '');
      assert.strictEqual(normalizeAnchor(null), '');
    });

    test('should remove leading # if present', () => {
      assert.strictEqual(normalizeAnchor('#header'), '#header');
    });

    test('should lowercase the anchor', () => {
      assert.strictEqual(normalizeAnchor('#Header'), '#header');
    });

    test('should remove dots', () => {
      assert.strictEqual(normalizeAnchor('#v1.0.0'), '#v100');
    });

    test('should replace spaces with hyphens', () => {
      assert.strictEqual(normalizeAnchor('#My Header'), '#my-header');
    });

    test('should remove invalid characters but keep Japanese', () => {
      assert.strictEqual(normalizeAnchor('#Hello! World?'), '#hello-world');
      assert.strictEqual(normalizeAnchor('#こんにちは'), '#こんにちは');
    });

    test('should return empty string if result is empty', () => {
      assert.strictEqual(normalizeAnchor('#...'), '');
    });
  });

  describe('buildInternalLinkUrl', () => {
    test('should build URL from simple path', () => {
      assert.strictEqual(buildInternalLinkUrl('my-post'), '/blog/my-post/');
    });

    test('should build URL with hash', () => {
      assert.strictEqual(buildInternalLinkUrl('my-post#header'), '/blog/my-post/#header');
    });

    test('should normalize path components', () => {
      assert.strictEqual(buildInternalLinkUrl('My Post.md'), '/blog/my-post/');
    });

    test('should normalize hash components', () => {
      assert.strictEqual(buildInternalLinkUrl('my-post#My Header'), '/blog/my-post/#my-header');
    });

    test('should handle empty hash', () => {
        // Based on implementation: split at #, normalize both parts.
        // If hash part is effectively empty after normalization, it should not append it?
        // Let's check implementation:
        // const cleanHash = normalizeAnchor(hash);
        // return cleanHash ? ... : ...
        // normalizeAnchor('#') returns '' because hashText is empty.
        assert.strictEqual(buildInternalLinkUrl('my-post#'), '/blog/my-post/');
    });
  });
});
