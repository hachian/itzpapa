# Research & Design Decisions

## Summary
- **Feature**: `homepage-redesign`
- **Discovery Scope**: Extension（既存システムの拡張）
- **Key Findings**:
  - 既存のデザインシステム（design-tokens.css）が充実しており、アニメーション、カラー、スペーシングのトークンが定義済み
  - card.css、button.cssで再利用可能なコンポーネントスタイルが確立されている
  - アクセシビリティ基盤（ARIA属性、prefers-reduced-motion、フォーカスリング）が実装済み

## Research Log

### 既存アニメーション基盤の調査
- **Context**: ヒーローセクションのフェードインアニメーション実装方法の検討
- **Sources Consulted**: `src/styles/design-tokens.css`
- **Findings**:
  - `@keyframes fade-in`、`fade-out`、`slide-from-right`、`slide-to-left`が定義済み
  - View Transitionsとの統合が実装されている
  - `--duration-*`トークンでアニメーション時間を統一管理
  - `--easing-*`トークンでイージング関数を標準化
- **Implications**: 新規keyframes定義は不要。既存のfade-inを活用し、ページロード時のアニメーションを追加

### prefers-reduced-motion対応の調査
- **Context**: アクセシビリティ要件5.7への対応確認
- **Sources Consulted**: `src/styles/design-tokens.css`, `src/styles/callout.css`, `src/styles/mark.css`
- **Findings**:
  - `@media (prefers-reduced-motion: reduce)`でduration変数を0msに設定
  - View Transitionsも無効化される仕組みが実装済み
  - 複数のCSSファイルで一貫したreduced-motion対応
- **Implications**: 新規アニメーション追加時もduration変数を使用すれば自動的にreduced-motion対応となる

### カードコンポーネントの調査
- **Context**: ナビゲーションカード・記事カードのデザイン改善
- **Sources Consulted**: `src/styles/card.css`
- **Findings**:
  - ホバー時のリフト効果（`transform: translateY(-4px)`）が実装済み
  - フォーカス時のアウトライン（`focus-within`）が実装済み
  - ダークモード対応（`html.dark .card`）が実装済み
  - サムネイル付きカード（`.card--has-thumbnail`）のスタイルが定義済み
- **Implications**: card.cssの既存スタイルで要件2.1-2.4、3.1-3.4をほぼカバー

### ホームページ現状分析
- **Context**: 変更対象ファイルの特定
- **Sources Consulted**: `src/pages/index.astro`
- **Findings**:
  - ヒーロー、ナビゲーション、最新記事の3セクション構成
  - ARIA属性が適切に使用されている（aria-labelledby, role, aria-label）
  - 画像最適化（Astro Image）が実装済み
  - ダークモード対応のスコープドCSS
  - ページ内CSSで約220行のスタイル定義
- **Implications**: index.astroのスコープドCSSに変更を加え、一部をcard.cssの共通スタイルに統合

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Option A: 既存拡張 | index.astroのスタイル調整のみ | 変更範囲最小、既存パターン活用 | なし | **推奨** |
| Option B: コンポーネント分離 | Hero/NavCardsを個別コンポーネント化 | 再利用性向上 | 過剰設計、変更範囲拡大 | 将来検討 |

## Design Decisions

### Decision: 既存デザインシステムの活用
- **Context**: デザイン刷新の実装アプローチ選定
- **Alternatives Considered**:
  1. 新規CSSファイル作成
  2. 既存design-tokens.css/card.cssの拡張
- **Selected Approach**: 既存のデザイントークンとカードスタイルを最大限活用し、index.astroのスコープドCSSで差分のみ追加
- **Rationale**: 既存基盤が充実しており、統一性を維持しながら最小限の変更で要件を満たせる
- **Trade-offs**:
  - ✅ 一貫性の維持、変更リスク最小化
  - ❌ 将来的なコンポーネント再利用性は限定的
- **Follow-up**: ページロード時アニメーションのパフォーマンス影響を検証

### Decision: スコープドCSSによるアニメーション追加
- **Context**: ヒーローセクションのフェードインアニメーション実装方法
- **Alternatives Considered**:
  1. design-tokens.cssに新規keyframes追加
  2. index.astroのスコープドCSSで定義
- **Selected Approach**: index.astroのスコープドCSSでアニメーションクラスを追加し、既存のduration/easingトークンを参照
- **Rationale**: ホームページ固有のアニメーションであり、グローバルに定義する必要がない
- **Trade-offs**:
  - ✅ 変更スコープが明確
  - ❌ 他ページで同様のアニメーションが必要な場合は別途定義が必要
- **Follow-up**: アニメーションがprefers-reduced-motionで正しく無効化されることを確認

## Risks & Mitigations
- **Risk 1: LCPへの影響** — ヒーローアニメーションがLCPを遅延させる可能性 → アニメーションはLCP測定後に開始するよう設計
- **Risk 2: カラーコントラスト不足** — ダークモードでの視認性 → Lighthouseアクセシビリティ監査で検証
- **Risk 3: アニメーション過多** — ユーザー体験への悪影響 → reduced-motion対応の徹底

## References
- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) — アクセシビリティ基準
- [Web Vitals - LCP](https://web.dev/lcp/) — パフォーマンス指標
- [Astro Image Optimization](https://docs.astro.build/en/guides/images/) — 画像最適化ガイド
