import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  generateSlug,
  validateHeadings,
  ensureHeadingIds,
  prepareTocHeadings
} from '../../src/utils/table-of-contents/index.ts';

describe('Table of Contents Utils', () => {
  describe('generateSlug', () => {
    it('converts basic Latin text to kebab-case', () => {
      assert.strictEqual(generateSlug('Hello World'), 'hello-world');
      assert.strictEqual(generateSlug('This is a Test'), 'this-is-a-test');
    });

    it('preserves Japanese characters', () => {
      assert.strictEqual(generateSlug('こんにちは 世界'), 'こんにちは-世界');
      assert.strictEqual(generateSlug('目次 テスト'), '目次-テスト');
    });

    it('removes special characters', () => {
      assert.strictEqual(generateSlug('Hello! @World#'), 'hello-world');
      assert.strictEqual(generateSlug('Foo & Bar'), 'foo-bar');
      assert.strictEqual(generateSlug('100% Correct'), '100-correct');
    });

    it('handles whitespace', () => {
      assert.strictEqual(generateSlug('  Trim Me  '), 'trim-me');
      assert.strictEqual(generateSlug('Multiple   Spaces'), 'multiple-spaces');
      assert.strictEqual(generateSlug('Tab\tCharacter'), 'tab-character');
    });

    it('handles hyphens', () => {
      assert.strictEqual(generateSlug('foo-bar'), 'foo-bar');
      assert.strictEqual(generateSlug('foo--bar'), 'foo-bar'); // Deduplicate
      assert.strictEqual(generateSlug('-foo-bar-'), 'foo-bar'); // Remove leading/trailing
    });

    it('handles edge cases', () => {
      assert.strictEqual(generateSlug(''), '');
      assert.strictEqual(generateSlug('!@#$%'), '');
      assert.strictEqual(generateSlug('   '), '');
    });
  });

  describe('validateHeadings', () => {
    it('filters out headings with empty text', () => {
      const headings = [
        { depth: 2, text: 'Valid', slug: 'valid' },
        { depth: 2, text: '', slug: 'empty' },
        { depth: 2, text: '   ', slug: 'whitespace' }
      ];
      const result = validateHeadings(headings);
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].text, 'Valid');
    });

    it('filters out invalid depths', () => {
      const headings = [
        { depth: 1, text: 'H1', slug: 'h1' },
        { depth: 2, text: 'H2', slug: 'h2' },
        { depth: 3, text: 'H3', slug: 'h3' },
        { depth: 4, text: 'H4', slug: 'h4' }
      ];
      const result = validateHeadings(headings);
      assert.strictEqual(result.length, 2);
      assert.ok(result.find(h => h.depth === 2));
      assert.ok(result.find(h => h.depth === 3));
    });

    it('keeps valid headings', () => {
      const headings = [
        { depth: 2, text: 'Section 1', slug: 'section-1' },
        { depth: 3, text: 'Subsection 1.1', slug: 'subsection-1-1' }
      ];
      const result = validateHeadings(headings);
      assert.strictEqual(result.length, 2);
    });
  });

  describe('ensureHeadingIds', () => {
    it('generates slug if missing', () => {
      const headings = [
        { depth: 2, text: 'New Section', slug: '' }
      ];
      const result = ensureHeadingIds(headings);
      assert.strictEqual(result[0].slug, 'new-section');
    });

    it('preserves existing slug', () => {
      const headings = [
        { depth: 2, text: 'New Section', slug: 'custom-slug' }
      ];
      const result = ensureHeadingIds(headings);
      assert.strictEqual(result[0].slug, 'custom-slug');
    });

    it('handles duplicates by appending counter', () => {
      const headings = [
        { depth: 2, text: 'Duplicate', slug: 'duplicate' },
        { depth: 2, text: 'Duplicate', slug: 'duplicate' },
        { depth: 2, text: 'Duplicate', slug: 'duplicate' }
      ];
      const result = ensureHeadingIds(headings);
      assert.strictEqual(result[0].slug, 'duplicate');
      assert.strictEqual(result[1].slug, 'duplicate-1');
      assert.strictEqual(result[2].slug, 'duplicate-2');
    });

    it('handles generated duplicates', () => {
      const headings = [
        { depth: 2, text: 'Same Text', slug: '' },
        { depth: 2, text: 'Same Text', slug: '' }
      ];
      const result = ensureHeadingIds(headings);
      assert.strictEqual(result[0].slug, 'same-text');
      assert.strictEqual(result[1].slug, 'same-text-1');
    });
  });

  describe('prepareTocHeadings', () => {
    it('processes headings through validation and ID generation', () => {
      const input = [
        { depth: 1, text: 'Title', slug: '' }, // Should be filtered (depth 1)
        { depth: 2, text: 'Section', slug: '' }, // Should get slug 'section'
        { depth: 2, text: '', slug: '' }, // Should be filtered (empty text)
        { depth: 3, text: 'Subsection', slug: 'custom-sub' }, // Should keep 'custom-sub'
        { depth: 2, text: 'Section', slug: '' } // Should get slug 'section-1'
      ];

      const result = prepareTocHeadings(input);

      assert.strictEqual(result.length, 3);

      assert.strictEqual(result[0].text, 'Section');
      assert.strictEqual(result[0].slug, 'section');
      assert.strictEqual(result[0].depth, 2);

      assert.strictEqual(result[1].text, 'Subsection');
      assert.strictEqual(result[1].slug, 'custom-sub');
      assert.strictEqual(result[1].depth, 3);

      assert.strictEqual(result[2].text, 'Section');
      assert.strictEqual(result[2].slug, 'section-1');
      assert.strictEqual(result[2].depth, 2);
    });
  });
});
