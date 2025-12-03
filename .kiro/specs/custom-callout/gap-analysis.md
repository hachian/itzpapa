# ギャップ分析: custom-callout

## 1. 現状の調査

### 1.1 関連アセット

| カテゴリ | ファイル | 役割 |
|---------|---------|------|
| 設定 | `astro.config.mjs` | rehype-calloutsの登録（mdx/markdown両方） |
| スタイル | `src/styles/global.css` | rehype-calloutsテーマのインポート |
| スタイル | `src/styles/callout.css` | カスタムスタイルオーバーライド |
| コンテンツ | `src/content/blog/callout-comprehensive-test/` | テストケース |

### 1.2 既存プラグインの構造パターン

3つの自前remarkプラグインが存在し、統一されたパターンを使用：

```
src/plugins/
├── remark-wikilink/index.js    # WikiLink記法処理
├── remark-mark-highlight/index.js  # ==ハイライト==記法処理
└── remark-tags/index.js        # #タグ記法処理
```

**共通パターン:**
- `unist-util-visit`でAST走査
- `visit(tree, 'text', ...)` でテキストノードを処理
- 正規表現でマッチング
- `parent.children.splice()`でノード置換
- ESModuleスタイル (`export default function`)

### 1.3 rehype-calloutsの現在の使用状況

**astro.config.mjs:**
```javascript
import rehypeCallouts from 'rehype-callouts';
// ...
rehypePlugins: [
  [rehypeCallouts, { theme: 'obsidian' }]
]
```

**global.css:**
```css
@import 'rehype-callouts/theme/obsidian';
```

**callout.css:** rehype-callouts固有のCSS変数（`--rc-color-*`）に依存

### 1.4 出力HTML構造（rehype-callouts）

```html
<blockquote class="callout callout-note">
  <div class="callout-title">
    <div class="callout-icon">...</div>
    <div class="callout-title-inner">Note</div>
  </div>
  <div class="callout-content">
    <p>コンテンツ...</p>
  </div>
</blockquote>
```

## 2. 要件の技術的ニーズ分析

### 2.1 必要な技術的実装

| 要件 | 技術的ニーズ | 既存コードから利用可能 |
|------|-------------|---------------------|
| R1: 構文パース | blockquoteノード検出、`[!type]`パース | remarkパターン流用可能 |
| R2: 折りたたみ | `<details>`/`<summary>`生成 | HTMLノード生成パターン有り |
| R3: Markdownコンテンツ | 子ノードの保持 | remark処理で自動対応 |
| R4: ネスト | 再帰的な処理 | 新規実装必要 |
| R5: スタイリング | OKLCH変数、CSSクラス | design-tokens.cssパターン有り |
| R6: blockquote区別 | 条件分岐 | シンプルな実装 |
| R7: アーキテクチャ | プラグイン構造 | 既存パターン完全流用 |
| R8: 依存削除 | 設定ファイル修正 | 単純な削除作業 |

### 2.2 ギャップ識別

| ギャップ | 状態 | 詳細 |
|---------|------|------|
| blockquote処理 | **新規** | 既存プラグインはtextノードのみ処理。blockquoteノードの処理は新規 |
| ネスト処理 | **新規** | 再帰的なblockquote処理の実装が必要 |
| HTML構造生成 | **一部流用** | remark-mark-highlightのHTMLノード生成パターンを拡張 |
| アイコン表示 | **調査必要** | SVGインライン or Unicode文字の選択 |
| 折りたたみ動作 | **新規** | `<details>`生成ロジック |

### 2.3 複雑性シグナル

- **アルゴリズム的ロジック**: blockquote内テキストのパース、ネスト検出
- **外部統合**: なし（自己完結型プラグイン）
- **ワークフロー**: シンプル（AST変換のみ）

## 3. 実装アプローチオプション

### Option A: remarkプラグインとして新規作成（推奨）

**理由:**
- 既存の3プラグインと一貫したアーキテクチャ
- Markdown AST（blockquoteノード）の段階で処理するのが自然
- 他のremarkプラグイン（WikiLink等）との統合が容易

