# Research & Design Decisions

## Summary
- **Feature**: `color-scheme-revision`
- **Discovery Scope**: Extension（既存のOKLCHカラーシステムの拡張）
- **Key Findings**:
  - 現在のdesign-tokens.cssは`--primary-hue`変数による動的カラー生成を既に実装済み
  - ダークモードの背景色（--color-gray-900）はOKLCH明度15%で非常に暗い
  - ブログ本文は`var(--color-background)`を使用しており、ページ背景と同一色

## Research Log

### 既存カラーシステムの分析
- **Context**: 現在の配色スキーム実装状況の把握
- **Sources Consulted**: `src/styles/design-tokens.css`, `src/site.config.ts`, `src/types/site-config.ts`
- **Findings**:
  - OKLCHカラースペースを採用（知覚的に均一な色空間）
  - `--primary-hue`（0-360）により全プライマリカラーパレットを動的生成
  - グレースケールは色相280（紫みのグレー）で統一感を持たせている
  - ダークモードは`html.dark`クラスと`@media (prefers-color-scheme: dark)`の両方をサポート
- **Implications**: プリセット配色は`--primary-hue`の値セットとして実装可能

### ダークモード明度の現状
- **Context**: ダークモードの黒が暗すぎるという課題
- **Sources Consulted**: `src/styles/design-tokens.css`
- **Findings**:
  - 現在の背景: `--color-gray-900: oklch(15% 0.010 280)` → 明度15%
  - サーフェス: `--color-gray-800: oklch(25% 0.012 280)` → 明度25%
  - 業界標準（Material Design 3）では背景に明度12-18%を推奨
  - ただしユーザーフィードバックでは明るめが望まれている
- **Implications**: 背景を20-25%、サーフェスを28-32%程度に調整

### 本文エリア背景分離
- **Context**: ブログ本文を周囲から視覚的に区別する
- **Sources Consulted**: `src/layouts/BlogPost.astro`, `src/styles/global.css`
- **Findings**:
  - 現在は`.prose`クラスに背景色指定なし（透明）
  - `body`にはグラデーション背景が設定されている
  - ライトモード: `var(--color-gray-100)` → `var(--color-background)`
  - `--color-surface`（白/ダークグレー）は定義済みだが未使用箇所あり
- **Implications**: `.prose`または`.blog-content`に`--color-surface`を適用

### Obsidian互換要素の配色
- **Context**: Callout、タグ、マークハイライトの統一
- **Sources Consulted**: `src/styles/callout.css`, `src/styles/tag.css`, `src/styles/mark.css`
- **Findings**:
  - Calloutは独自の固定色相を使用（note=260, tip=150等）
  - タグは`--tag-bg`, `--tag-color`変数でプライマリカラーから派生
  - マークハイライトは黄色系（色相100）で固定
  - プリセット変更時に調和が崩れる可能性
- **Implications**: セマンティック色相オフセットシステムの導入を検討

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| CSS変数のみ | design-tokens.cssの変数調整 | 最小限の変更、後方互換性維持 | プリセット切り替えにJS必要 | 推奨 |
| CSS-in-JS | Astroコンポーネントでスタイル生成 | 型安全、動的生成 | ビルド複雑化、SSGとの相性 | 不採用 |
| Tailwind | ユーティリティクラスベース | 開発効率 | 既存アーキテクチャと不整合 | 不採用 |

## Design Decisions

### Decision: プリセットシステムの実装方式
- **Context**: 複数の配色プリセットを提供する方法
- **Alternatives Considered**:
  1. site.config.tsでプリセット名を指定、ビルド時にCSS生成
  2. ランタイムでJSによりCSS変数を切り替え
  3. 複数のCSSファイルを生成しテーマごとに読み込み
- **Selected Approach**: Option 1 - ビルド時CSS生成
- **Rationale**: SSGアーキテクチャと整合、ランタイムJS不要、パフォーマンス最適
- **Trade-offs**: ランタイムでのテーマ切り替えは既存のダークモード切り替えに限定
- **Follow-up**: プリセット定義をTypeScript型で厳密に管理

### Decision: ダークモード明度調整
- **Context**: ダークモード背景が暗すぎる
- **Alternatives Considered**:
  1. gray-900の明度を15%→22%に変更
  2. 新しい変数`--color-dark-background`を追加
  3. ダークモード専用のグレースケール定義
- **Selected Approach**: Option 1 - 既存変数の明度調整
- **Rationale**: 後方互換性維持、変更箇所最小化
- **Trade-offs**: 既存ダークモードユーザーへの影響
- **Follow-up**: Playwrightで視覚的に確認後、微調整

### Decision: 本文エリア背景分離の実装
- **Context**: ブログ本文を視覚的に区別
- **Alternatives Considered**:
  1. `.prose`に背景色と角丸を追加
  2. カード風コンテナ`.article-card`で囲む
  3. シャドウのみで区別
- **Selected Approach**: Option 2 - カード風コンテナ
- **Rationale**: 視覚的階層が明確、他ページへの応用可能
- **Trade-offs**: マークアップ変更が必要
- **Follow-up**: 既存レイアウトへの影響を確認

## Risks & Mitigations
- **既存ユーザーへの影響**: ダークモード明度変更により見た目が変わる → 段階的な調整、フィードバック収集
- **プリセット間の不整合**: 特定の色相でCallout等が見づらくなる → 色相オフセットシステムで自動調整
- **パフォーマンス**: CSS変数過多による描画負荷 → 変数数を最小限に維持

## References
- [OKLCH Color Space](https://oklch.com/) — 知覚的に均一な色空間の解説
- [Material Design 3 Color System](https://m3.material.io/styles/color/system) — Googleの配色ガイドライン
- [WCAG 2.1 Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) — アクセシビリティ基準
