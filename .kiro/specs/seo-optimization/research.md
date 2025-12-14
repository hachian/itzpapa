# Research & Design Decisions: SEO Optimization

---
**Purpose**: SEO最適化機能のディスカバリーフェーズで得られた調査結果と設計判断の根拠を記録。

---

## Summary
- **Feature**: `seo-optimization`
- **Discovery Scope**: Extension（既存システムへの機能拡張）
- **Key Findings**:
  - JSON-LD構造化データはGoogleが推奨する形式であり、`<head>`または`<body>`に配置可能
  - Astro 5.2以降、`trailingSlash`設定に基づく自動リダイレクトがサポートされている
  - Req 4（パフォーマンス）、Req 7（内部リンク）は既存実装で充足済み

## Research Log

### JSON-LD Article Schema ベストプラクティス
- **Context**: 記事ページの構造化データ実装に必要なスキーマ仕様の確認
- **Sources Consulted**:
  - [Google Search Central - Article Schema](https://developers.google.com/search/docs/appearance/structured-data/article)
  - [Google Search Central - Structured Data Guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- **Findings**:
  - **必須プロパティ**: なし（推奨プロパティのみ）
  - **推奨プロパティ**: `author`, `author.name`, `author.url`, `datePublished`, `dateModified`, `headline`, `image`
  - `headline`は110文字制限（リッチリザルト表示上）
  - `BlogPosting`型は`Article`のサブタイプとして使用可能
  - JSON-LDはGoogleの推奨フォーマットで、`<head>`または`<body>`に配置可能
- **Implications**:
  - `BlogPosting`型を採用（ブログサイトに最適）
  - `siteConfig`から`author`情報を取得
  - 画像URLは絶対URLで出力必要

### JSON-LD BreadcrumbList Schema
- **Context**: パンくずリスト構造化データの実装仕様確認
- **Sources Consulted**:
  - [Google Search Central - Breadcrumb](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
  - [Schema.org - BreadcrumbList](https://schema.org/BreadcrumbList)
- **Findings**:
  - 最低2つの`ListItem`が必要
  - 各`ListItem`に`item`（URL）、`name`（表示名）、`position`（位置）が必須
  - JSON-LDでは`@id`でURLを指定
  - 表示されているパンくずと一致させる必要あり
- **Implications**:
  - 既存の`Breadcrumb.astro`のitems配列をJSON-LDに変換
  - 記事ページ: ホーム → ブログ → 記事タイトル

### JSON-LD WebSite Schema
- **Context**: トップページ用構造化データの実装仕様確認
- **Sources Consulted**:
  - [Schema.org - WebSite](https://schema.org/WebSite)
  - [Google Search Central - Sitelinks Searchbox](https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox)
- **Findings**:
  - `WebSite`型は`@type`, `name`, `url`が基本
  - 検索ボックスを有効にする場合は`potentialAction`を追加
  - 現時点で検索機能なしのため、基本的なWebSite型のみ
- **Implications**:
  - シンプルなWebSite型を実装（検索ボックスは将来対応）

### Astro trailingSlash設定
- **Context**: URL末尾スラッシュの統一設定確認
- **Sources Consulted**:
  - [Astro Configuration Reference](https://docs.astro.build/en/reference/configuration-reference/)
  - [Astro 5.2 Release Notes](https://astro.build/blog/astro-520/)
- **Findings**:
  - `trailingSlash`: `'always'` | `'never'` | `'ignore'`（デフォルト: `'ignore'`）
  - Astro 5.2以降、設定に基づく自動リダイレクト対応
  - SEO上、同一コンテンツへの複数URLを避けることが重要
- **Implications**:
  - `trailingSlash: 'always'`を推奨（既存の`/blog/{slug}/`パターンと一致）
  - 既存canonical URL実装との整合性確認必要

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| A: BaseHead拡張 | 既存BaseHeadにすべてのSEO機能追加 | 単一ファイル管理、既存パターン踏襲 | コンポーネント肥大化、条件分岐複雑化 | 小規模変更向き |
| B: 新規コンポーネント分離 | JsonLd.astro、ArticleMeta.astro新規作成 | 責務分離、再利用性高い | ファイル数増加、呼び出し元変更必要 | 大規模プロジェクト向き |
| **C: ハイブリッド** | JSON-LDは新規、OGタグはBaseHead拡張 | 適度な分離と既存パターン活用 | 判断基準の明確化必要 | **採用** |

## Design Decisions

### Decision: JSON-LDコンポーネント分離
- **Context**: 構造化データ出力の実装方式選択
- **Alternatives Considered**:
  1. BaseHead.astro内にインライン実装
  2. JsonLd.astro新規コンポーネント作成
- **Selected Approach**: 新規`JsonLd.astro`コンポーネント作成
- **Rationale**:
  - JSON-LDスキーマは複数の型（Article, WebSite, BreadcrumbList）に対応
  - スキーマ構造が複雑で、BaseHead内では可読性低下
  - 単一責任原則に従い、構造化データ専用コンポーネントを分離
- **Trade-offs**:
  - ✅ テスト容易、スキーマ型ごとの管理が明確
  - ❌ レイアウトからの呼び出しが必要
- **Follow-up**: Rich Results Testでの検証

### Decision: タイトルテンプレート実装箇所
- **Context**: 「記事タイトル | サイト名」形式の実装位置
- **Alternatives Considered**:
  1. BaseHead.astro内で結合
  2. 呼び出し元で結合してpropsで渡す
- **Selected Approach**: BaseHead.astro内で結合
- **Rationale**:
  - 呼び出し元の負担軽減
  - 一貫したフォーマット保証
  - 既存の`title`propsを活かしつつ、サイト名を自動追加
- **Trade-offs**:
  - ✅ 呼び出し元変更なし
  - ❌ トップページなど例外処理が必要

### Decision: 説明文切り詰めユーティリティ
- **Context**: 160文字制限の実装場所
- **Alternatives Considered**:
  1. BaseHead.astro内にインライン実装
  2. `src/utils/seo/`にユーティリティ関数作成
- **Selected Approach**: `src/utils/seo/truncate.ts`に分離
- **Rationale**:
  - 再利用可能（OGタグ、Twitter Card、JSON-LD）
  - テスト容易
  - 将来の文字数変更に柔軟対応
- **Trade-offs**:
  - ✅ テスト可能、再利用可能
  - ❌ ファイル数増加

## Risks & Mitigations
- **Risk**: JSON-LDスキーマエラーによるリッチリザルト非表示
  - **Mitigation**: Rich Results Testでの検証、CI/CDへの組み込み検討
- **Risk**: 既存ページとの互換性問題
  - **Mitigation**: 段階的リリース、既存機能への影響テスト
- **Risk**: タイトル形式変更によるSEO影響
  - **Mitigation**: Google Search Consoleでのインデックス状況監視

## References
- [Google Search Central - Article Schema](https://developers.google.com/search/docs/appearance/structured-data/article) — Article/BlogPosting推奨プロパティ
- [Google Search Central - Breadcrumb](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb) — BreadcrumbListスキーマ仕様
- [Schema.org - WebSite](https://schema.org/WebSite) — WebSiteスキーマ定義
- [Astro Configuration Reference](https://docs.astro.build/en/reference/configuration-reference/) — trailingSlash設定
- [Astro 5.2 Release](https://astro.build/blog/astro-520/) — trailingSlash自動リダイレクト機能
