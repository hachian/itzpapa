/**
 * サイト設定ファイル
 *
 * このファイルでサイト全体の設定を一元管理します。
 * 各設定項目を編集することで、サイトの見た目や動作をカスタマイズできます。
 */
import type { SiteConfig } from './types/site-config';

/**
 * サイト設定オブジェクト
 * すべてのカスタマイズ項目を一箇所で管理
 */
export const siteConfig: SiteConfig = {
  // ========================================
  // サイト基本情報
  // ========================================
  site: {
    /** サイトのタイトル（ブラウザタブやヘッダーに表示） */
    title: 'itzpapa',
    /** サイトの説明文（メタタグやRSSフィードに使用） */
    description: 'ObsidianユーザーのためのAstroブログソリューション',
    /** 著者名 */
    author: 'Your Name',
    /** 著者プロフィールページへのURL（オプション） */
    // authorProfile: '/about',
    /** 本番環境のベースURL（末尾のスラッシュなし） */
    baseUrl: 'https://example.com',
  },

  // ========================================
  // テーマ設定
  // ========================================
  theme: {
    /**
     * プライマリカラーの色相（Hue）
     * 0-360 の値を指定。サイト全体のアクセントカラーに影響します。
     * 例: 0=赤, 60=黄, 120=緑, 180=シアン, 240=青, 300=マゼンタ
     * デフォルト: 293（紫）
     */
    primaryHue: 293,
  },

  // ========================================
  // ナビゲーションメニュー
  // ========================================
  navigation: [
    /** ホームページ */
    { label: 'Home', href: '/' },
    /** ブログ一覧ページ */
    { label: 'Blog', href: '/blog' },
    /** タグ一覧ページ */
    { label: 'Tags', href: '/tags' },
    /** アバウトページ */
    { label: 'About', href: '/about' },
    // 外部リンクの例（http/https で始まるURLは自動的に新しいタブで開きます）
    // { label: 'GitHub', href: 'https://github.com/username' },
  ],

  // ========================================
  // SNSリンク設定
  // enabled: true にして url を設定すると、ヘッダー/フッターにアイコンが表示されます
  // ========================================
  social: {
    /** GitHub */
    github: { enabled: true, url: 'https://github.com/username' },
    /** Twitter (X) */
    twitter: { enabled: false, url: '' },
    /** YouTube */
    youtube: { enabled: false, url: '' },
    /** Bluesky */
    bluesky: { enabled: false, url: '' },
    /** Instagram */
    instagram: { enabled: false, url: '' },
    /** LinkedIn */
    linkedin: { enabled: false, url: '' },
    /** Mastodon */
    mastodon: { enabled: false, url: '' },
    /** Threads */
    threads: { enabled: false, url: '' },
  },

  // ========================================
  // フッター設定
  // ========================================
  footer: {
    /** 著作権テキスト */
    copyrightText: 'All rights reserved.',
    /**
     * 著作権の開始年
     * 設定すると「2024 - 2025」のような形式で表示されます
     * 未設定の場合は現在の年のみ表示
     */
    startYear: 2024,
  },

  // ========================================
  // SEO設定
  // ========================================
  seo: {
    /** デフォルトのOG画像パス（記事に個別のOG画像がない場合に使用） */
    defaultOgImage: '/og-image.png',
    /**
     * Google Analytics トラッキングID
     * 空文字または未設定の場合、トラッキングスクリプトは出力されません
     */
    googleAnalyticsId: '',
  },

  // ========================================
  // 機能フラグ
  // 各機能の有効/無効を切り替えられます
  // ========================================
  features: {
    /** 目次を表示するか */
    tableOfContents: true,
    /** タグクラウドを表示するか */
    tagCloud: true,
    /** 関連記事を表示するか */
    relatedPosts: true,
    /**
     * コメントシステム設定
     * enabled: true にして provider を設定すると、記事ページにコメント欄が表示されます
     */
    comments: {
      enabled: false,
      // provider: 'giscus',
      // config: {
      //   repo: 'owner/repo',
      //   repoId: 'R_xxxxx',
      //   category: 'Comments',
      //   categoryId: 'DIC_xxxxx',
      // },
    },
  },
};

// ========================================
// 後方互換性のためのエクスポート
// 既存のコンポーネントからの参照を維持
// ========================================
export const SITE_TITLE = siteConfig.site.title;
export const SITE_DESCRIPTION = siteConfig.site.description;
