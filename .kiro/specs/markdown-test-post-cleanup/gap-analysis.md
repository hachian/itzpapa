# Gap Analysis: markdown-test-post-cleanup

## 1. 現状調査

### テストポスト一覧（15件）

| ファイルパス | タイトル | draft | 構造 | 問題点 |
|-------------|---------|-------|------|--------|
| `callout-comprehensive-test/index.md` | Calloutのテスト | ❌ | フォルダ | 命名不一致 |
| `callout-edge-cases/index.md` | Callout エッジケーステスト | ❌ | フォルダ | 命名不一致 |
| `callout-wikilink-test/index.md` | Callout + Wikilink統合テスト | ❌ | フォルダ | 命名不一致 |
| `hierarchical-tag-test/index.md` | 階層タグテストページ | ❌ | フォルダ | 命名不一致 |
| `image-test/index.md` | Image Processing Test | ❌ | フォルダ | 命名不一致 |
| `integration-test/index.md` | TASK-103 統合テスト | ❌ | フォルダ | 命名不一致 |
| `mark-highlight-test/index.md` | マークハイライト機能のテスト | ❌ | フォルダ | 命名不一致 |
| `markdown-basic-test/index.md` | 基本的なMarkdownのテスト | ❌ | フォルダ | 命名不一致 |
| `math-test/index.md` | 数式記法のテスト | ❌ | フォルダ | 命名不一致 |
| `mermaid-test/index.md` | Mermaidダイアグラムのテスト | ❌ | フォルダ | 命名不一致 |
| `tag-test/index.md` | タグ機能テストページ | ❌ | フォルダ | 命名不一致 |
| `wikilink-test/index.md` | WikiLink記法のテスト | ❌ | フォルダ | 命名不一致 |
| `test page/index.md` | Test Page with Spaces | ❌ | フォルダ | スペース含む |
| `my test page/index.md` | My Test Page Example | ❌ | フォルダ | スペース含む |
| `table-style-test.md` | テーブルスタイルのテスト | ✅ | ファイル | 非フォルダ形式 |

### 機能カバレッジ

| 機能 | テストポスト | カバレッジ |
|------|------------|----------|
| WikiLink | wikilink-test, test page, my test page | ✅ 十分 |
| Callout | callout-comprehensive, callout-edge-cases, callout-wikilink | ✅ 十分（重複あり） |
| マークハイライト | mark-highlight-test, integration-test | ✅ 十分 |
| タグ | tag-test, hierarchical-tag-test | ✅ 十分 |
| テーブル | table-style-test | ✅ 十分 |
| 数式 | math-test | ✅ 十分 |
| Mermaid | mermaid-test | ✅ 十分 |
| 画像 | image-test | ✅ 十分 |
| 基本Markdown | markdown-basic-test | ✅ 十分 |
| 統合テスト | integration-test | ✅ 十分 |

### 既存インフラ状況

#### draft機能（実装済み）
- `src/content.config.ts`: `draft: z.boolean().optional().default(false)` ✅
- `src/pages/blog/[...slug].astro`: 本番環境でdraft除外 ✅
- `src/pages/blog/index.astro`: 本番環境でdraft除外 ✅
- `src/pages/rss.xml.js`: draft常時除外 ✅

**現状**: draft機能は完全に実装済み。テストポストに`draft: true`を追加するだけで要件4を満たせる。

## 2. 要件対応ギャップ分析

### Requirement 1: テストポストの識別と分類

| 受入条件 | 現状 | ギャップ |
|---------|------|---------|
| `test-`プレフィックス | 不統一（`callout-*`、`*-test`など） | **要対応**: リネーム必要 |
| 機能別分類 | ファイル名で暗黙的に分類 | **対応済み**: 追加作業不要 |
| `draft: true`フラグ | 1件のみ設定済み | **要対応**: 14件に追加 |

### Requirement 2: ディレクトリ構造の統一

| 受入条件 | 現状 | ギャップ |
|---------|------|---------|
| フォルダ形式統一 | 1件が非フォルダ | **要対応**: `table-style-test.md`移行 |
| スペース正規化 | 2件にスペース | **要対応**: `test page`, `my test page` |

### Requirement 3: 重複・冗長テストの統合

