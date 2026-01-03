/**
 * 関連記事取得ユーティリティのテスト
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { getRelatedPosts } from './index.js';
import type { CollectionEntry } from 'astro:content';

// テスト用のモックデータ型
type MockPost = {
  id: string;
  data: {
    title: string;
    published: Date;
    tags?: string[];
    description?: string;
    draft?: boolean;
  };
};

// テスト用のモック記事を作成するヘルパー
function createMockPost(
  id: string,
  title: string,
  published: Date,
  tags: string[] = []
): MockPost {
  return {
    id,
    data: {
      title,
      published,
      tags,
      description: `Description for ${title}`,
    },
  };
}

describe('getRelatedPosts', () => {
  let allPosts: MockPost[];

  beforeEach(() => {
    // テスト用の記事セットを初期化
    allPosts = [
      createMockPost('post-1', 'Post 1', new Date('2024-01-01'), ['javascript', 'react']),
      createMockPost('post-2', 'Post 2', new Date('2024-01-02'), ['javascript', 'vue']),
      createMockPost('post-3', 'Post 3', new Date('2024-01-03'), ['typescript', 'react']),
      createMockPost('post-4', 'Post 4', new Date('2024-01-04'), ['python', 'django']),
      createMockPost('post-5', 'Post 5', new Date('2024-01-05'), ['javascript', 'react', 'typescript']),
      createMockPost('post-6', 'Post 6', new Date('2024-01-06'), []), // タグなし
      createMockPost('post-7', 'Post 7', new Date('2024-01-07'), ['react']),
    ];
  });

  describe('スコアリングロジック', () => {
    it('共通タグ数でスコアを計算する', () => {
      const result = getRelatedPosts({
        currentPostId: 'post-1',
        currentTags: ['javascript', 'react'],
        allPosts: allPosts as unknown as CollectionEntry<'blog'>[],
      });

      // post-5 は javascript, react, typescript → 共通2つ (スコア2)
      // post-2 は javascript, vue → 共通1つ (スコア1)
      // post-3 は typescript, react → 共通1つ (スコア1)
      // post-7 は react → 共通1つ (スコア1)
      assert.strictEqual(result[0].id, 'post-5');
      assert.strictEqual(result[0].score, 2);
    });

    it('同カテゴリの場合は+1ポイント加算する', () => {
      const postsWithCategory = [
        { id: 'post-a', data: { title: 'A', published: new Date('2024-01-01'), tags: ['javascript'], category: 'tech' } },
        { id: 'post-b', data: { title: 'B', published: new Date('2024-01-02'), tags: ['javascript'], category: 'life' } },
        { id: 'post-c', data: { title: 'C', published: new Date('2024-01-03'), tags: ['javascript', 'react'], category: 'tech' } },
      ];

      const result = getRelatedPosts({
        currentPostId: 'post-current',
        currentTags: ['javascript', 'react'],
        currentCategory: 'tech',
        allPosts: postsWithCategory as unknown as CollectionEntry<'blog'>[],
      });

      // post-c: タグ2 + カテゴリ1 = 3
      // post-a: タグ1 + カテゴリ1 = 2
      // post-b: タグ1 + カテゴリ0 = 1
      assert.strictEqual(result[0].id, 'post-c');
      assert.strictEqual(result[0].score, 3);
      assert.strictEqual(result[1].id, 'post-a');
      assert.strictEqual(result[1].score, 2);
      assert.strictEqual(result[2].id, 'post-b');
      assert.strictEqual(result[2].score, 1);
    });

    it('現在の記事自身を結果から除外する', () => {
      const result = getRelatedPosts({
        currentPostId: 'post-1',
        currentTags: ['javascript', 'react'],
        allPosts: allPosts as unknown as CollectionEntry<'blog'>[],
      });

      const ids = result.map((p) => p.id);
      assert.ok(!ids.includes('post-1'));
    });

    it('日付プレフィックス付きIDでも現在の記事自身を除外する', () => {
      // 記事IDがYYYYMMDD-形式のプレフィックスを持つ場合のテスト
      const postsWithDatePrefix: MockPost[] = [
        { id: '20240101-obsidian-demo', data: { title: 'Demo', published: new Date('2024-01-01'), tags: ['javascript', 'react'] } },
        { id: '20240102-other-post', data: { title: 'Other', published: new Date('2024-01-02'), tags: ['javascript'] } },
      ];

      const result = getRelatedPosts({
        currentPostId: 'obsidian-demo', // 日付プレフィックスなしで渡される
        currentTags: ['javascript', 'react'],
        allPosts: postsWithDatePrefix as unknown as CollectionEntry<'blog'>[],
      });

      const ids = result.map((p) => p.id);
      // 20240101-obsidian-demo は現在の記事なので除外される
      assert.ok(!ids.includes('20240101-obsidian-demo'));
      // 他の記事は含まれる
      assert.ok(ids.includes('20240102-other-post'));
    });

    it('共通タグが0の記事を除外する', () => {
      const result = getRelatedPosts({
        currentPostId: 'post-1',
        currentTags: ['javascript', 'react'],
        allPosts: allPosts as unknown as CollectionEntry<'blog'>[],
      });

      const ids = result.map((p) => p.id);
      // post-4 は python, django → 共通0
      assert.ok(!ids.includes('post-4'));
    });

    it('タグが設定されていない記事を除外する', () => {
      const result = getRelatedPosts({
        currentPostId: 'post-1',
        currentTags: ['javascript', 'react'],
        allPosts: allPosts as unknown as CollectionEntry<'blog'>[],
      });

      const ids = result.map((p) => p.id);
      // post-6 はタグなし
      assert.ok(!ids.includes('post-6'));
    });

    it('draft記事を除外する', () => {
      const postsWithDraft: MockPost[] = [
        { id: 'post-a', data: { title: 'A', published: new Date('2024-01-01'), tags: ['javascript'], draft: false } },
        { id: 'post-b', data: { title: 'B', published: new Date('2024-01-02'), tags: ['javascript'], draft: true } },
        { id: 'post-c', data: { title: 'C', published: new Date('2024-01-03'), tags: ['javascript', 'react'] } },
      ];

      const result = getRelatedPosts({
        currentPostId: 'post-current',
        currentTags: ['javascript', 'react'],
        allPosts: postsWithDraft as unknown as CollectionEntry<'blog'>[],
      });

      const ids = result.map((p) => p.id);
      // post-b は draft: true なので除外される
      assert.ok(!ids.includes('post-b'));
      // post-a と post-c は含まれる
      assert.ok(ids.includes('post-a'));
      assert.ok(ids.includes('post-c'));
    });
  });

  describe('ソート順序', () => {
    it('スコアの高い順にソートする', () => {
      const result = getRelatedPosts({
        currentPostId: 'post-1',
        currentTags: ['javascript', 'react'],
        allPosts: allPosts as unknown as CollectionEntry<'blog'>[],
      });

      // スコアが降順であることを確認
      for (let i = 0; i < result.length - 1; i++) {
        assert.ok(result[i].score >= result[i + 1].score);
      }
    });

    it('同スコアの場合は更新日（なければ公開日）の新しい順でソートする', () => {
      // 更新日を持つ記事を追加してテスト
      const postsWithUpdated = [
        ...allPosts,
        {
          id: 'post-updated',
          data: {
            title: 'Updated Post',
            published: new Date('2024-01-01'),
            updated: new Date('2024-06-01'), // 更新日が新しい
            tags: ['javascript'],
          },
        },
      ];

      const result = getRelatedPosts({
        currentPostId: 'post-1',
        currentTags: ['javascript', 'react'],
        allPosts: postsWithUpdated as unknown as CollectionEntry<'blog'>[],
      });

      // 同スコア内で更新日（なければ公開日）が降順であることを確認
      const score1Posts = result.filter((p) => p.score === 1);
      for (let i = 0; i < score1Posts.length - 1; i++) {
        const date1 = (score1Posts[i].data.updated || score1Posts[i].data.published).getTime();
        const date2 = (score1Posts[i + 1].data.updated || score1Posts[i + 1].data.published).getTime();
        assert.ok(date1 >= date2);
      }
    });
  });

  describe('件数制限', () => {
    it('デフォルトで最大6件を返す', () => {
      // より多くの記事を追加
      const manyPosts = [
        ...allPosts,
        createMockPost('post-8', 'Post 8', new Date('2024-01-08'), ['javascript']),
        createMockPost('post-9', 'Post 9', new Date('2024-01-09'), ['javascript']),
        createMockPost('post-10', 'Post 10', new Date('2024-01-10'), ['javascript']),
      ];

      const result = getRelatedPosts({
        currentPostId: 'post-1',
        currentTags: ['javascript', 'react'],
        allPosts: manyPosts as unknown as CollectionEntry<'blog'>[],
      });

      assert.ok(result.length <= 6);
    });

    it('limit パラメータで件数を指定できる', () => {
      const result = getRelatedPosts({
        currentPostId: 'post-1',
        currentTags: ['javascript', 'react'],
        allPosts: allPosts as unknown as CollectionEntry<'blog'>[],
        limit: 2,
      });

      assert.ok(result.length <= 2);
    });
  });

  describe('エッジケース', () => {
    it('現在の記事のタグが空配列の場合、空配列を返す', () => {
      const result = getRelatedPosts({
        currentPostId: 'post-1',
        currentTags: [],
        allPosts: allPosts as unknown as CollectionEntry<'blog'>[],
      });

      assert.strictEqual(result.length, 0);
    });

    it('関連記事が見つからない場合、空配列を返す', () => {
      const result = getRelatedPosts({
        currentPostId: 'post-4',
        currentTags: ['python', 'django'],
        allPosts: allPosts as unknown as CollectionEntry<'blog'>[],
      });

      // post-4 以外に python, django を持つ記事はない
      assert.strictEqual(result.length, 0);
    });

    it('全記事が1件のみの場合、空配列を返す', () => {
      const singlePost = [createMockPost('only-post', 'Only Post', new Date(), ['test'])];

      const result = getRelatedPosts({
        currentPostId: 'only-post',
        currentTags: ['test'],
        allPosts: singlePost as unknown as CollectionEntry<'blog'>[],
      });

      assert.strictEqual(result.length, 0);
    });
  });
});
