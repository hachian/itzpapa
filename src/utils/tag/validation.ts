/**
 * タグのバリデーション関連ユーティリティ
 */

import type { TagOptions, TagValidationResult, TagErrorCode } from '../../types/tag';
import { DEFAULT_TAG_OPTIONS } from '../../types/tag';

/**
 * タグ名の有効な文字パターン
 * 英数字、ハイフン、アンダースコア、日本語文字（ひらがな、カタカナ、漢字）
 */
const VALID_TAG_PATTERN = /^[a-zA-Z0-9\-_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]+$/;

/**
 * タグ名をバリデートする
 */
export function validateTagName(
  tagName: string,
  options: TagOptions = {}
): TagValidationResult {
  const opts = { ...DEFAULT_TAG_OPTIONS, ...options };
  
  // 空文字チェック
  if (!tagName || tagName.length === 0) {
    return {
      isValid: false,
      error: 'タグ名が空です',
      errorCode: 'INVALID_TAG_NAME' as TagErrorCode
    };
  }
  
  // プレフィックスを除去
  const cleanedTag = tagName.startsWith(opts.tagPrefix) 
    ? tagName.slice(opts.tagPrefix.length)
    : tagName;
  
  // 長さチェック
  if (cleanedTag.length > opts.maxTagLength) {
    return {
      isValid: false,
      error: `タグ名が最大長（${opts.maxTagLength}文字）を超えています`,
      errorCode: 'MAX_LENGTH_EXCEEDED' as TagErrorCode
    };
  }
  
  // 階層の深さをチェック
  const hierarchyParts = cleanedTag.split(opts.hierarchySeparator);
  if (hierarchyParts.length > opts.maxHierarchyDepth) {
    return {
      isValid: false,
      error: `階層が最大深度（${opts.maxHierarchyDepth}レベル）を超えています`,
      errorCode: 'MAX_HIERARCHY_EXCEEDED' as TagErrorCode
    };
  }
  
  // 各階層パートの有効性チェック
  for (const part of hierarchyParts) {
    if (!part || part.length === 0) {
      return {
        isValid: false,
        error: '空の階層パートが含まれています',
        errorCode: 'INVALID_TAG_NAME' as TagErrorCode
      };
    }
    
    // スペースのチェック
    if (part.includes(' ')) {
      return {
        isValid: false,
        error: 'タグ名にスペースを含めることはできません',
        errorCode: 'INVALID_CHARACTER' as TagErrorCode
      };
    }
    
    // 有効な文字パターンチェック
    if (!VALID_TAG_PATTERN.test(part)) {
      return {
        isValid: false,
        error: `無効な文字が含まれています: ${part}`,
        errorCode: 'INVALID_CHARACTER' as TagErrorCode
      };
    }
  }
  
  // 正規化されたタグ名を生成
  const normalizedTag = normalizeTag(cleanedTag, opts);
  
  return {
    isValid: true,
    normalizedTag
  };
}

/**
 * タグ名を正規化する
 */
export function normalizeTag(tagName: string, options: TagOptions = {}): string {
  const opts = { ...DEFAULT_TAG_OPTIONS, ...options };
  
  // プレフィックスを除去
  let normalized = tagName.startsWith(opts.tagPrefix) 
    ? tagName.slice(opts.tagPrefix.length)
    : tagName;
  
  // 連続するスラッシュを単一に正規化
  normalized = normalized.replace(
    new RegExp(`${escapeRegExp(opts.hierarchySeparator)}+`, 'g'),
    opts.hierarchySeparator
  );
  
  // 先頭と末尾のスラッシュを除去
  normalized = normalized
    .replace(new RegExp(`^${escapeRegExp(opts.hierarchySeparator)}+`), '')
    .replace(new RegExp(`${escapeRegExp(opts.hierarchySeparator)}+$`), '');
  
  // 大文字小文字の処理
  if (!opts.caseSensitive) {
    normalized = normalized.toLowerCase();
  }
  
  return normalized;
}

/**
 * タグをURLセーフなスラッグに変換する
 */
export function tagToSlug(tagName: string, options: TagOptions = {}): string {
  const opts = { ...DEFAULT_TAG_OPTIONS, ...options };
  const normalized = normalizeTag(tagName, opts);

  // スラッシュとハイフンをそのまま保持
  // URLセーフな文字に変換（日本語はそのまま残す）
  let slug = encodeURIComponent(normalized);

  return slug;
}

/**
 * スラッグからタグ名に変換する
 */
export function slugToTag(slug: string, options: TagOptions = {}): string {
  const opts = { ...DEFAULT_TAG_OPTIONS, ...options };

  // URLデコード
  let tag = decodeURIComponent(slug);

  return tag;
}

/**
 * タグの階層を解析する
 */
export function parseTagHierarchy(
  tagName: string,
  options: TagOptions = {}
): {
  parts: string[];
  parent?: string;
  level: number;
} {
  const opts = { ...DEFAULT_TAG_OPTIONS, ...options };
  const normalized = normalizeTag(tagName, opts);
  const parts = normalized.split(opts.hierarchySeparator);
  
  return {
    parts,
    parent: parts.length > 1 
      ? parts.slice(0, -1).join(opts.hierarchySeparator)
      : undefined,
    level: parts.length - 1
  };
}

/**
 * 親タグのリストを取得する
 */
export function getParentTags(
  tagName: string,
  options: TagOptions = {}
): string[] {
  const { parts } = parseTagHierarchy(tagName, options);
  const parents: string[] = [];
  
  for (let i = 1; i < parts.length; i++) {
    parents.push(parts.slice(0, i).join(options.hierarchySeparator || '/'));
  }
  
  return parents;
}

/**
 * タグが別のタグの子孫かどうかをチェック
 */
export function isDescendantTag(
  childTag: string,
  parentTag: string,
  options: TagOptions = {}
): boolean {
  const opts = { ...DEFAULT_TAG_OPTIONS, ...options };
  const normalizedChild = normalizeTag(childTag, opts);
  const normalizedParent = normalizeTag(parentTag, opts);
  
  return normalizedChild.startsWith(normalizedParent + opts.hierarchySeparator);
}

/**
 * 正規表現の特殊文字をエスケープする
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}