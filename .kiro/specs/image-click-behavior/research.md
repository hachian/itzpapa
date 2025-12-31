# Research & Design Decisions

## Summary
- **Feature**: `image-click-behavior`
- **Discovery Scope**: Extension（既存のAstroブログサイトへの機能追加）
- **Key Findings**:
  - ライトボックス機能は外部ライブラリ不要でCSSとバニラJavaScriptで実装可能
  - 既存のダークモードシステム（`html.dark`クラス、`prefers-color-scheme`）を活用可能
  - BlogPost.astroレイアウトにスクリプト注入パターンが既に存在（Callout folding機能）

## Research Log

### ライトボックス実装アプローチ
- **Context**: 画像クリックで拡大表示するUIパターンの選択
- **Sources Consulted**: 既存コードベースパターン、デザイントークン
- **Findings**:
  - 外部ライブラリ（lightbox2, GLightbox等）は追加依存関係を増やす
  - プロジェクトはカスタム実装（remark plugins, Callout folding）を優先している
  - CSS + バニラJavaScriptでアクセシビリティを含む完全な実装が可能
- **Implications**: 外部ライブラリ不要。プロジェクトパターンに従いカスタム実装を選択

### 既存ダークモードシステム統合
- **Context**: ダークモード対応の実装方法
- **Sources Consulted**: `design-tokens.css`, `global.css`, `ThemeToggle.astro`
- **Findings**:
  - `html.dark` クラスによるダークモード切り替え
  - `@media (prefers-color-scheme: dark)` + `:root:not(.light)` でOS設定対応
  - OKLCHカラーシステム（`--color-gray-*`, `--color-primary-*`）使用
- **Implications**: 既存パターンに完全準拠。新規CSS変数不要

### アクセシビリティ要件
- **Context**: キーボード操作、スクリーンリーダー対応
- **Sources Consulted**: 既存Callout folding実装、ThemeToggle実装
- **Findings**:
  - `role="dialog"`, `aria-modal="true"` でモーダル表現
  - `aria-label` でスクリーンリーダー対応
  - `tabindex` によるフォーカス管理
  - Escapeキーハンドリングパターン確立済み
- **Implications**: 既存パターンを踏襲してアクセシビリティ実装

### コンポーネント配置
- **Context**: 新規コンポーネント・スタイルの配置場所
- **Sources Consulted**: `structure.md`, 既存ディレクトリ構造
- **Findings**:
  - コンポーネント: `src/components/ImageLightbox.astro`
  - スタイル: `src/styles/lightbox.css`
  - BlogPost.astroへのインポートと呼び出し追加
- **Implications**: 既存パターンに準拠した配置

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| CSS + Vanilla JS | ネイティブ実装 | 依存関係なし、軽量、フルコントロール | 実装工数やや多い | プロジェクトパターンに合致。採用 |
| GLightbox | 軽量ライトボックスライブラリ | 機能豊富、実装容易 | 外部依存、カスタマイズ制限 | 不採用 |
| CSS-only Lightbox | CSS :target セレクタ使用 | JavaScript不要 | URLハッシュ変更、フォーカス管理困難 | アクセシビリティ要件不充足。不採用 |

## Design Decisions

### Decision: カスタムCSS + JavaScript実装
- **Context**: ライトボックス機能の実装アプローチ選択
- **Alternatives Considered**:
  1. CSS + Vanilla JavaScript（カスタム実装）
  2. 外部ライブラリ（GLightbox, lightbox2）
  3. CSS-only（:target セレクタ）
- **Selected Approach**: CSS + Vanilla JavaScript
- **Rationale**:
  - プロジェクトは外部依存を最小化する方針
  - 既存のCallout foldingがこのパターンで実装済み
  - アクセシビリティ要件を完全に満たせる
- **Trade-offs**:
  - Benefits: 軽量、フルコントロール、既存パターン準拠
  - Compromises: 実装工数はライブラリ使用より多い
- **Follow-up**: View Transition対応の確認

### Decision: BlogPost.astroへの統合
- **Context**: ライトボックスコンポーネントの呼び出し場所
- **Alternatives Considered**:
  1. BlogPost.astro内でインラインスクリプト
  2. 別コンポーネントとしてBlogPost.astroにインポート
- **Selected Approach**: 別コンポーネント（ImageLightbox.astro）をインポート
- **Rationale**:
  - 関心の分離
  - 再利用性確保
  - テスト容易性
- **Trade-offs**: ファイル数増加 vs 保守性向上

## Risks & Mitigations
- **Risk 1**: View Transition後にイベントリスナーが動作しない
  - Mitigation: `astro:page-load` イベントで再初期化（既存パターン踏襲）
- **Risk 2**: 大きな画像でパフォーマンス低下
  - Mitigation: オリジナル画像を表示するため最適化済み画像を使用
- **Risk 3**: モバイルでのタッチ操作の競合
  - Mitigation: タップとスクロールを区別するイベント処理

## References
- [Callout folding実装](src/layouts/BlogPost.astro:452-508) — 既存のスクリプト注入パターン
- [ThemeToggle実装](src/components/ThemeToggle.astro) — アクセシビリティパターン
- [Design Tokens](src/styles/design-tokens.css) — z-index、アニメーション、カラーシステム
