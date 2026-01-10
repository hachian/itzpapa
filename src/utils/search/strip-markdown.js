/**
 * Markdown記法を除去してプレーンテキストを抽出
 * Obsidian固有の記法（WikiLink、Callout、ハイライト）にも対応
 */

/**
 * Markdownテキストからプレーンテキストを抽出
 * @param {string} markdown - Markdown形式のテキスト
 * @returns {string} プレーンテキスト
 */
export function stripMarkdown(markdown) {
  if (!markdown) return '';

  let text = markdown;

  // コードブロックを除去（```...``` と ~~~...~~~）
  text = text.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/~~~[\s\S]*?~~~/g, '');

  // インラインコードのコンテンツは保持（バッククォートのみ除去）
  text = text.replace(/`([^`]+)`/g, '$1');

  // 画像WikiLink を除去（![[...]]）
  text = text.replace(/!\[\[([^\]]+)\]\]/g, '');

  // WikiLink: [[Page|Alias]] → Alias, [[Page]] → Page
  text = text.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2');
  text = text.replace(/\[\[([^\]]+)\]\]/g, '$1');

  // 画像を除去（![alt](url)）
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');

  // リンク: [text](url) → text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Callout構文から [!type] を除去してコンテンツを保持
  text = text.replace(/>\s*\[!([^\]]+)\]\s*/g, '');

  // ブロッククォートの > を除去
  text = text.replace(/^>\s*/gm, '');

  // 見出しの # を除去
  text = text.replace(/^#{1,6}\s+/gm, '');

  // 水平線を除去
  text = text.replace(/^[-*_]{3,}\s*$/gm, '');

  // リストマーカーを除去（- * + と番号付き）
  text = text.replace(/^[\s]*[-*+]\s+/gm, '');
  text = text.replace(/^[\s]*\d+\.\s+/gm, '');

  // 強調記法を除去（**bold**, *italic*, __underline__, _emphasis_）
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');
  text = text.replace(/_([^_]+)_/g, '$1');

  // ハイライト ==text== を除去
  text = text.replace(/==([^=]+)==/g, '$1');

  // 取り消し線 ~~text~~ を除去
  text = text.replace(/~~([^~]+)~~/g, '$1');

  // 複数の空白・改行を単一スペースに正規化
  text = text.replace(/\s+/g, ' ');

  // 前後の空白を除去
  text = text.trim();

  return text;
}
