/**
 * サイト設定の型定義
 * site.config.ts で使用するすべての型を定義
 */

/**
 * SNS リンクの個別設定
 * enabled: true の場合のみリンクを表示
 */
export interface SocialLinkConfig {
  enabled: boolean;
  url: string;
}

/**
 * すべての SNS リンク設定
 * 各 SNS プラットフォームごとに enabled/url ペアを持つ
 */
export interface SocialLinks {
  github: SocialLinkConfig;
  twitter: SocialLinkConfig;
  youtube: SocialLinkConfig;
  bluesky: SocialLinkConfig;
  instagram: SocialLinkConfig;
  linkedin: SocialLinkConfig;
  mastodon: SocialLinkConfig;
  threads: SocialLinkConfig;
}

/**
 * ナビゲーションメニュー項目
 */
export interface NavItem {
  label: string;
  href: string;
}

/**
 * サイト基本情報
 */
export interface SiteInfo {
  /** サイトのタイトル */
  title: string;
  /** サイトの説明文 */
  description: string;
  /** 著者名 */
  author: string;
  /** 著者プロフィールページへのURL（オプション） */
  authorProfile?: string;
  /** 本番環境のベースURL */
  baseUrl: string;
}

/**
 * テーマ設定
 */
export interface ThemeConfig {
  /** プライマリカラーの色相（0-360）、デフォルト: 293（紫） */
  primaryHue: number;
}

/**
 * フッター設定
 */
export interface FooterConfig {
  /** 著作権テキスト */
  copyrightText?: string;
  /** 著作権の開始年（設定されている場合「開始年 - 現在年」形式で表示） */
  startYear?: number;
}

/**
 * SEO 設定
 */
export interface SeoConfig {
  /** デフォルトの OG 画像パス */
  defaultOgImage?: string;
  /** デフォルトの説明文 */
  defaultDescription?: string;
  /** Google Analytics トラッキング ID（空の場合はスクリプト出力なし） */
  googleAnalyticsId?: string;
}

/**
 * コメントシステム設定
 */
export interface CommentsConfig {
  enabled: boolean;
  provider?: 'giscus' | 'utterances';
  config?: Record<string, unknown>;
}

/**
 * 機能フラグ
 * 各機能の有効/無効を制御
 */
export interface FeatureFlags {
  /** 目次を表示するか */
  tableOfContents: boolean;
  /** タグクラウドを表示するか */
  tagCloud: boolean;
  /** 関連記事を表示するか */
  relatedPosts: boolean;
  /** コメントシステム設定 */
  comments?: CommentsConfig;
}

/**
 * サイト設定全体の型
 * site.config.ts でエクスポートするオブジェクトの型
 */
export interface SiteConfig {
  /** サイト基本情報 */
  site: SiteInfo;
  /** テーマ設定 */
  theme: ThemeConfig;
  /** ナビゲーションメニュー */
  navigation: NavItem[];
  /** SNS リンク設定 */
  social: SocialLinks;
  /** フッター設定 */
  footer: FooterConfig;
  /** SEO 設定 */
  seo: SeoConfig;
  /** 機能フラグ */
  features: FeatureFlags;
}