| 機能 | 重複状況 | 推奨アクション |
|------|---------|---------------|
| Callout | 3件（包括、エッジ、統合） | **統合推奨**: 包括テストに統合可能 |
| Tag | 2件（基本、階層） | **維持**: 目的が異なる |
| WikiLink | 3件（基本、test page、my test page） | **統合検討**: スペーステストは1件に統合可能 |

### Requirement 4: 本番環境からの除外

| 受入条件 | 現状 | ギャップ |
|---------|------|---------|
| `draft: true`設定 | 1件のみ | **要対応**: 全件に追加 |
| 本番ビルド除外 | 実装済み | **対応済み** |
| 開発プレビュー | 実装済み | **対応済み** |

### Requirement 5: テストカバレッジ

| 受入条件 | 現状 | ギャップ |
|---------|------|---------|
| 全機能テスト維持 | 全機能カバー | **対応済み** |
| 不足テスト特定 | N/A | **対応済み** |
| 動作説明 | 各ポストに説明あり | **対応済み** |

## 3. 実装アプローチオプション

### Option A: 最小変更（リネーム + draft追加のみ）

**スコープ**:
- 全テストポストに`draft: true`追加
- `table-style-test.md`をフォルダ形式に移行
- スペース含むフォルダをリネーム

**変更対象**:
- 15件のフロントマター更新
- 1件のファイル移動（table-style-test）
- 2件のフォルダリネーム（test page, my test page）

**トレードオフ**:
- ✅ 最小限の変更で要件4を完全達成
- ✅ 既存のWikiLinkリンクへの影響最小
- ❌ 命名規則統一（要件1-1）未達成
- ❌ 重複統合（要件3）未対応

### Option B: 命名規則統一

**スコープ**:
- Option A + 全テストポストを`test-{機能名}/index.md`にリネーム

**命名変換例**:
```
callout-comprehensive-test → test-callout/
callout-edge-cases → test-callout-edge-cases/
wikilink-test → test-wikilink/
tag-test → test-tag/
```

**トレードオフ**:
- ✅ 要件1-1完全達成
- ✅ 一貫した命名でファイル探索が容易
- ❌ WikiLink参照が壊れる可能性（要調査）
- ❌ 変更量が大きい

### Option C: 完全統合（推奨）

**スコープ**:
- Option B + 重複テストの統合

**統合計画**:
1. Callout系3件 → `test-callout/index.md`に統合
2. スペーステスト2件 → `test-wikilink-spaces/index.md`に統合

**最終テストポスト構成（10件）**:
```
test-callout/           # 包括、エッジ、Wikilink統合
test-image/
test-integration/
test-mark-highlight/
test-markdown-basic/
test-math/
test-mermaid/
test-table/
test-tag/               # 基本タグ
test-tag-hierarchical/  # 階層タグ
test-wikilink/          # 基本 + スペーステスト統合
```

**トレードオフ**:
- ✅ 全要件完全達成
- ✅ テストセットが最小化・明確化
- ❌ 統合作業の工数が必要
- ❌ コンテンツ統合で情報欠落リスク

## 4. 工数・リスク評価

| オプション | 工数 | リスク | 備考 |
|-----------|------|--------|------|
| A: 最小変更 | S (1日以内) | Low | 即時実行可能 |
| B: 命名統一 | M (2-3日) | Medium | WikiLink影響調査必要 |
| C: 完全統合 | M (3-5日) | Medium | コンテンツ統合慎重に |

## 5. 推奨アプローチ

**フェーズ1（即時）**: Option A実行
- 全テストポストに`draft: true`追加
- `table-style-test.md`をフォルダ形式に移行
- スペース含むフォルダをリネーム

**フェーズ2（オプション）**: Option B/C検討
- WikiLink参照影響を調査後、段階的に命名統一
- 重複テストは必要に応じて統合

## 6. 設計フェーズへの引継ぎ事項

### 確定事項
- draft機能は実装済み、追加開発不要
- フォルダ形式統一は単純なファイル操作

### 要調査事項（Research Needed）
- WikiLinkでのテストポスト相互参照有無
- リネーム時のリンク切れ影響範囲

### 制約
- `src/content/blog/`配下のパス変更は本番URLに影響
- 画像ファイルの移動先も同時に対応必要
