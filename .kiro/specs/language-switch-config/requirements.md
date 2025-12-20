# Requirements Document

## Introduction

本機能は、サイト設定ファイル（`site.config.ts`）を通じて、サイトのUIテキストを英語または日本語に切り替える機能を提供します。既存の設定構造に言語設定を追加し、ナビゲーションラベル、フッターテキスト、その他のUI要素を選択した言語で表示できるようにします。

## Requirements

### Requirement 1: 言語設定オプション

**Objective:** サイト管理者として、設定ファイルで表示言語を選択したい。サイト全体のUIテキストを一貫して日本語または英語で表示できるようにするため。

#### Acceptance Criteria
1. The SiteConfig shall サポートする言語オプションとして `'ja'`（日本語）および `'en'`（英語）を含む `language` プロパティを持つ
2. When `language` プロパティが省略された場合, the system shall デフォルト値として `'ja'` を使用する
3. The `language` プロパティ shall `site` セクション内に配置される

### Requirement 2: ナビゲーションラベルの国際化

**Objective:** サイト訪問者として、ナビゲーションメニューを選択した言語で表示したい。サイトを直感的に操作できるようにするため。

#### Acceptance Criteria
1. When `language` が `'ja'` に設定されている場合, the navigation labels shall 日本語で表示される（例: "Home" → "ホーム", "Blog" → "ブログ", "Tags" → "タグ", "About" → "このサイトについて"）
2. When `language` が `'en'` に設定されている場合, the navigation labels shall 英語で表示される
3. The navigation configuration shall ユーザー定義のカスタムラベルオーバーライドを引き続きサポートする

### Requirement 3: フッターテキストの国際化

**Objective:** サイト訪問者として、フッターの著作権表示やその他のテキストを選択した言語で表示したい。一貫したユーザー体験を提供するため。

#### Acceptance Criteria
1. When `language` が `'ja'` に設定されている場合, the footer copyright text shall 日本語形式で表示される
2. When `language` が `'en'` に設定されている場合, the footer copyright text shall 英語形式で表示される
3. If ユーザーがカスタムの `copyrightText` を設定している場合, the system shall 自動翻訳よりもユーザー設定を優先する

### Requirement 4: UIコンポーネントのテキスト国際化

**Objective:** サイト訪問者として、ブログ一覧や記事ページのUIテキストを選択した言語で表示したい。コンテンツと一貫した言語体験を得るため。

#### Acceptance Criteria
1. When `language` が設定されている場合, the system shall 以下のUIテキストを適切な言語で表示する:
   - 「続きを読む」リンク（例: "続きを読む" vs "Read more"）
   - 「関連記事」見出し（例: "関連記事" vs "Related Posts"）
   - 「目次」見出し（例: "目次" vs "Table of Contents"）
   - タグ一覧の見出し（例: "タグ一覧" vs "Tags"）
2. The date formatting shall 言語設定に関わらず `YYYY/MM/DD` 形式を維持する

### Requirement 5: 型安全性の維持

**Objective:** 開発者として、言語設定に対する型安全性を維持したい。設定ミスをコンパイル時に検出できるようにするため。

#### Acceptance Criteria
1. The `language` プロパティ shall TypeScriptのリテラル型 `'ja' | 'en'` で定義される
2. If 無効な言語コードが設定された場合, the TypeScript compiler shall コンパイルエラーを報告する
3. The type definitions shall `src/types/site-config.ts` で定義される

### Requirement 6: 翻訳リソースの管理

**Objective:** 開発者として、翻訳テキストを一元管理したい。将来の言語追加やテキスト修正を容易にするため。

#### Acceptance Criteria
1. The system shall すべてのUIテキスト翻訳を専用のファイルまたはオブジェクトで管理する
2. The translation structure shall 言語コードをキーとしたオブジェクト形式を使用する
3. When 新しい翻訳キーが追加された場合, the system shall すべてのサポート言語に対応するエントリを要求する

### Requirement 7: 後方互換性

**Objective:** 既存ユーザーとして、アップデート後も既存の設定が動作することを期待する。サイトが壊れることなく更新できるようにするため。

#### Acceptance Criteria
1. When `language` プロパティが未設定の既存設定ファイルがある場合, the system shall 現在の日本語表示を維持する
2. The system shall 既存の `navigation` 配列形式との互換性を維持する
3. While アップデート後, the system shall 既存のカスタム設定を尊重する
