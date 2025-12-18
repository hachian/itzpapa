# Research & Design Decisions

## Summary
- **Feature**: heading-design-change
- **Discovery Scope**: Simple Addition（CSSスタイル拡張）
- **Key Findings**:
  - 既存の`.prose`コンテキスト内にh2-h4のスタイルが定義済み（`japanese-typography.css`）
  - デザイントークンに必要な色変数（primary、gray系）が豊富に用意されている
  - ダークモード対応の仕組みが確立されている（`html.dark`、`@media prefers-color-scheme`）

## Research Log

### 既存の見出しスタイル構造
- **Context**: 見出し装飾の追加先を特定
- **Sources Consulted**: `global.css`、`japanese-typography.css`、`design-tokens.css`
- **Findings**:
  - `global.css`（L97-126）: 全見出し共通スタイル（margin、color、line-height、font-weight、scroll-margin）
  - `japanese-typography.css`（L22-46）: `.prose`内の見出しサイズとスタイル設定
  - 見出し装飾は`japanese-typography.css`への追加が適切
- **Implications**: `.prose h2`, `.prose h3`, `.prose h4`セレクタで装飾を追加

### デザイントークンの活用
- **Context**: 見出し装飾に使用可能な色変数の確認
- **Sources Consulted**: `design-tokens.css`
- **Findings**:
  - アクセントカラー: `--color-accent`、`--color-primary-500`〜`--color-primary-700`
  - 背景用透過色: `--color-primary-500-alpha10`、`--color-primary-500-alpha05`
  - グレー系: `--color-gray-100`〜`--color-gray-300`（背景用）
  - スペーシング: `--space-1`〜`--space-4`（padding用）
  - 角丸: `--radius-sm`〜`--radius-md`
- **Implications**: 新規CSS変数の追加は不要、既存トークンで実装可能

### ダークモード対応パターン
- **Context**: 見出し装飾のダークモード対応方法
- **Sources Consulted**: `global.css`、`design-tokens.css`
- **Findings**:
  - `html.dark`セレクタでライトモードスタイルを上書き
  - `@media (prefers-color-scheme: dark)`で`:root:not(.light)`を使用
  - ダークモードでは`--color-primary-500`が自動的に明るい色に切り替わる
- **Implications**: 同じ変数を使用すればダークモード対応は自動的に行われる

### 参考デザインパターン（saruwakakun.com）
- **Context**: h2-h4の視覚的区別のためのデザインパターン
- **Sources Consulted**: https://saruwakakun.com/html-css/reference/h-design
- **Findings**:
  - 左ボーダー+背景: 最も目立つ、セクション開始に適切
  - 左ボーダーのみ: 中程度の目立ち、サブセクションに適切
  - 下線のみ: 控えめ、細分化されたセクションに適切
- **Implications**: h2→左ボーダー+背景、h3→左ボーダー、h4→下線の階層化

## Design Decisions

### Decision: 装飾パターンの階層化
- **Context**: h2-h4を視覚的に区別する必要がある
- **Alternatives Considered**:
  1. 全レベル同じ装飾タイプで太さ/色を変える
  2. 各レベルで異なる装飾タイプを使用
- **Selected Approach**: 各レベルで異なる装飾タイプを使用
- **Rationale**: 装飾タイプが異なることで、色覚特性に関わらず区別しやすい
- **Trade-offs**: CSSの複雑性が若干増加するが、アクセシビリティ向上のメリットが大きい

### Decision: スタイル定義場所
- **Context**: 見出し装飾CSSの追加先
- **Alternatives Considered**:
  1. 新規ファイル`heading.css`を作成
  2. 既存の`japanese-typography.css`に追加
- **Selected Approach**: `japanese-typography.css`に追加
- **Rationale**: 既に`.prose h2`等のスタイルが定義されており、関連性が高い
- **Trade-offs**: ファイルサイズが増加するが、インポート管理の複雑性を回避

## Risks & Mitigations
- **既存スタイルとの競合** — セレクタの詳細度を既存と同等に保ち、追記形式で実装
- **ダークモードでの視認性低下** — 実装後にライト/ダーク両モードで視覚確認を実施

## References
- [サルワカ 見出しデザイン](https://saruwakakun.com/html-css/reference/h-design) — デザインパターンの参考
