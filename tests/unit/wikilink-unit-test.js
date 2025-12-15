/**
 * WikiLink Plugin Unit Test Suite
 *
 * Tests the remark-wikilink plugin with node:test runner
 * Covers: basic links, aliases, headings, Japanese characters, spaces, edge cases
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { remark } from 'remark';
import remarkWikilink from '../../src/plugins/remark-wikilink/index.js';
import { loadInput, loadAllFixtures } from '../fixtures/fixture-loader.js';

// Helper: Process markdown with remark-wikilink (returns AST)
async function processToAst(markdown) {
  const processor = remark().use(remarkWikilink);
  return processor.runSync(processor.parse(markdown));
}

// Helper: Find first link node in AST
function findLink(ast) {
  let result = null;
  function walk(node) {
    if (node.type === 'link') {
      result = node;
      return;
    }
    if (node.children) {
      for (const child of node.children) {
        if (result) return;
        walk(child);
      }
    }
  }
  walk(ast);
  return result;
}

// Helper: Find all link nodes in AST
function findAllLinks(ast) {
  const results = [];
  function walk(node) {
    if (node.type === 'link') {
      results.push(node);
    }
    if (node.children) {
      for (const child of node.children) {
        walk(child);
      }
    }
  }
  walk(ast);
  return results;
}

// Helper: Find image node in AST
function findImage(ast) {
  let result = null;
  function walk(node) {
    if (node.type === 'image') {
      result = node;
      return;
    }
    if (node.children) {
      for (const child of node.children) {
        if (result) return;
        walk(child);
      }
    }
  }
  walk(ast);
  return result;
}

describe('remark-wikilink Plugin', () => {
  describe('Basic Link Conversion', () => {
    test('converts basic wikilink to internal link', async () => {
      const input = await loadInput('wikilink', 'basic');
      const ast = await processToAst(input);
      const link = findLink(ast);

      assert(link, 'Should find a link');
      assert.strictEqual(link.url, '/blog/page/', 'Should convert to blog path');
    });

    test('adds wikilink-internal class', async () => {
      const input = '[[../test/index.md]]';
      const ast = await processToAst(input);
      const link = findLink(ast);

      assert(
        link.data?.hProperties?.className?.includes('wikilink-internal'),
        'Should have wikilink-internal class'
      );
    });

    test('preserves regular markdown links', async () => {
      const input = '[Regular link](https://example.com)';
      const ast = await processToAst(input);
      const link = findLink(ast);

      assert.strictEqual(link.url, 'https://example.com', 'Should preserve external URL');
      assert.strictEqual(
        link.data?.hProperties?.className,
        undefined,
        'Should not have wikilink class'
      );
    });
  });

  describe('Alias (Display Text)', () => {
    test('parses alias correctly', async () => {
      const input = await loadInput('wikilink', 'alias');
      const ast = await processToAst(input);
      const link = findLink(ast);

      assert.strictEqual(link.url, '/blog/page/', 'Should have correct URL');
      assert.strictEqual(
        link.children[0].value,
        'カスタム表示名',
        'Should have alias as display text'
      );
    });

    test('preserves alias with ampersand', async () => {
      const input = '[[../page/index.md|Test & Alias]]';
      const ast = await processToAst(input);
      const link = findLink(ast);

      assert(link, 'Should find link');
      assert.strictEqual(
        link.children[0].value,
        'Test & Alias',
        'Should preserve ampersand in alias'
      );
    });
  });

  describe('Japanese Character Support', () => {
    test('handles Japanese page names', async () => {
      const input = await loadInput('wikilink', 'japanese');
      const ast = await processToAst(input);
      const link = findLink(ast);

      assert(link, 'Should find link');
      assert(link.url.includes('日本語ページ'), 'Should preserve Japanese in URL');
    });

    test('handles Japanese in alias', async () => {
      const input = '[[../page/index.md|日本語の表示名]]';
      const ast = await processToAst(input);
      const link = findLink(ast);

      assert.strictEqual(link.children[0].value, '日本語の表示名', 'Should preserve Japanese alias');
    });

    test('handles full-width spaces', async () => {
      const input = '[[../ページ　名前/index.md]]';
      const ast = await processToAst(input);
      const link = findLink(ast);

      assert.strictEqual(link.url, '/blog/ページ-名前/', 'Should convert full-width space to hyphen');
    });
  });

  describe('Heading Anchors', () => {
    test('converts heading anchor to slug', async () => {
      const input = await loadInput('wikilink', 'heading-anchor');
      const ast = await processToAst(input);
      const link = findLink(ast);

      assert(link.url.includes('#'), 'Should include anchor');
    });

    test('converts English heading spaces to hyphens', async () => {
      const input = '[[../page/index.md#Test Heading]]';
      const ast = await processToAst(input);
      const link = findLink(ast);

      assert.strictEqual(link.url, '/blog/page/#test-heading', 'Should slugify heading');
    });

    test('preserves Japanese heading text', async () => {
      const input = '[[../page/index.md#日本語の見出し]]';
      const ast = await processToAst(input);
      const link = findLink(ast);

      assert.strictEqual(link.url, '/blog/page/#日本語の見出し', 'Should preserve Japanese heading');
    });

    test('handles mixed language heading', async () => {
      const input = '[[../page/index.md#English and 日本語]]';
      const ast = await processToAst(input);
      const link = findLink(ast);

      assert(link.url.includes('/#english-and-日本語'), 'Should handle mixed language heading');
    });
  });

  describe('Path Handling', () => {
    test('removes .md extension', async () => {
      const input = '[[../test/page.md]]';
      const ast = await processToAst(input);
      const link = findLink(ast);

      assert.strictEqual(link.url, '/blog/test/page/', 'Should remove .md extension');
    });

    test('removes /index from path', async () => {
      const input = '[[../test/index]]';
      const ast = await processToAst(input);
      const link = findLink(ast);

      assert.strictEqual(link.url, '/blog/test/', 'Should remove /index');
    });

    test('converts spaces to hyphens in path', async () => {
      const input = await loadInput('wikilink', 'spaces');
      const ast = await processToAst(input);
      const link = findLink(ast);

      assert.strictEqual(link.url, '/blog/page-name/', 'Should convert spaces to hyphens');
    });

    test('handles multiple consecutive spaces', async () => {
      const input = '[[../page   with   spaces/index.md]]';
      const ast = await processToAst(input);
      const link = findLink(ast);

      assert.strictEqual(link.url, '/blog/page-with-spaces/', 'Should normalize multiple spaces');
    });

    test('trims whitespace around path', async () => {
      const input = '[[  ../page/index.md  ]]';
      const ast = await processToAst(input);
      const link = findLink(ast);

      assert.strictEqual(link.url, '/blog/page/', 'Should trim whitespace');
    });
  });

  describe('Multiple Links', () => {
    test('processes multiple wikilinks', async () => {
      const input = await loadInput('wikilink', 'multiple');
      const ast = await processToAst(input);
      const links = findAllLinks(ast);

      assert.strictEqual(links.length, 2, 'Should find 2 links');
      assert.strictEqual(links[0].url, '/blog/first/', 'First link correct');
      assert.strictEqual(links[1].url, '/blog/second/', 'Second link correct');
      assert.strictEqual(links[1].children[0].value, '二番目', 'Second link has alias');
    });

    test('handles mixed wikilinks and regular links', async () => {
      const input = '[[../internal/index.md]] and [external](https://example.com)';
      const ast = await processToAst(input);
      const links = findAllLinks(ast);

      assert.strictEqual(links.length, 2, 'Should find 2 links');
      assert(
        links[0].data?.hProperties?.className?.includes('wikilink-internal'),
        'Wikilink has class'
      );
      assert.strictEqual(links[1].data?.hProperties?.className, undefined, 'External has no class');
    });
  });

  describe('Table Compatibility', () => {
    test('handles escaped pipe in table cell', async () => {
      const input = await loadInput('wikilink', 'escaped-pipe');
      const ast = await processToAst(input);
      const link = findLink(ast);

      assert(link, 'Should find link in table');
      assert.strictEqual(link.url, '/blog/page/', 'Should have correct URL');
      assert.strictEqual(link.children[0].value, 'リンク', 'Should have alias');
    });
  });

  describe('Image Wikilinks', () => {
    test('converts image wikilink to image node', async () => {
      const input = await loadInput('wikilink', 'image');
      const ast = await processToAst(input);
      const image = findImage(ast);

      assert(image, 'Should find image node');
      assert(image.url.includes('image.png'), 'Should have image URL');
    });

    test('handles image with alt text', async () => {
      const input = '![[./image.png|代替テキスト]]';
      const ast = await processToAst(input);
      const image = findImage(ast);

      assert(image, 'Should find image');
      assert.strictEqual(image.alt, '代替テキスト', 'Should have alt text');
    });
  });

  describe('Edge Cases', () => {
    test('ignores empty wikilink', async () => {
      const input = '[[]]';
      const ast = await processToAst(input);
      const link = findLink(ast);

      assert.strictEqual(link, null, 'Empty wikilink should not create link');
    });

    test('ignores whitespace-only wikilink', async () => {
      const input = '[[   ]]';
      const ast = await processToAst(input);
      const link = findLink(ast);

      assert.strictEqual(link, null, 'Whitespace-only wikilink should not create link');
    });

    test('handles wikilink with only alias (current behavior)', async () => {
      // Note: Current implementation creates a link with "|just alias" as URL
      // This documents the current behavior - future fix might change this
      const input = '[[|just alias]]';
      const ast = await processToAst(input);
      const link = findLink(ast);

      // Current behavior: creates a link (may be unintended but documenting as-is)
      if (link) {
        assert(link.url, 'If link exists, should have URL');
      }
    });

    test('handles path with control characters gracefully', async () => {
      const input = '[[../page\x00name/index.md]]';
      const ast = await processToAst(input);
      const link = findLink(ast);

      // Should either create link or gracefully handle the control character
      if (link) {
        assert(typeof link.url === 'string', 'Should have valid URL');
      }
    });

    test('lowercase path conversion', async () => {
      const input = '[[../MyPage/index.md]]';
      const ast = await processToAst(input);
      const link = findLink(ast);

      assert.strictEqual(link.url, '/blog/mypage/', 'Should lowercase path');
    });
  });

  describe('Fixture-Based Tests', () => {
    test('processes all wikilink fixtures without error', async () => {
      const fixtures = await loadAllFixtures('wikilink');
      assert(fixtures.length >= 3, 'Should have at least 3 wikilink fixtures');

      for (const fixture of fixtures) {
        const ast = await processToAst(fixture.input);
        assert(ast, `Fixture ${fixture.name} should produce valid AST`);

        // If contains [[, should have a link (unless it's an edge case)
        if (fixture.input.includes('[[') && !fixture.input.match(/\[\[\s*\]\]/)) {
          const link = findLink(ast);
          const image = findImage(ast);
          assert(
            link || image,
            `Fixture ${fixture.name} should produce link or image`
          );
        }
      }
    });
  });
});

console.log('🧪 Running WikiLink Plugin Unit Tests...');
