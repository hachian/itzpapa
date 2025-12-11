# Research & Design Decisions

## Summary
- **Feature**: japanese-page-design
- **Discovery Scope**: Extension（既存CSSシステムの拡張）
- **Key Findings**:
  - 現在のフォントサイズ（20px）は競合より大きく、line-height（1.625）は狭い
  - FormattedDateは`toLocaleDateString('ja-JP')`を使用しており「YYYY年M月D日」形式
  - 404ページは既に日本語化済み

## Research Log

### フォントサイズ・行間の競合調査
- **Context**: 日本語ブログの標準的なタイポグラフィ設定を把握
- **Sources Consulted**: note.com, Zenn, Qiita, Yahoo!ニュース
- **Findings**:
  - note.com: 18px / line-height: 2.0（ゆったり）
  - Zenn: 16px / line-height: 1.8-1.9（技術記事向け）
  - Qiita: 16px / line-height: 1.9（WCAG準拠）
  - ニュースサイト: 16px / line-height: 1.75
- **Implications**:
  - 本文は16-18pxが標準、line-heightは1.8-2.0が推奨
  - itzpapaの現状（20px / 1.625）は大きめ＆詰まり気味

### 既存デザイントークン分析
- **Context**: 変更の影響範囲を特定
- **Findings**:
  - `design-tokens.css`にタイポグラフィスケールが定義済み
  - `--font-size-lg: 1.125rem (18px)`, `--font-size-base: 1rem (16px)`
  - `--line-height-loose: 1.85`が日本語用として定義済みだが未使用
  - bodyのfont-sizeは`--font-size-xl`（20px）を使用
- **Implications**:
  - 既存トークンを活用してフォントサイズ変更可能
  - line-height-looseを1.9に調整して本文に適用

### 既存コンポーネント分析
- **Context**: 変更が必要なコンポーネントを特定
- **Findings**:
  - FormattedDate: `toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })`
  - 現在の出力形式: 「2025年1月15日」（要件はYYYY/MM/DD）
  - BlogPost: 更新日表示あり、形式変更が必要
  - 404.astro: 日本語メッセージ実装済み
- **Implications**:
  - FormattedDateの形式を`YYYY/MM/DD`に変更
  - 更新日の表示形式も同様に変更

### 日本語タイポグラフィ最適化
- **Context**: 和文に適したCSS設定を調査
- **Findings**:
  - `letter-spacing: 0.02em-0.05em`が和文の読みやすさを向上
  - `font-feature-settings: "palt"`で約物の配置最適化
  - `text-wrap: balance`で見出しの折り返し改善（Chrome 114+）
  - `overflow-wrap: break-word`で全角文字の適切な折り返し
- **Implications**:
  - .prose領域にletter-spacingを追加
  - 見出しにtext-wrap: balanceを検討

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| CSSトークン拡張 | design-tokens.cssの値を調整 | 既存パターン維持、影響範囲明確 | サイト全体に影響 | 採用 |
| 新規CSSファイル追加 | japanese-typography.css | 分離が明確 | import順序管理が複雑 | 不採用 |
| コンポーネント個別調整 | 各コンポーネントにスタイル追加 | 局所的な変更 | 一貫性維持が困難 | 不採用 |

## Design Decisions

### Decision: フォントサイズ戦略
- **Context**: 競合サービスと同等の可読性を実現
- **Alternatives Considered**:
  1. 固定値（18px）を全デバイスに適用
  2. レスポンシブ（デスクトップ18px、モバイル16px）
- **Selected Approach**: レスポンシブアプローチ
- **Rationale**: モバイルでは画面サイズを考慮して小さめに、デスクトップでは読みやすい18pxを使用
- **Trade-offs**: メディアクエリの追加が必要だが、デバイスごとの最適化が可能
- **Follow-up**: 実装後にユーザビリティテストを検討

### Decision: 日付形式の変更方法
- **Context**: YYYY/MM/DDへの形式変更
- **Alternatives Considered**:
  1. toLocaleDateString optionsの変更
  2. カスタムフォーマット関数の作成
- **Selected Approach**: カスタムフォーマット関数
- **Rationale**: `toLocaleDateString`ではYYYY/MM/DD形式を直接サポートしない
- **Trade-offs**: コード量増加だが、形式の完全な制御が可能

### Decision: 段落間余白の調整
- **Context**: 日本語テキストの視覚的リズム
- **Alternatives Considered**:
  1. `.prose p`のmargin-bottomを調整
  2. 新しいCSS変数を追加
- **Selected Approach**: 既存の.prose pルールを調整（var(--space-8)→1.75em相当）
- **Rationale**: 相対単位でフォントサイズに連動させる

## Risks & Mitigations
- **Risk 1**: フォントサイズ変更による既存レイアウト崩れ → カード・ヘッダー等を個別確認
- **Risk 2**: text-wrap: balanceのブラウザサポート → フォールバックは通常の折り返し
- **Risk 3**: 日付形式変更によるRSSフィード等への影響 → datetime属性はISO8601を維持

## References
- [note.comのタイポグラフィ設定](https://note.com/chanoh/n/n2dd309c8ded0)
- [日本語の文章とline-heightに対する考察 - Qiita](https://qiita.com/NagayamaToshiaki/items/25d4969636d05bf48c41)
- [CSS text-wrap: balance - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap)
- [font-feature-settings: palt - MDN](https://developer.mozilla.org/ja/docs/Web/CSS/font-feature-settings)
