# Requirements Document

## Introduction

本仕様は、itzpapaプロジェクトにおけるMarkdownレンダリング機能の改善と包括的なテストカバレッジの確立を目的としています。

itzpapaはObsidianユーザー向けのAstroブログソリューションであり、WikiLink、Callout、マークハイライトなどのObsidian固有記法をサポートしています。現在、以下のカスタムプラグインが実装されています：

- `remark-wikilink`: WikiLink記法（`[[ページ名]]`）の処理
- `remark-mark-highlight`: マークハイライト記法（`==テキスト==`）の処理
- `remark-tags`: インラインタグ記法の処理
- `remark-callout` / `rehype-callout`: Calloutブロックの処理

本要件では、これらのプラグインの挙動改善と、信頼性を確保するための包括的なテストスイートの構築を定義します。

## Requirements

### Requirement 1: WikiLinkプラグインの挙動改善

**Objective:** As a ブログ執筆者, I want WikiLinkが様々なエッジケースで正しく動作すること, so that Obsidianで書いた記事がそのまま正確にレンダリングされる

#### Acceptance Criteria

1. When WikiLink記法 `[[ページ名]]` が入力された場合, the remark-wikilink plugin shall 対応するページへのリンクを生成する
2. When WikiLink記法 `[[ページ名|表示テキスト]]` が入力された場合, the remark-wikilink plugin shall エイリアス（表示テキスト）を使用したリンクを生成する
3. When 存在しないページへのWikiLinkが入力された場合, the remark-wikilink plugin shall リンク切れを示すスタイル（例：破線下線）を適用する
4. When WikiLinkがコードブロック内に存在する場合, the remark-wikilink plugin shall 変換を行わずそのまま表示する
5. When WikiLinkに日本語文字が含まれる場合, the remark-wikilink plugin shall 正しくURLエンコードしてリンクを生成する
6. When WikiLinkが画像参照形式 `![[画像名.png]]` の場合, the remark-wikilink plugin shall 画像要素として正しくレンダリングする

### Requirement 2: マークハイライトプラグインの挙動改善

**Objective:** As a ブログ執筆者, I want マークハイライト記法が確実に動作すること, so that 重要な箇所を視覚的に強調できる

#### Acceptance Criteria

1. When マークハイライト記法 `==テキスト==` が入力された場合, the remark-mark-highlight plugin shall `<mark>` 要素でラップして出力する
2. When マークハイライト記法が複数行にまたがる場合, the remark-mark-highlight plugin shall 各行を個別にハイライトして出力する
3. When `==` がコードブロック内に存在する場合, the remark-mark-highlight plugin shall 変換を行わずそのまま表示する
4. When マークハイライトがネストされた書式（太字、斜体等）を含む場合, the remark-mark-highlight plugin shall 内部の書式を保持してハイライトする
5. If マークハイライトが不正な形式（閉じ `==` がない）の場合, then the remark-mark-highlight plugin shall 変換を行わずプレーンテキストとして表示する

### Requirement 3: Calloutプラグインの挙動改善

**Objective:** As a ブログ執筆者, I want Obsidian互換のCallout記法が完全に動作すること, so that 注意書きや補足情報を効果的に表示できる

#### Acceptance Criteria

1. When Callout記法 `> [!type]` が入力された場合, the rehype-callout plugin shall 対応するタイプのCalloutボックスを生成する
2. When Calloutに折りたたみ記法 `> [!type]-` が使用された場合, the rehype-callout plugin shall 折りたたみ可能なCalloutを生成する
3. When Calloutにカスタムタイトル `> [!type] タイトル` が指定された場合, the rehype-callout plugin shall カスタムタイトルを表示する
4. When ネストされたCalloutが存在する場合, the rehype-callout plugin shall 各レベルを正しくレンダリングする
5. The rehype-callout plugin shall 標準的なCalloutタイプ（note, warning, tip, important, caution等）に対応したアイコンとスタイルを適用する

### Requirement 4: タグプラグインの挙動改善

**Objective:** As a ブログ読者, I want インラインタグが正しく表示・リンクされること, so that 関連記事を簡単に見つけられる

#### Acceptance Criteria

1. When インラインタグ記法 `#タグ名` が入力された場合, the remark-tags plugin shall タグページへのリンクを持つバッジを生成する
2. When 階層タグ `#親/子` が入力された場合, the remark-tags plugin shall 階層構造を保持したリンクを生成する
3. When タグがコードブロック内に存在する場合, the remark-tags plugin shall 変換を行わずそのまま表示する
4. When タグに日本語文字が含まれる場合, the remark-tags plugin shall 正しく処理してリンクを生成する
5. If タグ名が不正な文字（空白、特殊記号等）を含む場合, then the remark-tags plugin shall バリデーションエラーを発生させずスキップする

