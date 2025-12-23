# Gap Analysis: Lighthouse Performance Improvement

## 概要
本ドキュメントは、itzpapa（Astro v5ベースの静的ブログサイト）の既存実装とLighthouseスコア改善要件とのギャップを分析します。

---

## 1. 現状調査結果

### 1.1 Performance関連
| 項目 | 現状 | 状態 |
|------|------|------|
| 画像最適化 | Astro Image + sharp + WebP形式 | ✅ 実装済 |
| 画像loading属性 | eager/lazy適切に使用 | ✅ 実装済 |
| フォントプリロード | ローカルフォントpreload済 | ✅ 実装済 |
| Google Fonts | 非同期読み込み（media="print"→"all"） | ✅ 実装済 |
| CSS code splitting | Vite設定で有効化 | ✅ 実装済 |
| Critical CSS inlining | 未実装 | ⚠️ 未実装 |
| Resource hints (preconnect) | Google Fonts用に設定済 | ✅ 実装済 |
| gzip/brotli圧縮 | サーバー側設定（Cloudflare Pages想定） | 🔍 サーバー依存 |

### 1.2 Accessibility関連
| 項目 | 現状 | 状態 |
|------|------|------|
| セマンティックHTML | header, nav, main, article, footer使用 | ✅ 実装済 |
| ARIA属性 | aria-label, aria-expanded, role等使用 | ✅ 実装済 |
| lang属性 | html要素に設定 | ✅ 実装済 |
| タッチターゲット | 44px (--touch-target-min) | ✅ 実装済 |
| フォーカスリング | CSS変数で定義済 | ✅ 実装済 |
| sr-only | スクリーンリーダー用テキスト対応 | ✅ 実装済 |
| 色コントラスト | OKLCH使用、要検証 | 🔍 検証必要 |
| 見出し階層 | 概ね適切だが個別検証必要 | 🔍 検証必要 |
| 画像alt属性 | 一部空alt（装飾画像） | ⚠️ 要確認 |

### 1.3 Best Practices関連
| 項目 | 現状 | 状態 |
|------|------|------|
| HTTPS | サーバー設定依存 | 🔍 サーバー依存 |
| セキュリティヘッダー | 未設定（CSP等） | ❌ 未実装 |
| font-display | swap設定済 | ✅ 実装済 |
| 外部スクリプトSRI | 未設定 | ❌ 未実装 |
| doctype/charset | 正しく設定 | ✅ 実装済 |
| コンソールエラー | 要検証 | 🔍 検証必要 |

### 1.4 SEO関連
| 項目 | 現状 | 状態 |
|------|------|------|
| title/description | 各ページに設定 | ✅ 実装済 |
| canonical URL | 設定済 | ✅ 実装済 |
| OGP/Twitter Cards | BaseHead.astroで実装済 | ✅ 実装済 |
| sitemap | @astrojs/sitemap使用 | ✅ 実装済 |
| robots.txt | 設定済 | ✅ 実装済 |
| JSON-LD構造化データ | 記事・パンくず対応 | ✅ 実装済 |
| hreflang | 未設定（単一言語サイト） | ➖ 対象外 |

### 1.5 継続的監視関連
| 項目 | 現状 | 状態 |
|------|------|------|
| CI/CD | GitHub Actions未設定 | ❌ 未実装 |
| Lighthouse CI | 未導入 | ❌ 未実装 |
| パフォーマンス監視ドキュメント | なし | ❌ 未実装 |

---

## 2. 要件-アセットマップ

### Requirement 1: Performance最適化

| AC | 現状アセット | ギャップ |
|----|-------------|---------|
| 1.1 画像最適化 | Astro Image + sharp | **None** - 既存実装で対応 |
| 1.2 コード分割 | Vite cssCodeSplit有効 | **None** - 既存設定で対応 |
| 1.3 圧縮配信 | - | **サーバー依存** - Cloudflare Pages設定 |
| 1.4 Critical CSS | - | **Missing** - 追加実装必要 |
| 1.5 Resource hints | preconnect設定済 | **Partial** - prefetch/preload拡張可能 |
| 1.6 LCP < 2.5s | 未計測 | **Unknown** - 計測必要 |
| 1.7 CLS < 0.1 | 画像にサイズ指定あり | **Unknown** - 計測必要 |
| 1.8 INP < 200ms | - | **Unknown** - 計測必要 |

### Requirement 2: Accessibility対応

| AC | 現状アセット | ギャップ |
|----|-------------|---------|
| 2.1 セマンティックHTML | Header, Footer, BlogPost.astro | **None** - 既存実装で対応 |
| 2.2 ARIA labels | 各コンポーネント | **None** - 既存実装で対応 |
| 2.3 色コントラスト | OKLCH設計 | **Unknown** - 検証必要 |
| 2.4 画像alt | 一部空alt | **Partial** - 装飾画像は適切、要レビュー |
| 2.5 キーボードナビ | focus-ring定義済 | **Partial** - 全体検証必要 |
| 2.6 見出し階層 | - | **Unknown** - 検証必要 |
| 2.7 タッチターゲット | 44px設定済 | **None** - 既存実装で対応 |

### Requirement 3: Best Practices遵守

