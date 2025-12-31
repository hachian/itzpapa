# itzpapa - Obsidian風機能を備えたAstroブログ

Astroをベースにしたブログサイトで、Obsidian風の記法（WikiLink、Callout、インラインタグ、マークハイライト）と豊富なカスタマイズ機能をサポートしています。

## 特徴

### 基本機能
- Markdown & MDXサポート
- 高速な静的サイト生成（Astro v5）
- シンプルでカスタマイズ可能なデザイン（`site.config.ts`で一元設定）
- 高パフォーマンス設計
- SEO最適化（canonical URLs、OpenGraphデータ）
- **動的OG画像生成** - 記事タイトル入りのOG画像を自動生成
- **ロゴ/ファビコン自動生成** - primaryHue設定に連動したカラー
- サイトマップ自動生成
- RSSフィード対応
- **多言語対応（i18n）** - 日本語と英語をサポート
- **giscusコメントシステム** - GitHub Discussionsベースのコメント機能
- **パンくずリスト** - ブログ・タグページに表示

### Obsidian風機能
- **WikiLink記法** - `[[ページ名]]`形式のリンク記法をサポート
  - スペースを含むファイル名に対応
  - アンカーリンク（`[[ページ#見出し]]`）対応
  - 画像の埋め込み（`![[画像名.jpg]]`）対応
- **Calloutブロック** - Obsidian風の強調ブロック
  - 13種類の公式タイプ + 14エイリアス（note、tip、warning、danger、abstract、summary、info、todo、success、question、failure、bug、example、quote等）
  - 折りたたみ・ネスト可能
- **マークハイライト** - `==テキスト==`形式でテキストをハイライト表示
- **インラインタグ** - `#tag`形式でタグページへ自動リンク
  - 階層タグ：`#親タグ/子タグ`
  - 日本語タグ対応
- **単一改行での改行** - 改行1つで段落内改行（remark-breaks）

### テーマカスタマイズ
`site.config.ts`の`primaryHue`でサイト全体の色相をカスタマイズできます：

```typescript
theme: {
  // プリセット名または数値(0-360)を指定
  primaryHue: 'purple'  // または 293
}
```

**プリセット一覧：**
- `purple` (293) - 創造性と高級感
- `ocean` (200) - 信頼感と落ち着き
- `forest` (145) - 自然と成長
- `sunset` (25) - 温かみと活力
- `mono` (240) - シンプルで洗練

## インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## コマンド一覧

| コマンド | 説明 |
|---------|------|
| `npm install` | 依存関係をインストール |
| `npm run dev` | 開発サーバーを起動（localhost:4321） |
| `npm run build` | 本番用サイトをビルド（./dist/へ出力） |
| `npm run preview` | ビルド結果をローカルでプレビュー |
| `npm run test` | すべてのテストを実行 |

## 設定

すべてのサイト設定はプロジェクトルートの`site.config.ts`で一元管理されます：

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
    primaryHue: 'purple',  // プリセット名または 0-360
  },
  navigation: [...],
  social: { github: {...}, twitter: {...}, ... },
  features: {
    tableOfContents: true,
    tagCloud: true,
    relatedPosts: true,
    comments: { enabled: true, provider: 'giscus', config: {...} },
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
│   ├── layouts/        # レイアウトテンプレート
│   ├── pages/          # ページコンポーネント
│   ├── plugins/        # カスタムプラグイン
│   │   ├── remark-wikilink/      # WikiLinkサポート
│   │   ├── remark-mark-highlight/ # マークハイライト
│   │   ├── remark-tags/          # インラインタグサポート
│   │   └── rehype-callout/       # Calloutブロック
│   └── styles/         # グローバルスタイル
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

### ブログ記事の作成

1. `src/content/blog/`ディレクトリに新しいフォルダを作成
2. `index.md`または`index.mdx`ファイルを作成
3. フロントマターとコンテンツを記述

#### フロントマター（記事のメタデータ）

```markdown
---
title: '記事タイトル'          # 必須：ページのタイトル
description: '記事の説明'      # 必須：SEOやRSSで使用される説明文
pubDate: '2024-07-08'        # 必須：公開日（形式: YYYY-MM-DD）
heroImage: './image.jpg'      # オプション：ヒーロー画像のパス
tags:                         # オプション：タグ（配列形式）
  - 'Astro'
  - 'ブログ'
draft: false                  # オプション：下書きフラグ（trueで非公開）
updateDate: '2024-07-09'      # オプション：更新日（形式: YYYY-MM-DD）
---

記事の内容をここに記述...
```

#### フロントマターのフィールド詳細

| フィールド | 必須 | 説明 | 例 |
|-----------|------|------|-----|
| `title` | ○ | 記事のタイトル | `'初めてのAstroブログ'` |
| `description` | ○ | 記事の概要（SEO用） | `'Astroでブログを始める方法'` |
| `pubDate` | ○ | 公開日 | `'2025-08-16'` |
| `heroImage` | - | ヒーロー画像のパス | `'./hero.jpg'` または `'/images/hero.jpg'` |
| `tags` | - | タグのリスト | `['tech', 'web']` |
| `draft` | - | 下書き状態 | `true` または `false` |
| `updateDate` | - | 更新日 | `'2025-08-17'` |

#### 画像パスの指定方法

- **相対パス**: `./image.jpg` - 同じフォルダ内の画像
- **絶対パス**: `/blog-placeholder-1.jpg` - publicフォルダからのパス
- **外部URL**: `https://example.com/image.jpg` - 外部画像

### WikiLink記法の使用

```markdown
# 基本的なリンク
[[他のページ]]

# アンカーリンク
[[ページ名#見出し]]

# 画像の埋め込み
![[画像ファイル.jpg]]
```

### インラインタグの使用

```markdown
これは #チュートリアル 記事で、#astro/ブログ 開発について説明しています。

#日本語タグ も使用できます。
```

### Calloutブロックの使用

```markdown
> [!note]
> これはノートタイプのコールアウトです。

> [!warning]
> これは警告タイプのコールアウトです。

> [!tip]
> これはヒントタイプのコールアウトです。

> [!abstract]
> これは要約タイプのコールアウトです。
```

**利用可能なCalloutタイプ:** note, abstract, summary, tldr, info, todo, tip, hint, important, success, check, done, question, help, faq, warning, caution, attention, failure, fail, missing, danger, error, bug, example, quote, cite

## デプロイ

### Cloudflare Pages

このプロジェクトにはCloudflare Pagesデプロイ用の設定が含まれています：
- `wrangler.toml` - Cloudflare設定
- `_headers` - セキュリティヘッダー設定

## ライセンス

MIT
