# Research & Design Decisions

## Summary
- **Feature**: prose-blog-padding
- **Discovery Scope**: Extension（既存スタイルの調整）
- **Key Findings**:
  - `.prose`のパディングは`BlogPost.astro`内の`<style>`タグで定義されている
  - デスクトップ: `padding: var(--space-8)`（32px）、モバイル: `padding: var(--space-4)`（16px）
  - 目次付きレイアウト時は`.blog-layout-with-toc .prose`で`padding: 0`にリセットされる

## Research Log

### 現在のproseスタイル構造
- **Context**: パディング調整の影響範囲を特定
- **Sources Consulted**: `src/layouts/BlogPost.astro`, `src/styles/japanese-typography.css`, `src/styles/design-tokens.css`
- **Findings**:
  - `BlogPost.astro:84-90`: `.prose`基本スタイル（`max-width: 720px`, `padding: var(--space-4)`）
  - `BlogPost.astro:93-98`: `.prose.blog-content`（`padding: var(--space-8)`、背景・角丸・シャドウ付き）
  - `BlogPost.astro:173-177`: `.blog-layout-with-toc .prose`（目次付き時の調整）
  - `BlogPost.astro:202-213`: モバイル用の`.prose`と`.prose.blog-content`の調整
- **Implications**: 変更はBlogPost.astro内のstyleタグのみで完結可能

### 既存のCSS変数
- **Context**: デザイントークンとの整合性確認
- **Sources Consulted**: `src/styles/design-tokens.css`
- **Findings**:
  - `--space-4`: 1rem（16px）- 現在のモバイルパディング
  - `--space-6`: 1.5rem（24px）
  - `--space-8`: 2rem（32px）- 現在のデスクトップパディング
  - `--content-padding`: var(--space-4) - 汎用コンテンツパディング変数あり
- **Implications**: 既存のCSS変数を使用でき、新規変数は不要

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| BlogPost.astro内のみ修正 | インラインstyleのpadding値を調整 | 変更範囲最小、他に影響なし | なし | 推奨 |
| 専用CSSファイル作成 | prose-padding.cssを新規作成 | 関心の分離 | ファイル増加、インポート必要 | 過剰 |
| japanese-typography.css修正 | 既存のproseスタイルに追記 | 関連スタイルの集約 | 既存動作への影響リスク | 非推奨 |

## Design Decisions

### Decision: BlogPost.astro内のスタイル修正のみ
- **Context**: 最小限の変更で要件を満たす
- **Alternatives Considered**:
  1. 新規CSSファイル作成 - 過剰な分離
  2. japanese-typography.css修正 - 既存動作への影響リスク
- **Selected Approach**: BlogPost.astro内の`<style>`タグのパディング値のみ調整
- **Rationale**: 影響範囲が明確で、他のコンポーネントに影響を与えない
- **Trade-offs**: スタイルがコンポーネントに閉じ込められる（メリットでもある）
- **Follow-up**: Playwrightでの確認が必須

## Risks & Mitigations
- リスク1: 目次付きレイアウトとの整合性 — 既存の`.blog-layout-with-toc`スタイルを維持することで対応
- リスク2: モバイル表示の崩れ — 既存のメディアクエリ構造を維持、Playwrightで確認
- リスク3: Callout等の子要素への影響 — `.prose`直下のpaddingのみ変更し、子要素のスタイルは変更しない

## References
- [design-tokens.css](src/styles/design-tokens.css) — スペーシング変数定義
- [BlogPost.astro](src/layouts/BlogPost.astro) — 現在のproseスタイル定義
