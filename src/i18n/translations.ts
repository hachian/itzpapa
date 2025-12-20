/**
 * 翻訳リソース
 * 全UIテキストの翻訳定義を一元管理
 */
import type { Language } from '../types/site-config';

/**
 * 翻訳キーの型定義
 * 新しいキー追加時は全言語のエントリが必須
 */
export interface TranslationKeys {
  // ナビゲーション関連
  'nav.home': string;
  'nav.blog': string;
  'nav.tags': string;
  'nav.about': string;

  // 目次関連
  'toc.title': string;
  'toc.ariaLabel': string;
  'toc.toggle': string;

  // タグ一覧ページ
  'tags.title': string;
  'tags.backToList': string;
  'tags.ariaLabel': string;
  'tags.totalTags': string;
  'tags.totalPosts': string;
  'tags.maxUsage': string;
  'tags.hierarchical': string;
  'tags.flat': string;
  'tags.notFound': string;
  'tags.notFoundDesc': string;
  'tags.disabled': string;
  'tags.disabledDesc': string;

  // タグ詳細ページ
  'tags.posts': string;
  'tags.hierarchicalLevel': string;
  'tags.relatedTags': string;
  'tags.subTags': string;
  'tags.postList': string;
  'tags.noPostsFound': string;
  'tags.noPostsFoundDesc': string;

  // ホームページ
  'home.exploreContent': string;
  'home.blogPosts': string;
  'home.blogPostsDesc': string;
  'home.tagList': string;
  'home.tagListDesc': string;
  'home.latestPosts': string;
  'home.viewAllPosts': string;

  // ブログ一覧ページ
  'blog.title': string;
  'blog.pageTitle': string;
  'blog.description': string;

  // 記事ページ
  'article.readingTime': string;
  'article.updated': string;
  'article.relatedTags': string;

  // パンくずナビ
  'breadcrumb.ariaLabel': string;
  'breadcrumb.home': string;
  'breadcrumb.blog': string;

  // メニュー操作
  'menu.open': string;
  'menu.close': string;

  // フッター
  'footer.allRightsReserved': string;

  // 404ページ
  'error.notFound.title': string;
  'error.notFound.pageTitle': string;
  'error.notFound.description': string;
  'error.notFound.message': string;
  'error.notFound.goHome': string;
  'error.notFound.viewBlog': string;

  // Aboutページ
  'about.title': string;
  'about.description': string;
  'about.intro.title': string;
  'about.intro.lead': string;
  'about.name.title': string;
  'about.name.pronunciation': string;
  'about.name.description': string;
  'about.name.metaphor': string;
  'about.features.title': string;
  'about.features.obsidian.title': string;
  'about.features.obsidian.text': string;
  'about.features.fast.title': string;
  'about.features.fast.text': string;
  'about.features.responsive.title': string;
  'about.features.responsive.text': string;
  'about.stack.title': string;
  'about.stack.astro': string;
  'about.stack.typescript': string;
  'about.stack.remark': string;
  'about.stack.css': string;
  'about.start.title': string;
  'about.start.step1': string;
  'about.start.step2': string;
  'about.start.step3': string;
  'about.start.step4': string;
}

export type Translations = Record<Language, TranslationKeys>;

