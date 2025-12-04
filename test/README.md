# Markdown Plugin テスト環境

## 概要

このディレクトリには、Obsidian互換のMarkdownプラグイン（WikiLink、Mark Highlight、Tags、Callout）の包括的なテストスイートが含まれています。

## テスト構成

### テストレベル

```
test/
├── 単体テスト (Unit Tests)
│   ├── wikilink-unit-test.js      # WikiLinkプラグイン
│   ├── mark-highlight-unit-test.js # Mark Highlightプラグイン
│   ├── tags-unit-test.js           # Tagsプラグイン
│   └── callout-test.js             # Calloutプラグイン
├── 統合テスト (Integration Tests)
│   └── integration-test.js         # プラグイン間の相互作用
├── E2Eテスト (End-to-End Tests)
│   ├── e2e-test.js                 # 完全な処理パイプライン
│   └── html-validator-test.js      # HTMLバリデータ
├── ユーティリティ (Utilities)
│   ├── utils/html-validator.js     # cheerioベースのHTMLバリデータ
│   └── fixtures/                   # テストフィクスチャ
└── レガシーテスト (Legacy Tests)
    ├── wikilink-test.js
    ├── image-wikilink-test.js
    └── table-wikilink-test.js
```

## テストの実行

### すべてのテストを実行

```bash
npm test
```

### カテゴリ別実行

```bash
# 単体テストのみ
npm run test:unit

# 統合テストのみ
npm run test:integration

# E2Eテストのみ
npm run test:e2e

# フィクスチャローダーテスト
npm run test:fixtures
```

### 個別テストの実行

```bash
# WikiLinkテスト
node --test test/wikilink-unit-test.js

# Calloutテスト
node --test test/callout-test.js

# Mark Highlightテスト
node --test test/mark-highlight-unit-test.js

# Tagsテスト
node --test test/tags-unit-test.js
```

## テストスイートの詳細

### 1. WikiLink Unit Tests (`wikilink-unit-test.js`)

**テスト数**: 28件

**カバー範囲**:
- 基本的なWikilink変換
- エイリアス付きリンク
- 見出しアンカー（英語・日本語）
- 日本語パスの処理
- 画像WikiLink
- エッジケース（空リンク、特殊文字）

### 2. Mark Highlight Unit Tests (`mark-highlight-unit-test.js`)

**テスト数**: 25件

**カバー範囲**:
- 基本的なハイライト構文（`==text==`）
- 複数ハイライト
- 日本語テキスト
- ネストされた書式
- セキュリティ（XSSテスト）
- アクセシビリティ

### 3. Tags Unit Tests (`tags-unit-test.js`)

**テスト数**: 27件

**カバー範囲**:
- 基本タグ（`#tag`）
- 階層タグ（`#level1/level2`）
- 日本語タグ
- URL生成
- CSSクラス
- エッジケース

### 4. Callout Unit Tests (`callout-test.js`)

**テスト数**: 31件

**カバー範囲**:
- 7種類のコールアウトタイプ（note, tip, warning, danger, info, caution, important）
- 折りたたみ可能状態（`+`, `-`）
- ネストされたコールアウト
- カスタムタイトル
- 日本語コンテンツ

### 5. Integration Tests (`integration-test.js`)

**テスト数**: 32件

**カバー範囲**:
- 2プラグイン組み合わせ（WikiLink + Highlight, Callout + WikiLink等）
- 3プラグイン組み合わせ
- 4プラグイン全組み合わせ
- 処理順序テスト
- 競合・干渉テスト
- エッジケース

### 6. E2E Tests (`e2e-test.js`)

**テスト数**: 24件

**カバー範囲**:
- 完全なMarkdown処理パイプライン
- 実際のフィクスチャファイル処理
- HTMLバリデーション
- 日本語コンテンツ
- 出力の一貫性

### 7. HTML Validator Tests (`html-validator-test.js`)

**テスト数**: 25件

**カバー範囲**:
- callout構造の検証
- wikilink（内部リンク）検証
- highlight（mark要素）検証
- tag（タグリンク）検証
- HTML構造検証
- アクセシビリティ検証

## フィクスチャ

### ディレクトリ構造

