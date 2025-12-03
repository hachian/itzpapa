# Requirements Document

## Introduction

本ドキュメントは、rehype-calloutsライブラリへの依存を排除し、プロジェクト独自のコールアウト処理プラグインを実装するための要件を定義します。

現在、itzpapaプロジェクトはObsidian互換のコールアウト表示にrehype-callouts（v2.1.2）を使用していますが、この外部依存を解消し、既存のremark-wikilinkやremark-mark-highlightと同様の自前実装に移行します。これにより、プロジェクトの依存関係を削減し、カスタマイズ性と保守性を向上させます。

## Requirements

### Requirement 1: Obsidian互換のコールアウト構文パース

**Objective:** As a コンテンツ作成者, I want Obsidian形式のコールアウト記法をそのまま使用できる, so that Obsidianで作成したノートを変更なく公開できる

#### Acceptance Criteria
1. When ブロッククォート内に`[!type]`形式のコールアウト記法が記述された場合, the Calloutプラグイン shall 該当のブロッククォートをコールアウトとして認識する
2. When コールアウトタイプとして`note`, `info`, `tip`, `warning`, `caution`, `important`, `danger`が指定された場合, the Calloutプラグイン shall 各タイプに対応したスタイルでレンダリングする
3. When 未定義のコールアウトタイプが指定された場合, the Calloutプラグイン shall デフォルトスタイル（noteと同等）でレンダリングする
4. When `[!type]`の後にスペース区切りでテキストが続く場合, the Calloutプラグイン shall そのテキストをカスタムタイトルとして表示する
5. When カスタムタイトルが指定されていない場合, the Calloutプラグイン shall コールアウトタイプ名をデフォルトタイトルとして表示する

### Requirement 2: 折りたたみ機能のサポート

**Objective:** As a コンテンツ作成者, I want コールアウトを折りたたみ可能にできる, so that 長いコンテンツを整理して表示できる

#### Acceptance Criteria
1. When コールアウトタイプの後に`-`記号が付与された場合（例: `[!note]-`）, the Calloutプラグイン shall コールアウトを折りたたみ可能かつ初期状態で展開された状態でレンダリングする
2. When コールアウトタイプの後に`+`記号が付与された場合（例: `[!note]+`）, the Calloutプラグイン shall コールアウトを折りたたみ可能かつ初期状態で折りたたまれた状態でレンダリングする
3. When 折りたたみ記号がない場合, the Calloutプラグイン shall コールアウトを折りたたみ不可としてレンダリングする
4. The Calloutプラグイン shall 折りたたみ機能をHTMLの`<details>`/`<summary>`要素で実装する

### Requirement 3: コールアウト内のMarkdownコンテンツ処理

**Objective:** As a コンテンツ作成者, I want コールアウト内で標準のMarkdown記法を使用できる, so that 豊富なコンテンツを作成できる

#### Acceptance Criteria
1. While コールアウト内にMarkdownコンテンツが存在する場合, the Calloutプラグイン shall 太字、斜体、打ち消し線、インラインコード等のインライン記法を正しくレンダリングする
2. While コールアウト内にリストが存在する場合, the Calloutプラグイン shall 順序付きリストおよび順序なしリストを正しくレンダリングする
3. While コールアウト内にコードブロックが存在する場合, the Calloutプラグイン shall シンタックスハイライト付きでレンダリングする
4. While コールアウト内に複数段落が存在する場合, the Calloutプラグイン shall 段落間の適切な間隔を保ってレンダリングする
5. While コールアウト内にWikiLinkが存在する場合, the Calloutプラグイン shall WikiLinkを正しくレンダリングする

### Requirement 4: ネストされたコールアウトのサポート

**Objective:** As a コンテンツ作成者, I want コールアウト内に別のコールアウトをネストできる, so that 階層的な情報構造を表現できる

