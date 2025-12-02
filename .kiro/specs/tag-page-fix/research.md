# Research & Design Decisions

## Summary
- **Feature**: `tag-page-fix`
- **Discovery Scope**: Extension（既存システムのスタイルバグ修正）
- **Key Findings**:
  - CSS変数は`tag-variables.css`で適切に定義されているが、コンポーネント内で一部のCSS変数がフォールバック値なしで参照されている
  - TagBadgeとTagTreeコンポーネントはスコープ付きスタイルを使用しており、CSS変数との整合性確保が必要
  - ダークモード切り替えはCSSカスタムプロパティの再定義で実装されている

## Research Log

### CSS変数定義の調査
- **Context**: タグコンポーネントのスタイル問題を解決するため、CSS変数の定義状況を調査
- **Sources Consulted**:
  - `src/styles/tag-variables.css` - タグ関連CSS変数定義
  - `src/styles/design-tokens.css` - デザインシステム基盤
  - `src/styles/global.css` - CSSインポート順序
- **Findings**:
  - `--tag-*`変数：`tag-variables.css`で定義済み（ライト/ダーク両対応）
  - `--tree-*`変数：`tag-variables.css`で定義済み（ライト/ダーク両対応）
  - CSSインポート順序：design-tokens → tag-variables → tag → その他
  - OKLCHカラー使用、@supports フォールバックあり
- **Implications**: CSS変数は適切に定義されているが、コンポーネント内のスコープ付きスタイルとの統合確認が必要

### コンポーネントスタイルの調査
- **Context**: TagBadgeとTagTreeの現状実装を確認
- **Sources Consulted**:
  - `src/components/TagBadge.astro` - タグバッジコンポーネント
  - `src/components/TagTree.astro` - ツリービューコンポーネント
- **Findings**:
  - TagBadge：Astroスコープ付き`<style>`内でCSS変数を参照
  - TagTree：同様にスコープ付きスタイル、JavaScriptで展開/折りたたみ制御
  - 両コンポーネントでダークモード用スタイルが`html.dark`セレクタで定義
  - 一部CSS変数参照にフォールバック値がない箇所あり
- **Implications**: スコープ付きスタイルがグローバルCSS変数を正しく継承できているか検証が必要

### ダークモード実装パターンの確認
- **Context**: ダークモード切り替え時のスタイル適用を理解
- **Sources Consulted**: 既存コンポーネント、design-tokens.css
- **Findings**:
  - `html.dark`クラスによる切り替え方式
  - CSS変数の再定義でカラー変更
  - `@media (prefers-color-scheme: dark)`によるOS設定連動
- **Implications**: コンポーネント内のダークモードスタイルが変数の再定義と重複しないよう整理が必要

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| CSS変数集約 | tag-variables.cssに全変数を集約し、コンポーネントはCSS変数のみ参照 | 一箇所管理、一貫性確保 | コンポーネント側の修正必要 | 推奨アプローチ |
| コンポーネント内フォールバック | コンポーネント内で全てのCSS変数参照にフォールバック値追加 | コンポーネント独立性向上 | 重複定義、管理複雑化 | 緊急対応用 |

## Design Decisions

### Decision: CSS変数参照の一元化
- **Context**: TagBadge/TagTreeコンポーネントのスタイル不具合
- **Alternatives Considered**:
  1. コンポーネント内でハードコード値を使用
  2. CSS変数にフォールバック値を追加
  3. tag-variables.cssで全変数を定義し、コンポーネントは変数参照のみ
- **Selected Approach**: Option 3 - CSS変数の一元管理
- **Rationale**: デザインシステムの一貫性を保ち、テーマ切り替えを容易にする
- **Trade-offs**: コンポーネント側の修正が必要だが、長期的な保守性が向上
- **Follow-up**: 修正後、ライト/ダーク両モードでの視覚確認

### Decision: ダークモードスタイルの整理
- **Context**: コンポーネント内とCSS変数定義でダークモードスタイルが重複
- **Alternatives Considered**:
  1. コンポーネント内のダークモードスタイルを削除し、CSS変数のみで制御
  2. 両方を維持（現状維持）
- **Selected Approach**: Option 1 - CSS変数による統一制御
- **Rationale**: `html.dark`での変数再定義が正しく機能していれば、コンポーネント内での重複定義は不要
- **Trade-offs**: CSS変数の適用確認が必要
- **Follow-up**: 変更後のダークモード表示確認

## Risks & Mitigations
- **CSS変数未定義リスク** → 全参照箇所にフォールバック値を追加
- **スコープスタイルの優先度問題** → `:global()`を適切に使用
- **ブラウザ互換性** → OKLCHの@supportsフォールバックは既存のまま維持

## References
- [Astro Scoped Styles](https://docs.astro.build/en/guides/styling/#scoped-styles) — Astroのスコープ付きスタイルの仕組み
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) — CSS変数のベストプラクティス
