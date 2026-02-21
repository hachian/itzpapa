/**
 * タグ関連の共通ユーティリティ
 */

/**
 * 正規表現の特殊文字をエスケープする
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
