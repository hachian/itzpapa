# Implementation Plan: markdown-test-post-cleanup

## Tasks

- [x] 1. テストポストのフロントマター更新
- [x] 1.1 既存テストポストに draft: true フラグを追加
  - 全15件のテストポストのフロントマターに`draft: true`を追加
  - 既存フィールド（title, description, pubDate, tags等）を保持
  - YAML構文の整合性を維持
  - _Requirements: 1.3, 4.1_

- [x] 2. ディレクトリ構造の正規化
- [x] 2.1 ルートレベルのMarkdownファイルをフォルダ形式に移行
  - `table-style-test.md`を`test-table/index.md`に移行
  - 同梱画像ファイルがある場合は同時に移動
  - _Requirements: 2.1, 2.2_

- [x] 2.2 スペースを含むフォルダ名をケバブケースに正規化
  - `test page/`を`test-page/`にリネーム
  - `my test page/`を`my-test-page/`にリネーム
  - フォルダ内の全ファイル（index.md、画像）も同時移動
  - _Requirements: 2.3_

- [x] 2.3 WikiLink参照パスの更新
  - リネームしたフォルダを参照するWikiLinkを更新
  - `[[../test page/index.md|...]]` → `[[../test-page/index.md|...]]`
  - 相対パス形式を維持
  - _Requirements: 2.3_

- [x] 3. 変更の検証
- [x] 3.1 ビルド検証の実行
  - `npm run build`を実行してビルドエラーがないことを確認
  - YAML構文エラー、WikiLink切れ、画像パス切れを検出
  - _Requirements: 4.2_

- [x] 3.2 本番除外と開発プレビューの確認
  - ビルド出力にテストポストが含まれていないことを確認
  - `npm run dev`でテストポストがプレビュー可能なことを確認
  - _Requirements: 4.2, 4.3_

- [x] 3.3 テストカバレッジの確認
  - 整理後も全Obsidian機能のテストポストが維持されていることを確認
  - WikiLink、Callout、マークハイライト、タグ、テーブル、数式、Mermaid、画像の各機能
  - _Requirements: 5.1_

## Deferred Requirements

以下の要件は設計段階でNon-Goalsとして定義され、将来オプションとして先送り:

- **1.1**: 命名プレフィックス「test-」の統一 — 将来の命名規則統一で対応
- **1.2**: 機能別分類表示 — 現状ファイル名で暗黙的に分類済み
- **3.1, 3.2, 3.3**: 重複テストの統合 — 将来の統合作業で対応
- **5.2**: 不足テストの特定 — 現状全機能カバー済み
- **5.3**: 動作説明の追加 — 既存テストポストに説明あり