```
test/fixtures/
├── wikilink/          # WikiLinkテスト用
├── mark-highlight/    # ハイライトテスト用
├── tags/              # タグテスト用
├── callout/           # コールアウトテスト用
├── combination/       # 組み合わせテスト用
└── e2e/               # E2Eテスト用
```

### フィクスチャの使い方

```javascript
import { loadInput, loadExpected, loadAllFixtures } from './fixtures/fixture-loader.js';

// 単一フィクスチャの読み込み
const input = await loadInput('wikilink', 'basic');
const expected = await loadExpected('wikilink', 'basic');

// 全フィクスチャの読み込み
const fixtures = await loadAllFixtures('callout');
```

## HTMLバリデータ

E2Eテスト用のcheerioベースのHTMLバリデータ。

```javascript
import {
  parseHtml,
  validateCallouts,
  validateWikilinks,
  validateHighlights,
  validateTags,
  assertHtmlContains,
} from './utils/html-validator.js';

// HTML解析
const $ = parseHtml(htmlString);

// コールアウト検証
const callouts = validateCallouts($);
console.log(callouts.count, callouts.callouts);

// 期待値アサーション
const result = assertHtmlContains($, {
  calloutTypes: ['note', 'warning'],
  highlightTexts: ['重要'],
  selectors: ['mark', '[data-callout]'],
});
```

## テスト結果

### 現在の状態

```
🧪 Markdown Plugin Test Suite
============================================================
✓ Fixture Loader Tests
✓ Wikilink Unit Tests (28件)
✓ Mark Highlight Unit Tests (25件)
✓ Tags Unit Tests (27件)
✓ Callout Unit Tests (31件)
✓ Integration Tests (32件)
✓ HTML Validator Tests (25件)
✓ E2E Tests (24件)
✓ Wikilink Core Tests (Legacy)
✓ Image Wikilink Tests
✓ Table Wikilink Tests
✓ Performance Tests
============================================================
📊 Test Summary
  Passed: 12 / Total: 12
  Failed: 0
✨ All tests passed! ✨
```

### テストカバレッジ目標

| カテゴリ | 単体テスト | 統合テスト | E2Eテスト |
|---------|-----------|-----------|----------|
| WikiLink | ✅ 28件 | ✅ 含む | ✅ 含む |
| Mark Highlight | ✅ 25件 | ✅ 含む | ✅ 含む |
| Tags | ✅ 27件 | ✅ 含む | ✅ 含む |
| Callout | ✅ 31件 | ✅ 含む | ✅ 含む |
| 組み合わせ | - | ✅ 32件 | ✅ 24件 |

## 既知の制限事項

1. **タグの日本語句読点**: `。`や`、`の後のタグは認識されない（スペース区切りが必要）
2. **エスケープシーケンス**: バックスラッシュによるWikiLinkのエスケープは完全にはサポートされていない
3. **複雑なネスト**: ハイライト内のWikiLinkなど、複雑なネストは予期しない結果になる場合がある
4. **ハイライトと太字の組み合わせ順序**: `**==text==**`（太字が外側）は動作するが、`==**text**==`（ハイライトが外側）は動作しない（Markdownパーサーの処理順序による制限、別タスクで対応予定）

## トラブルシューティング

### テストが失敗する場合

```bash
# 依存関係の確認
npm install

# 個別テストの詳細出力
node --test --test-reporter=spec test/wikilink-unit-test.js

# デバッグモード
DEBUG=1 npm test
```

### フィクスチャが見つからない場合

```bash
# フィクスチャディレクトリの確認
ls -la test/fixtures/

# フィクスチャローダーテスト
npm run test:fixtures
```

## 開発者向け情報

### 新しいテストの追加

1. 適切なディレクトリにフィクスチャを作成
2. テストファイルにテストケースを追加
3. `test-runner.js`に新しいテストスイートを追加（必要に応じて）

### テストの命名規則

- フィクスチャファイル: `{feature}-{case}.md`
- テストファイル: `{plugin}-{type}-test.js`
- テスト名: `{action} {target} ({condition})`

### プラグイン処理順序

```
remarkWikilink → remarkMarkHighlight → remarkTags → remarkCallout → remarkRehype → rehypeCallout
```
