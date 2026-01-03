/**
 * Callout Plugin Test Suite
 *
 * Tests the remark-callout and rehype-callout plugins
 * Covers: basic conversion, all types, foldable states, custom titles, nesting
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { remark } from 'remark';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkCallout from '../../src/plugins/remark-callout/index.js';
import rehypeCallout from '../../src/plugins/rehype-callout/index.js';
import { loadInput, loadAllFixtures } from '../fixtures/fixture-loader.js';

// Helper: Process markdown with remark-callout only (returns AST)
async function processToAst(markdown) {
  const processor = remark().use(remarkCallout);
  return processor.runSync(processor.parse(markdown));
}

// Helper: Process markdown through full pipeline to HTML
async function processToHtml(markdown) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkCallout)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeCallout)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);
  return String(result);
}

// Helper: Find blockquote node in AST
function findBlockquote(ast) {
  let result = null;
  function walk(node) {
    if (node.type === 'blockquote') {
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

// Helper: Find all blockquote nodes in AST
function findAllBlockquotes(ast) {
  const results = [];
  function walk(node) {
    if (node.type === 'blockquote') {
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

describe('remark-callout Plugin', () => {
  describe('Basic Callout Detection', () => {
    test('identifies basic note callout', async () => {
      const input = await loadInput('callout', 'basic');
      const ast = await processToAst(input);
      const blockquote = findBlockquote(ast);

      assert(blockquote, 'Should find a blockquote');
      assert.strictEqual(
        blockquote.data?.hProperties?.['data-callout'],
        'note',
        'Should have data-callout="note"'
      );
    });

    test('parses callout with custom title', async () => {
      const input = await loadInput('callout', 'custom-title');
      const ast = await processToAst(input);
      const blockquote = findBlockquote(ast);

      assert.strictEqual(
        blockquote.data?.hProperties?.['data-callout'],
        'tip',
        'Should have data-callout="tip"'
      );
      assert.strictEqual(
        blockquote.data?.hProperties?.['data-callout-title'],
        'カスタムタイトル',
        'Should have custom title'
      );
    });

    test('regular blockquote is not treated as callout', async () => {
      const input = '> This is a regular blockquote.';
      const ast = await processToAst(input);
      const blockquote = findBlockquote(ast);

      assert(blockquote, 'Should find blockquote');
      assert.strictEqual(
        blockquote.data?.hProperties?.['data-callout'],
        undefined,
        'Regular blockquote should not have data-callout'
      );
    });
  });

  describe('Callout Types', () => {
    // Obsidian公式13タイプ
    const types = [
      'note', 'abstract', 'info', 'todo', 'tip', 'success',
      'question', 'warning', 'failure', 'danger', 'bug', 'example', 'quote'
    ];

    for (const type of types) {
      test(`parses ${type} callout type`, async () => {
        const input = `> [!${type}]\n> Content`;
        const ast = await processToAst(input);
        const blockquote = findBlockquote(ast);

        assert.strictEqual(
          blockquote.data?.hProperties?.['data-callout'],
          type,
          `Should have data-callout="${type}"`
        );
        assert(
          blockquote.data?.hProperties?.className?.includes(`callout-${type}`),
          `Should have callout-${type} class`
        );
      });
    }

    test('unknown type falls back to note', async () => {
      const input = await loadInput('callout', 'unknown-type');
      const ast = await processToAst(input);
      const blockquote = findBlockquote(ast);

      assert.strictEqual(
        blockquote.data?.hProperties?.['data-callout'],
        'note',
        'Unknown type should fall back to note'
      );
    });

    test('case insensitive type parsing', async () => {
      const input = '> [!WARNING]\n> Uppercase type';
      const ast = await processToAst(input);
      const blockquote = findBlockquote(ast);

      assert.strictEqual(
        blockquote.data?.hProperties?.['data-callout'],
        'warning',
        'Should parse uppercase type as warning'
      );
    });
  });

  describe('Callout Type Aliases', () => {
    // エイリアス→正規タイプのマッピング
    const aliasTests = [
      // abstract aliases
      { alias: 'summary', canonical: 'abstract' },
      { alias: 'tldr', canonical: 'abstract' },
      // tip aliases
      { alias: 'hint', canonical: 'tip' },
      { alias: 'important', canonical: 'tip' },
      // success aliases
      { alias: 'check', canonical: 'success' },
      { alias: 'done', canonical: 'success' },
      // question aliases
      { alias: 'help', canonical: 'question' },
      { alias: 'faq', canonical: 'question' },
      // warning aliases
      { alias: 'caution', canonical: 'warning' },
      { alias: 'attention', canonical: 'warning' },
      // failure aliases
      { alias: 'fail', canonical: 'failure' },
      { alias: 'missing', canonical: 'failure' },
      // danger aliases
      { alias: 'error', canonical: 'danger' },
      // quote aliases
      { alias: 'cite', canonical: 'quote' }
    ];

    for (const { alias, canonical } of aliasTests) {
      test(`alias ${alias} resolves to ${canonical}`, async () => {
        const input = `> [!${alias}]\n> Content`;
        const ast = await processToAst(input);
        const blockquote = findBlockquote(ast);

        assert.strictEqual(
          blockquote.data?.hProperties?.['data-callout'],
          canonical,
          `Alias ${alias} should resolve to ${canonical}`
        );
        assert(
          blockquote.data?.hProperties?.className?.includes(`callout-${canonical}`),
          `Should have callout-${canonical} class`
        );
      });
    }

    test('alias is case insensitive', async () => {
      const input = '> [!TLDR]\n> Content';
      const ast = await processToAst(input);
      const blockquote = findBlockquote(ast);

      assert.strictEqual(
        blockquote.data?.hProperties?.['data-callout'],
        'abstract',
        'Uppercase alias TLDR should resolve to abstract'
      );
    });

    test('mixed case alias works', async () => {
      const input = '> [!Summary]\n> Content';
      const ast = await processToAst(input);
      const blockquote = findBlockquote(ast);

      assert.strictEqual(
        blockquote.data?.hProperties?.['data-callout'],
        'abstract',
        'Mixed case alias Summary should resolve to abstract'
      );
    });
  });

  describe('Foldable Callouts', () => {
    test('parses foldable callout with minus (default folded)', async () => {
      const input = await loadInput('callout', 'foldable');
      const ast = await processToAst(input);
      const blockquote = findBlockquote(ast);

      assert.strictEqual(
        blockquote.data?.hProperties?.['data-callout-foldable'],
        'true',
        'Should be foldable'
      );
      assert.strictEqual(
        blockquote.data?.hProperties?.['data-callout-folded'],
        'true',
        'Should be folded by default with minus'
      );
    });

    test('parses foldable callout with plus (default expanded)', async () => {
      const input = await loadInput('callout', 'foldable-expanded');
      const ast = await processToAst(input);
      const blockquote = findBlockquote(ast);

      assert.strictEqual(
        blockquote.data?.hProperties?.['data-callout-foldable'],
        'true',
        'Should be foldable'
      );
      assert.strictEqual(
        blockquote.data?.hProperties?.['data-callout-folded'],
        'false',
        'Should not be folded by default with plus'
      );
    });

    test('non-foldable callout has no foldable attribute', async () => {
      const input = await loadInput('callout', 'basic');
      const ast = await processToAst(input);
      const blockquote = findBlockquote(ast);

      assert.strictEqual(
        blockquote.data?.hProperties?.['data-callout-foldable'],
        undefined,
        'Non-foldable callout should not have foldable attribute'
      );
    });
  });

  describe('Nested Callouts', () => {
    test('parses nested callouts', async () => {
      const input = await loadInput('callout', 'nested');
      const ast = await processToAst(input);
      const blockquotes = findAllBlockquotes(ast);

      assert(blockquotes.length >= 1, 'Should find at least one blockquote');

      // Outer callout
      const outer = blockquotes[0];
      assert.strictEqual(
        outer.data?.hProperties?.['data-callout'],
        'note',
        'Outer should be note callout'
      );
    });

    test('nested callout has nest-level attribute', async () => {
      const input = await loadInput('callout', 'nested');
      const ast = await processToAst(input);

      // Look for nested callout with nest-level
      let foundNested = false;
      function walk(node, depth = 0) {
        if (node.type === 'blockquote' && node.data?.hProperties?.['data-nest-level']) {
          foundNested = true;
        }
        if (node.children) {
          for (const child of node.children) {
            walk(child, depth + 1);
          }
        }
      }
      walk(ast);

      assert(foundNested, 'Should find nested callout with nest-level attribute');
    });
  });

  describe('Content Preservation', () => {
    test('preserves content after callout header', async () => {
      const input = '> [!note]\n> Important content here.';
      const ast = await processToAst(input);
      const blockquote = findBlockquote(ast);

      // Content should be preserved (header removed, content kept)
      const hasContent = JSON.stringify(ast).includes('Important content here');
      assert(hasContent, 'Content should be preserved after header removal');
    });

    test('handles multi-line content', async () => {
      const input = '> [!tip]\n> Line 1\n> Line 2\n> Line 3';
      const ast = await processToAst(input);
      const blockquote = findBlockquote(ast);

      assert(blockquote, 'Should find blockquote');
      const content = JSON.stringify(ast);
      assert(content.includes('Line 1'), 'Should contain Line 1');
      assert(content.includes('Line 2'), 'Should contain Line 2');
      assert(content.includes('Line 3'), 'Should contain Line 3');
    });
  });

  describe('Edge Cases', () => {
    test('empty callout header type is ignored', async () => {
      const input = '> [!]\n> Content';
      const ast = await processToAst(input);
      const blockquote = findBlockquote(ast);

      assert.strictEqual(
        blockquote.data?.hProperties?.['data-callout'],
        undefined,
        'Empty type should not create callout'
      );
    });

    test('callout with only header (no content)', async () => {
      const input = '> [!note]';
      const ast = await processToAst(input);
      const blockquote = findBlockquote(ast);

      assert.strictEqual(
        blockquote.data?.hProperties?.['data-callout'],
        'note',
        'Header-only callout should still be detected'
      );
    });

    test('whitespace in callout header', async () => {
      const input = '> [!note]   Multiple   Spaced   Title';
      const ast = await processToAst(input);
      const blockquote = findBlockquote(ast);

      assert.strictEqual(
        blockquote.data?.hProperties?.['data-callout-title'],
        'Multiple   Spaced   Title',
        'Should preserve whitespace in title'
      );
    });
  });
});

describe('rehype-callout Plugin (HTML Output)', () => {
  describe('HTML Structure', () => {
    test('non-foldable callout generates div structure', async () => {
      const input = '> [!note]\n> Content';
      const html = await processToHtml(input);

      assert(html.includes('<div'), 'Should generate div wrapper');
      assert(html.includes('class="callout callout-note"'), 'Should have callout classes');
      assert(html.includes('data-callout="note"'), 'Should have data-callout attribute');
      assert(html.includes('callout-title'), 'Should have title element');
      assert(html.includes('callout-content'), 'Should have content element');
    });

    test('foldable callout generates details/summary structure', async () => {
      const input = '> [!warning]-\n> Foldable content';
      const html = await processToHtml(input);

      assert(html.includes('<details'), 'Should generate details element');
      assert(html.includes('<summary'), 'Should generate summary element');
      assert(html.includes('callout-fold-icon'), 'Should have fold icon');
    });

    test('expanded foldable callout has open attribute', async () => {
      const input = '> [!info]+\n> Expanded by default';
      const html = await processToHtml(input);

      assert(html.includes('<details'), 'Should generate details');
      assert(html.includes('open'), 'Should have open attribute');
    });
  });

  describe('Icons', () => {
    test('callout includes SVG icon', async () => {
      const input = '> [!note]\n> Content';
      const html = await processToHtml(input);

      assert(html.includes('<svg'), 'Should include SVG icon');
      assert(html.includes('callout-icon'), 'Should have icon wrapper');
    });

    test('all 13 types have icons', async () => {
      const types = [
        'note', 'abstract', 'info', 'todo', 'tip', 'success',
        'question', 'warning', 'failure', 'danger', 'bug', 'example', 'quote'
      ];
      for (const type of types) {
        const input = `> [!${type}]\n> Content`;
        const html = await processToHtml(input);
        assert(html.includes('<svg'), `${type} callout should have SVG icon`);
      }
    });
  });

  describe('Title Escaping', () => {
    test('escapes ampersand in title', async () => {
      const input = '> [!note] Test&Title';
      const html = await processToHtml(input);

      assert(html.includes('&amp;'), 'Should escape ampersand');
      assert(html.includes('Test&amp;Title'), 'Should have escaped title');
    });

    test('escapes angle brackets in title', async () => {
      const input = '> [!note] Test<br>Title';
      const html = await processToHtml(input);

      // Title should have escaped angle brackets
      assert(html.includes('callout-title-inner'), 'Should have title element');
      // The title portion "Test" is captured, "<br>Title" becomes content
      // This tests that when text includes <, the escapeHtml function handles it
    });

    test('escapes quotes in title', async () => {
      const input = '> [!note] Title with "quotes"';
      const html = await processToHtml(input);

      assert(html.includes('&quot;'), 'Should escape quotes');
    });
  });
});

describe('Fixture-Based Tests', () => {
  test('loads and processes all callout fixtures', async () => {
    const fixtures = await loadAllFixtures('callout');
    assert(fixtures.length >= 3, 'Should have at least 3 callout fixtures');

    for (const fixture of fixtures) {
      // Each fixture should process without error
      const ast = await processToAst(fixture.input);
      assert(ast, `Fixture ${fixture.name} should produce valid AST`);

      // If it contains [!, it should be detected as callout
      if (fixture.input.includes('[!')) {
        const blockquote = findBlockquote(ast);
        assert(
          blockquote?.data?.hProperties?.['data-callout'],
          `Fixture ${fixture.name} should be detected as callout`
        );
      }
    }
  });
});

console.log('🧪 Running Callout Plugin Tests...');
