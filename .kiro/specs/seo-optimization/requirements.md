# Requirements Document

## Introduction
本ドキュメントは、itzpapaブログサイトのSEO対策・最適化に関する要件を定義します。すでに実装されている基本的なSEO機能（canonical URL、Open Graph、サイトマップ、RSSフィード）を基盤として、検索エンジンからの可視性向上とユーザー体験の最適化を図ります。

## Requirements

### Requirement 1: robots.txt設定
**Objective:** As a サイト運営者, I want 検索エンジンクローラーに対して適切なクロール指示を与えたい, so that 不要なページのインデックスを防ぎ、重要なページを優先的にクロールさせることができる

#### Acceptance Criteria
1. The サイト shall ルートディレクトリに`robots.txt`ファイルを配置する
2. The サイト shall sitemap.xmlへの参照をrobots.txtに含める
3. When ビルド実行時, the サイト shall `robots.txt`をpublicディレクトリから出力ディレクトリにコピーする
4. The サイト shall `/api/`や`/test-*`などの内部テストページをクロール対象から除外する

### Requirement 2: 構造化データ（JSON-LD）
**Objective:** As a サイト運営者, I want 検索エンジンにコンテンツの構造を正確に伝えたい, so that リッチリザルト（検索結果の強化表示）を獲得し、クリック率を向上させることができる

#### Acceptance Criteria
1. When ブログ記事ページが表示される時, the サイト shall Article型のJSON-LD構造化データを出力する
2. The サイト shall JSON-LDに`headline`（タイトル）、`datePublished`（公開日）、`dateModified`（更新日）、`author`（著者）、`image`（アイキャッチ画像）を含める
3. When 記事に更新日が設定されていない場合, the サイト shall `dateModified`を`datePublished`と同じ値に設定する
4. The サイト shall トップページにWebSite型の構造化データを出力する
5. The サイト shall パンくずリスト用にBreadcrumbList型の構造化データを出力する

### Requirement 3: メタタグ最適化
**Objective:** As a サイト運営者, I want ページごとに最適化されたメタタグを設定したい, so that 検索結果での表示を改善し、SNS共有時の見栄えを向上させることができる

#### Acceptance Criteria
1. The サイト shall 各ページにユニークな`<title>`と`<meta name="description">`を設定する
2. The サイト shall タイトルタグを「記事タイトル | サイト名」の形式で出力する
3. When 記事の説明文が160文字を超える場合, the サイト shall 説明文を160文字で切り詰めて`...`を追加する
4. The サイト shall 記事ページに`article:published_time`と`article:modified_time`のOpen Graphメタタグを追加する
5. The サイト shall 記事のタグを`article:tag`としてOpen Graphメタタグに含める

### Requirement 4: パフォーマンス最適化
**Objective:** As a 訪問者, I want ページが高速に表示されてほしい, so that 快適にコンテンツを閲覧でき、離脱率が低下する

#### Acceptance Criteria
1. The サイト shall すべての画像をWebP形式で最適化して配信する
2. The サイト shall 画像に適切な`width`と`height`属性を設定してCLS（Cumulative Layout Shift）を防止する
3. The サイト shall ファーストビュー外の画像に`loading="lazy"`を設定する
4. The サイト shall CSSをコード分割して必要な分のみ読み込む
5. When Google Fontsを使用する場合, the サイト shall `font-display: swap`を適用してFOIT（Flash of Invisible Text）を防止する

### Requirement 5: アクセシビリティとSEOの統合
**Objective:** As a サイト運営者, I want アクセシビリティとSEOを両立させたい, so that すべてのユーザーと検索エンジンの両方にとって最適なサイトになる

#### Acceptance Criteria
1. The サイト shall すべての画像に意味のある`alt`属性を設定する（装飾画像の場合は空のalt）
2. The サイト shall 適切な見出し階層（h1→h2→h3）を維持する
3. The サイト shall 各ページに1つのみの`<h1>`タグを使用する
4. The サイト shall ナビゲーションリンクに`aria-label`または明確なテキストを設定する
5. When 現在のページへのリンクがある場合, the サイト shall `aria-current="page"`を設定する

### Requirement 6: URL構造最適化
**Objective:** As a サイト運営者, I want SEOに最適化されたURL構造を維持したい, so that 検索エンジンとユーザーの両方にとって分かりやすいサイト構造になる

#### Acceptance Criteria
1. The サイト shall ブログ記事を`/blog/{slug}/`形式の永続的なURLで公開する
2. The サイト shall タグページを`/tags/{tag}/`形式で公開する
3. The サイト shall 末尾スラッシュを統一し、canonical URLと一致させる
4. If 同一コンテンツに複数のURLでアクセス可能な場合, the サイト shall canonical URLを設定して重複を防止する

### Requirement 7: 内部リンク構造
**Objective:** As a サイト運営者, I want 効果的な内部リンク構造を構築したい, so that ページ間のリンクジュースを適切に分配し、クローラビリティを向上させる

#### Acceptance Criteria
1. The サイト shall 記事下部に関連タグへのリンクを表示する
2. The サイト shall パンくずナビゲーションで上位階層へのリンクを提供する
3. When WikiLink記法`[[ページ名]]`が使用された場合, the サイト shall 対応する内部リンクに自動変換する
4. The サイト shall タグ一覧ページから各タグの記事一覧へリンクする
