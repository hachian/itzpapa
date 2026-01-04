# Technical Design Document

## Overview

このドキュメントは、itzpapaプロジェクトのコードベース改善（Phase 1）に関する技術設計を記述します。Phase 1では、機能変更を伴わない低リスクなリファクタリングのみを対象とします。

---

## Requirement 1: 設定ファイルの重複解消

### 現状分析

`astro.config.mjs`において、以下の重複が存在します：

- **remarkPlugins**: 51-68行目（MDX用）と83-99行目（markdown用）が完全に同一
- **rehypePlugins**: 70-77行目（MDX用）と101-108行目（markdown用）が完全に同一

### Technical Design

#### 変更対象ファイル

| File | Changes |
|------|---------|
| `astro.config.mjs` | 共通プラグイン配列の定義と参照に変更 |

#### 設計詳細

1. **共通配列の定義**（ファイル上部、imageHostingConfig定義後）

```javascript
// 共通remarkプラグイン設定
// markdownとMDXで同一の処理を適用
const commonRemarkPlugins = [
	// Wikilinkを最初に処理（最高優先度）
	[remarkWikilink, { priority: 'high' }],
	// コールアウトパース（remarkBreaksより前に処理して、ヘッダー行の改行が<br>にならないようにする）
	[remarkCallout, { maxNestingDepth: 3 }],
	// 単一改行を<br>に変換（コールアウト処理後に実行）
	remarkBreaks,
	// タスクステータス処理（Obsidian形式）
	remarkTaskStatus,
	// ハイライト記法処理（セキュリティ強化設定）
	[remarkMarkHighlight, {
		accessibility: true,
		cache: true,
		securityMode: 'auto',
		maxInputLength: 100000
	}],
	// タグ処理プラグイン
	[remarkTags, { convertToLinks: true }]
];

// 共通rehypeプラグイン設定
const commonRehypePlugins = [
	// テーブルをdiv.table-wrapperでラップ（水平スクロール対応）
	rehypeTableWrapper,
	// GFMのcheckbox要素をカスタムスタイルに置き換え
	rehypeTaskStatus,
	// 相対リンクに末尾スラッシュを追加（Obsidian互換）
	rehypeTrailingSlash
];
```

2. **MDX設定での参照**

```javascript
mdx({
	remarkPlugins: commonRemarkPlugins,
	rehypePlugins: commonRehypePlugins,
	extendMarkdownConfig: false
}),
```

3. **markdown設定での参照**

```javascript
markdown: {
	remarkPlugins: commonRemarkPlugins,
	rehypePlugins: commonRehypePlugins,
	gfm: true
}
```

#### 検証方法

- ビルド前後の`dist/`ディレクトリを比較し、出力が同一であることを確認
- `npm run build`がエラーなく完了することを確認

---

## Requirement 2: 未使用ファイルの削除

### 現状分析

以下のファイルはどこからも参照されていないバックアップファイルです：

- `src/plugins/remark-wikilink/index-backup.js`
- `src/plugins/remark-wikilink/index-optimized.js`

### Technical Design

#### 変更対象ファイル

| File | Changes |
|------|---------|
| `src/plugins/remark-wikilink/index-backup.js` | 削除 |
| `src/plugins/remark-wikilink/index-optimized.js` | 削除 |

#### 検証方法

- `npm run build`がエラーなく完了することを確認
- `npm run test`がすべてパスすることを確認

---

## Requirement 3: プラグインテストの確認

### 現状分析

research.mdの調査により、以下の既存テストが発見されました：

| Plugin | Test File | Location |
|--------|-----------|----------|
| remark-wikilink | wikilink-unit-test.js | tests/unit/ |
| remark-callout | callout-test.js | tests/unit/ |
| remark-mark-highlight | mark-highlight-unit-test.js | tests/unit/ |
| remark-tags | tags-unit-test.js | tests/unit/ |

### Technical Design

新規テストの作成は不要です。既存テストのカバレッジを確認し、不足がある場合のみ拡充します。

#### アクション

1. 既存テストの実行と結果確認（`npm run test`）
2. テストカバレッジの評価
3. 主要ユースケースがカバーされているかの確認

#### 確認項目

| Plugin | 確認すべきユースケース |
|--------|----------------------|
| remark-wikilink | 基本変換、エイリアス、存在しないリンク |
| remark-callout | タイプ別パース、ネスト、折りたたみ |
| remark-mark-highlight | 基本ハイライト、エスケープ、マルチライン |
| remark-tags | タグ検出、リンク変換、特殊文字 |

---

## Requirement 4: コードコメント言語の統一

### 現状分析

プラグインファイルとユーティリティファイルにおいて、日本語と英語のコメントが混在しています。

### Technical Design

#### 変更対象ファイル

| File | Changes |
|------|---------|
| `src/plugins/*/index.js` | 英語コメントを日本語に統一 |
| `src/utils/*.ts` | 英語コメントを日本語に統一 |

#### 変換ルール

1. コードコメント（`//`、`/* */`）は日本語に翻訳
2. JSDoc/TSDocコメントは日本語で記述
3. 外部APIドキュメントへの参照は元の英語を保持可

#### 影響範囲

- ビルド出力に影響なし（コメントのみの変更）
- 機能に影響なし

#### 検証方法

- `npm run build`がエラーなく完了することを確認
- ビルド前後の`dist/`ディレクトリを比較し、出力が同一であることを確認

---

## Implementation Notes

### 実装順序

1. **Requirement 2**（未使用ファイル削除）- 最もリスクが低い
2. **Requirement 3**（テスト確認）- テストが正常に動作することを確認
3. **Requirement 1**（設定重複解消）- テストで回帰を検出可能な状態で実施
4. **Requirement 4**（コメント統一）- 機能に影響しない変更を最後に

### リスク軽減策

| リスク | 軽減策 |
|--------|--------|
| ビルド出力の変化 | ビルド前後の`dist/`比較 |
| テスト失敗 | 各変更前後でテスト実行 |
| 設定ミス | 既存の動作確認用記事でプレビュー確認 |

---

## Acceptance Criteria Mapping

| Requirement | Acceptance Criteria | 設計での対応 |
|-------------|---------------------|-------------|
| 1-1 | 共通remarkプラグイン配列を1箇所で定義 | `commonRemarkPlugins`配列 |
| 1-2 | 共通rehypeプラグイン配列を1箇所で定義 | `commonRehypePlugins`配列 |
| 1-3 | markdownとmdxで同一配列を参照 | 両設定から配列を参照 |
| 1-4 | 1箇所の修正で両方に反映 | 共通配列による一元管理 |
| 1-5 | 変更前と同一の出力を生成 | dist/比較で検証 |
| 2-1, 2-2 | バックアップファイルを含まない | ファイル削除 |
| 2-3 | 各プラグインにindex.jsのみ | 不要ファイル削除 |
| 2-4 | ビルドがエラーなく完了 | ビルド実行確認 |
| 3-1〜3-6 | 各プラグインのテスト | 既存テスト確認 |
| 4-1〜4-5 | コメント日本語統一 | コメント翻訳 |