**実装方針:**
1. `src/plugins/remark-callout/index.js`を新規作成
2. `visit(tree, 'blockquote', ...)`でブロッククォートを走査
3. 最初の子ノードから`[!type]`をパース
4. 条件に合致すればHTML構造に変換

**トレードオフ:**
- ✅ 既存パターンとの一貫性
- ✅ 他のremarkプラグインとの互換性
- ✅ Astroのmarkdown/mdx両方で動作
- ❌ rehypeより処理タイミングが早いためHTMLノード生成が必要

### Option B: rehypeプラグインとして新規作成

**理由:**
- rehype-calloutsの直接置換
- HTML AST処理のためスタイリングとの親和性が高い

**実装方針:**
1. `src/plugins/rehype-callout/index.js`を新規作成
2. `visit(tree, 'element', ...)`でblockquote要素を処理

**トレードオフ:**
- ✅ 既存のrehype-calloutsと同じ処理タイミング
- ❌ 既存の自前プラグインはすべてremarkで統一されている
- ❌ WikiLinkなどremark処理後のコンテンツに影響を受ける可能性

### Option C: ハイブリッド（remark + CSS）

**理由:**
- remarkでHTML構造生成、CSSでスタイリング完全分離

**実装方針:**
1. remarkプラグインでdata属性付きの構造を生成
2. CSSで完全にスタイリング

**トレードオフ:**
- ✅ 関心の分離が明確
- ✅ スタイルの変更がJS不要
- ❌ 実質Option Aと同じ

## 4. 実装複雑性とリスク

### 工数見積もり: **M（3-7日）**

**内訳:**
- プラグインコア実装: 1-2日
- スタイリング（OKLCH、ダークモード、レスポンシブ）: 1日
- ネスト処理: 1日
- テスト・検証: 1日
- 依存削除・リファクタリング: 0.5日

**根拠:**
- 既存パターンが明確で流用可能
- 複雑な外部統合なし
- 既存テストコンテンツで検証可能

### リスク: **Low**

| リスク要因 | 評価 | 理由 |
|-----------|------|------|
| 技術的不確実性 | 低 | remarkプラグインパターン確立済み |
| 既存機能への影響 | 低 | 独立したプラグイン、非破壊的 |
| 後方互換性 | 低 | 同じMarkdown構文をサポート |
| パフォーマンス | 低 | 既存プラグインと同等の処理量 |

## 5. 設計フェーズへの推奨事項

### 5.1 推奨アプローチ

**Option A: remarkプラグインとして新規作成**

- 既存アーキテクチャとの一貫性を重視
- `src/plugins/remark-callout/`に配置

### 5.2 主要な設計決定事項

1. **アイコン実装方式**: SVGインライン vs Unicode文字
   - 推奨: SVGインライン（視覚的一貫性、カスタマイズ性）

2. **HTML出力構造**: rehype-calloutsと互換 vs 独自構造
   - 推奨: 類似構造（既存CSSの部分流用可能）

3. **折りたたみ状態管理**: CSS only vs JavaScript
   - 推奨: `<details>`/`<summary>`によるCSS only（アクセシビリティ）

### 5.3 調査継続項目

- [ ] 各コールアウトタイプのアイコンSVG選定
- [ ] ネストされたコールアウトの具体的なHTML構造設計
- [ ] 折りたたみアニメーションの実装方式

## 6. 要件-アセットマッピング

| 要件 | 関連ファイル | ギャップタグ |
|------|-------------|-------------|
| R1: 構文パース | 新規: `src/plugins/remark-callout/index.js` | Missing |
| R2: 折りたたみ | 新規: `src/plugins/remark-callout/index.js` | Missing |
| R3: Markdownコンテンツ | 既存remark処理で対応 | - |
| R4: ネスト | 新規: `src/plugins/remark-callout/index.js` | Missing |
| R5: スタイリング | 更新: `src/styles/callout.css` | Partial |
| R6: blockquote区別 | 新規: `src/plugins/remark-callout/index.js` | Missing |
| R7: アーキテクチャ | 新規: `src/plugins/remark-callout/` | Missing |
| R8: 依存削除 | 更新: `package.json`, `astro.config.mjs`, `global.css`, `callout.css` | Constraint |
