# Research & Design Decisions

## Summary
- **Feature**: `breadcrumb-expansion`
- **Discovery Scope**: Extension（既存コンポーネントの拡張）
- **Key Findings**:
  - 既存のBreadcrumbコンポーネントは汎用的な設計で、`items`配列を渡すだけで動作
  - i18n翻訳キー`breadcrumb.tags`が未定義のため追加が必要
  - タグ詳細ページの既存パンくずリストは独自実装（`.breadcrumbs`クラス）で、共通コンポーネントへの置き換えが必要

## Research Log

### 既存Breadcrumbコンポーネントの分析
- **Context**: 拡張対象コンポーネントの仕様確認
- **Sources Consulted**: `src/components/Breadcrumb.astro`
- **Findings**:
  - インターフェース: `items: BreadcrumbItem[]`、`separator?: string`
  - BreadcrumbItem: `{ label: string; href?: string }`
  - `href`がundefinedの場合は現在のページとして表示（`aria-current="page"`）
  - 既存スタイルはCSS変数を使用しダークモード・レスポンシブ対応済み
- **Implications**: コンポーネント変更不要、呼び出し側で適切な`items`配列を構築するだけで対応可能

### i18n翻訳キーの現状
- **Context**: 多言語対応の実装確認
- **Sources Consulted**: `src/i18n/translations.ts`
- **Findings**:
  - 既存キー: `breadcrumb.ariaLabel`, `breadcrumb.home`, `breadcrumb.blog`
  - 不足キー: `breadcrumb.tags`
  - 翻訳値: ja=「タグ」, en="Tags"
- **Implications**: TranslationKeysインターフェースと各言語の翻訳オブジェクトに`breadcrumb.tags`を追加

### タグ詳細ページの既存実装
- **Context**: 置き換え対象の特定
- **Sources Consulted**: `src/pages/tags/[...slug].astro`
- **Findings**:
  - 独自の`.breadcrumbs`クラスによるパンくずリスト実装（行405-420）
  - 「戻る」リンク（`← タグ一覧に戻る`）も存在（行400-401）
  - `getTagBreadcrumbs()`関数で階層タグのパンくずを生成（行79-97）
  - 関連CSSスタイル: `.breadcrumbs`, `.breadcrumb-item`, `.breadcrumb-link`, `.breadcrumb-separator`
- **Implications**: 既存の独自実装を削除し、共通Breadcrumbコンポーネントに統一

### BlogPost.astroでの使用パターン
- **Context**: 既存の正しい使用方法の確認
- **Sources Consulted**: `src/layouts/BlogPost.astro`
- **Findings**:
  - Breadcrumbコンポーネントをimportして使用
  - items配列を構築: `[{ label: t('breadcrumb.home'), href: '/' }, { label: t('breadcrumb.blog'), href: '/blog/' }, { label: title }]`
  - 最後の要素は`href`なしで現在のページを表す
- **Implications**: 同じパターンをタグページ・ブログ一覧ページにも適用

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 既存コンポーネント再利用 | Breadcrumb.astroをそのまま使用 | 実装コスト最小、一貫性確保 | なし | 採用 |
| コンポーネント拡張 | 階層タグ用の特別処理を追加 | 階層タグの視覚的差別化 | 過剰設計、保守性低下 | 不採用 |

## Design Decisions

### Decision: 既存Breadcrumbコンポーネントの再利用
- **Context**: 3つのページにパンくずリストを追加する必要がある
- **Alternatives Considered**:
  1. 既存コンポーネントをそのまま再利用
  2. 新しい専用コンポーネントを作成
- **Selected Approach**: 既存コンポーネントをそのまま再利用
- **Rationale**: コンポーネントは汎用的に設計されており、items配列を渡すだけで動作する。変更は呼び出し側のみで完結する。
- **Trade-offs**: 追加開発なしで一貫性を確保できるが、ページ固有のカスタマイズは制限される
- **Follow-up**: なし

### Decision: i18n翻訳キーの追加
- **Context**: タグページのパンくずリストに「タグ」ラベルが必要
- **Alternatives Considered**:
  1. 既存の`nav.tags`キーを再利用
  2. 新しい`breadcrumb.tags`キーを追加
- **Selected Approach**: `breadcrumb.tags`キーを新規追加
- **Rationale**: ナビゲーションとパンくずリストで異なる文言が必要になる可能性を考慮し、名前空間を分離
- **Trade-offs**: 翻訳キーが増えるが、将来の柔軟性が向上
- **Follow-up**: translations.tsへのキー追加

### Decision: 既存独自実装の完全削除
- **Context**: タグ詳細ページに独自のパンくずリスト実装がある
- **Alternatives Considered**:
  1. 既存コードを残してBreadcrumbコンポーネントと並存
  2. 完全に置き換え
- **Selected Approach**: 完全に置き換え
- **Rationale**: 重複コードの削除、保守性向上、一貫性確保
- **Trade-offs**: 若干の視覚的な変化（スタイルが共通コンポーネントに統一）
- **Follow-up**: 既存CSSスタイルの削除確認

## Risks & Mitigations
- **リスク1**: 既存ページのレイアウト崩れ — パンくずリスト追加によるレイアウト影響を事前確認
- **リスク2**: 翻訳キー追加漏れ — 全言語（ja, en）への追加を確認
- **リスク3**: 階層タグの表示が長くなりすぎる — レスポンシブ対応の折り返し表示で対応済み

## References
- [Astro Components](https://docs.astro.build/en/core-concepts/astro-components/) — コンポーネント設計ガイド
- [WAI-ARIA Breadcrumb Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/) — アクセシビリティガイドライン
