# Research & Design Decisions

## Summary
- **Feature**: monthly-archive
- **Discovery Scope**: Extension（既存のタグ・カテゴリシステムの拡張）
- **Key Findings**:
  - 既存のタグページ（`/tags/`）とカテゴリページ（`/category/`）の設計パターンを再利用可能
  - `FeatureFlags`インターフェースへの`archive: boolean`追加が必要
  - i18n翻訳キーの追加（`archive.*`）で多言語対応を実現

## Research Log

### 既存ページ構造の分析
- **Context**: アーカイブページの設計パターンを既存ページから学ぶ
- **Sources Consulted**:
  - `src/pages/tags/index.astro`（タグ一覧）
  - `src/pages/tags/[...slug].astro`（タグ詳細）
  - `src/pages/category/index.astro`（カテゴリ一覧）
- **Findings**:
  - 動的ルーティングには`getStaticPaths()`を使用
  - 記事取得は`getCollection('blog')`で統一
  - 本番環境でのdraft除外は`import.meta.env.PROD`で判定
  - 統計情報（件数等）はページ内で計算
  - i18n対応は`t()`関数で実現
- **Implications**: アーカイブページも同じパターンで実装可能。コンポーネント再利用性が高い

### 型定義・設定システム
- **Context**: `features.archive`設定の追加方法
- **Sources Consulted**:
  - `src/types/site-config.ts`
  - `site.config.ts`
- **Findings**:
  - `FeatureFlags`インターフェースに新しいプロパティを追加
  - 既存パターン: `tableOfContents`, `tagCloud`, `relatedPosts`（boolean型）
  - 型定義とデフォルト値の両方を更新する必要あり
- **Implications**: `archive: boolean`を追加し、デフォルトは`true`

### 多言語対応
- **Context**: アーカイブ機能のi18n対応
- **Sources Consulted**:
  - `src/i18n/translations.ts`
  - `src/i18n/index.ts`
- **Findings**:
  - `TranslationKeys`インターフェースに新キーを追加
  - 日本語・英語の両方のエントリが必須
  - 日付フォーマットは`Intl.DateTimeFormat`で言語別に対応可能
- **Implications**: `archive.*`キーを追加（title, posts, yearFormat, monthFormat等）

### URL設計
- **Context**: アーカイブページのURL構造
- **Sources Consulted**: Astroファイルベースルーティングドキュメント
- **Findings**:
  - `/archive/` - 一覧ページ
  - `/archive/[year]/` - 年別ページ（動的ルート）
  - `/archive/[year]/[month]/` - 月別ページ（動的ルート）
  - Astroでは`[...path].astro`または`[param].astro`で動的ルーティング
- **Implications**: `src/pages/archive/`ディレクトリに3つのページファイルを作成

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 既存パターン踏襲 | タグ・カテゴリページと同じ構造 | 一貫性、学習コスト低 | なし | 採用 |
| ユーティリティ分離 | `src/utils/archive/`で集約処理 | テスト容易、再利用性 | 過剰設計の可能性 | シンプルな実装では不要 |

## Design Decisions

### Decision: 動的ルーティング構造
- **Context**: 年別・月別ページのルーティング方式
- **Alternatives Considered**:
  1. `[...slug].astro`で全パターンを1ファイルで処理
  2. `[year]/index.astro`と`[year]/[month]/index.astro`で分離
- **Selected Approach**: 分離方式（2）
- **Rationale**: 各ページの責務が明確になり、保守性が向上
- **Trade-offs**: ファイル数増加（3ファイル）vs 明確な責務分離
- **Follow-up**: なし

### Decision: 日付フォーマット
- **Context**: 年月の表示形式
- **Alternatives Considered**:
  1. 固定フォーマット（"2024年1月" / "January 2024"）
  2. `Intl.DateTimeFormat`による言語別フォーマット
- **Selected Approach**: `Intl.DateTimeFormat`を使用
- **Rationale**: 言語設定に自動追従、将来の言語追加にも対応
- **Trade-offs**: 若干の複雑さ vs 柔軟性
- **Follow-up**: なし

### Decision: 機能フラグ設計
- **Context**: `features.archive`の型と動作
- **Selected Approach**: `archive: boolean`（シンプルな有効/無効フラグ）
- **Rationale**: 他のfeatureフラグ（`tagCloud`, `relatedPosts`）と一貫性
- **Trade-offs**: 詳細設定なし vs シンプルさ

## Risks & Mitigations
- **記事が少ない場合のUX**: 記事が少ない月でもページ生成される → 空状態メッセージで対応
- **パフォーマンス**: 多数の月ページ生成 → SSGでビルド時処理のため問題なし
- **URL衝突**: `/archive/`が既存ページと衝突する可能性 → 事前確認済み、衝突なし

## References
- [Astro Dynamic Routes](https://docs.astro.build/en/guides/routing/#dynamic-routes) — ファイルベースルーティング
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) — コンテンツ取得パターン
- [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) — 国際化日付フォーマット
