/**
 * stripMarkdown ユニットテスト
 * Markdown記法を除去してプレーンテキストを抽出する機能のテスト
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { stripMarkdown } from '../../src/utils/search/strip-markdown.js';

describe('stripMarkdown', () => {
  describe('standard markdown syntax', () => {
    it('should remove headings', () => {
      const input = '# Heading 1\n## Heading 2\n### Heading 3';
      const result = stripMarkdown(input);
      assert.strictEqual(result, 'Heading 1 Heading 2 Heading 3');
    });

    it('should remove bold and italic markers', () => {
      const input = '**bold** and *italic* and __underline__ and _emphasis_';
      const result = stripMarkdown(input);
      assert.strictEqual(result, 'bold and italic and underline and emphasis');
    });

    it('should remove links but keep text', () => {
      const input = 'Check [this link](https://example.com) for more';
      const result = stripMarkdown(input);
      assert.strictEqual(result, 'Check this link for more');
    });

    it('should remove images', () => {
      const input = 'Text before ![alt text](image.png) text after';
      const result = stripMarkdown(input);
      assert.strictEqual(result, 'Text before text after');
    });

    it('should remove code blocks', () => {
      const input = 'Before\n```javascript\nconst x = 1;\n```\nAfter';
      const result = stripMarkdown(input);
      assert.strictEqual(result, 'Before After');
    });

    it('should remove inline code', () => {
      const input = 'Use `console.log()` for debugging';
      const result = stripMarkdown(input);
      assert.strictEqual(result, 'Use console.log() for debugging');
    });

    it('should remove blockquotes', () => {
      const input = '> This is a quote\n> continued';
      const result = stripMarkdown(input);
      assert.strictEqual(result, 'This is a quote continued');
    });

    it('should remove horizontal rules', () => {
      const input = 'Before\n---\nAfter';
      const result = stripMarkdown(input);
      assert.strictEqual(result, 'Before After');
    });

    it('should remove list markers', () => {
      const input = '- Item 1\n- Item 2\n1. Numbered\n2. List';
      const result = stripMarkdown(input);
      assert.strictEqual(result, 'Item 1 Item 2 Numbered List');
    });
  });

  describe('Obsidian specific syntax', () => {
    it('should remove WikiLinks but keep text', () => {
      const input = 'Check [[Page Name]] and [[Page|Alias]]';
      const result = stripMarkdown(input);
      assert.strictEqual(result, 'Check Page Name and Alias');
    });

    it('should remove Callout syntax', () => {
      const input = '> [!note] Title\n> Callout content';
      const result = stripMarkdown(input);
      assert.strictEqual(result, 'Title Callout content');
    });

    it('should remove mark highlight', () => {
      const input = 'This is ==highlighted== text';
      const result = stripMarkdown(input);
      assert.strictEqual(result, 'This is highlighted text');
    });

    it('should remove image wikilinks', () => {
      const input = 'Text ![[image.png]] more text';
      const result = stripMarkdown(input);
      assert.strictEqual(result, 'Text more text');
    });
  });

  describe('edge cases', () => {
    it('should handle empty string', () => {
      assert.strictEqual(stripMarkdown(''), '');
    });

    it('should normalize whitespace', () => {
      const input = 'Text   with   multiple   spaces\n\n\nand newlines';
      const result = stripMarkdown(input);
      assert.strictEqual(result, 'Text with multiple spaces and newlines');
    });

    it('should handle mixed content', () => {
      const input = '# Title\n\nSome **bold** text with [[WikiLink]] and `code`.';
      const result = stripMarkdown(input);
      assert.strictEqual(result, 'Title Some bold text with WikiLink and code.');
    });
  });
});