#### Acceptance Criteria
1. When コールアウト内に別のコールアウト記法が存在する場合, the Calloutプラグイン shall ネストされたコールアウトとしてレンダリングする
2. The Calloutプラグイン shall 最大3レベルまでのネストをサポートする
3. When 各ネストレベルにおいて, the Calloutプラグイン shall 視覚的に区別可能なインデントを適用する

### Requirement 5: スタイリングとテーマ対応

**Objective:** As a サイト訪問者, I want コールアウトがライトモード・ダークモードの両方で適切に表示される, so that どのモードでも読みやすい

#### Acceptance Criteria
1. The Calloutプラグイン shall 各コールアウトタイプに対応したアイコンを表示する
2. The Calloutプラグイン shall 各コールアウトタイプに以下の固有色（OKLCH形式）をボーダー色、アイコン色として適用する:
   - `note`: 青系 `oklch(0.65 0.2 260)`
   - `info`: 水色系 `oklch(0.7 0.15 210)`
   - `tip`: 緑系 `oklch(0.7 0.2 150)`
   - `warning`: 黄色/オレンジ系 `oklch(0.75 0.18 75)`
   - `caution`: オレンジ系 `oklch(0.7 0.2 55)`
   - `important`: 紫系 `oklch(0.6 0.25 300)`
   - `danger`: 赤系 `oklch(0.65 0.25 25)`
3. The Calloutプラグイン shall 背景色として各タイプの固有色を低い不透明度（約10-15%）で適用する
4. The Calloutプラグイン shall ボーダー（左ボーダー）に各タイプの固有色を適用する
5. When ダークモードが有効な場合, the Calloutプラグイン shall 各固有色の明度（L値）を調整したダークモード用カラースキームを適用する
6. The Calloutプラグイン shall プロジェクトのCSS変数（`--space-*`等）を使用してスペーシングを定義する
7. The Calloutプラグイン shall レスポンシブデザインに対応し、モバイル・デスクトップで適切に表示する

### Requirement 6: 通常のブロッククォートとの区別

**Objective:** As a コンテンツ作成者, I want 通常のブロッククォートとコールアウトを明確に区別できる, so that 両方の記法を適切に使い分けられる

#### Acceptance Criteria
1. When ブロッククォートの最初の行が`[!type]`形式で始まらない場合, the Calloutプラグイン shall そのブロッククォートを通常のブロッククォートとしてそのまま残す
2. When ブロッククォートの最初の行が`[!type]`形式で始まる場合, the Calloutプラグイン shall そのブロッククォートをコールアウトに変換する

### Requirement 7: プラグインアーキテクチャ

**Objective:** As a 開発者, I want プラグインが既存のプラグイン構造と一貫している, so that 保守性が高くなる

#### Acceptance Criteria
1. The Calloutプラグイン shall `src/plugins/remark-callout/`ディレクトリに配置する
2. The Calloutプラグイン shall remark（Markdown AST）プラグインとして実装する
3. The Calloutプラグイン shall JavaScriptで記述する（既存プラグインとの一貫性）
4. The Calloutプラグイン shall 他のremarkプラグイン（remark-wikilink, remark-mark-highlight, remark-tags）との互換性を維持する
5. When astro.config.mjsで設定された場合, the Calloutプラグイン shall mdxとmarkdownの両方で動作する

### Requirement 8: rehype-callouts依存の完全削除

**Objective:** As a 開発者, I want rehype-calloutsへの依存を完全に削除する, so that 依存関係を削減できる

#### Acceptance Criteria
1. When 実装完了後, the プロジェクト shall package.jsonからrehype-calloutsを削除する
2. When 実装完了後, the プロジェクト shall astro.config.mjsからrehype-calloutsのインポートと設定を削除する
3. When 実装完了後, the プロジェクト shall global.cssからrehype-calloutsテーマのインポートを削除する
4. When 実装完了後, the プロジェクト shall callout.cssからrehype-callouts固有のスタイルオーバーライドを削除する
5. The 新しいCalloutプラグイン shall 既存のコンテンツ（callout-comprehensive-test等）との完全な後方互換性を維持する
