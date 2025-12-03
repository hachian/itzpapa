# Research & Design Decisions

---
**Purpose**: ブログ一覧ページリデザインに関するディスカバリー結果と設計決定の根拠を記録
---

## Summary
- **Feature**: `blog-list-redesign`
- **Discovery Scope**: Extension（既存UIの改善）
- **Key Findings**:
  - 既存の `card.css` に再利用可能なカードコンポーネントスタイルが存在
  - デザイントークン（`design-tokens.css`）に統一されたスペーシング、タイポグラフィ、ブレークポイントが定義済み
  - 現状の実装では最初の記事を特別扱い（`li:first-child`）しており、これを削除する必要がある

## Research Log

### 既存カードスタイルの調査
- **Context**: ブログ一覧の記事カードに適用可能な既存スタイルの確認
- **Sources Consulted**: `src/styles/card.css`
- **Findings**:
  - `.card--has-thumbnail`: サムネイル付きカードの基本スタイル
  - `.card__thumbnail`: 16:9アスペクト比、`object-fit: cover`
  - `.card__content`: パディング付きコンテンツエリア
  - `.card__title`, `.card__description`: タイポグラフィスタイル
  - `.card-grid--3`: 3列グリッドレイアウト
- **Implications**: 既存スタイルを最大限活用し、追加CSSを最小化

### CSS Flexboxによる固定高さカード実装
- **Context**: カードの縦幅を揃えるための技術調査
- **Sources Consulted**: CSS仕様、既存実装
- **Findings**:
  - `display: flex; flex-direction: column;` でコンテンツ領域を構造化
  - `flex-grow: 1` で説明文エリアを伸縮させ、日付を常に下部に配置
  - `min-height` または固定 `height` で全カードの高さを統一
  - `-webkit-line-clamp` でテキスト省略（既存実装で使用済み）
- **Implications**: CSS Flexboxで高さ統一を実現、JavaScriptは不要

### グリッドレスポンシブブレークポイント
- **Context**: レスポンシブグリッドの列数制御
- **Sources Consulted**: `src/styles/design-tokens.css`
- **Findings**:
  - `--breakpoint-md: 768px`（タブレット）
  - `--breakpoint-lg: 1024px`（デスクトップ）
  - 既存グリッド: `minmax(300px, 1fr)` による自動フィット
- **Implications**: 明示的なブレークポイントで3列/2列/1列を制御

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 既存card.cssの拡張 | 既存カードスタイルをブログ一覧用に拡張 | 一貫性維持、コード重複削減 | 既存スタイルへの影響リスク | 採用 |
| インラインスタイルのみ | index.astro内のスタイルを修正 | 変更範囲が限定的 | card.cssとの重複、保守性低下 | 不採用 |
| 新規コンポーネント抽出 | PostCard.astroとして分離 | 再利用性向上 | 現時点では過剰設計 | 将来検討 |

## Design Decisions

### Decision: 既存card.cssスタイルの活用
- **Context**: ブログカードのスタイリング方針
- **Alternatives Considered**:
  1. 完全に新規スタイルを作成
  2. 既存card.cssを拡張
- **Selected Approach**: 既存card.cssのクラスを活用しつつ、ブログ一覧固有のスタイルをindex.astro内に記述
- **Rationale**: デザインシステムの一貫性を維持しながら、変更範囲を最小化
- **Trade-offs**: card.cssへの依存が増えるが、保守性は向上
- **Follow-up**: 将来的にPostCard.astroコンポーネントとして抽出を検討

### Decision: CSS Flexboxによる高さ統一
- **Context**: すべてのカードの縦幅を揃える方法
- **Alternatives Considered**:
  1. JavaScript で高さを動的計算
  2. CSS Grid の `grid-auto-rows: 1fr`
  3. CSS Flexbox で固定高さコンテナ
- **Selected Approach**: CSS Flexbox + 固定高さコンテナ
- **Rationale**: SSGサイトでJSなしに実現可能、既存パターンとの整合性
- **Trade-offs**: コンテンツ量が極端に多い場合に省略が発生
- **Follow-up**: 省略表示の視認性をテスト

### Decision: 明示的ブレークポイントによるグリッド制御
- **Context**: レスポンシブグリッドの列数
- **Alternatives Considered**:
  1. `auto-fill` + `minmax()` による自動調整
  2. メディアクエリで明示的に列数指定
- **Selected Approach**: メディアクエリで明示的に制御（3列/2列/1列）
- **Rationale**: 要件で指定された列数を確実に実現
- **Trade-offs**: CSS量がやや増加
- **Follow-up**: 中間サイズでのレイアウト確認

## Risks & Mitigations
- **Risk 1**: 既存card.cssへの変更が他ページに影響 — ブログ一覧固有スタイルはスコープ付きで記述
- **Risk 2**: 長いタイトル/説明文でレイアウト崩れ — line-clampとoverflow:hiddenで対応
- **Risk 3**: ヒーロー画像なし記事でのレイアウト不整合 — プレースホルダーまたは固定高さで対応

## References
- [CSS Flexbox - MDN](https://developer.mozilla.org/ja/docs/Web/CSS/CSS_flexible_box_layout) — Flexboxレイアウトの基本
- [CSS line-clamp - MDN](https://developer.mozilla.org/ja/docs/Web/CSS/-webkit-line-clamp) — テキスト省略の実装
- 既存実装: `src/styles/card.css`, `src/styles/design-tokens.css`
