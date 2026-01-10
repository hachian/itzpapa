# itzpapa - Obsidian風機能を備えたAstroブログ

![itzpapa スクリーンショット](./screenshot-blog-combined-hd.png)

Astroをベースにしたブログサイトで、Obsidian風の記法（WikiLink、Callout、インラインタグ、マークハイライト）と豊富なカスタマイズ機能をサポートしています。

## 特徴

- **Astro v5** - Markdown/MDX対応の高速な静的サイト生成
- **Obsidian記法** - WikiLink (`[[page]]`)、Callout、マークハイライト (`==text==`)、インラインタグ (`#tag`)
- **検索** - キーワードハイライト付き全文検索
- **SEO** - OG画像、サイトマップ、RSS、canonical URLs
- **多言語対応** - 日本語と英語
- **統合機能** - giscusコメント、Google AdSense
- **テーマ** - `site.config.ts`の`primaryHue` (0-360)でカスタマイズ

## はじめに

```bash
git clone https://github.com/hachian/itzpapa.git
cd itzpapa

# Linux/macOS
npm install

# Windows（pnpm推奨）
pnpm install
```

`site.config.ts`を編集：

```typescript
site: {
  title: 'サイトタイトル',
  author: '著者名',
  baseUrl: 'https://your-domain.com',
},
features: {
  comments: {
    enabled: false,  // giscusを無効化（または自分で設定）
  },
},
```

開発サーバーを起動：

```bash
npm run dev   # Linux/macOS
pnpm dev      # Windows
```

http://localhost:4321 でサイトを確認できます。

## コマンド一覧

| npm | pnpm | 説明 |
|-----|------|------|
| `npm install` | `pnpm install` | 依存関係をインストール |
| `npm run dev` | `pnpm dev` | 開発サーバーを起動（localhost:4321） |
| `npm run build` | `pnpm build` | 本番用サイトをビルド（./dist/） |
| `npm run build:ci` | `pnpm build:ci` | CI用ビルド（画像最適化なし） |
| `npm run preview` | `pnpm preview` | ビルド結果をローカルでプレビュー |
| `npm run test` | `pnpm test` | すべてのテストを実行 |

## 設定

すべてのサイト設定はプロジェクトルートの`site.config.ts`で一元管理されます。
詳細なドキュメントはこちら: https://itzpapa.hachian.com/blog/site-config-guide/

```typescript
export const siteConfig = {
  site: {
    title: 'サイトタイトル',
    description: { ja: '日本語説明', en: 'English description' },
    author: '著者名',
    baseUrl: 'https://your-site.com',
    language: 'ja',  // 'ja' または 'en'
  },
  theme: {
    primaryHue: 293,  // 0-360
  },
  navigation: [...],
  social: { github: {...}, twitter: {...}, ... },
  footer: {
    copyrightText: 'All rights reserved.',
    startYear: 2024,
  },
  seo: {
    googleAnalyticsId: 'G-XXXXXXXXXX',
    googleAdsenseId: 'ca-pub-XXXXXXXXXXXXXXXX',
  },
  features: {
    tableOfContents: true,
    tagCloud: true,
    relatedPosts: true,
    comments: { enabled: false, provider: 'giscus', config: {...} },
  },
  ogImage: {
    lightBackground: 'itzpapa-light_16_9.png',
    darkBackground: 'itzpapa-dark_16_9.png',
  },
  imageHosting: {...},  // オプション: S3/R2外部ホスティング
  pagination: {
    postsPerPage: 24,
  },
};
```

## プロジェクト構造

```
├── public/              # 静的ファイル
│   ├── favicon.svg
│   └── fonts/          # Webフォント
├── src/
│   ├── assets/         # 画像アセット
│   ├── components/     # Astroコンポーネント
│   ├── content/        # ブログ記事（Markdown/MDX）
│   │   └── blog/      # ブログ投稿
│   ├── i18n/           # 国際化
│   ├── integrations/   # Astro integrations
│   ├── layouts/        # レイアウトテンプレート
│   ├── pages/          # ページコンポーネント
│   ├── plugins/        # カスタムプラグイン
│   │   ├── remark-wikilink/      # WikiLinkサポート
│   │   ├── remark-mark-highlight/ # マークハイライト
│   │   ├── remark-tags/          # インラインタグサポート
│   │   └── rehype-callout/       # Calloutブロック
│   ├── styles/         # グローバルスタイル
│   ├── theme/          # テーマユーティリティ
│   ├── types/          # TypeScript型定義
│   └── utils/          # ユーティリティ関数
├── scripts/            # ビルドスクリプト
├── tests/              # テストファイル
├── site.config.ts      # サイト設定（一元管理）
├── astro.config.mjs    # Astro設定
├── package.json        # パッケージ設定
└── tsconfig.json       # TypeScript設定
```

## 依存ライブラリ

### メイン依存関係
- **astro** - 静的サイトジェネレーター
- **@astrojs/mdx** - MDX統合
- **@astrojs/rss** - RSSフィード生成
- **@astrojs/sitemap** - サイトマップ生成
- **sharp** - 画像処理
- **satori** - OG画像生成
- **remark-breaks** - 単一改行サポート

### 開発用依存関係
- **remark** - Markdownプロセッサ
- **unified** - テキスト処理インターフェース
- **unist-util-visit** - ASTノードトラバース

## カスタムプラグイン

### remark-wikilink
WikiLink記法（`[[ページ名]]`）をサポートするプラグイン。
- ファイル名のスペース対応
- アンカーリンク対応
- 画像埋め込み対応

### remark-mark-highlight
マークハイライト記法（`==テキスト==`）をサポートするプラグイン。
- インラインハイライト表示
- CSSカスタマイズ可能

### remark-tags
インラインタグ記法（`#tag`）をサポートするプラグイン。
- 階層タグ（`#親/子`）
- 日本語タグ対応
- タグページへの自動リンク

## 使い方

記法の例はこちらを参照：
- Markdown: https://itzpapa.hachian.com/blog/markdown-demo/
- Obsidian記法: https://itzpapa.hachian.com/blog/obsidian-syntax-demo/

### ブログ記事の作成

1. `src/content/blog/`ディレクトリに新しいフォルダを作成
2. `index.md`または`index.mdx`ファイルを作成
3. フロントマターとコンテンツを記述

```markdown
---
title: '記事タイトル'           # 必須
description: '記事の説明'       # 必須
pubDate: '2024-07-08'          # 必須 (YYYY-MM-DD)
heroImage: './image.jpg'        # オプション
tags: ['Astro', 'ブログ']       # オプション
draft: false                    # オプション
---
```

## デプロイ

### Cloudflare Pages

このプロジェクトにはCloudflare Pagesデプロイ用の設定が含まれています：
- セキュリティヘッダー設定: `public/_headers`

## ライセンス

[MIT](https://github.com/hachian/itzpapa/blob/main/LICENSE)
