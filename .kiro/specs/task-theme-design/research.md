# Research & Design Decisions: task-theme-design

---
**Purpose**: タスクステータスレンダリング機能の設計決定とディスカバリー調査結果を記録。
---

## Summary
- **Feature**: `task-theme-design`
- **Discovery Scope**: Extension（既存プラグインパターンの拡張）
- **Key Findings**:
  - Lucide Icons（1,637アイコン）から22種類のステータスに対応するアイコンを選定可能
  - 既存のremark-mark-highlightプラグインパターンを完全に流用可能
  - callout.cssのCSSマスクアイコンパターンが確立されており、同様の手法を採用

## Research Log

### Lucide Icons選定調査
- **Context**: 22種類のタスクステータスに対応するアイコンが必要
- **Sources Consulted**:
  - [Lucide Icons公式](https://lucide.dev/icons/)
  - [Lucide GitHub](https://github.com/lucide-icons/lucide)
- **Findings**:
  - Lucide Icons: 1,637アイコン（2025年時点）
  - ISCライセンス（商用利用可）
  - SVGベースでCSSマスクに最適
  - 必要なアイコンがすべて利用可能
- **Implications**: 外部依存なしでSVGをdata URIとしてCSS変数に埋め込み可能

### 22ステータスのアイコンマッピング
| ステータス | 文字 | Lucideアイコン | カラーカテゴリ |
|-----------|------|---------------|---------------|
| to-do | ` ` (space) | circle | neutral |
| done | `x` | circle-check | success |
| incomplete | `/` | circle-slash | warning |
| canceled | `-` | circle-x | muted |
| forwarded | `>` | arrow-right | info |
| scheduling | `<` | calendar | info |
| question | `?` | circle-help | warning |
| important | `!` | alert-triangle | danger |
| star | `*` | star | accent |
| quote | `"` | quote | neutral |
| location | `l` | map-pin | info |
| bookmark | `b` | bookmark | accent |
| information | `i` | info | info |
| savings | `S` | piggy-bank | success |
| idea | `I` | lightbulb | warning |
| pros | `p` | thumbs-up | success |
| cons | `c` | thumbs-down | danger |
| fire | `f` | flame | danger |
| key | `k` | key | accent |
| win | `w` | trophy | success |
| up | `u` | arrow-up | success |
| down | `d` | arrow-down | danger |

### 既存プラグインパターン調査
- **Context**: 新規remarkプラグインの実装パターンを確認
- **Sources Consulted**: `src/plugins/remark-mark-highlight/index.js`
- **Findings**:
  - `unist-util-visit`でtextノードを走査
  - 正規表現でパターンマッチ
  - `parent.children.splice()`でノード置換
  - セキュリティ対策（入力長制限、セキュリティモード）
  - LRUキャッシュによるパフォーマンス最適化
- **Implications**: 同様のパターンでremark-task-statusを実装可能

### CSSアイコンパターン調査
- **Context**: callout.cssのマスクアイコン実装を確認
- **Sources Consulted**: `src/styles/callout.css`
- **Findings**:
  - CSS変数にdata URI形式でSVGを格納
  - `mask-image`と`-webkit-mask-image`でアイコン表示
  - データ属性（`data-callout`）でスタイル分岐
  - ダークモード対応はOKLCH色変数で実現
- **Implications**: 同様のパターンでtask.cssを実装可能

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| A: rehype拡張 | GFM処理後にrehypeで拡張 | GFM活用 | ステータス情報が失われる | **非推奨** |
| B: remark新規 | GFMより前にremarkで処理 | 完全制御、既存パターン流用 | 新規ファイル必要 | **選択** |
| C: ハイブリッド | remark+rehype分離 | 責務分離 | 複雑すぎる | 過剰設計 |

## Design Decisions

### Decision: remarkプラグインアプローチの選択
- **Context**: GFMはタスクリストを処理するが、拡張ステータス（`[/]`, `[>]`等）を認識しない
- **Alternatives Considered**:
  1. GFM処理後にrehypeで拡張 → ステータス情報が失われる
  2. GFMより前にremarkで処理 → 完全制御可能
  3. remark+rehypeハイブリッド → 過剰な複雑性
- **Selected Approach**: Option B - GFMより前にremarkプラグインで処理
- **Rationale**:
  - 既存パターン（remark-mark-highlight）を流用可能
  - 22種類のステータスを完全に制御
  - GFMとの干渉を回避
- **Trade-offs**: 新規ファイル作成が必要だが、保守性は高い
- **Follow-up**: GFMのタスクリスト処理を無効化する必要はない（変換済みノードはスキップされる）

### Decision: HTML出力形式
- **Context**: タスクチェックボックスのHTML構造を決定する必要
- **Selected Approach**:
  ```html
  <span class="task-checkbox" data-task-status="done" aria-label="完了">
    <span class="task-icon" aria-hidden="true"></span>
  </span>
  ```
- **Rationale**:
  - `data-task-status`でCSS分岐
  - アクセシビリティ属性（`aria-label`）で状態を伝達
  - アイコン要素は装飾的なので`aria-hidden="true"`
- **Trade-offs**: `<input type="checkbox">`を使わないためGFMとの互換性はないが、表示専用なので問題なし

### Decision: カラーパレット設計
- **Context**: 22種類のステータスに色を割り当てる必要
- **Selected Approach**: 5カテゴリに分類
  - **neutral**: グレー（to-do, quote, canceled）
  - **success**: グリーン（done, savings, pros, win, up）
  - **warning**: イエロー/オレンジ（incomplete, question, idea）
  - **danger**: レッド（important, cons, fire, down）
  - **info**: ブルー（forwarded, scheduling, location, information）
  - **accent**: パープル（star, bookmark, key）
- **Rationale**: callout.cssの色パレットと一貫性を保つ
- **Trade-offs**: 同一カテゴリ内のステータスは同色だが、アイコン形状で区別可能

## Risks & Mitigations
- **リスク1**: GFMとの処理順序競合 → remarkプラグイン配列の先頭に配置して回避
- **リスク2**: 大量のタスクリストでパフォーマンス低下 → 早期リターン最適化とLRUキャッシュで対応
- **リスク3**: 未定義ステータス文字のエッジケース → フォールバック処理でデフォルトアイコンを表示

## References
- [Lucide Icons公式](https://lucide.dev/icons/) — アイコン選定
- [unist-util-visit](https://github.com/syntax-tree/unist-util-visit) — AST走査ユーティリティ
- [GFM Task List](https://github.github.com/gfm/#task-list-items-extension-) — GFMタスクリスト仕様
