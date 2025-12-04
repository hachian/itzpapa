# Implementation Plan

## Tasks

- [x] 1. テストフィクスチャ基盤の構築
- [x] 1.1 (P) フィクスチャディレクトリ構造の作成
  - テストフィクスチャ用のディレクトリ構造を作成する
  - プラグイン別（wikilink, mark-highlight, callout, tags）のサブディレクトリを設置
  - 組み合わせテスト用とE2Eテスト用のサブディレクトリも作成
  - _Requirements: 8.1, 8.2_

- [x] 1.2 (P) フィクスチャ読み込みユーティリティの実装
  - Markdownファイルと期待出力HTMLのペアを読み込む機能を実装
  - カテゴリ指定でフィクスチャを取得できるインターフェースを提供
  - 日本語ファイル名にも対応
  - _Requirements: 8.3, 8.4_

- [x] 2. 単体テストの拡充
- [x] 2.1 (P) Calloutプラグイン単体テストの新規作成
  - 基本Callout変換（note, warning, tip, important, caution, danger, info）のテスト
  - 折りたたみ記法（`-`/`+`）の動作検証
  - カスタムタイトル指定のテスト
  - ネストされたCalloutの処理検証
  - 不正な形式（閉じ忘れ等）のエラーハンドリングテスト
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.1_

- [x] 2.2 (P) WikiLinkテストのエッジケース拡充
  - 既存テストに追加でエッジケースを補完
  - 空入力、特殊文字、非常に長いパスのテスト
  - コードブロック内での非変換確認を強化
  - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.6, 5.2, 5.3_

- [x] 2.3 (P) マークハイライトテストのエッジケース拡充
  - 複数行にまたがるハイライトの動作確認
  - ネストされた書式（太字、斜体）との組み合わせテスト
  - 不完全な形式（閉じ`==`なし）のテスト
  - コードブロック内での非変換確認
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 5.2, 5.3_

- [x] 2.4 (P) タグプラグインテストのエッジケース拡充
  - 階層タグ（`#親/子`）の処理テスト
  - 日本語タグの処理確認
  - 不正文字を含むタグのスキップ動作検証
  - コードブロック内での非変換確認
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.2, 5.3_

- [x] 3. 統合テストの実装
- [x] 3.1 組み合わせテストマトリクスの実装
  - WikiLink内にマークハイライトが含まれるケースのテスト
  - マークハイライト内にWikiLinkが含まれるケースのテスト
  - Callout内にWikiLink、タグ、マークハイライトが含まれるケースのテスト
  - テーブルセル内の各記法テスト
  - リスト項目内の各記法テスト
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 3.2 プラグイン処理順序テストの実装
  - remarkプラグインの処理順序（wikilink → mark-highlight → tags → callout）の検証
  - 順序変更時の出力差異を確認するテスト
  - rehypeプラグインがremark処理後のASTを正しく処理することの検証
  - _Requirements: 6.6, 6.7_

- [x] 3.3 競合・干渉テストの実装
  - 類似記法（`==`と`===`）の競合処理テスト
  - エスケープ記法（バックスラッシュ）の一貫動作テスト
  - 不完全なネスト（開始タグのみ、終了タグのみ）の影響テスト
  - _Requirements: 6.8, 6.9, 6.10_

- [x] 4. E2Eテストの実装
- [x] 4.1 cheerio依存の追加とHTMLバリデータの実装
  - cheerioをdevDependencyとして追加
  - HTMLファイルを読み込んでDOM検証するユーティリティを実装
  - セレクタベースでの要素存在確認、属性検証、テキスト検証機能を提供
  - _Requirements: 7.5_

- [x] 4.2 E2Eテスト用フィクスチャの作成
  - テスト用Markdownファイルをコンテンツディレクトリに配置
  - 各Obsidian記法の代表的なパターンを含むテストコンテンツを作成
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 4.3 ビルド出力検証テストの実装
  - WikiLinkのhref属性、クラス名を検証するテスト
  - マークハイライトの`<mark>`要素出力を検証するテスト
  - CalloutのDOM構造（data-callout属性、折りたたみ）を検証するテスト
  - タグバッジのリンク先URLを検証するテスト
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 5. テストインフラの統合
- [x] 5.1 テストランナーの更新
  - 新規テストスイート（callout-test、combination-test、build-output-test）をランナーに登録
  - テストスイートの実行順序を最適化（単体→統合→E2E）
  - E2Eテスト前のビルド実行を自動化
  - _Requirements: 5.5, 6.5, 7.5_

- [x] 5.2 テストREADMEの更新
  - テストの実行方法と各テストスイートの説明を追加
  - テストフィクスチャの追加方法を文書化
  - テスト結果の解釈方法を説明
  - _Requirements: 8.5_

## Deferred Requirements

以下の要件は本フェーズのスコープ外とし、別タスクとして管理します：

- **1.3（リンク切れ検出）**: ビルドコンテキストへのアクセスが限定的で実装複雑度が高いため、テスト拡充を優先

## 実装サマリー

### 作成されたファイル

1. **フィクスチャ基盤**
   - `test/fixtures/fixture-loader.js` - フィクスチャ読み込みユーティリティ
   - `test/fixture-loader-test.js` - フィクスチャローダーのテスト
   - `test/fixtures/*/` - 各プラグイン用のフィクスチャディレクトリ

2. **単体テスト**
   - `test/wikilink-unit-test.js` - 28件のテスト
   - `test/mark-highlight-unit-test.js` - 25件のテスト
   - `test/tags-unit-test.js` - 27件のテスト
   - `test/callout-test.js` - 31件のテスト

3. **統合テスト**
   - `test/integration-test.js` - 32件のテスト

4. **E2Eテスト**
   - `test/utils/html-validator.js` - cheerioベースのHTMLバリデータ
   - `test/html-validator-test.js` - 25件のテスト
   - `test/e2e-test.js` - 24件のテスト
   - `test/fixtures/e2e/*` - E2Eテスト用フィクスチャ

5. **テストインフラ**
   - `test/test-runner.js` - 更新されたテストランナー
   - `test/README.md` - 更新されたドキュメント
   - `package.json` - 新しいテストスクリプト

### テスト結果

```
🧪 Markdown Plugin Test Suite
============================================================
✓ Fixture Loader Tests (10件)
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

**総テスト数**: 約200件以上
