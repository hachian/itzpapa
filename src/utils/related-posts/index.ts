/**
 * 関連記事取得ユーティリティ
 * タグベースで関連記事をスコアリングして取得する
 */
import type { CollectionEntry } from 'astro:content';

/**
 * 関連記事の型定義
 */
export interface RelatedPost {
  /** 記事ID（slug） */
  id: string;
  /** 記事データ */
  data: CollectionEntry<'blog'>['data'];
  /** 関連スコア（共通タグ数） */
  score: number;
}

/**
 * getRelatedPosts のオプション
 */
export interface GetRelatedPostsOptions {
  /** 現在の記事ID */
  currentPostId: string;
  /** 現在の記事のタグ */
  currentTags: string[];
  /** 現在の記事のカテゴリ */
  currentCategory?: string;
  /** 全記事リスト */
  allPosts: CollectionEntry<'blog'>[];
  /** 取得する最大件数（デフォルト: 6） */
  limit?: number;
}

/**
 * 関連記事を取得する
 *
 * タグの共通性に基づいてスコアを計算し、関連性の高い記事を返す。
 * 同スコアの場合は公開日の新しい順でソートする。
 *
 * @param options - 取得オプション
 * @returns スコア順にソートされた関連記事リスト
 */
export function getRelatedPosts(options: GetRelatedPostsOptions): RelatedPost[] {
  const { currentPostId, currentTags, currentCategory, allPosts, limit = 6 } = options;

  // 現在の記事のタグが空の場合は空配列を返す
  if (!currentTags || currentTags.length === 0) {
    return [];
  }

  // YYYYMMDD-プレフィックスを除去するヘルパー
  const removeDatePrefix = (id: string): string => id.replace(/^\d{8}-/, '');

  // 現在のタグをSetに変換（高速な検索のため）
  const currentTagSet = new Set(currentTags);

  // 関連記事を計算
  const relatedPosts: RelatedPost[] = [];

  for (const post of allPosts) {
    // 現在の記事自身を除外（日付プレフィックスを除去して比較）
    if (removeDatePrefix(post.id) === currentPostId) {
      continue;
    }

    // draft記事を除外
    if (post.data.draft === true) {
      continue;
    }

    // タグが設定されていない記事を除外
    const postTags = post.data.tags;
    if (!postTags || postTags.length === 0) {
      continue;
    }

    // 共通タグ数をスコアとして計算
    let score = 0;
    for (const tag of postTags) {
      if (currentTagSet.has(tag)) {
        score++;
      }
    }

    // 同じカテゴリなら+1ポイント
    if (currentCategory && post.data.category === currentCategory) {
      score += 1;
    }

    // 共通タグが0の記事を除外
    if (score > 0) {
      relatedPosts.push({
        id: post.id,
        data: post.data,
        score,
      });
    }
  }

  // ソート: スコア降順、同スコアは更新日（なければ公開日）降順
  relatedPosts.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // 同スコアの場合は更新日の新しい順（更新日がなければ公開日）
    const aDate = (a.data.updated || a.data.published).getTime();
    const bDate = (b.data.updated || b.data.published).getTime();
    return bDate - aDate;
  });

  // 件数制限
  return relatedPosts.slice(0, limit);
}
