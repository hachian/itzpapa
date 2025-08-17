/**
 * インラインタグ処理ユーティリティ
 * 本文中の #タグ を自動的にリンク化する
 */

export interface InlineTagResult {
  /** 抽出されたタグ名の配列 */
  tags: string[];
  /** リンク化されたHTML */
  html: string;
}

/**
 * インラインタグの正規表現パターン
 * Obsidian形式のタグ (#タグ, #親/子/孫) にマッチ
 */
const INLINE_TAG_PATTERN = /#([a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF][a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF/_-]*)/g;

/**
 * タグ名をURLスラッグに変換
 */
export function generateTagUrl(tagName: string): string {
  // 階層区切りをハイフンに変換
  const slug = tagName.replace(/\//g, '-');
  
  // URLエンコード
  const encoded = encodeURIComponent(slug);
  
  return `/tags/${encoded}`;
}

/**
 * マークダウンテキスト内のインラインタグを抽出してリンク化
 */
export function processInlineTags(markdown: string, baseUrl: string = '/tags/'): InlineTagResult {
  const tags: string[] = [];
  const tagSet = new Set<string>(); // 重複排除用
  
  // タグを抽出してリンクに置換
  const html = markdown.replace(INLINE_TAG_PATTERN, (match, tagName) => {
    // タグ名のバリデーション
    if (!isValidTagName(tagName)) {
      return match; // 無効なタグはそのまま残す
    }
    
    // 重複チェック
    if (!tagSet.has(tagName)) {
      tagSet.add(tagName);
      tags.push(tagName);
    }
    
    // リンクHTML生成
    const url = generateTagUrl(tagName);
    const ariaLabel = `${tagName}タグの記事を表示`;
    
    return `<a href="${url}" class="inline-tag" aria-label="${ariaLabel}" role="link">#${escapeHtml(tagName)}</a>`;
  });
  
  return { tags, html };
}

/**
 * タグ名のバリデーション
 */
function isValidTagName(tagName: string): boolean {
  // 空文字チェック
  if (!tagName || tagName.trim() === '') {
    return false;
  }
  
  // 数字のみは無効
  if (/^\d+$/.test(tagName)) {
    return false;
  }
  
  // ハイフンで始まるのは無効
  if (tagName.startsWith('-')) {
    return false;
  }
  
  // 連続するスラッシュは無効
  if (tagName.includes('//')) {
    return false;
  }
  
  return true;
}

/**
 * HTMLエスケープ（サーバーサイド対応）
 */
function escapeHtml(text: string): string {
  // サーバーサイドでは常にマニュアルエスケープ
  if (typeof document === 'undefined') {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  
  // ブラウザサイドではDOM APIを使用
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * remarkプラグイン用のインラインタグ処理
 */
export function remarkInlineTags() {
  return function transformer(tree: any) {
    // ASTを走査してテキストノードを処理
    function visit(node: any) {
      if (node.type === 'text') {
        // テキストノード内のタグを処理
        const result = processInlineTags(node.value);
        if (result.tags.length > 0) {
          // HTMLノードに変換
          node.type = 'html';
          node.value = result.html;
        }
      }
      
      if (node.children) {
        node.children.forEach(visit);
      }
    }
    
    visit(tree);
  };
}