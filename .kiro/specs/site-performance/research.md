# Research & Design Decisions

## Summary
- **Feature**: site-performance
- **Discovery Scope**: Extension（既存システムの拡張）
- **Key Findings**:
  1. LCP問題の主因はヒーロー画像のpreload未設定（fetchpriority="high"だけでは不十分）
  2. Google Fontsは既に最適化済み（media="print"、preconnect）だが、フォントサブセット化が必要
  3. ARIAエラーはspan要素でのrole="img"+aria-label使用が原因（W3C仕様違反）

## Research Log

### LCP最適化アプローチ

- **Context**: LCPが5.6秒と目標の2.5秒に遠く及ばない
- **Sources Consulted**:
  - Lighthouse Insights: `fetchpriority=high should be applied` (実装済み)
  - web.dev LCP最適化ガイド
  - 既存コード: `src/layouts/BlogPost.astro`
- **Findings**:
  - ヒーロー画像は`fetchpriority="high"`と`format="webp"`が設定済み
  - `<link rel="preload">`が未設定（ブラウザの画像発見が遅れる）
  - Astro Imageコンポーネントはビルド時に画像を最適化するが、preloadタグは自動生成しない
- **Implications**:
  - BaseHead.astroでヒーロー画像のpreloadを追加する必要がある
  - 動的なスラッグベースのパスに対応するため、BlogPost.astroからBaseHeadへpreload情報を渡す設計が必要

### Google Fonts最適化

- **Context**: unminified-css/unused-css-rulesがGoogle Fontsから発生
- **Sources Consulted**:
  - `src/components/BaseHead.astro`
  - Google Fonts API仕様
- **Findings**:
  - 現状: `Noto+Sans+JP:wght@400;500;700`で全文字を読み込み
  - `media="print" onload="this.media='all'"`でレンダリングブロック回避済み
  - 日本語フォントは非常に大きい（86KiB以上の未使用CSS）
  - `&text=`パラメータでサブセット化可能だが、動的コンテンツには不向き
- **Implications**:
  - 現実的なアプローチ: display=swapを維持し、ローカルフォントファミリーへのフォールバックを強化
  - Fontsourceなどのセルフホスティングは検討対象外（既存構成維持）

### ARIA属性の問題

- **Context**: task-checkboxのspan要素で`aria-label`が禁止属性として検出
- **Sources Consulted**:
  - WAI-ARIA 1.2仕様
  - axe-core ルール: aria-prohibited-attr
  - `src/plugins/rehype-task-status/index.js`
- **Findings**:
  - `role="img"`を持つspan要素では`aria-label`は許可されている（WAI-ARIA仕様）
  - しかしLighthouseではまだエラーが出ている
  - 原因: axe-coreの検出ルールと実際のDOM構造の不一致の可能性
  - より安全なアプローチ: visually hidden text (`<span class="sr-only">`) を使用
- **Implications**:
  - rehype-task-statusプラグインを修正し、sr-onlyパターンに変更
  - global.cssにsr-onlyクラスを追加

### コントラスト比の問題

- **Context**: time要素（article-meta__published, post-card__date）とem > strong要素でコントラスト不足
- **Sources Consulted**:
  - `src/styles/design-tokens.css`
  - `src/layouts/BlogPost.astro`
  - WCAG 2.1 Level AA基準
- **Findings**:
  - `--color-primary-500`は65%明度（前回55%→65%に変更済み）
  - `article-meta__published`は`var(--color-primary-500)`を使用
  - 背景色`var(--color-surface)`（白）との組み合わせでコントラスト不足
  - WCAG AA基準: 通常テキスト 4.5:1、大きいテキスト 3:1
  - oklch(65% 0.24 293)の白背景でのコントラスト比は約3.5:1（不足）
- **Implications**:
  - primary-500の明度を55%以下に戻す、または専用のテキストカラーを定義
  - `--color-text-accent`などセマンティックカラーを追加し、コントラスト比を保証

### Lightbox画像のサイズ問題

- **Context**: `.lightbox-image`にwidth/height属性がなく、unsized-imagesエラー
- **Sources Consulted**:
  - `src/components/ImageLightbox.astro`
  - `src/styles/lightbox.css`
