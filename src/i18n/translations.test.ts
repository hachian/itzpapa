import { describe, it } from 'node:test';
import assert from 'node:assert';
import { translations } from './translations.ts';

describe('translations', () => {
  describe('breadcrumb keys', () => {
    it('should have breadcrumb.tags key in Japanese', () => {
      assert.ok('breadcrumb.tags' in translations.ja);
      assert.strictEqual(translations.ja['breadcrumb.tags'], 'タグ');
    });

    it('should have breadcrumb.tags key in English', () => {
      assert.ok('breadcrumb.tags' in translations.en);
      assert.strictEqual(translations.en['breadcrumb.tags'], 'Tags');
    });

    it('should have all required breadcrumb keys', () => {
      const requiredKeys = [
        'breadcrumb.ariaLabel',
        'breadcrumb.home',
        'breadcrumb.blog',
        'breadcrumb.tags',
      ];

      for (const key of requiredKeys) {
        assert.ok(key in translations.ja, `Missing key in ja: ${key}`);
        assert.ok(key in translations.en, `Missing key in en: ${key}`);
      }
    });
  });
});
