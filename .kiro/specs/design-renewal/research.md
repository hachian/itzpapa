# Research & Design Decisions: design-renewal

## Summary
- **Feature**: design-renewal
- **Discovery Scope**: Extension（既存システムの拡張）
- **Key Findings**:
  - OKLCHは2025年時点で92%以上のブラウザサポートがあり、パレット生成に最適
  - Astro View Transitionsは75%以上のサポートで、ネイティブクロスドキュメント遷移が利用可能
  - Noto Sans JPはFontsource経由のセルフホスティングまたはGoogle Fonts CDNが選択肢

## Research Log

### OKLCH カラーパレット生成
- **Context**: 要件1.1-1.4でOKLCH色空間を使用したカラーシステムが必要
- **Sources Consulted**:
  - [OKLCH in CSS: why we moved from RGB and HSL - Evil Martians](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)
  - [oklch.fyi - OKLCH Color Picker](https://oklch.fyi/)
  - [OKLCH Guide](https://oklch.org/posts/ultimate-oklch-guide)
  - [Oklchroma - CSS Variables Generator](https://utilitybend.com/blog/oklchroma-an-oklch-color-pattern-generator-that-generates-css-variables)
- **Findings**:
  - OKLCHは知覚的に均一で、Lightness調整でも色相がズレない（特に紫・青で有効）
  - 相対カラー構文 `oklch(from var(--primary) L% c h)` でパレット生成可能
  - #7c3aed → `oklch(54.86% 0.243 293.26)` に変換
  - 2025年Q2時点でグローバルサポート92%以上
- **Implications**:
  - 紫パレットはlightness値（10%-95%）を変化させて生成
  - ダークモードはlightness値の反転/調整で実現
  - CSS相対カラー構文は一部ブラウザで未サポートのため、静的定義を推奨

### Astro View Transitions API
- **Context**: 要件8.3でページ間トランジションが必要
- **Sources Consulted**:
  - [View transitions - Astro Docs](https://docs.astro.build/en/guides/view-transitions/)
  - [View Transitions Router API Reference](https://docs.astro.build/en/reference/modules/astro-transitions/)
  - [Chrome Developers Blog - Astro View Transitions](https://developer.chrome.com/blog/astro-view-transitions)
- **Findings**:
  - AstroはView Transitions APIを主流化した最初のフレームワーク
  - `<ClientRouter />` コンポーネントで有効化
  - ネイティブクロスドキュメント遷移は75%以上のサポート
  - `transition:name` ディレクティブで要素間アニメーション
  - `transition:persist` で状態保持
  - Firefoxは開発中だが未リリース
- **Implications**:
  - `<ClientRouter />` を使用してフォールバック付きで実装
  - ヘッダー、フッターに `transition:persist` 適用
  - カード要素に `transition:name` で個別アニメーション

### 日本語Webフォント（Noto Sans JP）
- **Context**: 要件3.3で日本語フォントのfallbackが必要
- **Sources Consulted**:
  - [Fontsource - Noto Sans JP](https://fontsource.org/fonts/noto-sans-jp/install)
  - [Google Fonts Noto Sans JP Guide](https://dad-union.com/en/css-google-fonts-noto-sans-japanese-guide)
  - [@fontsource/noto-sans-jp - npm](https://www.npmjs.com/package/@fontsource/noto-sans-jp)
- **Findings**:
  - Google Fonts CDN: `display=swap` + `preconnect` + `preload` で最適化
  - Fontsource: NPMパッケージでセルフホスティング可能
  - 必要なウェイト: 400（normal）、700（bold）のみで軽量化
  - 日本語は行間185-200%、欧文比10-15%小さめが推奨
  - WOFF2形式で最大圧縮
- **Implications**:
  - Google Fonts CDNを使用（シンプル、キャッシュ有効）
  - ウェイトは400, 500, 700に限定
  - フォールバック: `"Noto Sans JP", "Hiragino Kaku Gothic Pro", "Meiryo", sans-serif`

### モバイルメニュー実装方式
- **Context**: 要件5.3でハンバーガーメニューが必要
- **Sources Consulted**: 既存コードベース分析
- **Findings**:
  - Astroはデフォルトでクライアントサイドスクリプトなし
  - 3つの選択肢:
    1. Pure CSS（:has()セレクタ使用）- JSなし
    2. Vanilla JavaScript - シンプル、軽量
    3. Astro Islands（React/Vue等）- オーバーヘッド大
- **Implications**:
  - Vanilla JavaScriptをインラインで実装（シンプル、軽量）
  - アクセシビリティ属性（aria-expanded等）を適切に設定

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| CSS変数拡張 | 既存tag-variables.css拡張 | 移行コスト最小 | ファイル肥大化 | 短期的には有効 |
| デザイントークン新規 | design-tokens.css新設 | 関心分離、保守性 | 既存との整合性 | 長期的に推奨 |
| ハイブリッド | 新規ファイル + 既存統合 | バランス | 一時的な重複 | **採用** |

## Design Decisions

### Decision: OKLCHパレット生成方式
- **Context**: 紫ベースカラーから50-900のシェードを生成
- **Alternatives Considered**:
  1. CSS相対カラー構文 `oklch(from var(--primary) L% c h)` - ブラウザ依存
  2. 静的OKLCH値定義 - 確実だがやや冗長
  3. ビルドタイム生成（PostCSS等）- 追加依存
- **Selected Approach**: 静的OKLCH値定義
- **Rationale**: ブラウザサポートが確実、ビルド依存なし
- **Trade-offs**: やや冗長だが保守性は良好
- **Follow-up**: oklch.fyiツールでパレット値を生成

### Decision: ダークモード実装
- **Context**: 既存はhtml.darkクラス方式（タグのみ）
- **Alternatives Considered**:
  1. `html.dark` クラスのみ - ユーザー明示切替
  2. `prefers-color-scheme` のみ - OS連動
  3. 両方サポート - 柔軟だが複雑
- **Selected Approach**: `html.dark` クラス + `prefers-color-scheme` 初期値
- **Rationale**: 既存パターン踏襲 + OS設定尊重
- **Trade-offs**: CSS量が増えるが、UX向上
- **Follow-up**: ダークモードトグルボタンは後続フェーズで検討

### Decision: View Transitions有効化
- **Context**: ページ間の滑らかな遷移
- **Alternatives Considered**:
  1. `<ClientRouter />` - 広範なブラウザサポート
  2. ネイティブクロスドキュメント遷移 - JSなし
  3. 使用しない - シンプル
- **Selected Approach**: `<ClientRouter />` 使用
- **Rationale**: Firefoxフォールバック対応、既存Astroパターン
- **Trade-offs**: 軽量なJS追加
- **Follow-up**: ヘッダー/フッターにpersist、カードにnameディレクティブ

### Decision: フォント読み込み方式
- **Context**: 日本語フォント追加
- **Alternatives Considered**:
  1. Google Fonts CDN - キャッシュ有効、シンプル
  2. Fontsource セルフホスト - プライバシー、速度
  3. Adobe Fonts - 追加契約必要
- **Selected Approach**: Google Fonts CDN
- **Rationale**: 実装シンプル、CDNキャッシュ効果大、既存Atkinsonフォントと併用容易
- **Trade-offs**: 外部依存
- **Follow-up**: preconnect, preload最適化を適用

## Risks & Mitigations
- **OKLCH古いブラウザ未サポート** - フォールバックhex値を併記（@supports使用）
- **View Transitions Firefox未対応** - `<ClientRouter />` フォールバックで対応
- **日本語フォント読み込み遅延** - display:swap + preconnect + preloadで軽減
- **モバイルメニューアクセシビリティ** - aria属性、フォーカス管理を徹底

## References
- [OKLCH in CSS - Evil Martians](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)
- [oklch.fyi](https://oklch.fyi/)
- [Astro View Transitions Docs](https://docs.astro.build/en/guides/view-transitions/)
- [Fontsource Noto Sans JP](https://fontsource.org/fonts/noto-sans-jp/install)
- [CSS-Tricks oklch()](https://css-tricks.com/almanac/functions/o/oklch/)
