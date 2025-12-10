# Gap Analysis: task-theme-design

## 概要
Obsidianのタスクチェックボックス拡張構文（22種類のステータス）をAstroブログでレンダリングする機能のギャップ分析。

---

## 1. 現状調査

### 1.1 既存アセット

#### プラグイン構造 (`src/plugins/`)
| プラグイン | 種類 | 機能 |
|-----------|------|------|
| `remark-wikilink` | remark | WikiLink構文を処理 |
| `remark-tags` | remark | `#tag`構文をリンクに変換 |
| `remark-mark-highlight` | remark | `==highlight==`をmarkタグに変換 |
| `remark-callout` | remark | Calloutブロックの解析 |
| `rehype-callout` | rehype | Calloutのスタイリング |
| `rehype-table-wrapper` | rehype | テーブルのラッパー追加 |

#### CSS構造 (`src/styles/`)
- `design-tokens.css`: OKLCH色システム、スペーシング、アイコン変数
- `callout.css`: データ属性+CSS疑似要素によるアイコン表示パターン
- `global.css`: CSSインポート管理、ダークモード対応

#### Astro設定 (`astro.config.mjs`)
- remarkプラグイン: WikiLink → MarkHighlight → Tags → Callout の順
- rehypeプラグイン: table-wrapper
- GFM有効（`gfm: true`）

### 1.2 既存パターン

#### プラグイン実装パターン
```javascript
// remark-mark-highlightの例
export default function remarkPlugin(options = {}) {
  return function transformer(tree) {
    visit(tree, 'text', (node, index, parent) => {
      // 正規表現でパターンマッチ
      // ノード分割・置換
      // parent.children.splice()で更新
    });
  };
}
```

#### CSSアイコンパターン（callout.css）
```css
/* データ属性でスタイル分岐 */
blockquote[data-callout="note"]::after {
  -webkit-mask-image: var(--callout-icon-note);
  mask-image: var(--callout-icon-note);
}
```

### 1.3 GFMタスクリストの現状
- AstroはGFMを有効化済み（`gfm: true`）
- 標準の`- [ ]`と`- [x]`はGFMで処理される
- 拡張ステータス（`- [/]`, `- [>]`等）は**未対応**
- 現在のHTML出力例:
  ```html
  <ul class="contains-task-list">
    <li class="task-list-item">
      <input type="checkbox" disabled> 未完了
    </li>
  </ul>
  ```

---

## 2. 要件実現可能性分析

### 2.1 技術的ニーズ

| 要件 | 技術的対応 | ギャップ |
|------|-----------|---------|
| 22種類のステータス認識 | remarkプラグインで正規表現パース | **Missing** |
| ステータスごとのアイコン表示 | CSSデータ属性+マスクアイコン | **Missing**（パターン存在） |
| クリック無効化 | `disabled`属性+CSS `pointer-events` | Partial（GFMで`disabled`済み） |
| ダークモード対応 | CSS変数+メディアクエリ | **既存パターン** |
| 未知ステータスのフォールバック | プラグインでデフォルト処理 | **Missing** |

### 2.2 ギャップ詳細

#### Missing: 拡張タスク構文パーサー
- GFMは`[ ]`と`[x]`のみサポート
- 22種類のステータス文字を認識するカスタムプラグインが必要

#### Missing: タスクステータスCSS
- callout.cssのパターンを流用可能
- 22種類のアイコンSVGとカラー定義が必要

#### Constraint: GFMとの競合
- GFMが先にタスクリストを処理する可能性
- remarkプラグインの実行順序を調整する必要

### 2.3 複雑度シグナル
- **ワークフロー**: 単純なAST変換（remark-mark-highlightと同様）
- **外部依存**: なし（unist-util-visitのみ）
- **アルゴリズム**: 正規表現マッチング（低複雑度）

---

## 3. 実装アプローチオプション

### Option A: 既存コンポーネント拡張

**アプローチ**: GFMのタスクリスト処理後にrehypeで拡張

**対象ファイル**:
- 新規: `src/plugins/rehype-task-status/index.js`
- 変更: `astro.config.mjs`（rehypeプラグイン追加）
- 新規: `src/styles/task.css`

