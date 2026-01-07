# Research & Design Decisions

## Summary
- **Feature**: `codebase-improvements-phase2`
- **Discovery Scope**: Extension（既存システムへのリファクタリング）
- **Key Findings**:
  - remark-tagsプラグインで正規表現が関数内で毎回生成されている（66-68行目、196-204行目）
  - Header.astroのモバイルメニューで`document`へのプロパティ追加パターンが使用されている（131-132行目）
  - design-tokens.cssとglobal.cssでダークモードスタイルの責務が分離されているが、一部重複がある

## Research Log

### 正規表現の最適化余地

- **Context**: Phase 1でテストが整備されたプラグインの正規表現パフォーマンス改善可能性を調査
- **Findings**:
  - **remark-tags/index.js**:
    - 66-68行目: `tagRegex`が`transformer`関数内で毎回`new RegExp()`で生成
    - 196-204行目: `normalizeTag`関数内で3つの正規表現が毎回生成
    - 設定値（`tagPrefix`, `hierarchySeparator`）に依存するため、完全なモジュールスコープ化は困難
  - **remark-wikilink/index.js**:
    - 111行目: `wikilinkRegex`が関数内で定義されているが、設定依存ではないため最適化可能
    - 104行目: パイプ置換の正規表現は定数として抽出可能
    - 12行目: `wikilinkMatch`のパターンは定数として抽出可能
- **Implications**:
  - 設定依存の正規表現は遅延初期化パターン（WeakMapまたはメモ化）で対応
  - 設定非依存の正規表現はモジュールスコープに移動可能

### グローバル変数のパターン

- **Context**: View Transitions時のモバイルメニュー動作の堅牢性を調査
- **Sources Consulted**: Header.astro（85-167行目）
- **Findings**:
  - 131-132行目: `(document as any).__mobileMenuGlobalListeners`パターン使用
  - イベントリスナーの重複登録防止のためのフラグとして機能
  - `transition:persist`属性がヘッダーに適用されている（25行目）
  - View Transitions後の`astro:after-swap`イベントで`setupMobileMenu`が再実行される（166行目）
- **Implications**:
  - `document`への直接プロパティ追加はTypeScript的にも不適切
  - DOM要素のdata属性による初期化フラグ管理に置換可能
  - グローバルイベントリスナー（click, keydown）は`document.body`のdata属性でフラグ管理

### CSSダークモード重複の調査

- **Context**: design-tokens.cssとglobal.cssのダークモードスタイル重複を特定
- **Findings**:
  - **design-tokens.css（269-310行目, 316-352行目）**:
    - CSS変数の再定義（セマンティックカラー、シャドウ、フォーカスリング）
    - `html.dark`と`@media (prefers-color-scheme: dark)`の両方で定義
  - **global.css（317-411行目）**:
    - 要素固有のスタイル（body背景グラデーション、selection、code、strong、em、blockquote等）
    - `html.dark`と`@media (prefers-color-scheme: dark)`の両方で同一スタイルを重複定義
  - 実際の重複:
    - global.cssの`@media (prefers-color-scheme: dark)`ブロック（370-411行目）が`html.dark`ブロック（317-368行目）とほぼ同一内容
- **Implications**:
  - design-tokens.cssの変数定義は適切に分離されている
  - global.cssの`:root:not(.light)`と`html.dark`の重複は`html:is(.dark), :root:where(:not(.light))`セレクタで統合可能
  - ただしCSSカスケード順序と特定度に注意が必要

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 正規表現モジュールスコープ化 | 設定非依存の正規表現を関数外に移動 | シンプル、変更少ない | 設定依存の正規表現には適用不可 | remark-wikilinkに採用 |
| 正規表現メモ化 | 設定値をキーにしたキャッシュ | 設定依存でも対応可能 | 複雑度増加 | remark-tagsに検討 |
| DOM data属性フラグ | `document.body.dataset`でフラグ管理 | TypeScript型安全、View Transitions対応 | なし | Header.astroに採用 |
| CSSセレクタ統合 | `:is()`, `:where()`でダークモード統合 | 重複削減、保守性向上 | 特定度の理解が必要 | global.cssに採用 |

## Design Decisions

### Decision: 正規表現の最適化方式

- **Context**: プラグイン内の正規表現がビルド時に毎回生成されている
- **Alternatives Considered**:
  1. 全正規表現をモジュールスコープに移動 — 設定依存で不可能な場合がある
  2. 設定非依存のみモジュールスコープ化 — シンプル、低リスク
  3. WeakMapによるメモ化 — 複雑だが設定依存にも対応
- **Selected Approach**: 設定非依存の正規表現はモジュールスコープに移動、設定依存はそのまま維持
- **Rationale**: 最小限の変更でパフォーマンス向上を実現。設定依存の正規表現は将来のメモ化実装に委ねる
- **Trade-offs**: 設定依存の正規表現は最適化されないが、ビルドパフォーマンスへの影響は軽微

### Decision: グローバルイベントリスナーのフラグ管理

- **Context**: `document`へのプロパティ追加はTypeScript的に不適切でView Transitions時に問題の可能性
- **Alternatives Considered**:
  1. `document.body.dataset`でフラグ管理 — DOM標準API、型安全
  2. `<html>`要素のdata属性 — 同様に有効
  3. モジュールスコープ変数 — View Transitionsで永続化されない可能性
- **Selected Approach**: `document.body.dataset.mobileMenuGlobalInit`でフラグ管理
- **Rationale**: DOM標準APIで型安全、View Transitions時もDOMが永続するため信頼性が高い
- **Trade-offs**: なし

### Decision: CSSダークモード重複の解消方式

- **Context**: global.cssで`html.dark`と`@media (prefers-color-scheme: dark) :root:not(.light)`が同一内容で重複
- **Alternatives Considered**:
  1. `:is()`セレクタで統合 — 特定度が高くなる
  2. `:where()`セレクタで統合 — 特定度0で上書きしやすい
  3. `:is(.dark), :where(:not(.light))`の組み合わせ — バランス型
- **Selected Approach**: `html.dark`セレクタをベースに、`@media (prefers-color-scheme: dark)`ブロック内で`:root:not(.light)`を使用するパターンを維持しつつ重複削除
- **Rationale**: 既存のセレクタパターンを尊重しながら重複のみを削除。特定度の変更を最小限に抑える
- **Trade-offs**: CSS構造は複雑なまま維持されるが、機能的な変更はなく安全

## Risks & Mitigations

- **リスク1**: 正規表現最適化でエッジケースの動作が変わる可能性
  - **緩和策**: Phase 1で整備されたユニットテストで回帰検出、ビルド出力比較
- **リスク2**: グローバルイベントリスナーの重複登録
  - **緩和策**: `document.body.dataset`フラグで確実に防止、手動テストで確認
- **リスク3**: CSSダークモード統合で視覚的な差異が発生
  - **緩和策**: ダークモード切替の手動確認、CSS特定度の慎重な検証

## References

- [MDN: Regular Expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions) — 正規表現のベストプラクティス
- [Astro View Transitions](https://docs.astro.build/en/guides/view-transitions/) — View Transitions時のスクリプト動作
- [MDN: :is() pseudo-class](https://developer.mozilla.org/en-US/docs/Web/CSS/:is) — CSS疑似クラスの特定度
- [MDN: :where() pseudo-class](https://developer.mozilla.org/en-US/docs/Web/CSS/:where) — 特定度0の疑似クラス
