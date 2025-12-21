# Research & Design Decisions

## Summary
- **Feature**: obsidian-callout
- **Discovery Scope**: Extension（既存システムの拡張）
- **Key Findings**:
  - 現行実装は7タイプ、Obsidian公式は13タイプ+エイリアスをサポート
  - エイリアス解決はremark-calloutプラグインで一元管理可能
  - Lucideアイコンは全タイプに対応するアイコンが存在

## Research Log

### Obsidian公式calloutタイプ調査
- **Context**: 現行実装との差分を明確化
- **Sources Consulted**:
  - [Obsidian Help - Callouts](https://help.obsidian.md/callouts)
  - [Using Callouts in Obsidian - Obsidian Rocks](https://obsidian.rocks/using-callouts-in-obsidian/)
- **Findings**:
  - 公式13タイプ: note, abstract, info, todo, tip, success, question, warning, failure, danger, bug, example, quote
  - エイリアスマッピング:
    - abstract: summary, tldr
    - tip: hint, important
    - success: check, done
    - question: help, faq
    - warning: caution, attention
    - failure: fail, missing
    - danger: error
    - quote: cite
- **Implications**: エイリアス→正規タイプの変換ロジックをremark-calloutに追加

### 現行実装分析
- **Context**: 拡張ポイントの特定
- **Sources Consulted**: `src/plugins/remark-callout/index.js`, `src/plugins/rehype-callout/index.js`, `src/styles/callout.css`
- **Findings**:
  - remark-callout: VALID_TYPES配列とDEFAULT_TITLES定数の拡張が必要
  - rehype-callout: CALLOUT_ICONS定数に新タイプ用アイコンを追加
  - callout.css: 新タイプ用のOKLCHカラー変数とスタイル定義を追加
  - 既存の折りたたみ・カスタムタイトル・ネスト機能は変更不要
- **Implications**: 3ファイルへの追加修正のみで実装可能、破壊的変更なし

### Lucideアイコン調査
- **Context**: 新タイプに適切なアイコンを選定
- **Sources Consulted**: [Lucide Icons](https://lucide.dev/icons/)
- **Findings**:
  - abstract: clipboard-list（リスト形式のサマリー）
  - todo: list-todo（チェックリスト）
  - success: circle-check（完了マーク）
  - question: circle-help（ヘルプマーク）
  - failure: x-circle（失敗マーク）
  - bug: bug（虫アイコン）
  - example: folder-open（例示フォルダ）
  - quote: quote（引用符）
- **Implications**: 全タイプに適切なLucideアイコンが存在

### OKLCHカラー設計
- **Context**: 既存デザインシステムとの整合性
- **Sources Consulted**: `src/styles/callout.css`
- **Findings**:
  - 既存パターン: L(明度)=0.65-0.75, C(彩度)=0.15-0.25, H(色相)でタイプ区別
  - ダークモード: L値を+0.1程度増加、背景透明度を0.1→0.15
  - 新タイプ配色案:
    - abstract: hue=150（緑系、successと同系統）
    - todo: hue=260（青系、noteと同系統）
    - success: hue=150（緑系）
    - question: hue=90（黄系）
    - failure: hue=25（赤系、dangerと同系統）
    - bug: hue=25（赤系）
    - example: hue=300（紫系）
    - quote: chroma=0.02（グレー系）
- **Implications**: 既存パターンに従って新色を定義

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| インプレース拡張 | 既存ファイルに定数・スタイルを追加 | 最小変更、既存パターン踏襲 | ファイル肥大化 | 推奨 |
| 設定外部化 | タイプ定義をJSONに分離 | 保守性向上 | 過剰設計、現時点では不要 | 将来検討 |

## Design Decisions

### Decision: エイリアス解決の実装箇所
- **Context**: エイリアスをどの段階で正規タイプに変換するか
- **Alternatives Considered**:
  1. remark-calloutでパース時に即座に変換
  2. rehype-calloutで変換
- **Selected Approach**: remark-calloutでパース時に変換
- **Rationale**:
  - AST段階で正規化することで、rehypeプラグインとCSSは正規タイプのみを扱えばよい
  - 単一責任の原則に従い、構文解析を担当するremarkで型解決も行う
- **Trade-offs**: originalTypeプロパティで元の入力を保持し、デバッグ性を確保
- **Follow-up**: テストでエイリアス→正規タイプ変換を検証

### Decision: CSS変数によるタイプ別スタイリング
- **Context**: 新タイプのスタイルを効率的に追加する方法
- **Alternatives Considered**:
  1. 各タイプごとに完全なスタイルブロックを定義
  2. CSS変数で色のみ定義し、セレクタで適用
- **Selected Approach**: CSS変数パターンを継続（既存パターン踏襲）
- **Rationale**: 既存実装との一貫性、ダークモード対応の簡素化
- **Trade-offs**: 変数定義が増加するが、スタイル定義は最小限
- **Follow-up**: なし

## Risks & Mitigations
- **リスク**: 新タイプのカラーが既存タイプと視覚的に区別しづらい
  - **軽減策**: hue値を30度以上離す、同系色は明度で差別化
- **リスク**: エイリアス変換によるデフォルトタイトルの混乱
  - **軽減策**: 正規タイプ名をデフォルトタイトルとして使用

## References
- [Obsidian Help - Callouts](https://help.obsidian.md/callouts) — 公式callout仕様
- [Lucide Icons](https://lucide.dev/icons/) — アイコン選定リファレンス
- [Using Callouts in Obsidian - Obsidian Rocks](https://obsidian.rocks/using-callouts-in-obsidian/) — タイプ・エイリアス一覧
