/**
 * SearchEngine ユニットテスト
 * クライアントサイド検索ロジックのテスト
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { SearchEngine } from '../../src/utils/search/search-engine.js';

// モックインデックスデータ
const mockIndex = [
  {
    slug: 'post-1',
    title: 'TypeScript入門ガイド',
    body: 'TypeScriptは静的型付けのJavaScriptスーパーセットです。型安全なコードを書くことができます。'
  },
  {
    slug: 'post-2',
    title: 'JavaScriptの基本',
    body: 'JavaScriptは動的型付けのプログラミング言語です。Webブラウザで動作します。'
  },
  {
    slug: 'post-3',
    title: 'AstroでブログをTypeScriptで作る',
    body: 'Astroは静的サイトジェネレーターです。TypeScriptをサポートしています。'
  }
];

describe('SearchEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new SearchEngine();
    engine.setIndex(mockIndex);
  });

  describe('search', () => {
    it('should return empty results for empty query', () => {
      const result = engine.search('');
      assert.strictEqual(result.hits.length, 0);
      assert.strictEqual(result.totalHits, 0);
    });

    it('should return empty results for whitespace-only query', () => {
      const result = engine.search('   ');
      assert.strictEqual(result.hits.length, 0);
    });

    it('should find exact matches in body', () => {
      const result = engine.search('静的型付け');
      assert.strictEqual(result.totalHits, 1);
      assert.strictEqual(result.hits[0].slug, 'post-1');
    });

    it('should find partial matches (case insensitive)', () => {
      const result = engine.search('typescript');
      assert.ok(result.totalHits >= 2);
    });

    it('should find matches in title', () => {
      const result = engine.search('入門ガイド');
      assert.strictEqual(result.totalHits, 1);
      assert.strictEqual(result.hits[0].slug, 'post-1');
    });

    it('should return multiple hits for same article', () => {
      const result = engine.search('TypeScript');
      // post-1のタイトルと本文、post-3のタイトルと本文で複数ヒット
      assert.ok(result.totalHits >= 2);
    });

    it('should include context around match', () => {
      const result = engine.search('静的型付け');
      assert.ok(result.hits[0].context.length > 0);
      assert.ok(result.hits[0].context.includes('静的型付け'));
    });

    it('should track highlight position in context', () => {
      const result = engine.search('TypeScript');
      const hit = result.hits[0];
      assert.ok(hit.highlightStart >= 0);
      assert.ok(hit.highlightEnd > hit.highlightStart);
    });

    it('should store the query in result', () => {
      const result = engine.search('JavaScript');
      assert.strictEqual(result.query, 'JavaScript');
    });
  });

  describe('context extraction', () => {
    it('should extract context of appropriate length', () => {
      const result = engine.search('静的');
      const hit = result.hits[0];
      // コンテキストは長すぎず短すぎない
      assert.ok(hit.context.length >= 10);
      assert.ok(hit.context.length <= 200);
    });

    it('should include title in results', () => {
      const result = engine.search('TypeScript');
      assert.ok(result.hits.every(hit => hit.title && hit.title.length > 0));
    });

    it('should handle edge case at start of text', () => {
      const result = engine.search('TypeScriptは');
      assert.ok(result.totalHits > 0);
    });
  });

  describe('index loading', () => {
    it('should allow setting index directly', () => {
      const newEngine = new SearchEngine();
      newEngine.setIndex(mockIndex);
      const result = newEngine.search('TypeScript');
      assert.ok(result.totalHits > 0);
    });

    it('should return empty results when no index is loaded', () => {
      const emptyEngine = new SearchEngine();
      const result = emptyEngine.search('test');
      assert.strictEqual(result.hits.length, 0);
    });
  });
});
