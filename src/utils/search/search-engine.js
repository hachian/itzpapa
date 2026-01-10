/**
 * クライアントサイド検索エンジン
 * インデックスを読み込み、部分一致検索を行い、コンテキストを抽出する
 */

/**
 * @typedef {Object} SearchIndexEntry
 * @property {string} slug
 * @property {string} title
 * @property {string} body
 */

/**
 * @typedef {Object} SearchHit
 * @property {string} slug
 * @property {string} title
 * @property {string} context - ヒット箇所の周辺テキスト
 * @property {number} matchIndex - 本文中でのヒット位置
 * @property {number} highlightStart - context内でのハイライト開始位置
 * @property {number} highlightEnd - context内でのハイライト終了位置
 */

/**
 * @typedef {Object} SearchResult
 * @property {string} query
 * @property {SearchHit[]} hits
 * @property {number} totalHits
 */

/** コンテキスト抽出の前後文字数 */
const CONTEXT_RADIUS = 50;

/**
 * 検索エンジンクラス
 */
export class SearchEngine {
  constructor() {
    /** @type {SearchIndexEntry[]|null} */
    this.index = null;
    /** @type {boolean} */
    this.indexLoaded = false;
  }

  /**
   * インデックスを設定
   * @param {SearchIndexEntry[]} index
   */
  setIndex(index) {
    this.index = index;
    this.indexLoaded = true;
  }

  /**
   * インデックスをフェッチ
   * @param {string} url - インデックスJSONのURL
   * @returns {Promise<void>}
   */
  async loadIndex(url = '/search-index.json') {
    if (this.indexLoaded) return;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch index: ${response.status}`);
      }
      this.index = await response.json();
      this.indexLoaded = true;
    } catch (error) {
      console.error('Failed to load search index:', error);
      throw error;
    }
  }

  /**
   * 検索を実行
   * @param {string} query - 検索クエリ
   * @returns {SearchResult}
   */
  search(query) {
    const result = {
      query,
      hits: [],
      totalHits: 0
    };

    // 空クエリは即座に空結果を返す
    if (!query || !query.trim()) {
      return result;
    }

    // インデックスがない場合は空結果
    if (!this.index || this.index.length === 0) {
      return result;
    }

    const normalizedQuery = query.trim();
    const queryLower = normalizedQuery.toLowerCase();

    // 各記事を検索
    for (const entry of this.index) {
      // タイトルと本文を検索対象に
      const searchTargets = [
        { text: entry.title, isTitle: true },
        { text: entry.body, isTitle: false }
      ];

      for (const { text, isTitle } of searchTargets) {
        if (!text) continue;

        const textLower = text.toLowerCase();
        let searchStart = 0;

        // 同一テキスト内の複数ヒットを検出
        while (searchStart < textLower.length) {
          const matchIndex = textLower.indexOf(queryLower, searchStart);
          if (matchIndex === -1) break;

          // コンテキスト抽出
          const { context, highlightStart, highlightEnd } = this.extractContext(
            text,
            matchIndex,
            normalizedQuery.length
          );

          result.hits.push({
            slug: entry.slug,
            title: entry.title,
            context,
            matchIndex,
            highlightStart,
            highlightEnd,
            isTitle
          });

          // 次の検索開始位置を更新（オーバーラップを避ける）
          searchStart = matchIndex + normalizedQuery.length;
        }
      }
    }

    result.totalHits = result.hits.length;
    return result;
  }

  /**
   * ヒット箇所の周辺コンテキストを抽出
   * @param {string} text - 対象テキスト
   * @param {number} matchIndex - マッチ位置
   * @param {number} queryLength - クエリの長さ
   * @returns {{ context: string, highlightStart: number, highlightEnd: number }}
   */
  extractContext(text, matchIndex, queryLength) {
    // コンテキストの開始・終了位置を計算
    let contextStart = Math.max(0, matchIndex - CONTEXT_RADIUS);
    let contextEnd = Math.min(text.length, matchIndex + queryLength + CONTEXT_RADIUS);

    // 単語境界で区切る（可能な場合）
    if (contextStart > 0) {
      const spaceIndex = text.indexOf(' ', contextStart);
      if (spaceIndex !== -1 && spaceIndex < matchIndex) {
        contextStart = spaceIndex + 1;
      }
    }

    if (contextEnd < text.length) {
      const spaceIndex = text.lastIndexOf(' ', contextEnd);
      if (spaceIndex !== -1 && spaceIndex > matchIndex + queryLength) {
        contextEnd = spaceIndex;
      }
    }

    const context = text.slice(contextStart, contextEnd);

    // context内でのハイライト位置を計算
    const highlightStart = matchIndex - contextStart;
    const highlightEnd = highlightStart + queryLength;

    // 先頭・末尾に省略記号を追加
    let finalContext = context;
    let adjustedHighlightStart = highlightStart;
    let adjustedHighlightEnd = highlightEnd;

    if (contextStart > 0) {
      finalContext = '...' + finalContext;
      adjustedHighlightStart += 3;
      adjustedHighlightEnd += 3;
    }

    if (contextEnd < text.length) {
      finalContext = finalContext + '...';
    }

    return {
      context: finalContext,
      highlightStart: adjustedHighlightStart,
      highlightEnd: adjustedHighlightEnd
    };
  }
}

export default SearchEngine;
