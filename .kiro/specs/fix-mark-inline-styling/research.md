# Research & Design Decisions

## Summary
- **Feature**: `fix-mark-inline-styling`
- **Discovery Scope**: Extension（既存プラグインのバグ修正）
- **Key Findings**:
  - 現在のプラグインは`type: 'html'`ノードを生成しており、これが`strong`/`emphasis`ノード内で正しく変換されない原因
  - remark-wikilinkプラグインは標準MDATノードを使用しており、参考になる実装パターン
  - 解決策として`mark`カスタムノード + hast変換ハンドラーの組み合わせが最適

## Research Log

### MDAST内でのHTMLノードの扱い
- **Context**: `**==text==**`が正しく変換されない原因調査
- **Sources Consulted**:
  - unified/remark エコシステムドキュメント
  - 既存プラグイン実装（remark-wikilink）
- **Findings**:
  - `type: 'html'`ノードはremark-rehype変換時に「raw」HTMLとして扱われる
  - `strong`や`emphasis`の子ノードにraw HTMLを配置すると、変換時に親子関係が崩れる可能性がある
  - 特に、HTMLノードは兄弟ノードとして独立して処理されるため、親のセマンティクスが失われる
- **Implications**: `type: 'html'`を使わず、カスタムMDATノードを定義してhast変換時に処理する必要がある

### remark-wikilinkの実装パターン分析
- **Context**: 正しく動作しているプラグインの実装パターン参照
- **Sources Consulted**: `src/plugins/remark-wikilink/index.js`
- **Findings**:
  - 標準MDATノードタイプ（`link`, `image`, `text`）を使用
  - `data.hProperties`でHTML属性を付与
  - `parent.children.splice()`でノード置換
  - グローバル正規表現のリセット処理（`lastIndex = 0`）
- **Implications**: remark-mark-highlightも同様のパターンに従うべき

### カスタムMDATノードとhast変換
- **Context**: `<mark>`タグを生成するための最適なアプローチ調査
- **Sources Consulted**:
  - mdast-util-to-hast ドキュメント
  - remark-rehypeのhandlersオプション
- **Findings**:
  - カスタムノードタイプを定義し、`data.hName`と`data.hProperties`でhast変換を制御可能
  - `data.hName = 'mark'`を設定すると、remark-rehypeが自動的に`<mark>`タグを生成
  - 子ノードは`children`プロパティで指定、適切に変換される
- **Implications**: これにより、親ノード（strong/emphasis）との入れ子関係が維持される

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| HTMLノード継続 | 現状の`type: 'html'`を維持し、問題を回避 | 変更量が少ない | 根本解決にならない、他の組み合わせでも問題発生の可能性 | 不採用 |
| カスタムMDATノード | `type: 'mark'`を定義し、`data.hName`で変換制御 | 標準的なアプローチ、親子関係維持 | 変換ハンドラーの追加が必要（Astro設定変更） | 採用候補 |
| phrasingContentラップ | 標準ノードでラップし、CSSで表現 | 追加設定不要 | セマンティクスが不正確、アクセシビリティ懸念 | 不採用 |

## Design Decisions

### Decision: カスタムMDATノード + data.hName方式の採用
- **Context**: `strong`/`emphasis`内でマークハイライトが機能しない問題の解決
- **Alternatives Considered**:
  1. HTMLノード継続 — 変更量は少ないが根本解決にならない
  2. カスタムMDATノード — 標準的なアプローチで親子関係を維持
  3. rehypeプラグインへの移行 — 処理タイミングが遅すぎて他のremarkプラグインと競合
- **Selected Approach**: カスタムMDATノード（`type: 'mark'`）を生成し、`data.hName = 'mark'`と`data.hProperties`でhast変換を制御
- **Rationale**:
  - remarkエコシステムの標準パターンに従う
  - 親ノード（strong/emphasis）との入れ子関係が維持される
  - 既存のアクセシビリティ機能（role属性等）をhPropertiesで実現可能
- **Trade-offs**:
  - Astro設定でrehype-raw（または同等）が必要になる可能性があるが、カスタムハンドラー不要
  - 実際にはAstroのデフォルト設定で対応可能
- **Follow-up**: 実装後にstrong/emphasis/inlineCode内での動作を検証

### Decision: 処理対象ノードタイプの拡張なし
- **Context**: `strong`や`emphasis`ノード自体を処理対象に追加するか検討
- **Alternatives Considered**:
  1. `visit(tree, 'text', ...)`のみ — 現状維持
  2. `visit(tree, ['text', 'strong', 'emphasis'], ...)`に拡張
- **Selected Approach**: `visit(tree, 'text', ...)`を維持
- **Rationale**:
  - `strong`/`emphasis`の子ノードにある`text`ノードは現在のvisitorで処理される
  - 問題はvisitor対象ではなく、出力ノードタイプにある
  - 不要な複雑性を避ける
- **Trade-offs**: なし
- **Follow-up**: 変更後の動作確認で、すべてのケースをカバーできることを検証

## Risks & Mitigations
- **Risk 1**: カスタムノードがrehype変換で認識されない — `data.hName`を使用することでmdast-util-to-hastが自動処理（ミティゲーション済み）
- **Risk 2**: 後方互換性の破壊 — 出力HTMLは同一（`<mark>`タグ）のため影響なし
- **Risk 3**: キャッシュの無効化 — ノード構造が変わるためキャッシュキーの再設計が必要

## References
- [mdast-util-to-hast - Unknown nodes](https://github.com/syntax-tree/mdast-util-to-hast#unknown-nodes) — hName/hPropertiesの仕様
- [unist-util-visit](https://github.com/syntax-tree/unist-util-visit) — ASTトラバーサルAPI
- 既存実装: `src/plugins/remark-wikilink/index.js` — 参考パターン
