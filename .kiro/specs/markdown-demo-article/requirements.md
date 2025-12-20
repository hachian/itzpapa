# Requirements Document

## Introduction

GitHub公開用のMarkdown動作確認記事を作成する。記事は3つに分割し、1つは標準Markdown記法のデモ、2つ目はObsidian互換およびitzpapa独自の拡張記法のデモ、3つ目はsite.config.tsの設定ガイドとする。GitHubリポジトリを訪れた開発者やユーザーが、サポートされている記法と設定方法を確認できることを目的とする。

## Requirements

### Requirement 1: 基本Markdown記法デモ記事の作成
**Objective:** As a GitHubリポジトリ訪問者, I want 標準Markdown記法のサンプル記事を確認できること, so that このブログでサポートされている基本記法を理解できる

#### Acceptance Criteria
1. The 記事 shall 見出し（h1〜h6）のサンプルを含む
2. The 記事 shall 段落テキストと改行のサンプルを含む
3. The 記事 shall 強調（太字・斜体・取り消し線）のサンプルを含む
4. The 記事 shall 順序付きリストと順序なしリストのサンプルを含む
5. The 記事 shall リンク（内部・外部）のサンプルを含む
6. The 記事 shall 引用ブロックのサンプルを含む
7. The 記事 shall 水平線のサンプルを含む
8. The 記事 shall インラインコードのサンプルを含む
9. The 記事 shall フェンスコードブロック（言語指定あり・なし）のサンプルを含む
10. The 記事 shall 基本的なテーブル（列配置含む）のサンプルを含む
11. The 記事 shall 画像埋め込みのサンプルを含む

### Requirement 2: 独自拡張記法デモ記事の作成
**Objective:** As a Obsidianユーザー, I want Obsidian互換およびitzpapa独自の拡張記法のサンプル記事を確認できること, so that 既存のObsidianノートをそのまま公開できるか判断できる

#### Acceptance Criteria
1. The 記事 shall WikiLink記法（`[[ページ名]]`）のサンプルを含む
2. The 記事 shall マークハイライト記法（`==テキスト==`）のサンプルを含む
3. The 記事 shall Calloutブロック（Note、Warning、Info等）のサンプルを含む
4. The 記事 shall 折りたたみ可能なCallout（`[!note]-`形式）のサンプルを含む
5. The 記事 shall タグ記法（frontmatter、階層的タグ）のサンプルを含む
6. The 記事 shall 各拡張記法の用途・使い方の解説を含む

### Requirement 3: 記事メタデータの設定
**Objective:** As a ブログ管理者, I want 両記事が適切なfrontmatterを持つこと, so that ブログとして正しく公開・管理できる

#### Acceptance Criteria
1. The 各記事 shall 必須frontmatterフィールド（title、description、pubDate）を設定する
2. The 各記事 shall 適切なタグを設定する
3. The 基本記法記事 shall `markdown`や`tutorial`等のタグを持つ
4. The 独自記法記事 shall `obsidian`や`itzpapa`等のタグを持つ
5. The 設定ガイド記事 shall `config`や`setup`等のタグを持つ

### Requirement 4: サイト設定ガイド記事の作成
**Objective:** As a itzpapaユーザー, I want site.config.tsの設定方法を理解できること, so that 自分のブログを適切にカスタマイズできる

#### Acceptance Criteria
1. The 記事 shall site.config.tsの全体構造を説明する
2. The 記事 shall サイト基本情報（title、description、author、baseUrl、language）の設定方法を説明する
3. The 記事 shall テーマ設定（primaryHue）のプリセットとカスタム値の指定方法を説明する
4. The 記事 shall ナビゲーションメニューの追加・編集方法を説明する
5. The 記事 shall SNSリンク設定の有効化方法を説明する
6. The 記事 shall フッター設定（著作権表示、開始年）の設定方法を説明する
7. The 記事 shall SEO設定（OG画像、Google Analytics）の設定方法を説明する
8. The 記事 shall 機能フラグ（目次、タグクラウド、関連記事、コメント）の設定方法を説明する
9. The 記事 shall 多言語対応（description、language）の設定例を含む
