# Requirements Document

## Introduction

本仕様は、itzpapaプロジェクト内に存在するマークダウンテストポストを整理し、管理しやすい状態にすることを目的とします。現在、`src/content/blog/`配下には様々な機能テスト用のポストが散在しており、命名規則やディレクトリ構造に一貫性がありません。この整理により、テスト記事の管理性向上と本番コンテンツとの分離を実現します。

## Requirements

### Requirement 1: テストポストの識別と分類

**Objective:** As a 開発者, I want テストポストを機能別に分類し識別できるようにする, so that テスト目的が明確になり、保守が容易になる

#### Acceptance Criteria
1. The Content Management System shall 全テストポストに統一された命名プレフィックス「test-」を適用する
2. When テストポストを一覧する, the Content Management System shall テスト対象機能（callout、wikilink、tag等）で分類して表示する
3. The Content Management System shall 各テストポストのフロントマターに `test: true` または `draft: true` フラグを含める

### Requirement 2: ディレクトリ構造の統一

**Objective:** As a 開発者, I want 全テストポストが一貫したディレクトリ構造に従うようにする, so that コンテンツ管理が簡素化される

#### Acceptance Criteria
1. The Content Management System shall 全テストポストを `{slug}/index.md` フォルダ形式で格納する
2. When ルートレベルの `.md` ファイルが存在する, the Content Management System shall これをフォルダ形式に移行する
3. The Content Management System shall スペースを含むフォルダ名（例: `test page`）をケバブケース（例: `test-page`）に正規化する

### Requirement 3: 重複・冗長テストの統合

**Objective:** As a 開発者, I want 重複したテストケースを統合する, so that テストセットが最小限かつ包括的になる

#### Acceptance Criteria
1. When 同一機能に対する複数のテストポストが存在する, the Content Management System shall これらを1つの包括的なテストポストに統合する
2. The Content Management System shall 統合後も全てのエッジケースがカバーされることを保証する
3. If テストポストが本番記事と重複する内容を含む, then the Content Management System shall テスト専用のコンテンツに置き換える

### Requirement 4: テストポストの本番環境からの除外

**Objective:** As a サイト運営者, I want テストポストが本番ビルドに含まれないようにする, so that 公開サイトにテストコンテンツが表示されない

#### Acceptance Criteria
1. The Content Management System shall 全テストポストに `draft: true` フラグを設定する
2. When 本番ビルドを実行する, the Content Management System shall `draft: true` のポストをビルドから除外する
3. While 開発モード, the Content Management System shall テストポストをプレビュー可能にする

### Requirement 5: テストカバレッジの確認

**Objective:** As a 開発者, I want 整理後もObsidian記法の全機能がテストされていることを確認する, so that 機能の品質保証が維持される

#### Acceptance Criteria
1. The Content Management System shall 以下の機能それぞれに対応するテストポストを維持する: WikiLink、Callout、マークハイライト、タグ、テーブル、数式、Mermaid、画像
2. When 機能テストが不足している, the Content Management System shall 不足しているテストケースを特定する
3. The Content Management System shall 各テストポストに期待される動作の説明を含める
