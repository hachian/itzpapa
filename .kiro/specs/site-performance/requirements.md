# Requirements Document

## Introduction

本仕様書は、itzpapaブログサイトのパフォーマンス改善に関する要件を定義します。Lighthouse分析結果（Performance: 77-79、Accessibility: 86-94）に基づき、Core Web Vitalsの改善とアクセシビリティ向上を目指します。

### 現状分析

**Lighthouseスコア比較**

| 指標 | 改善前 | 改善後 | 変化 |
|------|--------|--------|------|
| Performance | 77 | 79 | +2 |
| Accessibility | 86 | 94 | +8 |
| Best Practices | 96 | 96 | ±0 |
| SEO | 100 | 100 | ±0 |

**Core Web Vitals比較**

| 指標 | 改善前 | 改善後 | 目標 |
|------|--------|--------|------|
| FCP | 1.8秒 | 1.4秒 | < 1.8秒 |
| LCP | 6.2秒 | 5.6秒 | < 2.5秒 |
| TBT | 60ms | 0ms | < 200ms |
| TTI | 6.2秒 | 5.6秒 | < 3.8秒 |
| CLS | 0 | 0 | < 0.1 |

### 前回の改善試行（コミット 2e2c082）

以下の改善を実施したが、期待した効果が得られていない：

**実施した対策**
- ヒーロー画像に `fetchpriority="high"` を追加（LCP最適化）
- `primary-500` の明度を55%→65%に変更（コントラスト比改善）
- task-checkboxに `role="img"` を追加（ARIA修正）
- TagListでタグを `role="listitem"` でラップ（ARIA修正）
- RelatedPostCardの画像リンクに `aria-label` を追加（リンク名改善）

**効果**
- Accessibilityスコア: 86 → 94（+8ポイント改善）
- Performanceスコア: 77 → 79（+2ポイントのみ、期待外れ）
- LCP: 6.2秒 → 5.6秒（0.6秒短縮のみ、目標2.5秒に遠く及ばず）

**残存する問題**
- `color-contrast`: time要素（article-meta、post-card__date）、em > strong要素でまだコントラスト不足
- `aria-prohibited-attr`: task-checkboxのspan要素で `aria-label` が禁止属性として検出（role="img"では不十分）
- `unsized-images`: Lightbox画像（`.lightbox-image`）にwidth/height未設定
- `unminified-css`/`unused-css-rules`: Google Fonts CSSの最適化が未対応

### 根本原因の分析

**LCPが改善しない主因**
1. ヒーロー画像のファイルサイズ・配信形式の問題（WebP/AVIF未使用の可能性）
2. 画像のpreload未設定（ブラウザの発見が遅い）
3. レンダリングブロッキングリソース（Google Fonts等）の影響

**追加対策が必要な項目**
- 画像の最適化（フォーマット変換、圧縮、適切なサイズ）
- クリティカルCSSのインライン化
- Google Fontsの読み込み最適化（preconnect、サブセット化）
- ARIA属性の正しいパターン適用（role="img"ではなく別アプローチ）

## Requirements

### Requirement 1: LCP（Largest Contentful Paint）最適化

**Objective:** As a サイト訪問者, I want ページのメインコンテンツを素早く表示してほしい, so that ストレスなくコンテンツを閲覧できる

**背景:** 前回の改善で `fetchpriority="high"` を追加したが、LCPは6.2秒→5.6秒と0.6秒しか改善しなかった。画像の配信最適化とpreloadが必要。

#### Acceptance Criteria
1. The サイト shall display LCP element within 2.5 seconds on mobile network conditions.
2. When ヒーロー画像がLCP要素の場合, the サイト shall apply `fetchpriority="high"` attribute to the hero image. *(実装済み)*
3. When ページが読み込まれた時, the サイト shall preload critical above-the-fold images using `<link rel="preload">`.
4. The サイト shall serve images in WebP or AVIF format with appropriate fallbacks.
5. The サイト shall optimize hero image file size to under 100KB for mobile viewport.

### Requirement 2: レンダリングブロッキングリソースの削減

**Objective:** As a サイト訪問者, I want ページが素早くレンダリングされてほしい, so that コンテンツにすぐアクセスできる

#### Acceptance Criteria
1. The サイト shall inline critical CSS for above-the-fold content.
2. When Google Fontsを読み込む時, the サイト shall use `font-display: swap` and preconnect hints.
3. The サイト shall defer non-critical CSS loading.
4. The サイト shall eliminate render-blocking resources that delay First Contentful Paint.

