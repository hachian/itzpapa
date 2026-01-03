/**
 * 共通ユーティリティモジュール
 * プラグイン間で共有される関数を提供
 */

/**
 * HTMLエスケープ（セキュリティモード対応）
 * @param {string} text - エスケープするテキスト
 * @param {string} securityMode - セキュリティモード: 'auto', 'strict', 'disabled'
 * @returns {string} エスケープされたテキスト
 */
export function escapeHtml(text, securityMode = 'auto') {
  if (typeof text !== 'string') return '';

  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  // 基本的なHTMLエスケープ
  let escaped = text.replace(/[&<>"']/g, (match) => htmlEscapes[match]);

  // strictモードでは追加のセキュリティチェック
  if (securityMode === 'strict') {
    // 制御文字の除去
    escaped = escaped.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Unicode zero-width characters の除去
    escaped = escaped.replace(/[\u200B-\u200D\uFEFF]/g, '');

    // 潜在的に危険なプロトコルの検出と無効化
    escaped = escaped.replace(/javascript:/gi, 'javascript&#58;');
    escaped = escaped.replace(/vbscript:/gi, 'vbscript&#58;');
    escaped = escaped.replace(/data:/gi, 'data&#58;');
  }

  return escaped;
}

/**
 * YYYYMMDD-プレフィックスを除去
 * @param {string} slug - 処理するスラッグ
 * @returns {string} プレフィックス除去後のスラッグ
 */
export function removeDatePrefix(slug) {
  // 8桁の数字 + ハイフンで始まる場合、そのプレフィックスを除去
  return slug.replace(/^\d{8}-/, '');
}

/**
 * ファイルパスを正規化（URL用）
 * @param {string} filePath - 正規化するファイルパス（../で始まる相対パス）
 * @returns {string} 正規化されたパス
 */
export function normalizeFilePath(filePath) {
  const normalized = filePath
    .replace(/^\.\.\//, '')
    .replace(/\.md$/, '')
    .replace(/\/index$/, '')
    .replace(/\s+/g, '-')
    .toLowerCase();

  // YYYYMMDD-プレフィックスを除去
  return removeDatePrefix(normalized);
}

/**
 * ハッシュ（アンカー）を正規化
 * @param {string} hash - ハッシュ文字列（#付きまたはなし）
 * @returns {string} 正規化されたハッシュ（#付き、または空文字列）
 */
export function normalizeAnchor(hash) {
  if (!hash) return '';

  // #を除去してテキストを取得
  const hashText = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!hashText) return '';

  // 正規化: 小文字化、ドット除去、スペースをハイフンに、許可された文字のみ保持
  const normalized = hashText
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3005\u3006\u3007\u30FC]/g, '');

  return normalized ? '#' + normalized : '';
}

/**
 * 内部リンクURLを構築
 * @param {string} linkPath - リンクパス（../で始まる相対パス）
 * @returns {string} 構築されたURL（/blog/path/ または /blog/path/#hash）
 */
export function buildInternalLinkUrl(linkPath) {
  const hashIndex = linkPath.indexOf('#');
  let filePath = linkPath;
  let hash = '';

  if (hashIndex !== -1) {
    filePath = linkPath.slice(0, hashIndex);
    hash = linkPath.slice(hashIndex);
  }

  const cleanPath = normalizeFilePath(filePath);
  const cleanHash = normalizeAnchor(hash);

  return cleanHash ? `/blog/${cleanPath}/${cleanHash}` : `/blog/${cleanPath}/`;
}
