/**
 * タグ機能の型定義
 * Obsidianスタイルのタグシステムをサポート
 */

/**
 * 単一のタグを表すインターフェース
 */
export interface Tag {
  /** タグ名（例: "tech/web/frontend"） */
  name: string;
  
  /** URLセーフな形式のタグ識別子 */
  slug: string;
  
  /** 親タグ名（例: "tech/web"）*/
  parent?: string;
  
  /** 子タグ名のリスト */
  children: string[];
  
  /** このタグが使用されている記事数 */
  count: number;
  
  /** 階層の深さ（0から開始） */
  level: number;
}

/**
 * タグの階層構造を表すインターフェース
 */
export interface TagHierarchy {
  [key: string]: {
    tag: Tag;
    children: TagHierarchy;
  };
}

/**
 * 記事のタグメタデータ
 */
export interface PostTagMetadata {
  /** frontmatterで定義されたタグ */
  frontmatterTags: string[];
  
  /** 本文中のインラインタグ */
  inlineTags: string[];
  
  /** すべてのタグ（重複なし） */
  allTags: string[];
}

/**
 * タグ検索結果
 */
export interface TagSearchResult {
  /** 検索にマッチしたタグ */
  tag: Tag;
  
  /** スコア（関連度） */
  score: number;
  
  /** ハイライト用のマッチ位置 */
  matchIndices?: [number, number][];
}

/**
 * タグ設定オプション
 */
export interface TagOptions {
  /** タグの最大階層深度（デフォルト: 5） */
  maxHierarchyDepth?: number;
  
  /** 記事あたりの最大タグ数（デフォルト: 20） */
  maxTagsPerPost?: number;
  
  /** タグ名の最大長（デフォルト: 64） */
  maxTagLength?: number;
  
  /** 大文字小文字を区別するか（デフォルト: false） */
  caseSensitive?: boolean;
  
  /** タグのプレフィックス（デフォルト: "#"） */
  tagPrefix?: string;
  
  /** 階層の区切り文字（デフォルト: "/"） */
  hierarchySeparator?: string;
}

/**
 * タグ処理エラー
 */
export class TagError extends Error {
  constructor(
    message: string,
    public readonly code: TagErrorCode,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'TagError';
  }
}

/**
 * タグエラーコード
 */
export enum TagErrorCode {
  /** タグ名が無効 */
  INVALID_TAG_NAME = 'INVALID_TAG_NAME',
  
  /** 階層が深すぎる */
  MAX_HIERARCHY_EXCEEDED = 'MAX_HIERARCHY_EXCEEDED',
  
  /** タグ名が長すぎる */
  MAX_LENGTH_EXCEEDED = 'MAX_LENGTH_EXCEEDED',
  
  /** タグ数が多すぎる */
  MAX_TAGS_EXCEEDED = 'MAX_TAGS_EXCEEDED',
  
  /** 循環参照が検出された */
  CIRCULAR_REFERENCE = 'CIRCULAR_REFERENCE',
  
  /** 不正な文字が含まれている */
  INVALID_CHARACTER = 'INVALID_CHARACTER'
}

/**
 * タグのバリデーション結果
 */
export interface TagValidationResult {
  /** バリデーションが成功したか */
  isValid: boolean;
  
  /** エラーメッセージ（エラーの場合） */
  error?: string;
  
  /** エラーコード（エラーの場合） */
  errorCode?: TagErrorCode;
  
  /** 正規化されたタグ名 */
  normalizedTag?: string;
}

/**
 * タグクラウド用のタグ情報
 */
export interface TagCloudItem {
  /** タグ */
  tag: Tag;
  
  /** 表示サイズ（1-5の5段階） */
  size: 1 | 2 | 3 | 4 | 5;
  
  /** 表示色（オプション） */
  color?: string;
  
  /** 重要度（0-1） */
  weight: number;
}

/**
 * タグツリーノード
 */
export interface TagTreeNode {
  /** タグ情報 */
  tag: Tag;
  
  /** 子ノード */
  children: TagTreeNode[];
  
  /** 展開状態（UIで使用） */
  expanded?: boolean;
  
  /** 選択状態（UIで使用） */
  selected?: boolean;
}

/**
 * タグ統計情報
 */
export interface TagStatistics {
  /** 総タグ数 */
  totalTags: number;
  
  /** ユニークタグ数 */
  uniqueTags: number;
  
  /** 最も使用されているタグ */
  mostUsedTags: Array<{
    tag: Tag;
    count: number;
  }>;
  
  /** 最近追加されたタグ */
  recentTags: Array<{
    tag: Tag;
    addedAt: Date;
  }>;
  
  /** 階層別のタグ数 */
  tagsByLevel: Record<number, number>;
}

/**
 * デフォルトのタグ設定
 */
export const DEFAULT_TAG_OPTIONS: Required<TagOptions> = {
  maxHierarchyDepth: 5,
  maxTagsPerPost: 20,
  maxTagLength: 64,
  caseSensitive: false,
  tagPrefix: '#',
  hierarchySeparator: '/'
};