**処理フロー**:
1. GFMがタスクリストをHTML化
2. rehypeプラグインが`<input type="checkbox">`を検出
3. チェックボックスの前のテキストから元のステータス文字を推測（困難）

**Trade-offs**:
- ✅ GFMの既存処理を活用
- ❌ 元のステータス文字情報が失われる（GFMは`[x]`以外を`[ ]`として処理）
- ❌ ステータス判定が困難または不可能

**結論**: **非推奨** - GFM処理後では元のステータス情報が失われるため

---

### Option B: 新規remarkプラグイン作成

**アプローチ**: GFMより前にタスク構文を処理するカスタムremarkプラグイン

**対象ファイル**:
- 新規: `src/plugins/remark-task-status/index.js`
- 変更: `astro.config.mjs`（remarkプラグイン追加、GFMより前）
- 新規: `src/styles/task.css`

**処理フロー**:
1. remarkプラグインが`- [x]`パターンを検出（x=任意の文字）
2. カスタムHTML要素に変換（`data-task-status`属性付き）
3. GFMはすでに変換済みのため処理しない
4. CSSでステータス別スタイリング

**実装詳細**:
```javascript
// 正規表現: リストアイテム内のタスク構文を検出
const TASK_REGEX = /^\[([ xX/\-><!?*"lbiSIpcfkwud])\]\s/;

// 出力例:
// <span class="task-checkbox" data-task-status="done">
//   <span class="task-icon"></span>
// </span>
```

**Trade-offs**:
- ✅ 全22種類のステータスを完全に制御
- ✅ 既存プラグインパターン（remark-mark-highlight）を流用
- ✅ GFMのタスクリスト処理との干渉を回避
- ❌ 新規ファイル作成が必要
- ❌ GFMタスクリストのアクセシビリティ属性を手動で再実装

**結論**: **推奨** - 最も確実で保守しやすい

---

### Option C: ハイブリッドアプローチ

**アプローチ**: remarkでステータス情報を保持し、rehypeでスタイリング

**対象ファイル**:
- 新規: `src/plugins/remark-task-status/index.js`（ステータス抽出・マーキング）
- 新規: `src/plugins/rehype-task-style/index.js`（スタイル適用）
- 新規: `src/styles/task.css`
- 変更: `astro.config.mjs`

**処理フロー**:
1. remarkでステータス文字を抽出し、カスタムノードとして保持
2. GFM処理は通常通り
3. rehypeでカスタムノードをHTML要素に変換

**Trade-offs**:
- ✅ remark/rehypeの責務分離
- ❌ 2つのプラグインが必要で複雑
- ❌ ノード間の情報受け渡しが複雑

**結論**: **過剰設計** - この機能規模には不要

---

## 4. 実装複雑度とリスク

### 工数見積もり: **S（1-3日）**
- 理由:
  - 既存パターン（remark-mark-highlight, callout.css）を流用
  - 単純なAST変換のみ
  - 外部依存なし

### リスク評価: **Low**
- 理由:
  - 確立されたプラグインパターンを使用
  - 影響範囲がタスクリスト表示のみに限定
  - GFMより前に処理することで干渉を回避

---

## 5. 設計フェーズへの推奨事項

### 推奨アプローチ
**Option B: 新規remarkプラグイン作成**

### 主要な設計決定事項
1. **プラグイン配置**: `src/plugins/remark-task-status/index.js`
2. **処理順序**: WikiLink → **TaskStatus** → MarkHighlight → Tags → Callout
3. **出力形式**: `<span data-task-status="...">` + アイコン用子要素
4. **CSSパターン**: callout.cssのマスクアイコンパターンを踏襲

### 要調査事項
1. **アイコンデザイン**: 22種類のSVGアイコン選定
   - Lucide Icons / Heroicons から選定推奨
2. **カラーパレット**: ステータス種類ごとの色分け
   - 既存callout色パレットを参考に設計

### ファイル構成案
```
src/
├── plugins/
│   └── remark-task-status/
│       └── index.js        # remarkプラグイン本体
└── styles/
    └── task.css            # タスクステータススタイル
```

---

## 6. 次のステップ

1. 要件の承認確認
2. `/kiro:spec-design task-theme-design` で技術設計を作成
3. アイコン・カラーの具体的な選定
