/**
 * HTML Validator Unit Tests
 *
 * Tests the HTML validator utility functions
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import {
  parseHtml,
  validateCallouts,
  validateWikilinks,
  validateHighlights,
  validateTags,
  validateHtmlStructure,
  validateAccessibility,
  assertHtmlContains,
} from './utils/html-validator.js';

describe('HTML Validator', () => {
  describe('parseHtml', () => {
    test('parses valid HTML', () => {
      const $ = parseHtml('<div>Hello</div>');
      assert.strictEqual($('div').text(), 'Hello');
    });

    test('parses complex HTML', () => {
      const html = `
        <html>
          <head><title>Test</title></head>
          <body><main><p>Content</p></main></body>
        </html>
      `;
      const $ = parseHtml(html);
      assert.strictEqual($('title').text(), 'Test');
      assert.strictEqual($('p').text(), 'Content');
    });
  });

  describe('validateCallouts', () => {
    test('detects callout structure', () => {
      const html = `
        <div class="callout callout-note" data-callout="note">
          <div class="callout-title">
            <div class="callout-icon">📝</div>
            <div class="callout-title-inner">Note Title</div>
          </div>
          <div class="callout-content">Content here</div>
        </div>
      `;
      const $ = parseHtml(html);
      const result = validateCallouts($);

      assert.strictEqual(result.count, 1);
      assert.strictEqual(result.callouts[0].type, 'note');
      assert.strictEqual(result.callouts[0].foldable, null);
      assert.strictEqual(result.callouts[0].title, 'Note Title');
      assert(result.callouts[0].hasIcon);
    });

    test('handles foldable callouts with details element', () => {
      const html = `
        <details class="callout callout-note" data-callout="note">
          <summary class="callout-title">
            <div class="callout-icon">📝</div>
            <div class="callout-title-inner">Foldable Note</div>
          </summary>
          <div class="callout-content">Content here</div>
        </details>
      `;
      const $ = parseHtml(html);
      const result = validateCallouts($);

      assert.strictEqual(result.count, 1);
      assert.strictEqual(result.callouts[0].type, 'note');
      assert.strictEqual(result.callouts[0].foldable, 'open');
      assert.strictEqual(result.callouts[0].title, 'Foldable Note');
    });

    test('handles multiple callouts', () => {
      const html = `
        <div data-callout="note">
          <div class="callout-title">
            <div class="callout-icon">📝</div>
            <div class="callout-title-inner">Note</div>
          </div>
          <div class="callout-content">First</div>
        </div>
        <div data-callout="warning">
          <div class="callout-title">
            <div class="callout-icon">⚠️</div>
            <div class="callout-title-inner">Warning</div>
          </div>
          <div class="callout-content">Second</div>
        </div>
      `;
      const $ = parseHtml(html);
      const result = validateCallouts($);

      assert.strictEqual(result.count, 2);
      assert.strictEqual(result.callouts[0].type, 'note');
      assert.strictEqual(result.callouts[1].type, 'warning');
    });

    test('returns empty for no callouts', () => {
      const $ = parseHtml('<p>No callouts here</p>');
      const result = validateCallouts($);

      assert.strictEqual(result.count, 0);
      assert.deepStrictEqual(result.callouts, []);
    });
  });

  describe('validateWikilinks', () => {
    test('detects internal blog links', () => {
      const html = `
        <p>Check <a href="/blog/my-post/" class="wikilink">My Post</a> for details.</p>
      `;
      const $ = parseHtml(html);
      const result = validateWikilinks($);

      assert.strictEqual(result.count, 1);
      assert.strictEqual(result.links[0].href, '/blog/my-post/');
      assert.strictEqual(result.links[0].text, 'My Post');
    });

    test('handles multiple wikilinks', () => {
      const html = `
        <p>
          See <a href="/blog/first/">First</a> and
          <a href="/blog/second/">Second</a>.
        </p>
      `;
      const $ = parseHtml(html);
      const result = validateWikilinks($);

      assert.strictEqual(result.count, 2);
    });

    test('ignores external links', () => {
      const html = `
        <p><a href="https://example.com">External</a></p>
      `;
      const $ = parseHtml(html);
      const result = validateWikilinks($);

      assert.strictEqual(result.count, 0);
    });
  });

  describe('validateHighlights', () => {
    test('detects mark elements', () => {
      const html = `<p>This is <mark>highlighted</mark> text.</p>`;
      const $ = parseHtml(html);
      const result = validateHighlights($);

      assert.strictEqual(result.count, 1);
      assert.strictEqual(result.highlights[0].text, 'highlighted');
    });

    test('handles multiple highlights', () => {
      const html = `
        <p>
          <mark>First</mark> and <mark>Second</mark> highlights.
        </p>
      `;
      const $ = parseHtml(html);
      const result = validateHighlights($);

      assert.strictEqual(result.count, 2);
    });

    test('captures mark with class', () => {
      const html = `<mark class="custom-highlight">Text</mark>`;
      const $ = parseHtml(html);
      const result = validateHighlights($);

      assert.strictEqual(result.highlights[0].className, 'custom-highlight');
    });
  });

  describe('validateTags', () => {
    test('detects tag links', () => {
      const html = `<a href="/tags/programming/" class="tag">programming</a>`;
      const $ = parseHtml(html);
      const result = validateTags($);

      assert.strictEqual(result.count, 1);
      assert.strictEqual(result.tags[0].tagName, 'programming');
    });

    test('handles multiple tags', () => {
      const html = `
        <p>
          <a href="/tags/javascript/">JavaScript</a>
          <a href="/tags/typescript/">TypeScript</a>
        </p>
      `;
      const $ = parseHtml(html);
      const result = validateTags($);

      assert.strictEqual(result.count, 2);
    });

    test('handles Japanese tag names', () => {
      const html = `<a href="/tags/日本語/">日本語タグ</a>`;
      const $ = parseHtml(html);
      const result = validateTags($);

      assert.strictEqual(result.tags[0].tagName, '日本語');
    });
  });

  describe('validateHtmlStructure', () => {
    test('validates complete HTML document', () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Test Page</title>
          </head>
          <body>
            <main>Content</main>
          </body>
        </html>
      `;
      const $ = parseHtml(html);
      const result = validateHtmlStructure($);

      assert(result.hasDoctype);
      assert(result.hasHtmlTag);
      assert(result.hasHead);
      assert(result.hasBody);
      assert(result.hasTitle);
      assert(result.hasMeta);
      assert(result.hasMain);
    });

    test('detects missing elements', () => {
      const html = `<div>Incomplete HTML</div>`;
      const $ = parseHtml(html);
      const result = validateHtmlStructure($);

      assert(!result.hasDoctype);
      assert(!result.hasTitle);
      assert(!result.hasMain);
    });
  });

  describe('validateAccessibility', () => {
    test('checks image alt attributes', () => {
      const html = `
        <img src="a.jpg" alt="Description">
        <img src="b.jpg">
      `;
      const $ = parseHtml(html);
      const result = validateAccessibility($);

      assert.strictEqual(result.images.total, 2);
      assert.strictEqual(result.images.withAlt, 1);
      assert.strictEqual(result.images.missingAlt, 1);
    });

    test('checks link text', () => {
      const html = `
        <a href="/a">Link Text</a>
        <a href="/b" aria-label="Hidden">
          <img src="icon.png">
        </a>
        <a href="/c"></a>
      `;
      const $ = parseHtml(html);
      const result = validateAccessibility($);

      assert.strictEqual(result.links.total, 3);
      assert.strictEqual(result.links.withText, 2);
      assert.strictEqual(result.links.emptyLinks, 1);
    });

    test('counts headings', () => {
      const html = `
        <h1>Title</h1>
        <h2>Section 1</h2>
        <h3>Subsection</h3>
        <h2>Section 2</h2>
      `;
      const $ = parseHtml(html);
      const result = validateAccessibility($);

      assert.strictEqual(result.headings.total, 4);
      assert.strictEqual(result.headings.h1Count, 1);
    });
  });

  describe('assertHtmlContains', () => {
    test('validates callout types', () => {
      const html = `
        <div data-callout="note">
          <div class="callout-title">
            <div class="callout-icon">📝</div>
            <div class="callout-title-inner">Note</div>
          </div>
          <div class="callout-content">Content</div>
        </div>
        <div data-callout="warning">
          <div class="callout-title">
            <div class="callout-icon">⚠️</div>
            <div class="callout-title-inner">Warning</div>
          </div>
          <div class="callout-content">Content</div>
        </div>
      `;
      const $ = parseHtml(html);

      const result = assertHtmlContains($, {
        calloutTypes: ['note', 'warning'],
      });

      assert(result.passed);
      assert(result.details.calloutTypes);
    });

    test('validates link hrefs', () => {
      const html = `
        <a href="/blog/post-1/">Post 1</a>
        <a href="/blog/post-2/">Post 2</a>
      `;
      const $ = parseHtml(html);

      const result = assertHtmlContains($, {
        linkHrefs: ['/blog/post-1/', '/blog/post-2/'],
      });

      assert(result.passed);
    });

    test('validates highlight texts', () => {
      const html = `<p><mark>important</mark> and <mark>critical</mark></p>`;
      const $ = parseHtml(html);

      const result = assertHtmlContains($, {
        highlightTexts: ['important', 'critical'],
      });

      assert(result.passed);
    });

    test('validates selectors', () => {
      const html = `
        <main class="content">
          <article>
            <h1>Title</h1>
          </article>
        </main>
      `;
      const $ = parseHtml(html);

      const result = assertHtmlContains($, {
        selectors: ['main.content', 'article', 'h1'],
      });

      assert(result.passed);
    });

    test('fails on missing elements', () => {
      const $ = parseHtml('<p>Simple text</p>');

      const result = assertHtmlContains($, {
        calloutTypes: ['note'],
        selectors: ['article'],
      });

      assert(!result.passed);
      assert(!result.details.calloutTypes);
      assert(!result.details.selectors);
    });
  });
});

console.log('🧪 Running HTML Validator Tests...');