### Requirement 3: 未使用CSS・CSSの最小化

**Objective:** As a サイト訪問者, I want 不要なCSSをダウンロードしたくない, so that ページの読み込み時間を短縮できる

#### Acceptance Criteria
1. The ビルドプロセス shall remove unused CSS rules from production bundles.
2. The ビルドプロセス shall minify all CSS files in production builds.
3. When Google Fontsを使用する時, the サイト shall load only required font weights and character subsets.
4. The サイト shall reduce total CSS transfer size by at least 50KiB compared to current state.

### Requirement 4: 画像最適化

**Objective:** As a サイト訪問者, I want 最適化された画像を取得したい, so that データ通信量を抑えつつ高品質な画像を閲覧できる

#### Acceptance Criteria
1. The サイト shall provide explicit `width` and `height` attributes on all `<img>` elements.
2. When Lightboxコンポーネントがある場合, the Lightbox image element shall have explicit dimensions or use CSS aspect-ratio.
3. The サイト shall serve appropriately sized images based on viewport width using `srcset` attribute.
4. The サイト shall lazy-load below-the-fold images using `loading="lazy"` attribute.

### Requirement 5: アクセシビリティ改善（コントラスト比）

**Objective:** As a 視覚に困難を抱えるユーザー, I want 十分なコントラスト比でテキストを表示してほしい, so that コンテンツを読みやすくなる

**背景:** 前回の改善で `primary-500` の明度を55%→65%に変更したが、time要素（article-meta、post-card__date）および em > strong 要素でまだコントラスト不足が検出されている。

#### Acceptance Criteria
1. The サイト shall ensure all text elements meet WCAG 2.1 Level AA contrast ratio (4.5:1 for normal text, 3:1 for large text).
2. When 日時（time要素）を表示する時, the サイト shall use colors with sufficient contrast against the background (article-meta__published, post-card__date).
3. When 強調テキスト（em > strong要素）を表示する時, the サイト shall maintain sufficient contrast ratio.
4. The サイト shall verify contrast ratios using automated tools (e.g., axe-core) before deployment.

### Requirement 6: アクセシビリティ改善（ARIAとセマンティクス）

**Objective:** As a スクリーンリーダー使用者, I want 適切なARIA属性とセマンティックマークアップを使用してほしい, so that 支援技術でコンテンツを正しく理解できる

**背景:** 前回の改善で `role="img"` を追加し `aria-label` を設定したが、span要素では `aria-label` が禁止属性として検出された。別のアプローチが必要。

#### Acceptance Criteria
1. The サイト shall not use prohibited ARIA attributes on elements (task-checkbox span elements shall not use aria-label without appropriate role).
2. When task-checkboxを実装する時, the サイト shall use visually hidden text (`<span class="sr-only">`) instead of aria-label for status indication.
3. When role="list"を使用する時, the サイト shall include child elements with role="listitem". *(実装済み)*
4. The サイト shall provide discernible link text or aria-label for all anchor elements.
5. When 画像リンクを使用する時, the サイト shall provide appropriate alt text or aria-label for the linked image. *(実装済み)*

### Requirement 7: キャッシュ戦略の最適化

**Objective:** As a リピート訪問者, I want 静的リソースをキャッシュから取得したい, so that 再訪問時の読み込み時間を短縮できる

#### Acceptance Criteria
1. The サイト shall set appropriate Cache-Control headers for static assets (images, CSS, JS).
2. When Cloudflare経由で配信する時, the サイト shall leverage edge caching for static resources.
3. The ビルドプロセス shall generate hashed filenames for cache busting on content changes.

### Requirement 8: パフォーマンス目標値

**Objective:** As a サイト運営者, I want Lighthouseスコアを改善したい, so that ユーザー体験とSEO評価を向上できる

#### Acceptance Criteria
1. The サイト shall achieve Lighthouse Performance score of 90 or higher.
2. The サイト shall achieve Lighthouse Accessibility score of 95 or higher.
3. The サイト shall achieve LCP of 2.5 seconds or less on mobile devices.
4. The サイト shall achieve CLS (Cumulative Layout Shift) of 0.1 or less.
5. The サイト shall maintain current Best Practices score (96) and SEO score (100).

## Out of Scope

以下の項目は本仕様の対象外とします：

- サーバーサイドの設定変更（Cloudflare設定はコード変更の範囲内のみ）
- コンテンツの追加・変更
- 新機能の追加
- デザインの大幅な変更
