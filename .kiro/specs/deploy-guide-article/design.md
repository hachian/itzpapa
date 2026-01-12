# Design Document: deploy-guide-article

## Overview

**Purpose**: itzpapaブログの新規ユーザーが、プロジェクト取得から本番公開までを1つの記事で完結できるデプロイガイドを提供する。

**Users**: itzpapaテンプレートを使用してブログを公開したいユーザー（初心者〜中級者）

**Impact**: 既存のドキュメント体系に新しいGuide記事を追加。コードベースへの変更なし。

### Goals
- プロジェクト取得からデプロイ完了までの一連の手順を提供
- GitHub連携とDirect Upload（GitHubなし）の両方をカバー
- 既存記事（site-config-guide）と一貫したスタイルを維持

### Non-Goals
- Cloudflare Pages以外のホスティングサービスの詳細解説
- トラブルシューティングガイド
- CI/CDパイプラインの高度な設定

## Architecture

### Existing Architecture Analysis

本フィーチャーはMarkdown記事の追加のみで、既存のコンテンツ管理構造に従う。

- **Content Collection**: `src/content/blog/` 配下のフォルダベース管理
- **Schema**: `src/content.config.ts` で定義されたフロントマター構造
- **Build Process**: Astroビルド時にMarkdownがHTMLに変換される

### Technology Stack

| Layer | Choice / Version | Role in Feature | Notes |
|-------|------------------|-----------------|-------|
| Content | Markdown | 記事本文 | Astro Content Collections |
| Frontmatter | YAML | メタデータ | content.config.tsスキーマ準拠 |

## Requirements Traceability

| Requirement | Summary | Components | Notes |
|-------------|---------|------------|-------|
| 1.1, 1.2, 1.3, 1.4 | 記事の基本構造 | index.md | フロントマター、カテゴリ、セクション構成 |
| 2.1, 2.2, 2.3, 2.4 | プロジェクト取得とセットアップ | セクション「プロジェクトの取得」 | git clone, npm install, dev server |
| 3.1, 3.2, 3.3, 3.4, 3.5, 3.6 | デプロイ前の必須設定 | セクション「デプロイ前の必須設定」 | site.config.ts, astro.config.mjs |
| 4.1, 4.2, 4.3 | ビルドプロセス | セクション「ビルド」 | build vs build:ci, dist/, .env |
| 5.1, 5.2, 5.3, 5.4 | Cloudflare Pagesデプロイ | セクション「Cloudflare Pagesへのデプロイ」 | GitHub連携, Direct Upload |
| 6.1, 6.2 | デプロイ方法の比較 | セクション「デプロイ方法の比較」 | 比較表 |
| 7.1, 7.2 | 画像外部ホスティング | セクション「画像外部ホスティング」 | S3/R2設定 |
| 8.1, 8.2, 8.3, 8.4 | コンテンツ品質 | 全体 | スタイル準拠、言語指定 |

## Components and Interfaces

### Content Layer

#### deploy-guide/index.md

| Field | Detail |
|-------|--------|
| Intent | itzpapaのデプロイ手順を包括的に解説するMarkdown記事 |
| Requirements | 1.1-1.4, 2.1-2.4, 3.1-3.6, 4.1-4.3, 5.1-5.4, 6.1-6.2, 7.1-7.2, 8.1-8.4 |

**Responsibilities & Constraints**
- content.config.tsで定義されたスキーマに準拠したフロントマター
- 既存Guide記事と一貫したセクション構造
- 日本語で記述

**File Structure**
```
src/content/blog/20260112-deploy-guide/
└── index.md
```

**Frontmatter Contract**
```yaml
---
title: "デプロイガイド"
description: "itzpapaブログをCloudflare Pagesにデプロイする方法を解説します。プロジェクト取得から本番公開まで、この記事だけで完結できます。"
category: "Guide"
tags:
  - deploy
  - cloudflare
  - guide
  - setup
published: 2026-01-12
---
```

## Data Models

### Article Content Structure

記事は以下のセクション構成で作成する。

```
# デプロイガイド

## はじめに
- 記事の目的と対象読者の説明

## 1. プロジェクトの取得とセットアップ
### リポジトリのクローン
### 依存関係のインストール
### 開発サーバーの起動

## 2. デプロイ前の必須設定
### site.config.tsの設定
### astro.config.mjsの設定

## 3. ビルド
### ビルドコマンド
### 出力先と確認方法
### 環境変数の設定

## 4. Cloudflare Pagesへのデプロイ
### 方法1: GitHub連携（推奨）
### 方法2: Direct Upload（CLI）
### セキュリティヘッダーについて

## 5. デプロイ方法の比較
（比較表）

## 6. 画像外部ホスティング（オプション）
### 環境変数の設定
### S3/R2の設定例

## まとめ
```

## Testing Strategy

### Content Validation
- フロントマターがcontent.config.tsスキーマに準拠していることを確認
- `npm run build` でビルドエラーがないことを確認
- 生成されたHTMLで目次が正しく表示されることを確認

### Visual Verification
- `npm run dev` で記事が正しく表示されることを確認
- コードブロックのシンタックスハイライトが適用されていることを確認
- 表が正しくレンダリングされることを確認
- 内部リンク（WikiLink形式可）が正しく機能することを確認

## Implementation Notes

- **Integration**: 既存のContent Collectionsに自動的に統合される
- **Validation**: Astroビルド時にフロントマターが自動検証される
- **Risks**: 外部サービス（Cloudflare Pages）のUIが変更された場合、記事の更新が必要
