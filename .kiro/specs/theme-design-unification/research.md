# Research & Design Decisions

---
**Purpose**: テーマデザイン統一機能のための調査結果と設計判断を記録
---

## Summary
- **Feature**: `theme-design-unification`
- **Discovery Scope**: Extension（既存CSSシステムの拡張）
- **Key Findings**:
  - 目次コンポーネント（`.table-of-contents`）はダークモードでのみボーダーが定義されており、ライトモードでは未定義
  - 目次リンク（`.toc-link:hover`, `.toc-link.active`）はダークモードでのみ背景色が定義されている
  - カードコンポーネント（`.card`）は両モードで一貫したボーダーパターンを持つ（ライト: `--color-gray-200`、ダーク: `--color-gray-700`）
  - ボタンコンポーネント（`.btn--secondary`, `.btn--ghost`, `.btn--text`）は既に両モードでホバー背景色が定義済み（問題なし）

## Research Log

### 目次コンポーネントのスタイル不整合

- **Context**: ユーザーからの報告で、ダークモードでは目次の枠が見えるがライトモードでは見えない
- **Sources Consulted**: `src/styles/table-of-contents.css`、`src/styles/card.css`
- **Findings**:
  - `table-of-contents.css:256-266` でライトモード基本スタイルを定義:
    - `background-color: var(--color-gray-50)`
    - `border-radius: var(--radius-xl)`
    - `box-shadow: var(--shadow-sm)`
    - **`border` プロパティなし**
  - `table-of-contents.css:269-272` でダークモードスタイルを追加:
    - `background-color: var(--color-gray-800)`
    - `border: 1px solid var(--color-gray-700)` ← **ダークモードでのみ追加**
- **Implications**: ライトモードにも `border: 1px solid var(--color-gray-200)` を追加して一貫性を確保

### 目次リンクのホバー/アクティブ状態の不整合

- **Context**: 網羅的調査で発見
- **Sources Consulted**: `src/styles/table-of-contents.css`
- **Findings**:
  - `.toc-link:hover` (lines 278-281): ダークモードでのみ `background-color: oklch(30% 0.08 293)` を定義
  - `.toc-link.active` (lines 283-286): ダークモードでのみ `background-color: oklch(30% 0.08 293)` を定義
  - ライトモードではこれらの状態に背景色が定義されていない
- **Implications**: ライトモードにもホバー/アクティブ時の背景色を追加（`.toc-link:hover` → `--color-gray-100`、`.toc-link.active` → `--color-primary-50`）

### ボタンコンポーネントの調査（問題なし）

- **Context**: 網羅的調査の一環
- **Sources Consulted**: `src/styles/button.css`
- **Findings**:
  - `.btn--secondary:hover` (lines 79-83, 209-213): 両モードで背景色定義済み
  - `.btn--ghost:hover` (lines 100-102, 215-217): 両モードで背景色定義済み
  - `.btn--text:hover` (lines 119-122, 223-225): 両モードで背景色定義済み
- **Implications**: 修正不要

### カードコンポーネントのパターン分析（参照モデル）

- **Context**: 両モードで一貫したスタイルを持つコンポーネントのパターンを調査
- **Sources Consulted**: `src/styles/card.css`
- **Findings**:
  - ライトモード基本定義（line 12-22）:
    ```css
    .card {
      border: 1px solid var(--color-gray-200);
      /* その他のスタイル */
    }
    ```
  - ダークモード上書き（line 193-195）:
    ```css
    html.dark .card {
      border-color: var(--color-gray-700);
    }
    ```
  - **パターン**: 基本スタイルでプロパティを定義し、ダークモードでは値のみ上書き
- **Implications**: このパターンを目次コンポーネントに適用

### スケルトンコンポーネントの調査

- **Context**: 網羅的調査の一環
- **Sources Consulted**: `src/styles/skeleton.css`
- **Findings**:
  - `.skeleton` (lines 12-22, 149-157): 両モードでグラデーション背景定義済み
  - `.skeleton-card` (lines 123-128, 159-161): 両モードでボーダー定義済み
- **Implications**: 修正不要

### トランジション設定の確認

- **Context**: テーマ切り替え時のスムーズな視覚的変化を確認
- **Sources Consulted**: `src/styles/design-tokens.css`、`src/styles/global.css`
- **Findings**:
  - `design-tokens.css` でトランジション変数を定義:
    - `--duration-normal: 300ms`
    - `--easing-default: cubic-bezier(0.4, 0, 0.2, 1)`
  - `global.css:74-75` でbodyにトランジション適用:
    ```css
    transition: background-color var(--duration-normal) var(--easing-default),
                color var(--duration-normal) var(--easing-default);
    ```
  - `prefers-reduced-motion` 対応済み（design-tokens.css:272-287）
- **Implications**: 新しいボーダープロパティにもトランジションを追加して一貫性を維持

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| ライトモードにボーダー追加 | 既存のダークモードパターンを逆適用 | 最小限の変更、既存パターン準拠 | なし | 推奨 |
| CSS変数でボーダー色を管理 | `--toc-border-color` 変数を導入 | 一元管理、将来の拡張性 | 変数追加のオーバーヘッド | 過剰設計の可能性 |

## Design Decisions

### Decision: カードコンポーネントパターンの採用

- **Context**: 目次のボーダー不整合を解消する方法の選定
- **Alternatives Considered**:
  1. 新規CSS変数（`--toc-border-color`）を導入して管理
  2. カードコンポーネントと同じ直接的なボーダー定義パターンを採用
- **Selected Approach**: カードコンポーネントパターンを採用
- **Rationale**:
  - 既存コードベースで確立されたパターンとの一貫性
  - 追加の抽象化レイヤーが不要
  - レビューしやすい最小限の変更
- **Trade-offs**:
  - メリット: シンプル、既存パターン準拠、即座に実装可能
  - デメリット: 特になし
- **Follow-up**: 他のコンポーネントで同様の不整合がないか監査を推奨

### Decision: トランジション適用範囲

- **Context**: 新しいボーダープロパティにトランジションを適用するか
- **Selected Approach**: `.table-of-contents` にボーダーカラーのトランジションを追加
- **Rationale**: 既存の `body` トランジションパターンとの一貫性

### Decision: ホバー/アクティブ状態の背景色選定

- **Context**: ライトモードでのホバー/アクティブ背景色の選定
- **Selected Approach**:
  - `.toc-link:hover` → `var(--color-gray-100)`: 控えめなホバー効果
  - `.toc-link.active` → `var(--color-primary-50)`: アクティブ状態を強調
- **Rationale**:
  - ボタンコンポーネントで使用されている同様のパターンとの一貫性
  - デザイントークンの活用

## Risks & Mitigations

- **既存レイアウトへの影響**: ボーダー追加によるbox-sizingの変更 → `border-box` が既に適用済み、影響なし
- **パフォーマンス**: CSSプロパティ追加によるレンダリング負荷 → 軽微、問題なし
- **ブラウザ互換性**: OKLCH色空間使用 → 既存のフォールバック機構で対応済み

## References

- [MDN - prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme) — OSテーマプリファレンスの標準仕様
- [OKLCH Color Space](https://oklch.com/) — プロジェクトで採用しているカラースペース
