# Research & Design Decisions

## Summary
- **Feature**: `table-design-improvement`
- **Discovery Scope**: Simple Addition（CSSのみの変更）
- **Key Findings**:
  - 既存のcallout.cssがダークモード、レスポンシブ、OKLCH対応のベストプラクティスを提供
  - design-tokens.cssで定義された変数を活用することで一貫性を確保
  - 現在のテーブルスタイルは`width: 100%`のみで、大幅な改善余地がある

## Research Log

### 既存スタイルパターン分析
- **Context**: プロジェクト内の既存CSSパターンを確認し、新規スタイルの設計方針を決定
- **Sources Consulted**: `src/styles/callout.css`, `src/styles/global.css`, `src/styles/design-tokens.css`
- **Findings**:
  - CSS変数による色定義（OKLCH形式）
  - `html.dark`セレクタと`@media (prefers-color-scheme: dark)`の両方でダークモード対応
  - モバイル(767px未満)、タブレット(768px-1023px)、デスクトップ(1024px以上)のブレイクポイント
  - `var(--space-*)`, `var(--radius-*)`, `var(--color-*)` 形式の変数参照
- **Implications**: table.cssは同じパターンに従い、design-tokens.cssの変数を使用

### テーブルレスポンシブ対応の検討
- **Context**: モバイルでのテーブル表示方法の選択肢を検討
- **Sources Consulted**: CSS best practices, 一般的なテーブルレスポンシブ手法
- **Findings**:
  - 水平スクロール方式が最もシンプルで堅牢
  - カード形式への変換は複雑度が高く、Markdown生成テーブルには不向き
  - スクロールインジケーター（影）で視覚的なフィードバックを提供可能
- **Implications**: 水平スクロール + 影インジケーター方式を採用

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| global.css追加 | 既存のglobal.cssにテーブルスタイルを追加 | 分離されたファイル管理なし | ファイルが肥大化、保守性低下 | 非推奨 |
| table.css分離 | 専用CSSファイルとしてtable.cssを作成 | 機能別分離、保守性向上、他スタイルと一貫 | ファイル数増加（軽微） | **採用** |

## Design Decisions

### Decision: スタイルファイルの配置
- **Context**: テーブルスタイルをどこに配置するか
- **Alternatives Considered**:
  1. global.cssに追加 — 既存ファイルへの追記
  2. table.css新規作成 — 機能別分離
- **Selected Approach**: `src/styles/table.css`として新規作成し、global.cssからインポート
- **Rationale**: プロジェクトの既存パターン（callout.css, tag.css等）に従う
- **Trade-offs**: ファイル数が1つ増えるが、保守性が向上
- **Follow-up**: global.cssに`@import './table.css';`を追加

### Decision: ゼブラストライプの色
- **Context**: 交互背景色の視認性とデザイン一貫性のバランス
- **Alternatives Considered**:
  1. gray-50/gray-100の交互 — 微妙な差
  2. transparent/gray-100の交互 — 明確な差
- **Selected Approach**: transparent（奇数行）とgray-100（偶数行）の交互
- **Rationale**: 既存のcallout背景色パターンと調和し、十分な視認性を確保
- **Trade-offs**: ダークモードでは別の配色が必要

## Risks & Mitigations
- **Risk**: 既存コンテンツのテーブルレイアウト崩れ — 既存のブログ記事を確認し、テスト
- **Risk**: 複雑なMarkdownテーブル（セル結合など）非対応 — Markdownの標準テーブル記法の範囲内に限定
- **Risk**: 非常に長いセル内容によるレイアウト崩れ — min-widthと水平スクロールで対応

## References
- [design-tokens.css](src/styles/design-tokens.css) — プロジェクトのデザインシステム基盤
- [callout.css](src/styles/callout.css) — ダークモード・レスポンシブ対応のベストプラクティス
