# ギャップ分析レポート: site-performance-optimization

## 1. 現状調査

### 1.1 既存アセット構成

#### 画像関連
- **Astro Image統合**: `astro:assets`の`Image`コンポーネントを使用中
- **sharp**: `package.json`に依存関係あり（v0.34.2）
- **現状の画像処理**:
  - `Image`コンポーネントで`width`/`height`を明示的に指定
  - `loading="eager"`をヒーロー画像に適用（index.astro）
  - ビルド出力はJPG/PNG形式のまま（WebP変換なし）
  - `srcset`は生成されていない

#### フォント関連
- **ローカルフォント**: `public/fonts/`にAtkinson（woff形式、約46KB合計）
- **外部フォント**: Google Fonts（Noto Sans JP）を`<link>`で読み込み
- **font-display: swap**: ローカルフォントのみ設定済み（global.css:48,55）
- **preload**: ローカルフォントのみ設定済み（BaseHead.astro:46-47）
- **問題**: Google Fonts（Noto Sans JP）はサブセット化なしで全量読み込み

#### CSS関連
- **構成**: 12個の分離CSSファイル（global.css + 11インポート）
- **現状**:
  - ビルド時にCSSはバンドル・minify済み（Vite/Astro標準）
  - コンテンツハッシュ付きファイル名で出力
  - 未使用CSS削除は未実装
  - Critical CSSインライン化は未実装

#### JavaScript関連
- **構成**: 主にインラインスクリプト（`<script>`タグ）
- **外部スクリプト**:
  - View Transitions（ClientRouter）: 約15KB
  - Google Analytics: `async`属性付きで外部読み込み
- **現状**:
  - GA以外は同期読み込み
  - スクリプト量は比較的少ない（SSGの恩恵）

#### ビルド出力
- **Vite/Astro標準最適化**:
  - JS minification済み
  - CSS minification済み
  - アセットにコンテンツハッシュ付与済み
- **未対応**:
  - HTML minification
  - バンドルサイズレポート生成
  - 圧縮ファイル事前生成

---

## 2. 要件実現可能性分析

### Requirement 1: 画像最適化

| 受入基準 | 現状 | ギャップ |
|---------|------|---------|
| WebP自動変換 | なし | **Missing** - Astro Image設定追加必要 |
| width/height明示 | 一部対応 | **Constraint** - 全Image使用箇所を確認必要 |
| lazy loading | 未適用 | **Missing** - デフォルト設定変更必要 |
| srcset生成 | なし | **Missing** - Astro Image設定追加必要 |
| 変換失敗時フォールバック | なし | **Research Needed** - Astroのエラーハンドリング確認 |

**複雑度**: 外部統合＋設定変更

### Requirement 2: フォント読み込み最適化

| 受入基準 | 現状 | ギャップ |
|---------|------|---------|
| Noto Sans JPサブセット化 | 未対応 | **Missing** - セルフホスト化が必要 |
| font-display: swap | ローカルのみ対応 | **Partial** - Google Fontsはswap指定済み |
| フォントpreload | ローカルのみ対応 | **Missing** - 日本語フォント追加必要 |
| フォールバック | 部分対応 | **Constraint** - font-stackは設定済み |

**複雑度**: セルフホスト化の場合は中程度の作業

### Requirement 3: CSS最適化

| 受入基準 | 現状 | ギャップ |
|---------|------|---------|
| CSSバンドル | 対応済み | ✅ Astro標準機能 |
| 未使用CSS削除 | 未対応 | **Research Needed** - PurgeCSS等の導入検討 |
| Critical CSSインライン化 | 未対応 | **Research Needed** - critters等の導入検討 |
| CSS Minification | 対応済み | ✅ Astro標準機能 |

**複雑度**: 追加ツール導入が必要

### Requirement 4: JavaScript最適化

| 受入基準 | 現状 | ギャップ |
|---------|------|---------|
| JS minify | 対応済み | ✅ Astro標準機能 |
| async/defer遅延読み込み | GA以外未対応 | **Missing** - インラインスクリプト見直し |
| GA遅延読み込み | async対応済み | **Partial** - さらなる遅延化可能 |
| 不要スクリプト削除 | 該当なし | ✅ 現状問題なし |

**複雑度**: 低〜中程度

### Requirement 5: キャッシュ戦略

| 受入基準 | 現状 | ギャップ |
|---------|------|---------|
| Cache-Controlヘッダー | 未設定 | **Missing** - ホスティング設定依存 |
| コンテンツハッシュファイル名 | 対応済み | ✅ Astro標準機能 |
| HTML再検証ポリシー | 未設定 | **Missing** - ホスティング設定依存 |

