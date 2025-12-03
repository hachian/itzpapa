# Research & Design Decisions: custom-callout

---
**Purpose**: Capture discovery findings, architectural investigations, and rationale that inform the technical design.
---

## Summary
- **Feature**: `custom-callout`
- **Discovery Scope**: Extension（既存プラグインパターンの拡張）
- **Key Findings**:
  - 既存の3つのremarkプラグイン（wikilink, mark-highlight, tags）は統一されたパターンを使用
  - プロジェクトはインラインSVGでアイコンを実装している（外部アイコンライブラリ未使用）
  - OKLCHカラーシステムがdesign-tokens.cssで確立されており、コールアウト色定義に活用可能

## Research Log

### remarkプラグインパターン調査
- **Context**: 新規コールアウトプラグインの実装アプローチ決定のため
- **Sources Consulted**:
  - `src/plugins/remark-wikilink/index.js`
  - `src/plugins/remark-mark-highlight/index.js`
  - `src/plugins/remark-tags/index.js`
- **Findings**:
  - 全プラグインが`unist-util-visit`を使用
  - ESModuleスタイル（`export default function`）
  - `visit(tree, nodeType, callback)`パターン
  - ノード置換は`parent.children.splice()`
  - HTMLノード生成は`{ type: 'html', value: '...' }`形式
- **Implications**: 同一パターンを採用し、`visit(tree, 'blockquote', ...)`で実装

### blockquoteノード処理
- **Context**: 既存プラグインはtextノード処理のみで、blockquoteノード処理の前例がない
- **Sources Consulted**:
  - unist-util-visit仕様
  - mdast仕様（blockquoteノード構造）
- **Findings**:
  - blockquoteノードは`children`配列を持ち、最初の子がparagraphノード
  - paragraphの最初のtextノードから`[!type]`をパース可能
  - ネストされたblockquoteは再帰的に処理可能
- **Implications**: `visit(tree, 'blockquote', ...)`で走査し、最初の段落の最初のテキストを検査

### アイコン実装方式
- **Context**: 各コールアウトタイプに対応したアイコンの実装方式決定
- **Sources Consulted**:
  - `src/components/ThemeToggle.astro`
  - `src/components/Header.astro`
- **Findings**:
  - プロジェクトはインラインSVGを使用（lucide等の外部ライブラリ未使用）
  - viewBox="0 0 24 24"、width/height=20が標準
  - `fill="currentColor"`でテーマ色に対応
- **Implications**: 各コールアウトタイプ用のSVGアイコンをインラインで定義

### OKLCHカラーシステム
- **Context**: 要件5で指定されたOKLCH形式の色定義
- **Sources Consulted**:
  - `src/styles/design-tokens.css`
- **Findings**:
  - プロジェクト全体でOKLCHベースのカラーシステムを使用
  - ダークモードはL値（明度）調整で対応
  - CSS変数で一元管理
- **Implications**: コールアウト色もOKLCH変数として定義し、design-tokensパターンに準拠

### rehype-calloutsの出力構造
- **Context**: 後方互換性とCSS移行のための既存構造調査
- **Sources Consulted**:
  - `src/styles/callout.css`
  - テストコンテンツのビルド出力
- **Findings**:
  - 出力構造: `blockquote.callout > div.callout-title + div.callout-content`
  - 折りたたみ: `details > summary`構造
  - CSS変数: `--rc-color-*`（これは削除予定）
- **Implications**: 類似のクラス構造を維持してCSS移行を容易にする

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| remarkプラグイン | Markdown AST段階で処理 | 既存パターン一貫性、他プラグイン互換 | HTML生成が必要 | **推奨** |
| rehypeプラグイン | HTML AST段階で処理 | rehype-calloutsと同タイミング | 既存パターンと不一致 | 却下 |
| Astroコンポーネント | MDXコンポーネントとして実装 | 柔軟性高い | Markdown純粋記法から逸脱 | 却下 |

## Design Decisions

### Decision: remarkプラグインとして実装
- **Context**: コールアウト処理のアーキテクチャ層決定
- **Alternatives Considered**:
  1. remarkプラグイン — Markdown AST段階で処理
  2. rehypeプラグイン — HTML AST段階で処理
  3. Astroコンポーネント — MDX専用コンポーネント
- **Selected Approach**: remarkプラグインとして`src/plugins/remark-callout/`に実装
- **Rationale**: 既存3プラグインと同一アーキテクチャで保守性向上、markdown/mdx両対応
- **Trade-offs**: HTMLノード生成が必要だが、既存パターン（mark-highlight）で実績あり
- **Follow-up**: 他のremarkプラグインとの処理順序の確認

### Decision: インラインSVGアイコン
- **Context**: コールアウトタイプ別アイコンの実装方式
- **Alternatives Considered**:
  1. インラインSVG — プラグイン内でSVG文字列を直接出力
  2. Unicode文字 — 絵文字やシンボル文字
  3. 外部アイコンライブラリ — lucide-reactなど
- **Selected Approach**: インラインSVG
- **Rationale**: プロジェクト既存パターン準拠、外部依存なし、色制御可能
- **Trade-offs**: プラグインコードが長くなるが、自己完結性が高い
- **Follow-up**: 各タイプ用のSVGパス選定（シンプルなアイコンを選択）

### Decision: details/summary要素による折りたたみ
- **Context**: 折りたたみ機能の実装方式
- **Alternatives Considered**:
  1. HTML details/summary — ネイティブ折りたたみ
  2. JavaScript制御 — カスタムアニメーション
  3. CSS only — max-heightトランジション
- **Selected Approach**: HTML details/summary要素
- **Rationale**: アクセシビリティ標準準拠、JavaScript不要、ブラウザネイティブ
- **Trade-offs**: アニメーションカスタマイズに制限があるが、機能的には十分
- **Follow-up**: CSSでdetails要素のスタイリング調整

### Decision: 類似HTML構造の維持
- **Context**: 出力HTML構造の設計
- **Alternatives Considered**:
  1. rehype-callouts互換構造 — 同一クラス名
  2. 完全独自構造 — 新規クラス設計
- **Selected Approach**: 類似構造（callout, callout-title, callout-content）を維持
- **Rationale**: 既存CSSの部分流用可能、移行コスト削減
- **Trade-offs**: rehype-callouts固有の変数（--rc-*）は削除し独自定義に置換
- **Follow-up**: callout.cssの全面改訂

## Risks & Mitigations
- **ネスト処理の複雑性** — 再帰的処理で最大3レベルに制限、深度カウンタで管理
- **他プラグインとの干渉** — WikiLinkなどはblockquote内でも正常動作（別ノードタイプ）
- **後方互換性** — 既存テストコンテンツで全パターン検証

## References
- [unist-util-visit](https://github.com/syntax-tree/unist-util-visit) — AST走査ユーティリティ
- [mdast](https://github.com/syntax-tree/mdast) — Markdown AST仕様
- [Obsidian Callouts](https://help.obsidian.md/Editing+and+formatting/Callouts) — 構文仕様リファレンス
- [HTML details/summary](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details) — 折りたたみ要素仕様
