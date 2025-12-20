/**
 * サイト設定ファイル
 *
 * このファイルでサイト全体の設定を一元管理します。
 * 各設定項目を編集することで、サイトの見た目や動作をカスタマイズできます。
 */
import type { SiteConfig } from './src/types/site-config';

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
    /**
     * サイトの説明文（メタタグやRSSフィードに使用）
     * 単一文字列または言語別オブジェクト { ja: '...', en: '...' } で設定可能
     */
    description: {
      ja: 'ObsidianユーザーのためのAstroブログソリューション',
      en: 'An Astro blog solution for Obsidian users',
    },
    /** 著者名 */
    author: 'Your Name',
    /** 著者プロフィールページへのURL（オプション） */
    // authorProfile: '/about',
    /** 本番環境のベースURL（末尾のスラッシュなし） */
    baseUrl: 'https://example.com',
    /**
     * 表示言語
     * 'ja': 日本語（デフォルト）
     * 'en': English
     * 設定しない場合は日本語が使用されます
     */
    language: 'en',
  },

  // ========================================
  // テーマ設定
  // ========================================
  theme: {
    /**
     * プライマリカラーの色相
     * プリセット名または0-360の数値を指定。サイト全体のアクセントカラーに影響します。
     *
     * プリセット名:
     *   - 'purple': 紫色（293）- 創造性と高級感
     *   - 'ocean':  海のブルー（200）- 信頼感と落ち着き
     *   - 'forest': 森のグリーン（145）- 自然と成長
     *   - 'sunset': 夕焼けのオレンジ（25）- 温かみと活力
     *   - 'mono':   モノトーン（240）- シンプルで洗練
     *
     * 数値指定: 0-360（色相を直接指定）
     *   例: 0=赤, 60=黄, 120=緑, 180=シアン, 240=青, 300=マゼンタ
     *
     * デフォルト: 'purple'
     */
    primaryHue: 293
  },

  // ========================================
  // ナビゲーションメニュー
  // ========================================
  navigation: [
    /** ホームページ */
    { label: 'Home', href: '/' },
    /** ブログ一覧ページ */
    { label: 'Blog', href: '/blog/' },
    /** タグ一覧ページ */
    { label: 'Tags', href: '/tags/' },
    /** アバウトページ */
    { label: 'About', href: '/about/' },
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
     *
     * giscusの設定手順:
     * 1. https://giscus.app/ にアクセス
     * 2. GitHubリポジトリを入力して設定を生成
     * 3. 生成された値を以下に設定
     *
     * 必須設定:
     *   - repo: GitHubリポジトリ（例: "owner/repo"）
     *   - repoId: リポジトリID（giscus.appで生成）
     *   - category: Discussionカテゴリ名
     *   - categoryId: カテゴリID（giscus.appで生成）
     *
     * オプション設定:
     *   - mapping: ページとDiscussionの紐付け方法（デフォルト: 'pathname'）
     *     'pathname' | 'url' | 'title' | 'og:title' | 'specific' | 'number'
     *   - strict: 厳密マッチング（デフォルト: false）
     *   - reactionsEnabled: リアクション表示（デフォルト: true）
     *   - emitMetadata: メタデータ送信（デフォルト: false）
     *   - inputPosition: 入力欄の位置（デフォルト: 'bottom'）
     *     'top' | 'bottom'
     *   - lang: 言語（デフォルト: サイト言語）
     */
    comments: {
      enabled: true,
      // コメントを有効にするには enabled: true にし、以下のコメントを解除してください
      provider: 'giscus',
      config: {
        // 必須: giscus.appで生成した値を設定
        repo: 'hachian/itzpapa',
        repoId: 'R_kgDOPfX1yA',
        category: 'Announcements',
        categoryId: 'DIC_kwDOPfX1yM4C0CxI',
        // オプション: 必要に応じて設定
        // mapping: 'pathname',
        // strict: false,
        // reactionsEnabled: true,
        // emitMetadata: false,
        // inputPosition: 'bottom',
        // lang: 'ja',
      },
    },
  },
};

// ========================================
// 後方互換性のためのエクスポート
// 既存のコンポーネントからの参照を維持
// ========================================
export const SITE_TITLE = siteConfig.site.title;
export const SITE_DESCRIPTION = siteConfig.site.description;