### Requirement 5: プラグインの単体テスト

**Objective:** As a 開発者, I want 各プラグインに対して包括的な単体テストがあること, so that リグレッションを早期に検出できる

#### Acceptance Criteria

1. The test suite shall 各remarkプラグイン（wikilink, mark-highlight, tags, callout）に対する単体テストを含む
2. The test suite shall 各プラグインの正常系パターンを網羅したテストケースを含む
3. The test suite shall 各プラグインのエッジケース（空入力、特殊文字、ネスト等）をテストする
4. The test suite shall 各プラグインのエラーハンドリングをテストする
5. When `npm run test` が実行された場合, the test runner shall 全ての単体テストを実行して結果を報告する

### Requirement 6: 統合テスト

**Objective:** As a 開発者, I want 複数プラグインの連携動作をテストできること, so that プラグイン間の干渉を検出できる

#### Acceptance Criteria

1. The test suite shall 複数のObsidian記法が混在するドキュメントの処理をテストする
2. The test suite shall WikiLink内にマークハイライトが含まれるケースをテストする
3. The test suite shall Callout内にWikiLinkやタグが含まれるケースをテストする
4. The test suite shall コードブロック内の各記法が変換されないことをテストする
5. When 統合テストが実行された場合, the test runner shall プラグイン間の相互作用を検証した結果を報告する

#### 組み合わせテストマトリクス

以下の記法組み合わせパターンを網羅的にテストする：

| 外側の記法 | 内側の記法 | テストケース例 |
|-----------|-----------|---------------|
| WikiLink | マークハイライト | `[[==重要==なページ]]` |
| WikiLink | タグ | `[[ページ名#セクション]]` |
| マークハイライト | WikiLink | `==[[重要ページ]]==` |
| マークハイライト | 太字/斜体 | `==**太字**と*斜体*==` |
| Callout | WikiLink | `> [!note] [[参照ページ]]を参照` |
| Callout | マークハイライト | `> [!warning] ==重要==な警告` |
| Callout | タグ | `> [!tip] #tips #howto` |
| Callout | コードブロック | Callout内のインラインコード・コードブロック |
| リスト | WikiLink | `- [[ページA]]\n- [[ページB]]` |
| リスト | タグ | `- #tag1\n- #tag2` |
| テーブル | WikiLink | テーブルセル内のWikiLink |
| テーブル | マークハイライト | テーブルセル内のハイライト |

#### 処理順序テスト

6. The test suite shall remarkプラグインの処理順序（wikilink → mark-highlight → tags）が正しく適用されることをテストする
7. The test suite shall rehypeプラグイン（callout）がremark処理後のASTを正しく処理することをテストする

#### 競合・干渉テスト

8. The test suite shall 類似記法間の競合（例：`==` と `===`）が正しく処理されることをテストする
9. The test suite shall エスケープ記法（バックスラッシュ）が各プラグインで一貫して動作することをテストする
10. The test suite shall 不完全なネスト（開始タグのみ、終了タグのみ）が他のプラグインに影響を与えないことをテストする

### Requirement 7: E2Eテスト

**Objective:** As a 開発者, I want ビルド後のHTML出力を検証できること, so that 最終的なユーザー体験を保証できる

#### Acceptance Criteria

1. The test suite shall ビルド後のHTMLでWikiLinkが正しいhref属性を持つことを検証する
2. The test suite shall ビルド後のHTMLでマークハイライトが正しいmark要素として出力されることを検証する
3. The test suite shall ビルド後のHTMLでCalloutが正しいDOM構造を持つことを検証する
4. The test suite shall ビルド後のHTMLでタグバッジが正しいリンクを持つことを検証する
5. When E2Eテストが実行された場合, the test runner shall 実際のビルド出力を検証した結果を報告する

### Requirement 8: テストドキュメントとテストデータ

**Objective:** As a 開発者, I want テスト用のサンプルMarkdownドキュメントがあること, so that 手動検証とテスト自動化の両方に活用できる

#### Acceptance Criteria

1. The test fixtures shall 各Obsidian記法の全パターンを含むサンプルMarkdownファイルを含む
2. The test fixtures shall エッジケースを再現するための専用テストファイルを含む
3. The test fixtures shall 日本語コンテンツを含むテストファイルを含む
4. The test fixtures shall 各フィクスチャに対応する期待出力（expected output）を含む
5. The test documentation shall テストの実行方法と追加方法を説明する README を含む