- **Findings**:
  - Lightbox画像は動的に設定されるため、事前にサイズを知ることができない
  - CSSで`max-width: 90vw; max-height: 80vh; aspect-ratio`を設定することでCLS回避可能
  - 実際のLCP要素ではないため、パフォーマンスへの影響は軽微
- **Implications**:
  - CSS `aspect-ratio`プロパティを使用してCLSを防止
  - または、画像ロード時にJavaScriptでwidth/heightを動的に設定

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| A. Astro Image + Preload | BaseHeadでpreloadタグ生成、Astro Image継続使用 | 既存構成維持、シンプル | スラッグ依存のpreloadパス管理が必要 | **採用** |
| B. Astro組み込み最適化のみ | 追加実装なし、Astro任せ | 実装コスト最小 | LCP改善効果が限定的 | 却下 |
| C. 外部画像CDN | Cloudinary等の画像CDN導入 | 自動最適化 | 構成変更大、コスト発生 | 対象外 |

## Design Decisions

### Decision: ヒーロー画像Preload戦略

- **Context**: LCPを2.5秒以下に改善するため、ヒーロー画像のブラウザ発見を早める必要がある
- **Alternatives Considered**:
  1. BaseHeadでハードコードされたpreloadパス
  2. BlogPost.astroからBaseHeadへprops経由でpreload情報を渡す
  3. Astro ViewTransitionsのprefetch機能に依存
- **Selected Approach**: Option 2 - Props経由でpreload情報を渡す
- **Rationale**:
  - 記事ごとに異なるヒーロー画像パスに対応可能
  - 既存のBaseHeadインターフェースを拡張するだけで実装可能
- **Trade-offs**:
  - BlogPost.astro側での追加props定義が必要
  - 全ページでpreloadを生成するわけではない（記事ページのみ）
- **Follow-up**: preload効果のLighthouse再測定で検証

### Decision: コントラスト改善戦略

- **Context**: primary-500が明るすぎてコントラスト不足
- **Alternatives Considered**:
  1. primary-500の明度を下げる（55%以下）
  2. セマンティックカラー`--color-text-accent`を新規定義
  3. 該当要素のみ個別色指定
- **Selected Approach**: Option 2 - セマンティックカラー追加
- **Rationale**:
  - primary-500はUIアクセントとして使用されており、変更すると他に影響
  - テキスト専用のアクセントカラーを別途定義することで、用途を分離
- **Trade-offs**:
  - デザイントークンの増加
  - 既存コンポーネントでの色参照変更が必要
- **Follow-up**: axe-coreでコントラスト比を自動検証

### Decision: ARIA修正アプローチ

- **Context**: span[role="img"][aria-label]がaxe-coreでエラー検出
- **Alternatives Considered**:
  1. role="img"を別のroleに変更
  2. visually hidden text (sr-only) パターン
  3. aria-labelledbyで外部テキスト参照
- **Selected Approach**: Option 2 - sr-onlyパターン
- **Rationale**:
  - 最も広くサポートされ、確実に動作するパターン
  - 実装がシンプルで、既存のrehypeプラグイン構造に適合
- **Trade-offs**:
  - DOMに追加のspan要素が挿入される
  - CSSでsr-onlyクラスの定義が必要
- **Follow-up**: スクリーンリーダーでの動作確認

## Risks & Mitigations

- **Risk 1**: Preload追加によるファーストバイト遅延 — 軽微。preloadは並列ダウンロードを促進するため、全体的には改善効果が大きい
- **Risk 2**: セマンティックカラー追加によるデザイン整合性 — design-tokens.cssで一元管理し、ドキュメント化
- **Risk 3**: ARIA修正がスクリーンリーダーで期待通り動作しない — 実装後にNVDA/VoiceOverでテスト

## References

- [web.dev - Optimize Largest Contentful Paint](https://web.dev/lcp/) — LCP最適化のベストプラクティス
- [WAI-ARIA 1.2 - img role](https://www.w3.org/TR/wai-aria-1.2/#img) — img roleの仕様
- [Deque University - aria-prohibited-attr](https://dequeuniversity.com/rules/axe/4.6/aria-prohibited-attr) — axe-coreルール説明
- [WCAG 2.1 - Contrast (Minimum)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) — コントラスト比要件
