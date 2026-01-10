import { describe, it } from 'node:test';
import assert from 'node:assert';
import { translations } from './translations.ts';

describe('translations', () => {
  describe('search keys', () => {
    const searchKeys = [
      'search.title',
      'search.placeholder',
      'search.button',
      'search.noResults',
      'search.resultsCount',
      'search.enterQuery',
      'search.error',
      'breadcrumb.search',
    ];

    it('should have all search keys in Japanese', () => {
      for (const key of searchKeys) {
        assert.ok(key in translations.ja, `Missing key in ja: ${key}`);
        assert.ok(translations.ja[key as keyof typeof translations.ja], `Empty value in ja: ${key}`);
      }
    });

    it('should have all search keys in English', () => {
      for (const key of searchKeys) {
        assert.ok(key in translations.en, `Missing key in en: ${key}`);
        assert.ok(translations.en[key as keyof typeof translations.en], `Empty value in en: ${key}`);
      }
    });

    it('should have correct Japanese search translations', () => {
      assert.strictEqual(translations.ja['search.title'], '検索');
      assert.strictEqual(translations.ja['search.noResults'], '検索結果が見つかりませんでした');
      assert.strictEqual(translations.ja['breadcrumb.search'], '検索');
    });

    it('should have correct English search translations', () => {
      assert.strictEqual(translations.en['search.title'], 'Search');
      assert.strictEqual(translations.en['search.noResults'], 'No results found');
      assert.strictEqual(translations.en['breadcrumb.search'], 'Search');
    });
  });

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
