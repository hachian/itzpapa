/**
 * E2E Test Suite
 *
 * Tests the full markdown processing pipeline by processing markdown files
 * and validating the HTML output using the HTML validator utility.
 *
 * Note: These tests process markdown through the full remark/rehype pipeline
 * without actually building the Astro site.
 */

import { describe, test, before } from 'node:test';
import assert from 'node:assert';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkWikilink from '../../src/plugins/remark-wikilink/index.js';
import remarkMarkHighlight from '../../src/plugins/remark-mark-highlight/index.js';
import remarkTags from '../../src/plugins/remark-tags/index.js';
import remarkCallout from '../../src/plugins/remark-callout/index.js';
import rehypeCallout from '../../src/plugins/rehype-callout/index.js';
import {
  parseHtml,
  validateCallouts,
  validateWikilinks,
  validateHighlights,
  validateTags,
  assertHtmlContains,
} from '../utils/html-validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Full processing pipeline
async function processMarkdownToHtml(markdown) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkWikilink)
    .use(remarkMarkHighlight)
    .use(remarkTags)
    .use(remarkCallout)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeCallout)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  return String(result);
}

// Load E2E fixture
async function loadE2EFixture(name) {
  const fixturePath = join(__dirname, '..', 'fixtures', 'e2e', `${name}.md`);
  const content = await readFile(fixturePath, 'utf-8');
  // Extract content after frontmatter
  const frontmatterMatch = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  return frontmatterMatch ? frontmatterMatch[1] : content;
}

// Load expected output
async function loadExpectedOutput() {
  const path = join(__dirname, '..', 'fixtures', 'e2e', 'expected-output.json');
  const content = await readFile(path, 'utf-8');
  return JSON.parse(content);
}