**複雑度**: ホスティング環境に依存

### Requirement 6: Core Web Vitals改善

| 受入基準 | 現状 | ギャップ |
|---------|------|---------|
| LCP < 2.5秒 | 未計測 | **Research Needed** - 現状計測が必要 |
| FID < 100ms | 未計測 | **Research Needed** - 現状計測が必要 |
| CLS < 0.1 | 未計測 | **Research Needed** - 現状計測が必要 |
| 定期検証 | 未対応 | **Missing** - CI/CD統合検討 |

**複雑度**: 計測基盤構築が必要

### Requirement 7: ビルド・配信最適化

| 受入基準 | 現状 | ギャップ |
|---------|------|---------|
| HTML minify | 未対応 | **Missing** - astro-compress等の導入 |
| gzip/Brotli圧縮 | 未対応 | **Research Needed** - ホスティング設定 or 事前生成 |
| バンドルサイズレポート | 未対応 | **Missing** - Vite plugin追加 |

**複雑度**: 中程度

---

## 3. 実装アプローチ選択肢

### Option A: Astro標準機能の最大活用（推奨）

**適用対象**: 画像最適化、JS/CSS最適化

**内容**:
- `astro.config.mjs`の`image`設定でWebP変換・srcset有効化
- `Image`コンポーネントのデフォルト`loading`属性調整
- 既存コードへの最小限の変更

**トレードオフ**:
- ✅ 設定変更のみで多くの最適化が可能
- ✅ Astroのメンテナンスに追従
- ❌ 高度なカスタマイズには限界あり

### Option B: 追加ツール・プラグイン導入

**適用対象**: フォントサブセット化、Critical CSS、未使用CSS削除、HTML圧縮

**内容**:
- `fontsource`によるNoto Sans JPセルフホスト化
- `astro-compress`によるHTML/CSS/JS圧縮
- `critters`または類似ツールでCritical CSSインライン化

**トレードオフ**:
- ✅ より高度な最適化が可能
- ✅ 業界標準ツールの活用
- ❌ 依存関係の増加
- ❌ ビルド時間の増加

### Option C: ハイブリッドアプローチ（推奨）

**内容**:
1. **Phase 1**: Astro標準機能の最適化（Option A）
2. **Phase 2**: 追加ツール導入（Option B）
3. **Phase 3**: キャッシュ戦略・CWV計測基盤構築

**トレードオフ**:
- ✅ 段階的な改善でリスク軽減
- ✅ 各フェーズで効果測定可能
- ❌ 完了までに複数イテレーション必要

---

## 4. 実装複雑度とリスク評価

| 要件 | 工数 | リスク | 理由 |
|-----|------|-------|------|
| Req 1: 画像最適化 | **M** (3-7日) | Medium | Astro設定変更＋既存コード確認 |
| Req 2: フォント最適化 | **M** (3-7日) | Medium | セルフホスト化の場合は新パターン導入 |
| Req 3: CSS最適化 | **S** (1-3日) | Low | 大部分は対応済み、追加は任意 |
| Req 4: JS最適化 | **S** (1-3日) | Low | 現状でほぼ問題なし |
| Req 5: キャッシュ戦略 | **S** (1-3日) | Low | ホスティング設定のみ |
| Req 6: CWV改善 | **M** (3-7日) | Medium | 計測基盤構築＋他要件の結果依存 |
| Req 7: ビルド最適化 | **S** (1-3日) | Low | プラグイン追加のみ |

**総合工数見積**: **M-L** (7-14日)
**総合リスク**: **Medium** - 新ツール導入があるが、既存パターンへの影響は限定的

---

## 5. 設計フェーズへの推奨事項

### 優先アプローチ: Option C（ハイブリッド）

### 設計フェーズで決定すべき事項

1. **画像最適化**
   - Astro Image設定（フォーマット、品質、breakpoints）
   - 既存`Image`コンポーネント使用箇所の`loading`属性方針

2. **フォント最適化**
   - Google Fonts維持 vs セルフホスト化の選択
   - サブセット化の範囲（使用文字のみ vs 常用漢字）

3. **追加ツール選定**
   - HTML圧縮: `astro-compress` vs `@playform/compress`
   - Critical CSS: 必要性の判断

4. **キャッシュ戦略**
   - 想定ホスティング環境の確認
   - Cache-Control値の設計

5. **CWV計測基盤**
   - 計測ツール選定（Lighthouse CI, web-vitals, etc.）
   - CI/CD統合の有無

### 調査が必要な項目（Research Needed）

- Astro v5での画像変換エラーハンドリング
- PurgeCSSのAstro v5対応状況
- crittersのAstro v5互換性
- web-vitalsライブラリの導入方法