| AC | 現状アセット | ギャップ |
|----|-------------|---------|
| 3.1 HTTPS | - | **サーバー依存** - Cloudflare Pages対応 |
| 3.2 非推奨API | - | **Unknown** - 検証必要 |
| 3.3 JSエラーなし | - | **Unknown** - 検証必要 |
| 3.4 セキュアオリジン | 外部リソース確認済 | **None** - HTTPS使用 |
| 3.5 doctype/charset | BaseHead.astro | **None** - 既存実装で対応 |
| 3.6 セキュリティヘッダー | - | **Missing** - _headers設定必要 |
| 3.7 SRI | - | **Missing** - Google Analytics等に必要 |

### Requirement 4: SEO最適化

| AC | 現状アセット | ギャップ |
|----|-------------|---------|
| 4.1 title | BaseHead.astro | **None** |
| 4.2 description | BaseHead.astro | **None** |
| 4.3 HTTPステータス | Astro標準 | **None** |
| 4.4 canonical | BaseHead.astro | **None** |
| 4.5 robots.txt | public/robots.txt | **None** |
| 4.6 sitemap | @astrojs/sitemap | **None** |
| 4.7 OGP/Twitter | BaseHead.astro | **None** |
| 4.8 リンクテキスト | - | **Unknown** - コンテンツ依存 |
| 4.9 hreflang | - | **N/A** - 単一言語 |

### Requirement 5: 継続的監視

| AC | 現状アセット | ギャップ |
|----|-------------|---------|
| 5.1 ビルド時監査 | - | **Missing** - Lighthouse CI導入必要 |
| 5.2 閾値アラート | - | **Missing** - CI設定必要 |
| 5.3 ガイドライン | - | **Missing** - ドキュメント作成必要 |
| 5.4 レポート生成 | - | **Missing** - CI設定必要 |

---

## 3. 実装アプローチオプション

### Option A: 既存コンポーネント拡張

**対象:**
- BaseHead.astro: Critical CSSインライン化、追加resource hints
- Cloudflare設定: _headers, _redirects

**メリット:**
- ✅ 変更箇所が少ない
- ✅ 既存パターンを維持
- ✅ テスト影響範囲が限定的

**デメリット:**
- ❌ BaseHead.astroがさらに肥大化
- ❌ Cloudflare固有設定が分散

**推奨シナリオ:** 軽微な改善のみの場合

### Option B: 新規コンポーネント/設定作成

**対象:**
- `public/_headers`: Cloudflareセキュリティヘッダー設定
- `.github/workflows/lighthouse.yml`: Lighthouse CI
- `docs/performance-guidelines.md`: パフォーマンスガイドライン

**メリット:**
- ✅ 関心の分離が明確
- ✅ 各設定の独立性が高い
- ✅ メンテナンスしやすい

**デメリット:**
- ❌ ファイル数増加
- ❌ 初期セットアップコストあり

**推奨シナリオ:** CI/CD導入や本格的なパフォーマンス監視が必要な場合

### Option C: ハイブリッドアプローチ（推奨）

**フェーズ1: 既存拡張**
- BaseHead.astroの最適化（resource hints追加）
- 既存コンポーネントのアクセシビリティ検証

**フェーズ2: 新規作成**
- `public/_headers`: セキュリティヘッダー
- GitHub Actions: Lighthouse CI

**フェーズ3: ドキュメント化**
- パフォーマンスガイドライン作成

**メリット:**
- ✅ 段階的に改善可能
- ✅ 優先度に応じた実装
- ✅ リスク分散

**デメリット:**
- ❌ 複数フェーズの管理が必要

---

## 4. 工数・リスク評価

| 領域 | 工数 | リスク | 理由 |
|------|------|--------|------|
| Performance最適化 | S-M | Low | 既存Astro機能の活用、追加設定のみ |
| Accessibility検証 | S | Low | 既存実装の検証が中心 |
| Best Practices | M | Medium | セキュリティヘッダー設定の検証必要 |
| SEO最適化 | S | Low | 既に実装済、追加作業なし |
| 継続的監視 | M | Medium | GitHub Actions設定、Lighthouse CI導入 |

**総合工数: M（3-7日）**
**総合リスク: Medium**

---

## 5. 設計フェーズへの推奨事項

### 優先アプローチ
**Option C（ハイブリッドアプローチ）** を推奨

### 主要決定事項
1. Critical CSSインライン化の実装方法（Astro標準 vs カスタム）
2. Lighthouse CIのスコア閾値設定
3. セキュリティヘッダーの具体的な設定内容

### Research Needed
1. Astro v5でのCritical CSS最適化ベストプラクティス
2. Cloudflare Pages向けセキュリティヘッダー設定
3. Lighthouse CI導入手順とGitHub Actions統合

### 既存実装の強み
- 画像最適化は既に高水準
- SEOメタタグは包括的に実装済
- アクセシビリティ基盤は整っている
- デザインシステム（design-tokens.css）が充実

### ギャップの重点領域
1. **セキュリティヘッダー** - Best Practicesスコアへの影響大
2. **継続的監視** - パフォーマンス劣化防止に必須
3. **Core Web Vitals計測** - 現状把握と改善効果測定

---

## 6. 次のステップ

1. 本ギャップ分析を確認
2. `/kiro:spec-design lighthouse-performance-improvement` で設計フェーズへ進む
3. 設計で具体的な実装方針を決定
