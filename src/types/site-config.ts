/**
 * サイト設定の型定義
 * site.config.ts で使用するすべての型を定義
 */

/**
 * サポートする言語コード
 */
export type Language = 'ja' | 'en';

/**
 * ローカライズされたテキスト
 * 単一文字列または言語別オブジェクトをサポート
 */
export type LocalizedText = string | { ja: string; en: string };

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
  /** サイトの説明文（単一文字列または言語別オブジェクト） */
  description: LocalizedText;
  /** 著者名 */
  author: string;
  /** 著者プロフィールページへのURL（オプション） */
  authorProfile?: string;
  /** 本番環境のベースURL */
  baseUrl: string;
  /** 表示言語（デフォルト: 'ja'） */
  language?: Language;
}

/**
 * テーマ設定
 */
export interface ThemeConfig {
  /**
   * プライマリカラーの色相
   * - プリセット名: 'purple' | 'ocean' | 'forest' | 'sunset' | 'mono'
   * - 数値: 0-360（色相値を直接指定）
   * デフォルト: 'purple'（293）
   */
  primaryHue: import('../theme/color-presets').ThemeColorInput;
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
  /** デフォルトの説明文 */
  defaultDescription?: string;
  /** Google Analytics トラッキング ID（空の場合はスクリプト出力なし） */
  googleAnalyticsId?: string;
  /** Google AdSense パブリッシャー ID（空の場合はスクリプト出力なし） */
  googleAdsenseId?: string;
}

/**
 * giscusプロバイダー固有の設定
 * @see https://giscus.app/ for configuration options
 */
export interface GiscusConfig {
  /** GitHubリポジトリ（例: "owner/repo"） */
  repo: string;
  /** リポジトリID */
  repoId: string;
  /** ディスカッションカテゴリ名 */
  category: string;
  /** カテゴリID */
  categoryId: string;

  /** マッピング方式（デフォルト: "pathname"） */
  mapping?: 'pathname' | 'url' | 'title' | 'og:title' | 'specific' | 'number';
  /** 厳密マッチング（デフォルト: false） */
  strict?: boolean;
  /** リアクション表示（デフォルト: true） */
  reactionsEnabled?: boolean;
  /** メタデータ送信（デフォルト: false） */
  emitMetadata?: boolean;
  /** 入力位置（デフォルト: "bottom"） */
  inputPosition?: 'top' | 'bottom';
  /** 言語（デフォルト: サイト言語） */
  lang?: string;
}

/**
 * コメントシステム設定
 * providerに応じてconfigの型が決まる
 */
export interface CommentsConfig {
  enabled: boolean;
  provider?: 'giscus' | 'utterances';
  config?: GiscusConfig;
}

/**
 * OG画像設定
 * 背景画像のパスを指定
 */
export interface OgImageConfig {
  /**
   * ライトモード用の背景画像パス
   * src/assets/ からの相対パス
   * デフォルト: 'itzpapa-light_16_9.png'
   */
  lightBackground?: string;
  /**
   * ダークモード用の背景画像パス
   * src/assets/ からの相対パス
   * デフォルト: 'itzpapa-dark_16_9.png'
   */
  darkBackground?: string;
}

/**
 * 画像外部ホスティング設定
 * S3/R2への画像アップロードを制御
 * 認証情報は環境変数から読み取り（セキュリティのため）
 *
 * 環境変数で設定する項目（.envファイル）:
 * - IMAGE_HOSTING_ENABLED: 有効化フラグ
 * - IMAGE_HOSTING_PROVIDER: プロバイダー（S3/R2）
 * - IMAGE_HOSTING_BUCKET: バケット名
 * - IMAGE_HOST_URL: 画像配信用URL
 */
export interface ImageHostingConfig {
  /** アップロード対象のファイルパターン */
  include?: string[];
  /** アップロード除外のファイルパターン */
  exclude?: string[];
  /** アップロード失敗時にビルドを中断するか */
  failOnError?: boolean;
  /** 開発モードでも外部URLを使用するか */
  useExternalUrlInDev?: boolean;
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
  /** OG画像設定（オプション） */
  ogImage?: OgImageConfig;
  /** 画像外部ホスティング設定（オプション） */
  imageHosting?: ImageHostingConfig;
}
