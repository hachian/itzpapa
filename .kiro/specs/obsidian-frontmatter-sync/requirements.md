# Requirements Document

## Introduction

本ドキュメントは、itzpapaプロジェクトのフロントマター仕様を[fuwari](https://github.com/saicaca/fuwari)テーマに準拠させ、Obsidianとの互換性を確保するための要件を定義します。

### 背景
- 当初fuwariをベースにプロジェクトを構築したが、フロントマターフィールド名が独自に変更されていた
- Obsidian公式プロパティ（`tags`, `aliases`）との整合性も考慮が必要
- 19件の既存記事のマイグレーションが必要

### 目標フロントマター仕様（fuwari準拠）

```yaml
---
title: 記事タイトル          # 必須
published: 2025-01-01        # 必須
description: 記事の説明文    # オプション（デフォルト: ""）
image: ./cover.jpg           # オプション（デフォルト: ""）
tags: [Tag1, Tag2]           # オプション（デフォルト: []）
category: カテゴリ名         # オプション（デフォルト: ""）
draft: false                 # オプション（デフォルト: false）
lang: ja                     # オプション（デフォルト: ""）
updated: 2025-01-02          # オプション
aliases: [別名1]             # オプション（Obsidian公式）
---
```

## Requirements

### Requirement 1: フロントマターフィールドのリネーム

**Objective:** As a 開発者, I want フロントマターフィールド名をfuwari仕様に統一すること, so that fuwariテーマとの互換性が確保され、将来のアップデートが容易になる

#### Acceptance Criteria
1. The Content Schema shall `pubDate`フィールドを`published`にリネームする
2. The Content Schema shall `heroImage`フィールドを`image`にリネームする
3. The Content Schema shall `updatedDate`フィールドを`updated`にリネームする
4. When スキーマ変更後にビルドを実行した場合, the Build Process shall 新しいフィールド名で正常にビルドが完了する

### Requirement 2: スキーマ定義のfuwari準拠

**Objective:** As a 開発者, I want スキーマ定義がfuwariと同一であること, so that fuwariとの互換性が完全に確保される

#### Acceptance Criteria
1. The Content Schema shall `title`フィールドを文字列型の必須フィールドとして定義する
2. The Content Schema shall `published`フィールドを日付型の必須フィールドとして定義する
3. The Content Schema shall `updated`フィールドを日付型のオプショナルフィールドとして定義する
4. The Content Schema shall `description`フィールドを文字列型のオプショナルフィールドとして定義する（デフォルト: ""）
5. The Content Schema shall `image`フィールドを文字列型のオプショナルフィールドとして定義する（デフォルト: ""）
6. The Content Schema shall `tags`フィールドを文字列配列型のオプショナルフィールドとして定義する（デフォルト: []）
7. The Content Schema shall `category`フィールドを文字列型のオプショナルフィールドとして定義する（デフォルト: ""）
8. The Content Schema shall `draft`フィールドをブール型のオプショナルフィールドとして定義する（デフォルト: false）
9. The Content Schema shall `lang`フィールドを文字列型のオプショナルフィールドとして定義する（デフォルト: ""）

### Requirement 3: Obsidian公式プロパティのサポート

**Objective:** As a Obsidianユーザー, I want Obsidian公式プロパティが認識されること, so that Obsidianで作成したノートをそのまま記事として使用できる

#### Acceptance Criteria
1. The Content Schema shall `aliases`フィールドを文字列配列のオプショナルフィールドとしてサポートする（Obsidian公式）
2. The Content Schema shall 未定義のフロントマターフィールドを無視し、ビルドエラーとしない

### Requirement 4: 既存コンテンツのマイグレーション

**Objective:** As a サイト管理者, I want 既存の19件の記事が新しいスキーマに移行されること, so that スキーマ変更後も全記事が正常に表示される

#### Acceptance Criteria
1. The Migration Script shall すべての既存記事の`pubDate`を`published`にリネームする
2. The Migration Script shall すべての既存記事の`heroImage`を`image`にリネームする
3. The Migration Script shall すべての既存記事の`updatedDate`を`updated`にリネームする（存在する場合）
4. When マイグレーション完了後にビルドを実行した場合, the Build Process shall エラーなく完了する

### Requirement 5: コード内参照の更新

**Objective:** As a 開発者, I want フロントマターフィールドを参照しているすべてのコードが更新されること, so that リネーム後もサイトが正常に動作する

#### Acceptance Criteria
1. The Codebase shall `pubDate`への参照をすべて`published`に更新する
2. The Codebase shall `heroImage`への参照をすべて`image`に更新する
3. The Codebase shall `updatedDate`への参照をすべて`updated`に更新する
4. When すべての参照更新後にビルドを実行した場合, the Build Process shall TypeScriptエラーなく完了する

### Requirement 6: 日付形式の標準化

**Objective:** As a コンテンツ作成者, I want 日付フィールドの入力形式が明確であること, so that フロントマター記述時に迷わず一貫した形式で記述できる

#### Acceptance Criteria
1. The Content Schema shall `published`フィールドでYYYY-MM-DD形式を受け入れる
2. The Content Schema shall `published`フィールドでISO 8601形式（YYYY-MM-DDTHH:MM）を受け入れる
3. The Content Schema shall `updated`フィールドで`published`と同じ形式を受け入れる
4. If 無効な日付形式が入力された場合, the Build Process shall 明確なエラーメッセージを表示する
