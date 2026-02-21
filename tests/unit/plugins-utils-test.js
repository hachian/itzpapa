import { describe, test } from 'node:test';
import assert from 'node:assert';
import {
  escapeHtml,
  removeDatePrefix,
  normalizeFilePath,
  normalizeAnchor,
  buildInternalLinkUrl
} from '../../src/plugins/utils/index.js';

describe('Plugin Utility Functions', () => {

  describe('escapeHtml', () => {
    test('should escape basic HTML characters', () => {
      const input = '<div class="test">Wait & See</div>';
      const expected = '&lt;div class=&quot;test&quot;&gt;Wait &amp; See&lt;/div&gt;';
      assert.strictEqual(escapeHtml(input), expected);
    });

    test('should handle single quotes', () => {
      const input = "It's a test";
      const expected = "It&#39;s a test";
      assert.strictEqual(escapeHtml(input), expected);
    });

    test('should return empty string for non-string input', () => {
      assert.strictEqual(escapeHtml(null), '');
      assert.strictEqual(escapeHtml(undefined), '');
      assert.strictEqual(escapeHtml(123), '');
      assert.strictEqual(escapeHtml({}), '');
    });

    test('should handle securityMode="strict" - remove control characters', () => {
      // \x00 is null char
      const input = 'Hello\x00World';
      const expected = 'HelloWorld';
      assert.strictEqual(escapeHtml(input, 'strict'), expected);
    });

    test('should handle securityMode="strict" - remove zero-width characters', () => {
      // \u200B is zero width space
      const input = 'Hello\u200BWorld';
      const expected = 'HelloWorld';
      assert.strictEqual(escapeHtml(input, 'strict'), expected);
    });

    test('should handle securityMode="strict" - neutralize dangerous protocols', () => {
      const input = '<a href="javascript:alert(1)">Click</a>';
      // First basic escape happens: &lt;a href=&quot;javascript:alert(1)&quot;&gt;Click&lt;/a&gt;
      // Then protocol replacement: javascript: becomes javascript&#58;
      const expected = '&lt;a href=&quot;javascript&#58;alert(1)&quot;&gt;Click&lt;/a&gt;';
      assert.strictEqual(escapeHtml(input, 'strict'), expected);
    });

    test('should handle securityMode="strict" - neutralize vbscript and data protocols', () => {
      const input1 = 'vbscript:exec';
      assert.strictEqual(escapeHtml(input1, 'strict'), 'vbscript&#58;exec');

      const input2 = 'data:text/html';
      assert.strictEqual(escapeHtml(input2, 'strict'), 'data&#58;text/html');
    });

    test('should treat securityMode="disabled" as basic escaping (default behavior)', () => {
      const input = '<script>';
      const expected = '&lt;script&gt;';
      assert.strictEqual(escapeHtml(input, 'disabled'), expected);
    });
  });

  describe('removeDatePrefix', () => {
    test('should remove YYYYMMDD- prefix', () => {
      assert.strictEqual(removeDatePrefix('20230101-my-post'), 'my-post');
    });

    test('should keep string without prefix unchanged', () => {
      assert.strictEqual(removeDatePrefix('my-post'), 'my-post');
    });

    test('should not remove partial date prefix (less than 8 digits)', () => {
      assert.strictEqual(removeDatePrefix('2023-my-post'), '2023-my-post');
    });

    test('should not remove prefix if hyphen is missing', () => {
      assert.strictEqual(removeDatePrefix('20230101my-post'), '20230101my-post');
    });
  });

  describe('normalizeFilePath', () => {
    test('should remove "../" prefix', () => {
      assert.strictEqual(normalizeFilePath('../path/to/file'), 'path/to/file');
    });

    test('should remove ".md" extension', () => {
      assert.strictEqual(normalizeFilePath('path/to/file.md'), 'path/to/file');
    });

    test('should remove "/index" suffix', () => {
      assert.strictEqual(normalizeFilePath('path/to/index'), 'path/to');
    });

    test('should replace spaces with hyphens', () => {
      assert.strictEqual(normalizeFilePath('path/to/file name'), 'path/to/file-name');
    });

    test('should convert to lowercase', () => {
      assert.strictEqual(normalizeFilePath('Path/To/File'), 'path/to/file');
    });

    test('should remove date prefix (integration)', () => {
      assert.strictEqual(normalizeFilePath('20230101-My Post.md'), 'my-post');
    });

    test('should handle complex case', () => {
      // removeDatePrefix only removes prefix at the start of the string
      assert.strictEqual(normalizeFilePath('../blog/20230505-Hello World/index.md'), 'blog/20230505-hello-world');
    });
  });

  describe('normalizeAnchor', () => {
    test('should return empty string for empty input', () => {
      assert.strictEqual(normalizeAnchor(''), '');
      assert.strictEqual(normalizeAnchor(null), '');
    });

    test('should normalize hash with #', () => {
      assert.strictEqual(normalizeAnchor('#Header'), '#header');
    });

    test('should normalize hash without #', () => {
      assert.strictEqual(normalizeAnchor('Header'), '#header');
    });

    test('should replace spaces with hyphens', () => {
      assert.strictEqual(normalizeAnchor('#My Header'), '#my-header');
    });

    test('should remove dots', () => {
      assert.strictEqual(normalizeAnchor('#v1.0.0'), '#v100');
    });

    test('should remove invalid characters', () => {
      assert.strictEqual(normalizeAnchor('#hello!@#$%^&*()'), '#hello');
    });

    test('should keep Japanese characters', () => {
      assert.strictEqual(normalizeAnchor('#こんにちは'), '#こんにちは');
    });

    test('should handle Kanji and Kana', () => {
      assert.strictEqual(normalizeAnchor('#漢字とカナ'), '#漢字とカナ');
    });
  });

  describe('buildInternalLinkUrl', () => {
    test('should build URL from simple path', () => {
      assert.strictEqual(buildInternalLinkUrl('my-post'), '/blog/my-post/');
    });

    test('should build URL from path with extension', () => {
      assert.strictEqual(buildInternalLinkUrl('my-post.md'), '/blog/my-post/');
    });

    test('should build URL from path with date prefix', () => {
      assert.strictEqual(buildInternalLinkUrl('20230101-my-post'), '/blog/my-post/');
    });

    test('should build URL with hash', () => {
      assert.strictEqual(buildInternalLinkUrl('my-post#header'), '/blog/my-post/#header');
    });

    test('should normalize path and hash components', () => {
      assert.strictEqual(
        buildInternalLinkUrl('../20230101-My Post.md#My Header'),
        '/blog/my-post/#my-header'
      );
    });

    test('should handle path with only hash (not typical for this function but good check)', () => {
       // Based on implementation: filePath becomes empty string, normalized becomes empty string?
       // buildInternalLinkUrl('#hash') -> hashIndex=0. filePath='', hash='#hash'.
       // normalizeFilePath('') -> ''. normalizeAnchor('#hash') -> '#hash'.
       // Returns '/blog//#hash' ?? Let's verify implementation logic.
       // cleanPath = normalizeFilePath('') => ''.
       // return cleanHash ? `/blog/${cleanPath}/${cleanHash}` : ...
       // so `/blog//${cleanHash}`.
       // This seems to be the current behavior.
       assert.strictEqual(buildInternalLinkUrl('#header'), '/blog//#header');
    });
  });

});
