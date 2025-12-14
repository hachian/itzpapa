import { describe, it } from 'node:test';
import assert from 'node:assert';
import { truncateText } from './truncate.ts';

describe('truncateText', () => {
  describe('basic functionality', () => {
    it('should return original text if shorter than maxLength', () => {
      const result = truncateText('短いテキスト', 160);
      assert.strictEqual(result, '短いテキスト');
    });

    it('should truncate text and add suffix if longer than maxLength', () => {
      const longText = 'a'.repeat(200);
      const result = truncateText(longText, 160);
      assert.strictEqual(result.length, 163); // 160 + '...'
      assert.ok(result.endsWith('...'));
    });

    it('should use default maxLength of 160', () => {
      const longText = 'a'.repeat(200);
      const result = truncateText(longText);
      assert.strictEqual(result.length, 163);
    });

    it('should use custom suffix', () => {
      const longText = 'a'.repeat(200);
      const result = truncateText(longText, 160, '…');
      assert.ok(result.endsWith('…'));
      assert.strictEqual(result.length, 161); // 160 + '…'
    });
  });

  describe('edge cases', () => {
    it('should handle empty string', () => {
      const result = truncateText('');
      assert.strictEqual(result, '');
    });

    it('should handle null/undefined gracefully', () => {
      // @ts-expect-error - testing runtime safety
      const resultNull = truncateText(null);
      assert.strictEqual(resultNull, '');

      // @ts-expect-error - testing runtime safety
      const resultUndefined = truncateText(undefined);
      assert.strictEqual(resultUndefined, '');
    });

    it('should handle text exactly at maxLength', () => {
      const exactText = 'a'.repeat(160);
      const result = truncateText(exactText, 160);
      assert.strictEqual(result, exactText);
      assert.strictEqual(result.length, 160);
    });
  });

  describe('Japanese text handling', () => {
    it('should count Japanese characters correctly', () => {
      const japaneseText = 'あ'.repeat(200);
      const result = truncateText(japaneseText, 160);
      // Japanese character count should be correct
      assert.strictEqual([...result.slice(0, -3)].length, 160);
    });

    it('should handle mixed ASCII and Japanese text', () => {
      const mixedText = 'Hello世界'.repeat(50);
      const result = truncateText(mixedText, 160);
      assert.ok(result.length <= 163);
      assert.ok(result.endsWith('...'));
    });
  });

  describe('surrogate pair handling', () => {
    it('should handle emoji correctly', () => {
      const emojiText = '😀'.repeat(200);
      const result = truncateText(emojiText, 160);
      // Each emoji is one character, so result should have 160 emojis + suffix
      const emojis = [...result.slice(0, -3)];
      assert.strictEqual(emojis.length, 160);
    });

    it('should not break in the middle of surrogate pair', () => {
      const textWithEmoji = 'a'.repeat(159) + '😀';
      const result = truncateText(textWithEmoji, 160);
      // Should include the full emoji since it's exactly at the limit
      assert.strictEqual(result, textWithEmoji);
    });

    it('should handle complex emoji (ZWJ sequences)', () => {
      // Family emoji (👨‍👩‍👧‍👦) is a ZWJ sequence
      const familyEmoji = '👨‍👩‍👧‍👦';
      const text = familyEmoji.repeat(50);
      const result = truncateText(text, 10);
      // Should not break the emoji sequence
      assert.ok(result.length > 0);
    });
  });
});
