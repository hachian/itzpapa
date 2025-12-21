# Requirements Document

## Introduction

本仕様は、現在のcallout実装をObsidianの公式仕様に完全準拠させることを目的とする。現行実装では7タイプ（note, info, tip, warning, caution, important, danger）のみサポートしているが、Obsidianでは13タイプとそれぞれのエイリアスをサポートしている。本対応により、ObsidianユーザーがVaultで使用しているcalloutをそのままブログで表示できるようにする。

## Requirements

### Requirement 1: Obsidian公式calloutタイプの完全サポート

**Objective:** As a Obsidianユーザー, I want Obsidianで使用している全てのcalloutタイプがブログで正しく表示される, so that Vaultのコンテンツを修正なしでそのまま公開できる

#### Acceptance Criteria

1. The remark-callout shall サポートするcalloutタイプを以下の13種類に拡張する: note, abstract, info, todo, tip, success, question, warning, failure, danger, bug, example, quote
2. When 未知のcalloutタイプが使用された場合, the remark-callout shall noteタイプとして処理する（現行動作を維持）
3. The callout.css shall 各タイプに対応した配色をOKLCHカラーシステムで定義する:
   - note: 青系 (hue: 260)
   - abstract: 緑系 (hue: 150)
   - info: シアン系 (hue: 210)
   - todo: 青系 (hue: 260)
   - tip: 水色系 (hue: 180)
   - success: 緑系 (hue: 150)
   - question: 黄系 (hue: 90)
   - warning: オレンジ系 (hue: 75)
   - failure: 赤系 (hue: 25)
   - danger: 赤系 (hue: 25)
   - bug: 赤系 (hue: 25)
   - example: 紫系 (hue: 300)
   - quote: グレー系 (chroma: 0)
4. The rehype-callout shall 各タイプに適切なLucideアイコンを表示する

### Requirement 2: calloutタイプエイリアスのサポート

**Objective:** As a Obsidianユーザー, I want calloutタイプのエイリアス（別名）が認識される, so that Obsidianで使用している様々な記法がそのまま動作する

#### Acceptance Criteria

1. When `[!summary]` または `[!tldr]` が使用された場合, the remark-callout shall abstractタイプとして処理する
2. When `[!hint]` または `[!important]` が使用された場合, the remark-callout shall tipタイプとして処理する
3. When `[!check]` または `[!done]` が使用された場合, the remark-callout shall successタイプとして処理する
4. When `[!help]` または `[!faq]` が使用された場合, the remark-callout shall questionタイプとして処理する
5. When `[!caution]` または `[!attention]` が使用された場合, the remark-callout shall warningタイプとして処理する
6. When `[!fail]` または `[!missing]` が使用された場合, the remark-callout shall failureタイプとして処理する
7. When `[!error]` が使用された場合, the remark-callout shall dangerタイプとして処理する
8. When `[!cite]` が使用された場合, the remark-callout shall quoteタイプとして処理する

### Requirement 3: 既存機能の互換性維持

**Objective:** As a 既存ユーザー, I want 現在使用しているcallout記法が引き続き動作する, so that 既存コンテンツの修正が不要である

#### Acceptance Criteria

1. The remark-callout shall 既存の折りたたみ機能（`+`/`-`）を維持する
2. The remark-callout shall カスタムタイトル機能を維持する
3. The remark-callout shall ネストされたcallout機能を維持する
4. While 大文字小文字が混在した記法（例: `[!WARNING]`）が使用された場合, the remark-callout shall 大文字小文字を区別せずに処理する（現行動作を維持）
5. The callout.css shall ダークモード対応を維持する
6. The callout.css shall レスポンシブ対応を維持する

### Requirement 4: デフォルトタイトルの国際化対応

**Objective:** As a 日本語ブログ運営者, I want calloutのデフォルトタイトルが適切に表示される, so that ユーザー体験が向上する

#### Acceptance Criteria

1. The remark-callout shall カスタムタイトルが指定されていない場合、タイプ名をデフォルトタイトルとして使用する
2. When カスタムタイトルが指定された場合, the remark-callout shall そのタイトルをそのまま使用する

### Requirement 5: テストカバレッジ

**Objective:** As a 開発者, I want 新規追加したcalloutタイプが正しく動作することを確認できる, so that 品質を担保できる

#### Acceptance Criteria

1. The テストスイート shall 13種類すべてのcalloutタイプの変換をテストする
2. The テストスイート shall すべてのエイリアスが正しいタイプに解決されることをテストする
3. The テストスイート shall 既存のcallout機能（折りたたみ、カスタムタイトル、ネスト）が引き続き動作することをテストする