describe('E2E Markdown Processing Tests', () => {
  let expectedOutput;

  before(async () => {
    expectedOutput = await loadExpectedOutput();
  });

  describe('Complete Markdown Processing', () => {
    test('processes complete-markdown fixture', async () => {
      const markdown = await loadE2EFixture('complete-markdown');
      const html = await processMarkdownToHtml(markdown);
      const $ = parseHtml(html);

      // Validate callouts
      const callouts = validateCallouts($);
      assert(callouts.count >= 5, `Expected at least 5 callouts, got ${callouts.count}`);

      // Validate wikilinks
      const wikilinks = validateWikilinks($);
      assert(wikilinks.count >= 1, 'Should have wikilinks');

      // Validate highlights
      const highlights = validateHighlights($);
      assert(highlights.count >= 4, `Expected at least 4 highlights, got ${highlights.count}`);

      // Validate tags
      const tags = validateTags($);
      assert(tags.count >= 1, 'Should have tag links');
    });

    test('validates callout types in complete-markdown', async () => {
      const markdown = await loadE2EFixture('complete-markdown');
      const html = await processMarkdownToHtml(markdown);
      const $ = parseHtml(html);

      const callouts = validateCallouts($);
      const types = callouts.callouts.map(c => c.type);

      assert(types.includes('note'), 'Should have note callout');
      assert(types.includes('warning'), 'Should have warning callout');
      assert(types.includes('tip'), 'Should have tip callout');
    });

    test('validates highlight content', async () => {
      const markdown = await loadE2EFixture('complete-markdown');
      const html = await processMarkdownToHtml(markdown);
      const $ = parseHtml(html);

      const highlights = validateHighlights($);
      const texts = highlights.highlights.map(h => h.text);

      assert(texts.some(t => t.includes('重要')), 'Should have Japanese highlight');
    });
  });

  describe('Callout Variants Processing', () => {
    test('processes all callout types', async () => {
      const markdown = await loadE2EFixture('callout-variants');
      const html = await processMarkdownToHtml(markdown);
      const $ = parseHtml(html);

      const callouts = validateCallouts($);
      const types = new Set(callouts.callouts.map(c => c.type));

      // Check for basic types
      const expectedTypes = ['note', 'tip', 'warning', 'danger', 'info', 'caution', 'important'];
      for (const type of expectedTypes) {
        assert(types.has(type), `Should have ${type} callout`);
      }
    });

    test('handles foldable callouts', async () => {
      const markdown = await loadE2EFixture('callout-variants');
      const html = await processMarkdownToHtml(markdown);
      const $ = parseHtml(html);

      const callouts = validateCallouts($);
      const foldableCallouts = callouts.callouts.filter(c => c.foldable !== null);

      assert(foldableCallouts.length >= 2, `Should have foldable callouts, got ${foldableCallouts.length}`);
    });

    test('preserves custom titles', async () => {
      const markdown = await loadE2EFixture('callout-variants');
      const html = await processMarkdownToHtml(markdown);
      const $ = parseHtml(html);

      const callouts = validateCallouts($);
      // All callouts should have titles (either custom or default)
      const calloutsWithTitles = callouts.callouts.filter(c => c.title && c.title.length > 0);

      assert(calloutsWithTitles.length >= 3, `Should have callouts with titles, got ${calloutsWithTitles.length}`);
    });
  });

  describe('WikiLink Variants Processing', () => {
    test('processes various wikilink formats', async () => {
      const markdown = await loadE2EFixture('wikilink-variants');
      const html = await processMarkdownToHtml(markdown);
      const $ = parseHtml(html);

      const wikilinks = validateWikilinks($);
      assert(wikilinks.count >= 5, `Expected at least 5 wikilinks, got ${wikilinks.count}`);
    });

    test('handles wikilinks with aliases', async () => {
      const markdown = await loadE2EFixture('wikilink-variants');
      const html = await processMarkdownToHtml(markdown);
      const $ = parseHtml(html);

      const wikilinks = validateWikilinks($);
      const withCustomText = wikilinks.links.filter(
        l => l.text !== l.href && l.text.length > 0
      );

      assert(withCustomText.length >= 1, 'Should have wikilinks with aliases');
    });

    test('generates correct href paths', async () => {
      const markdown = await loadE2EFixture('wikilink-variants');
      const html = await processMarkdownToHtml(markdown);
      const $ = parseHtml(html);

      const wikilinks = validateWikilinks($);
      const validPaths = wikilinks.links.filter(l => l.href.startsWith('/blog/'));

      assert(validPaths.length >= 1, 'Should have valid /blog/ paths');
    });
  });

  describe('Plugin Interaction Tests', () => {
    test('callout with wikilink inside', async () => {
      const markdown = `
> [!note] テスト
> [[../page/index.md]] を参照
`;
      const html = await processMarkdownToHtml(markdown);
      const $ = parseHtml(html);

      const callouts = validateCallouts($);
      const wikilinks = validateWikilinks($);

      assert.strictEqual(callouts.count, 1, 'Should have 1 callout');
      assert(wikilinks.count >= 1, 'Should have wikilink inside callout');
    });

    test('callout with highlight inside', async () => {
      const markdown = `
> [!warning] 警告
> ==重要な== 情報です
`;
      const html = await processMarkdownToHtml(markdown);
      const $ = parseHtml(html);

      const callouts = validateCallouts($);
      const highlights = validateHighlights($);

      assert.strictEqual(callouts.count, 1, 'Should have 1 callout');
      assert(highlights.count >= 1, 'Should have highlight inside callout');
    });

    test('callout with tag inside', async () => {
      const markdown = `
> [!tip] ヒント
> #programming に関する情報
`;
      const html = await processMarkdownToHtml(markdown);
      const $ = parseHtml(html);

      const callouts = validateCallouts($);
      const tags = validateTags($);

      assert.strictEqual(callouts.count, 1, 'Should have 1 callout');
      assert(tags.count >= 1, 'Should have tag inside callout');
    });

    test('combined features in same paragraph', async () => {
      const markdown = `[[../page/index.md]] と ==highlight== と #tag の組み合わせ`;
      const html = await processMarkdownToHtml(markdown);
      const $ = parseHtml(html);

      const wikilinks = validateWikilinks($);
      const highlights = validateHighlights($);
      const tags = validateTags($);

      assert(wikilinks.count >= 1, 'Should have wikilink');
      assert(highlights.count >= 1, 'Should have highlight');
      assert(tags.count >= 1, 'Should have tag');
    });
  });

  describe('Japanese Content Tests', () => {
    test('processes Japanese callout title and content', async () => {
      const markdown = `
> [!note] 日本語タイトル
> 日本語のコンテンツです。
`;
      const html = await processMarkdownToHtml(markdown);
      const $ = parseHtml(html);

      const callouts = validateCallouts($);
      assert.strictEqual(callouts.count, 1);
      // Check that either title or content includes Japanese
      const hasJapanese = callouts.callouts[0].title.includes('日本語') ||
                         callouts.callouts[0].content.includes('日本語');
      assert(hasJapanese, 'Should have Japanese title or content');
    });

    test('processes Japanese highlights', async () => {
      const markdown = `==日本語ハイライト==`;
      const html = await processMarkdownToHtml(markdown);
      const $ = parseHtml(html);

      const highlights = validateHighlights($);
      assert(highlights.count >= 1);
      assert(highlights.highlights[0].text.includes('日本語'), 'Should have Japanese text');
    });

    test('processes Japanese tags', async () => {
      const markdown = `#日本語 タグ`;
      const html = await processMarkdownToHtml(markdown);
      const $ = parseHtml(html);

      const tags = validateTags($);
      assert(tags.count >= 1, 'Should have Japanese tag');
    });
  });

  describe('Edge Case Tests', () => {
    test('handles empty callout', async () => {
      const markdown = `> [!note]`;
      const html = await processMarkdownToHtml(markdown);
      const $ = parseHtml(html);

      const callouts = validateCallouts($);
      assert.strictEqual(callouts.count, 1, 'Should create callout even when empty');
    });

    test('handles multiple adjacent features', async () => {
      const markdown = `==highlight1====highlight2==`;
      const html = await processMarkdownToHtml(markdown);

      // Should not crash
      assert(html, 'Should produce valid HTML');
    });

    test('handles special characters in callout title', async () => {
      const markdown = `> [!note] タイトル & 特殊文字
> コンテンツ`;
      const html = await processMarkdownToHtml(markdown);
      const $ = parseHtml(html);

      const callouts = validateCallouts($);
      assert.strictEqual(callouts.count, 1);
    });

    test('handles nested blockquotes', async () => {
      const markdown = `
> [!note] 外側
> 外側のコンテンツ
> > ネストされた引用
`;
      const html = await processMarkdownToHtml(markdown);

      // Should not crash
      assert(html, 'Should handle nested quotes');
    });
  });

  describe('Assertion Helper Tests', () => {
    test('assertHtmlContains with complete fixture', async () => {
      const markdown = await loadE2EFixture('complete-markdown');
      const html = await processMarkdownToHtml(markdown);
      const $ = parseHtml(html);

      const result = assertHtmlContains($, {
        calloutTypes: ['note', 'warning'],
        highlightTexts: ['重要'],
        selectors: ['mark', '[data-callout]'],
      });

      assert(result.passed, 'Should pass all assertions');
    });

    test('assertHtmlContains fails appropriately', async () => {
      const markdown = `Simple paragraph without features`;
      const html = await processMarkdownToHtml(markdown);
      const $ = parseHtml(html);

      const result = assertHtmlContains($, {
        calloutTypes: ['note'],
      });

      assert(!result.passed, 'Should fail when expected features missing');
    });
  });
});

describe('Output Consistency Tests', () => {
  test('produces consistent output for same input', async () => {
    const markdown = await loadE2EFixture('complete-markdown');

    const html1 = await processMarkdownToHtml(markdown);
    const html2 = await processMarkdownToHtml(markdown);

    assert.strictEqual(html1, html2, 'Output should be deterministic');
  });

  test('produces valid HTML structure', async () => {
    const markdown = await loadE2EFixture('complete-markdown');
    const html = await processMarkdownToHtml(markdown);

    // Basic HTML validity checks
    assert(!html.includes('undefined'), 'Should not contain undefined');
    assert(!html.includes('[object Object]'), 'Should not contain stringified objects');

    // Check for balanced tags (simplified check)
    const openCallouts = (html.match(/<blockquote[^>]*data-callout/g) || []).length;
    const closeCallouts = (html.match(/<\/blockquote>/g) || []).length;
    assert(closeCallouts >= openCallouts, 'Should have balanced blockquote tags');
  });
});

console.log('🧪 Running E2E Tests...');
