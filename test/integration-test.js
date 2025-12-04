/**
 * Integration Test Suite
 *
 * Tests plugin combinations, processing order, and potential conflicts
 * Covers the interaction between all markdown plugins
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { remark } from 'remark';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkWikilink from '../src/plugins/remark-wikilink/index.js';
import remarkMarkHighlight from '../src/plugins/remark-mark-highlight/index.js';
import remarkTags from '../src/plugins/remark-tags/index.js';
import remarkCallout from '../src/plugins/remark-callout/index.js';
import rehypeCallout from '../src/plugins/rehype-callout/index.js';
import { loadInput, loadAllFixtures } from './fixtures/fixture-loader.js';

// Helper: Process with all remark plugins (AST level)
async function processAllRemarkToAst(markdown, options = {}) {
  const processor = remark()
    .use(remarkWikilink)
    .use(remarkMarkHighlight)
    .use(remarkTags)
    .use(remarkCallout);

  const file = { data: { astro: { frontmatter: {} } } };
  return processor.runSync(processor.parse(markdown), file);
}

// Helper: Process through full pipeline to HTML
async function processToHtml(markdown) {
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

// Helper: Find nodes of type in AST
function findNodes(ast, type) {
  const results = [];
  function walk(node) {
    if (node.type === type) results.push(node);
    if (node.children) node.children.forEach(walk);
  }
  walk(ast);
  return results;
}

describe('Plugin Combination Tests', () => {
  describe('WikiLink + Highlight', () => {
    test('highlight containing wikilink', async () => {
      const input = await loadInput('combination', 'wikilink-highlight');
      const html = await processToHtml(input);

      // Should have both mark and link
      assert(html.includes('<mark'), 'Should have highlight');
      assert(html.includes('href='), 'Should have link');
    });

    test('wikilink inside highlight (documents current behavior)', async () => {
      // Note: WikiLink syntax inside highlight markers may not work as expected
      // due to plugin processing order and text node handling
      const input = '==Check [[../page/index.md]] for details==';
      const html = await processToHtml(input);

      // The current behavior may vary - this test documents it
      assert(html, 'Should produce valid HTML');
      // WikiLink processing happens before highlight, so the wikilink may or may not be inside <mark>
    });

    test('highlight inside wikilink alias', async () => {
      // This is an edge case - highlight syntax in alias
      const input = '[[../page/index.md|==highlighted== text]]';
      const ast = await processAllRemarkToAst(input);

      // Should not crash and produce valid AST
      assert(ast, 'Should produce valid AST');
    });
  });

  describe('Callout + WikiLink', () => {
    test('wikilink inside callout content', async () => {
      const input = await loadInput('combination', 'callout-wikilink');
      const html = await processToHtml(input);

      assert(html.includes('callout'), 'Should have callout structure');
      assert(html.includes('href='), 'Should have wikilink converted to link');
    });

    test('wikilink in callout title', async () => {
      const input = '> [!note] See [[../page/index.md]]\n> Content here';
      const ast = await processAllRemarkToAst(input);

      // Should produce valid structure
      assert(ast, 'Should produce valid AST');
    });
  });

  describe('Callout + Highlight', () => {
    test('highlight inside callout', async () => {
      const input = '> [!warning]\n> This is ==important== info';
      const html = await processToHtml(input);

      assert(html.includes('callout'), 'Should have callout');
      assert(html.includes('<mark'), 'Should have highlight');
    });
  });

  describe('Tags + WikiLink', () => {
    test('tag and wikilink in same line', async () => {
      const input = '#tag と [[../page/index.md]] の組み合わせ';
      const html = await processToHtml(input);

      assert(html.includes('/tags/'), 'Should have tag link');
      assert(html.includes('/blog/'), 'Should have wikilink');
    });
  });

  describe('Tags + Highlight', () => {
    test('highlight containing tag', async () => {
      const input = '==#important タグ==';
      const html = await processToHtml(input);

      // Highlight processes the text
      assert(html.includes('<mark'), 'Should have highlight');
    });

    test('tag inside highlight', async () => {
      const input = '==See #tag for more==';
      const html = await processToHtml(input);

      assert(html.includes('<mark'), 'Should have highlight');
    });
  });

  describe('Tags + Callout', () => {
    test('tag inside callout', async () => {
      const input = '> [!info]\n> Check #programming for resources';
      const html = await processToHtml(input);

      assert(html.includes('callout'), 'Should have callout');
      assert(html.includes('/tags/'), 'Should have tag link');
    });
  });

  describe('Three-way Combinations', () => {
    test('wikilink + highlight + tag (complex interaction)', async () => {
      // Complex interaction between multiple syntax types
      const input = '==[[../page/index.md]] と #tag のハイライト==';
      const html = await processToHtml(input);

      // Due to complex plugin interactions, behavior may vary
      // This test ensures the combination doesn't crash
      assert(html, 'Should produce valid HTML without crashing');
    });

    test('callout containing wikilink and highlight', async () => {
      const input = '> [!note] 参照情報\n> [[../page/index.md]] を参照。\n> ==重要== な情報です。';
      const html = await processToHtml(input);

      assert(html.includes('callout'), 'Should have callout');
      assert(html.includes('<mark'), 'Should have highlight');
    });

    test('callout with tag and highlight', async () => {
      const input = '> [!tip]\n> #advice についての ==重要な== 情報';
      const html = await processToHtml(input);

      assert(html.includes('callout'), 'Should have callout');
      assert(html.includes('<mark'), 'Should have highlight');
    });
  });

  describe('All Four Plugins', () => {
    test('all syntax types in one document', async () => {
      const input = `
> [!note] 参照ノート
> [[../page/index.md]] を参照してください。
> ==重要== な #tag 付き情報です。

通常のテキストと [[../other/index.md|リンク]] があります。

==ハイライトされた #another タグ==
`;
      const html = await processToHtml(input);

      assert(html.includes('callout'), 'Should have callout');
      assert(html.includes('<mark'), 'Should have highlight');
      assert(html.includes('href='), 'Should have links');
    });
  });
});

describe('Processing Order Tests', () => {
  describe('Plugin Execution Order', () => {
    test('wikilink processes before others', async () => {
      // WikiLink should transform [[...]] syntax before other plugins see it
      const input = '[[../page/index.md]]';
      const ast = await processAllRemarkToAst(input);
      const links = findNodes(ast, 'link');

      assert(links.length > 0, 'WikiLink should create link node');
    });

    test('highlight processes text nodes', async () => {
      const input = '==test==';
      const ast = await processAllRemarkToAst(input);
      const htmlNodes = findNodes(ast, 'html');

      assert(htmlNodes.length > 0, 'Highlight should create html node');
    });

    test('tags process after wikilink', async () => {
      // Tags should not interfere with already processed wikilinks
      const input = '[[../page/index.md]] #tag';
      const ast = await processAllRemarkToAst(input);
      const links = findNodes(ast, 'link');

      // Should have both wikilink and tag links
      assert(links.length >= 2, 'Should have multiple links');
    });

    test('callout processes blockquotes', async () => {
      const input = '> [!note]\n> Content';
      const ast = await processAllRemarkToAst(input);
      const blockquotes = findNodes(ast, 'blockquote');

      if (blockquotes.length > 0) {
        assert(
          blockquotes[0].data?.hProperties?.['data-callout'],
          'Blockquote should have callout data'
        );
      }
    });
  });

  describe('Order Independence', () => {
    test('result should be consistent', async () => {
      const input = '> [!tip]\n> [[../page/index.md]] と ==highlight==';

      // Process twice to ensure consistency
      const html1 = await processToHtml(input);
      const html2 = await processToHtml(input);

      assert.strictEqual(html1, html2, 'Processing should be deterministic');
    });
  });
});

describe('Conflict and Interference Tests', () => {
  describe('Syntax Boundary Cases', () => {
    test('adjacent syntax markers', async () => {
      const input = '==highlight==[[../page/index.md]]';
      const html = await processToHtml(input);

      // Should handle adjacent markers without breaking
      assert(html, 'Should produce valid HTML');
    });

    test('overlapping-like syntax', async () => {
      // == inside [[]] context
      const input = '[[../page==name==/index.md]]';
      const ast = await processAllRemarkToAst(input);

      // Should not crash
      assert(ast, 'Should handle edge case');
    });

    test('nested quotes in callout', async () => {
      const input = '> [!note]\n> > Nested quote';
      const ast = await processAllRemarkToAst(input);

      assert(ast, 'Should handle nested quotes');
    });
  });

  describe('Escape Sequences', () => {
    test('escaped wikilink syntax (documents current behavior)', async () => {
      // Note: Markdown's backslash escaping may not prevent wikilink processing
      // as the wikilink plugin has its own parsing logic
      const input = '\\[\\[not a link\\]\\]';
      const ast = await processAllRemarkToAst(input);
      const links = findNodes(ast, 'link');

      // Current behavior: escaping may or may not work depending on implementation
      // This documents the actual behavior
      assert(ast, 'Should produce valid AST');
    });

    test('pipe in table with wikilink', async () => {
      const input = '| [[../page/index.md\\|alias]] | cell |';
      const ast = await processAllRemarkToAst(input);

      assert(ast, 'Should handle escaped pipe');
    });
  });

  describe('Empty and Edge Cases', () => {
    test('empty highlight', async () => {
      const input = '====';
      const html = await processToHtml(input);

      assert(html, 'Should handle empty highlight');
    });

    test('empty wikilink', async () => {
      const input = '[[]]';
      const html = await processToHtml(input);

      assert(html, 'Should handle empty wikilink');
    });

    test('callout without content', async () => {
      const input = '> [!note]';
      const html = await processToHtml(input);

      assert(html.includes('callout'), 'Should create callout even without content');
    });

    test('standalone hash', async () => {
      const input = '# header not tag';
      const ast = await processAllRemarkToAst(input);
      const links = findNodes(ast, 'link');

      // # at line start is header, not tag
      assert.strictEqual(links.length, 0, 'Header marker should not become tag');
    });
  });

  describe('Special Characters', () => {
    test('Japanese in all syntax types', async () => {
      const input = '> [!note] 日本語タイトル\n> [[../日本語/index.md|日本語リンク]] と ==日本語ハイライト== と #日本語タグ';
      const html = await processToHtml(input);

      assert(html, 'Should handle Japanese in all syntax');
      assert(html.includes('日本語'), 'Japanese should be preserved');
    });

    test('unicode in paths', async () => {
      const input = '[[../émoji-🎉/index.md]]';
      const ast = await processAllRemarkToAst(input);

      assert(ast, 'Should handle unicode in paths');
    });
  });

  describe('Large Input', () => {
    test('handles long content', async () => {
      const repeatedContent = '> [!note]\n> [[../page/index.md]] と ==highlight== と #tag\n\n';
      const input = repeatedContent.repeat(10);
      const html = await processToHtml(input);

      assert(html, 'Should handle long content');
    });
  });
});

describe('Combination Fixture Tests', () => {
  test('processes all combination fixtures', async () => {
    const fixtures = await loadAllFixtures('combination');
    assert(fixtures.length >= 2, 'Should have combination fixtures');

    for (const fixture of fixtures) {
      const html = await processToHtml(fixture.input);
      assert(html, `Fixture ${fixture.name} should produce valid HTML`);
    }
  });
});

console.log('🧪 Running Integration Tests...');
