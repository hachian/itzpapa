# Research & Design Decisions

## Summary
- **Feature**: `fix-about-page-horizontal-scroll`
- **Discovery Scope**: Simple Addition（CSSスタイル修正）
- **Key Findings**:
  - `.stack-name`の`min-width: 160px`は既存レスポンシブ対応で解除済み
  - `.step-text code`要素に`word-break`プロパティが未設定
  - `.feature-grid`の`minmax(200px, 1fr)`は640px以下で1列に変更済み

## Research Log

### 既存レスポンシブ対応の分析
- **Context**: 640px以下での横スクロール原因を特定するため既存CSSを分析
- **Sources Consulted**: `src/pages/about.astro` のスコープ内CSS
- **Findings**:
  - `@media (max-width: 640px)` で以下が適用済み:
    - `.feature-grid`: `grid-template-columns: 1fr`（1列レイアウト）
    - `.stack-list li`: `flex-direction: column`（縦方向配置）
    - `.stack-name`: `min-width: auto`（固定幅解除）
  - 未対応の潜在的オーバーフロー要素:
    - `.step-text code`: `word-break`未設定
    - 長いコードパス（`src/content/blog/`など）が折り返されない
- **Implications**: 追加のレスポンシブCSSルールが必要

### CSSオーバーフロー制御パターン
- **Context**: 横スクロール防止のベストプラクティス調査
- **Findings**:
  - `overflow-wrap: break-word`: 単語境界で折り返し
  - `word-break: break-all`: 強制的に文字単位で折り返し（日本語テキストに適切）
  - `overflow-x: auto` + `max-width: 100%`: 要素単位のスクロール
- **Implications**: `code`要素には`word-break: break-all`が適切

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| スコープ内CSS修正 | about.astroの`<style>`タグ内のみ修正 | 影響範囲が限定的、回帰リスク低 | なし | 推奨アプローチ |
| グローバルCSS修正 | global.cssに汎用ルール追加 | 再利用可能 | 他ページへの影響、過度な汎用化 | 不採用 |

## Design Decisions

### Decision: スコープ限定CSS修正
- **Context**: 横スクロール問題はAboutページ固有
- **Alternatives Considered**:
  1. グローバルCSSに汎用ルール追加
  2. about.astroのスコープ内CSSのみ修正
- **Selected Approach**: スコープ内CSSのみ修正
- **Rationale**: 影響範囲を最小限に抑え、回帰バグリスクを低減
- **Trade-offs**: 他ページで同様の問題が発生した場合は個別対応が必要
- **Follow-up**: 修正後、640px以下でのビジュアルテストを実施

### Decision: コード要素の折り返し方式
- **Context**: `.step-text code`内の長いパスがはみ出す
- **Alternatives Considered**:
  1. `word-break: break-all`で強制折り返し
  2. `overflow-x: auto`で個別スクロール
  3. パスを省略表示（`text-overflow: ellipsis`）
- **Selected Approach**: `word-break: break-all`で強制折り返し
- **Rationale**: ユーザーがパス全体を確認できることが重要、横スクロールを完全に防止
- **Trade-offs**: 単語途中での折り返しが発生する可能性
- **Follow-up**: 実際の表示を確認し、必要に応じて調整

## Risks & Mitigations
- **リスク1**: デスクトップ表示への影響 — 640px以下のメディアクエリ内でのみ変更を適用
- **リスク2**: ダークモードでの表示崩れ — ダークモードのスタイルは色のみで、レイアウトには影響しない
- **リスク3**: 他の要素でのオーバーフロー — 修正後に全セクションを目視確認

## References
- [MDN: word-break](https://developer.mozilla.org/ja/docs/Web/CSS/word-break) — CSSプロパティのリファレンス
- [MDN: overflow-wrap](https://developer.mozilla.org/ja/docs/Web/CSS/overflow-wrap) — 折り返し制御の代替手法
