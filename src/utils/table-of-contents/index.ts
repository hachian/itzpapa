/**
 * 目次関連のユーティリティ関数
 */

export interface Heading {
  depth: number;
  text: string;
  slug: string;
}

/**
 * テキストからスラッグを生成
 * @param text - 見出しテキスト
 * @returns URL safe なスラッグ
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // 日本語文字はそのまま残す
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    // スペースをハイフンに変換
    .replace(/\s+/g, '-')
    // 連続するハイフンを1つに
    .replace(/-+/g, '-')
    // 先頭と末尾のハイフンを削除
    .replace(/^-+|-+$/g, '');
}

/**
 * 見出し要素の検証とフィルタリング
 * @param headings - 見出しのリスト
 * @returns 有効な見出しのみのリスト
 */
export function validateHeadings(headings: Heading[]): Heading[] {
  return headings.filter(heading => {
    // EDGE-002: 無効なHTML構造の見出しのフィルタリング
    if (!heading.text || heading.text.trim() === '') {
      return false;
    }

    // depth が 2 または 3 の見出しのみを対象とする
    if (heading.depth !== 2 && heading.depth !== 3) {
      return false;
    }

    return true;
  });
}

/**
 * 見出しにIDが存在しない場合は生成する
 * @param headings - 見出しのリスト
 * @returns IDが確実に存在する見出しのリスト
 */
export function ensureHeadingIds(headings: Heading[]): Heading[] {
  const usedIds = new Set<string>();

  return headings.map(heading => {
    let slug = heading.slug;

    // slugが存在しない場合は生成
    if (!slug) {
      slug = generateSlug(heading.text);
    }

    // 重複するIDの場合は番号を付与
    let uniqueSlug = slug;
    let counter = 1;
    while (usedIds.has(uniqueSlug)) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    usedIds.add(uniqueSlug);

    return {
      ...heading,
      slug: uniqueSlug
    };
  });
}

/**
 * 目次用の見出しリストを準備
 * @param headings - 元の見出しリスト
 * @returns 目次表示用に処理された見出しリスト
 */
export function prepareTocHeadings(headings: Heading[]): Heading[] {
  // 1. 検証とフィルタリング
  const validHeadings = validateHeadings(headings);

  // 2. IDの確認と生成
  const headingsWithIds = ensureHeadingIds(validHeadings);

  // 3. EDGE-003: 空の見出しテキストへの対応
  const processedHeadings = headingsWithIds.map(heading => ({
    ...heading,
    text: heading.text || '無題のセクション'
  }));

  return processedHeadings;
}