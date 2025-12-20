# Implementation Plan

## Tasks

- [x] 1. 基本Markdown記法デモ記事の作成 (P)
- [x] 1.1 記事フォルダとfrontmatterのセットアップ (P)
  - `src/content/blog/markdown-demo/` フォルダを作成
  - frontmatterに title, description, pubDate, tags を設定
  - タグとして `markdown`, `tutorial`, `demo` を指定
  - 公開用として draft フィールドを省略または false に設定
  - _Requirements: 1.1, 3.1, 3.2, 3.3_

- [x] 1.2 基本記法のSyntax/Outputセクション作成 (P)
  - 見出し（h1〜h6）のサンプルを作成
  - 段落テキストと改行のサンプルを作成
  - 強調（太字・斜体・取り消し線）のサンプルを作成
  - 順序付きリストと順序なしリストのサンプルを作成
  - リンク（内部・外部）のサンプルを作成
  - 引用ブロックのサンプルを作成
  - 水平線のサンプルを作成
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 1.3 コードと表・画像セクションの作成 (P)
  - インラインコードのサンプルを作成
  - フェンスコードブロック（言語指定あり・なし）のサンプルを作成
  - 基本的なテーブル（左寄せ・中央・右寄せ）のサンプルを作成
  - 画像埋め込み用のサンプル画像を配置
  - 画像のalt属性付きサンプルを作成
  - _Requirements: 1.8, 1.9, 1.10, 1.11_

- [x] 2. Obsidian互換記法デモ記事の作成 (P)
- [x] 2.1 記事フォルダとfrontmatterのセットアップ (P)
  - `src/content/blog/obsidian-syntax-demo/` フォルダを作成
  - frontmatterに title, description, pubDate, tags を設定
  - タグとして `obsidian`, `itzpapa`, `demo` を指定
  - 公開用として draft フィールドを省略または false に設定
  - _Requirements: 2.1, 3.1, 3.2, 3.4_

- [x] 2.2 WikiLinkとマークハイライトセクションの作成 (P)
  - WikiLink記法（`[[ページ名]]`）の基本サンプルを作成
  - WikiLinkのエイリアス記法（`[[ページ名|表示名]]`）のサンプルを作成
  - マークハイライト記法（`==テキスト==`）のサンプルを作成
  - 各記法の用途と使い方の解説を含める
  - _Requirements: 2.1, 2.2, 2.6_

- [x] 2.3 Calloutブロックセクションの作成 (P)
  - 基本的なCallout（Note、Warning、Info、Tip）のサンプルを作成
  - 追加のCalloutタイプ（Caution、Important等）のサンプルを作成
  - 折りたたみ可能なCallout（`[!note]-`形式）のサンプルを作成
  - 各Calloutタイプの用途説明を含める
  - _Requirements: 2.3, 2.4, 2.6_

- [x] 2.4 タグ記法セクションの作成 (P)
  - frontmatterでのタグ設定方法の説明を作成
  - 階層的タグ（例：`tech/web`）の使用例を作成
  - インラインタグ記法がある場合はそのサンプルを作成
  - _Requirements: 2.5, 2.6_

- [x] 3. サイト設定ガイド記事の作成 (P)
- [x] 3.1 記事フォルダとfrontmatter・導入部の作成 (P)
  - `src/content/blog/site-config-guide/` フォルダを作成
  - frontmatterに title, description, pubDate, tags を設定
  - タグとして `config`, `setup`, `guide` を指定
  - site.config.tsの全体構造と概要の説明を作成
  - _Requirements: 3.1, 3.2, 3.5, 4.1_

- [x] 3.2 サイト基本情報とテーマ設定の解説 (P)
  - siteセクション（title, description, author, baseUrl, language）の設定方法を解説
  - themeセクション（primaryHue）のプリセット名と数値指定の解説
  - 多言語対応（descriptionオブジェクト形式、language切替）の設定例を含める
  - _Requirements: 4.2, 4.3, 4.9_

- [x] 3.3 ナビゲーションとSNS設定の解説 (P)
  - navigationセクションのメニュー項目追加・編集方法を解説
  - 外部リンクの設定方法（https://で始まるURL）を説明
  - socialセクションの各SNS（GitHub、Twitter等）の有効化方法を解説
  - _Requirements: 4.4, 4.5_

- [x] 3.4 フッター・SEO・機能フラグの解説 (P)
  - footerセクション（copyrightText、startYear）の設定方法を解説
  - seoセクション（defaultOgImage、googleAnalyticsId）の設定方法を解説
  - featuresセクションの各フラグ（目次、タグクラウド、関連記事、コメント）の設定方法を解説
  - _Requirements: 4.6, 4.7, 4.8_

- [x] 4. ビルド確認と統合検証
- [x] 4.1 ビルドと表示確認
  - `npm run build` でビルドが成功することを確認
  - 開発サーバーで3記事がブログ一覧に表示されることを確認
  - 各記事の記法が正しくレンダリングされることを目視確認
  - タグページに各記事が適切にリンクされることを確認
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_
