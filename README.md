# Astroブログサイト with Obsidian風機能

このプロジェクトは、Astroをベースにしたブログサイトで、Obsidian風の記法（WikiLink、Callout、マークハイライト）をサポートしています。

## 特徴

### 基本機能
- 📝 Markdown & MDXサポート
- 🚀 高速な静的サイト生成（Astro v5.12.8）
- 🎨 シンプルでカスタマイズ可能なデザイン
- 📊 高パフォーマンス設計
- 🔍 SEO最適化（canonical URLs、OpenGraphデータ）
- 🗺️ サイトマップ自動生成
- 📡 RSSフィード対応

### Obsidian風機能
- **WikiLink記法** - `[[ページ名]]`形式のリンク記法をサポート
  - スペースを含むファイル名に対応
  - アンカーリンク（`[[ページ#見出し]]`）対応
  - 画像の埋め込み（`![[画像名.jpg]]`）対応
- **Calloutブロック** - Obsidian風の強調ブロック
  - 各種タイプ（note、tip、warning、danger等）をサポート
  - ネスト可能
- **マークハイライト** - `==テキスト==`形式でテキストをハイライト表示

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
| `npm run test:wikilink` | WikiLinkプラグインのテスト |
| `npm run test:image` | 画像WikiLinkのテスト |
| `npm run test:table` | テーブル内WikiLinkのテスト |
| `npm run test:performance` | パフォーマンステスト |

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
│   │   └── remark-mark-highlight/ # マークハイライト
│   └── styles/         # グローバルスタイル
├── test/               # テストファイル
├── docs/               # ドキュメント
│   ├── spec/          # 仕様書
│   ├── tasks/         # タスク管理
│   └── implementation/ # 実装詳細
├── astro.config.mjs    # Astro設定
├── package.json        # パッケージ設定
└── tsconfig.json       # TypeScript設定
```

## 依存ライブラリ

### メイン依存関係
- **astro** (v5.12.8) - 静的サイトジェネレーター
- **@astrojs/mdx** (v4.3.3) - MDX統合
- **@astrojs/rss** (v4.0.12) - RSSフィード生成
- **@astrojs/sitemap** (v3.4.2) - サイトマップ生成
- **rehype-callouts** (v2.1.2) - Obsidian風コールアウトブロック
- **sharp** (v0.34.2) - 画像処理

### 開発用依存関係
- **remark** (v15.0.1) - Markdownプロセッサ
- **unified** (v11.0.5) - テキスト処理インターフェース
- **unist-util-visit** (v5.0.0) - ASTノードトラバース

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

## 使い方

### ブログ記事の作成

1. `src/content/blog/`ディレクトリに新しいフォルダを作成
2. `index.md`または`index.mdx`ファイルを作成
3. フロントマターとコンテンツを記述

#### フロントマター（記事のメタデータ）

フロントマターは、Markdownファイルの先頭に記述するYAML形式のメタデータです。`---`で囲まれた部分に記述します。

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
| `title` | ✅ | 記事のタイトル | `'初めてのAstroブログ'` |
| `description` | ✅ | 記事の概要（SEO用） | `'Astroでブログを始める方法'` |
| `pubDate` | ✅ | 公開日 | `'2025-08-16'` |
| `heroImage` | ❌ | ヒーロー画像のパス | `'./hero.jpg'` または `'/images/hero.jpg'` |
| `tags` | ❌ | タグのリスト | `['tech', 'web']` |
| `draft` | ❌ | 下書き状態 | `true` または `false` |
| `updateDate` | ❌ | 更新日 | `'2025-08-17'` |

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

### Calloutブロックの使用

```markdown
> [!note]
> これはノートタイプのコールアウトです。

> [!warning]
> これは警告タイプのコールアウトです。

> [!tip]
> これはヒントタイプのコールアウトです。
```

## ライセンス

MIT
