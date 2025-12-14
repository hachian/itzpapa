/**
 * テキストを指定文字数で切り詰める
 *
 * @param text - 対象テキスト
 * @param maxLength - 最大文字数（デフォルト: 160）
 * @param suffix - 省略記号（デフォルト: '...'）
 * @returns 切り詰められたテキスト
 */
export function truncateText(
  text: string,
  maxLength: number = 160,
  suffix: string = '...'
): string {
  // null/undefined安全
  if (!text) {
    return '';
  }

  // スプレッド演算子でUnicodeコードポイント単位で分割
  // これによりサロゲートペア（絵文字等）を正しく処理
  const chars = [...text];

  // 切り詰め不要な場合
  if (chars.length <= maxLength) {
    return text;
  }

  // 指定文字数で切り詰めて省略記号を追加
  return chars.slice(0, maxLength).join('') + suffix;
}