export const translations: Translations = {
  ja: {
    // ナビゲーション
    'nav.home': 'ホーム',
    'nav.blog': 'ブログ',
    'nav.tags': 'タグ',
    'nav.about': 'このサイトについて',
    // 目次
    'toc.title': '目次',
    'toc.ariaLabel': '目次',
    'toc.toggle': '目次の表示/非表示を切り替え',
    // タグ一覧ページ
    'tags.title': 'タグ一覧',
    'tags.backToList': 'タグ一覧に戻る',
    'tags.ariaLabel': 'タグ一覧',
    'tags.totalTags': '総タグ数',
    'tags.totalPosts': '記事数',
    'tags.maxUsage': '最大使用回数',
    'tags.hierarchical': '階層タグ',
    'tags.flat': 'タグ',
    'tags.notFound': 'タグが見つかりません',
    'tags.notFoundDesc': 'まだタグが付けられた記事がありません。',
    'tags.disabled': 'タグクラウドは無効です',
    'tags.disabledDesc': 'この機能は現在無効になっています。',
    // タグ詳細ページ
    'tags.posts': '件の記事',
    'tags.hierarchicalLevel': '階層タグ（レベル {level}）',
    'tags.relatedTags': '関連タグ {count} 個を含む',
    'tags.subTags': 'サブタグ',
    'tags.postList': '記事一覧',
    'tags.noPostsFound': '記事が見つかりません',
    'tags.noPostsFoundDesc': 'このタグが付けられた記事はまだありません。',
    // ホームページ
    'home.exploreContent': 'コンテンツを探索する',
    'home.blogPosts': 'ブログ記事',
    'home.blogPostsDesc': 'すべての記事を一覧で見る。カテゴリや投稿日から探せます。',
    'home.tagList': 'タグ一覧',
    'home.tagListDesc': 'タグから記事を探す。興味のあるトピックを見つけましょう。',
    'home.latestPosts': '最新の記事',
    'home.viewAllPosts': 'すべての記事を見る',
    // ブログ一覧ページ
    'blog.title': 'ブログ記事',
    'blog.pageTitle': 'ブログ記事一覧',
    'blog.description': '技術的な洞察、プログラミングのヒント、そして日々の学びを共有しています。',
    // 記事ページ
    'article.readingTime': '{min}分で読めます',
    'article.updated': '（更新：{date}）',
    'article.relatedTags': '関連タグ',
    // パンくずナビ
    'breadcrumb.ariaLabel': 'パンくずナビゲーション',
    'breadcrumb.home': 'ホーム',
    'breadcrumb.blog': 'ブログ',
    // メニュー操作
    'menu.open': 'メニューを開く',
    'menu.close': 'メニューを閉じる',
    // フッター
    'footer.allRightsReserved': 'All rights reserved.',
    // 404ページ
    'error.notFound.title': 'ページが見つかりません',
    'error.notFound.pageTitle': 'ページが見つかりません',
    'error.notFound.description': 'お探しのページは見つかりませんでした。',
    'error.notFound.message': 'お探しのページは存在しないか、移動した可能性があります。',
    'error.notFound.goHome': 'トップページへ戻る',
    'error.notFound.viewBlog': 'ブログ記事を見る',
    // Aboutページ
    'about.title': 'About itzpapa',
    'about.description': 'Obsidian記事をそのまま公開できるAstroブログテンプレート',
    'about.intro.title': 'itzpapaとは',
    'about.intro.lead': 'Obsidianで書いたMarkdown記事を、そのままWebサイトとして公開できるブログテンプレートです。WikiLinkやCalloutなど、Obsidian独自の記法をそのまま使えるので、執筆環境を変えることなくブログを運営できます。',
    'about.name.title': '名前の由来',
    'about.name.pronunciation': 'イツパパロトル',
    'about.name.description': 'アステカ神話に登場する女神の名前に由来しています。ナワトル語で「黒曜石（ītztli）の蝶（pāpālotl）」という意味を持ちます。',
    'about.name.metaphor': 'ローカルの執筆環境からWebへの公開。その変換を「黒曜石から生まれる蝶」になぞらえています。',
    'about.features.title': '特徴',
    'about.features.obsidian.title': 'Obsidian互換',
    'about.features.obsidian.text': 'WikiLink、Callout、階層タグ、マークハイライトなど、Obsidianの主要な記法に対応しています。',
    'about.features.fast.title': '高速表示',
    'about.features.fast.text': 'Astroの静的サイト生成により、JavaScriptを最小限に抑えた軽量なページを生成します。',
    'about.features.responsive.title': 'レスポンシブ',
    'about.features.responsive.text': 'PC、タブレット、スマートフォンなど、どのデバイスでも快適に閲覧できます。',
    'about.stack.title': '技術スタック',
    'about.stack.astro': '静的サイト生成フレームワーク',
    'about.stack.typescript': '型安全な開発環境',
    'about.stack.remark': 'Obsidian記法の変換処理',
    'about.stack.css': '柔軟なテーマカスタマイズ',
    'about.start.title': 'はじめ方',
    'about.start.step1': 'GitHubからリポジトリをクローン',
    'about.start.step2': 'src/content/blog/ に記事を配置',
    'about.start.step3': 'npm run build でビルド',
    'about.start.step4': 'お好みのホスティングサービスにデプロイ',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.blog': 'Blog',
    'nav.tags': 'Tags',
    'nav.about': 'About',
    // Table of Contents
    'toc.title': 'Table of Contents',
    'toc.ariaLabel': 'Table of Contents',
    'toc.toggle': 'Toggle table of contents',
    // Tags index page
    'tags.title': 'Tags',
    'tags.backToList': 'Back to Tags',
    'tags.ariaLabel': 'Tag list',
    'tags.totalTags': 'Total Tags',
    'tags.totalPosts': 'Total Posts',
    'tags.maxUsage': 'Max Usage',
    'tags.hierarchical': 'Hierarchical Tags',
    'tags.flat': 'Tags',
    'tags.notFound': 'No tags found',
    'tags.notFoundDesc': 'There are no tagged posts yet.',
    'tags.disabled': 'Tag cloud is disabled',
    'tags.disabledDesc': 'This feature is currently disabled.',
    // Tag detail page
    'tags.posts': ' posts',
    'tags.hierarchicalLevel': 'Hierarchical tag (Level {level})',
    'tags.relatedTags': 'Including {count} related tags',
    'tags.subTags': 'Sub Tags',
    'tags.postList': 'Posts',
    'tags.noPostsFound': 'No posts found',
    'tags.noPostsFoundDesc': 'There are no posts with this tag yet.',
    // Homepage
    'home.exploreContent': 'Explore Content',
    'home.blogPosts': 'Blog Posts',
    'home.blogPostsDesc': 'Browse all articles. Search by category or publication date.',
    'home.tagList': 'Tags',
    'home.tagListDesc': 'Find articles by tag. Discover topics that interest you.',
    'home.latestPosts': 'Latest Posts',
    'home.viewAllPosts': 'View All Posts',
    // Blog index page
    'blog.title': 'Blog',
    'blog.pageTitle': 'Blog Posts',
    'blog.description': 'Sharing technical insights, programming tips, and daily learnings.',
    // Article page
    'article.readingTime': '{min} min read',
    'article.updated': '(Updated: {date})',
    'article.relatedTags': 'Related Tags',
    // Breadcrumb
    'breadcrumb.ariaLabel': 'Breadcrumb navigation',
    'breadcrumb.home': 'Home',
    'breadcrumb.blog': 'Blog',
    // Menu operations
    'menu.open': 'Open menu',
    'menu.close': 'Close menu',
    // Footer
    'footer.allRightsReserved': 'All rights reserved.',
    // 404 page
    'error.notFound.title': 'Page Not Found',
    'error.notFound.pageTitle': 'Page Not Found',
    'error.notFound.description': 'The page you are looking for could not be found.',
    'error.notFound.message': 'The page you are looking for does not exist or may have been moved.',
    'error.notFound.goHome': 'Go to Home',
    'error.notFound.viewBlog': 'View Blog Posts',
    // About page
    'about.title': 'About itzpapa',
    'about.description': 'An Astro blog template for publishing Obsidian articles',
    'about.intro.title': 'What is itzpapa',
    'about.intro.lead': 'A blog template that lets you publish Markdown articles written in Obsidian directly as a website. You can use Obsidian-specific syntax like WikiLinks and Callouts as-is, allowing you to run a blog without changing your writing environment.',
    'about.name.title': 'Origin of the Name',
    'about.name.pronunciation': 'Itzpapalotl',
    'about.name.description': 'Named after the goddess from Aztec mythology. In Nahuatl, it means "Obsidian Butterfly" - combining "ītztli" (obsidian) and "pāpālotl" (butterfly).',
    'about.name.metaphor': 'The transformation from local writing environment to web publication. We liken this conversion to "a butterfly born from obsidian."',
    'about.features.title': 'Features',
    'about.features.obsidian.title': 'Obsidian Compatible',
    'about.features.obsidian.text': 'Supports major Obsidian syntax including WikiLinks, Callouts, hierarchical tags, and mark highlights.',
    'about.features.fast.title': 'Fast Loading',
    'about.features.fast.text': 'Generates lightweight pages with minimal JavaScript through Astro static site generation.',
    'about.features.responsive.title': 'Responsive',
    'about.features.responsive.text': 'Comfortable viewing on any device - PC, tablet, or smartphone.',
    'about.stack.title': 'Tech Stack',
    'about.stack.astro': 'Static site generation framework',
    'about.stack.typescript': 'Type-safe development environment',
    'about.stack.remark': 'Obsidian syntax conversion',
    'about.stack.css': 'Flexible theme customization',
    'about.start.title': 'Getting Started',
    'about.start.step1': 'Clone the repository from GitHub',
    'about.start.step2': 'Place articles in src/content/blog/',
    'about.start.step3': 'Build with npm run build',
    'about.start.step4': 'Deploy to your preferred hosting service',
  },
};
