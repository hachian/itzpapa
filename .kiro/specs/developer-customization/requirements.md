# Requirements Document

## Introduction

itzpapaを利用する開発者が、サイトの見た目や動作を自分のニーズに合わせてカスタマイズできる機能を提供します。すべてのカスタマイズは単一の設定ファイル（`site.config.ts`）で管理し、開発者が一箇所を編集するだけでサイト全体をカスタマイズできるようにします。

## Requirements

### Requirement 1: 単一設定ファイルによる一元管理

**Objective:** As a 開発者, I want すべてのサイト設定を一つのファイル（`site.config.ts`）で管理したい, so that 複数ファイルを探し回ることなく効率的にサイトをカスタマイズできる

#### Acceptance Criteria
1. The 設定システム shall すべてのカスタマイズ項目を `site.config.ts` に集約する
2. The 設定システム shall TypeScriptの型定義を提供し、設定項目の補完と型チェックを有効にする
3. When 設定ファイルが変更されたとき, the ビルドシステム shall 次回ビルド時に新しい設定を反映したサイトを生成する
4. If 必須の設定項目が欠けている場合, then the ビルドシステム shall 明確なエラーメッセージとともにビルドを停止する
5. The 設定ファイル shall サンプル値とコメントを含み、各設定項目の用途を開発者が理解できるようにする

### Requirement 2: サイト基本情報の設定

**Objective:** As a 開発者, I want サイトの基本情報（タイトル、説明、著者）を設定したい, so that サイト全体で一貫した情報を表示できる

#### Acceptance Criteria
1. The 設定システム shall サイトタイトル、サイト説明文、著者名、著者プロフィールを設定可能にする
2. The 設定システム shall サイトのベースURL（本番環境用）を設定可能にする
3. When サイト情報が設定されたとき, the テンプレート shall ヘッダー、フッター、メタタグに設定値を反映する

### Requirement 3: SNSリンクの個別設定

**Objective:** As a 開発者, I want 各SNSリンク（GitHub、Twitter、YouTube等）を個別にON/OFFし、それぞれのURLを設定したい, so that 自分が使用しているSNSのみを表示できる

#### Acceptance Criteria
1. The 設定システム shall 以下のSNSについて個別に有効/無効とURLを設定可能にする：GitHub、Twitter（X）、YouTube、Bluesky、Instagram、LinkedIn、Mastodon、Threads
2. When SNSが有効に設定されたとき, the フッター shall 対応するアイコンとリンクを表示する
3. When SNSが無効に設定されたとき, the フッター shall 対応するアイコンとリンクを非表示にする
4. If SNSが有効だがURLが空の場合, then the ビルドシステム shall 警告メッセージを出力し、そのSNSリンクを非表示にする
5. The SNS設定 shall 各SNSごとに `enabled: boolean` と `url: string` のペアで構成される

### Requirement 4: テーマカラーのカスタマイズ

**Objective:** As a 開発者, I want サイトのカラーテーマを変更したい, so that ブランドやコンテンツに合った配色でサイトを運営できる

#### Acceptance Criteria
1. The 設定システム shall プライマリカラー（hue値）を設定可能にする
2. When プライマリカラーが設定されたとき, the テーマシステム shall アクセントカラー、リンクカラー、ボタンカラーなど関連する色を自動的に調整する
3. The テーマシステム shall ライトモード・ダークモードの両方でカスタムカラーを適切に表示する
4. If カラー設定が省略された場合, the テーマシステム shall デフォルトのカラー値を使用する

### Requirement 5: ナビゲーションメニューの設定

**Objective:** As a 開発者, I want ナビゲーションメニューの項目を設定ファイルで管理したい, so that コードを編集せずにメニュー構成を変更できる

#### Acceptance Criteria
1. The 設定システム shall メニュー項目（ラベル、URL）のリストを設定可能にする
2. When 外部リンクが設定されたとき, the ナビゲーションシステム shall 自動的に新しいタブで開く属性を付与する
3. The ナビゲーションシステム shall 現在のページに対応するメニュー項目をハイライト表示する

### Requirement 6: フッター情報の設定

**Objective:** As a 開発者, I want フッターに表示する著作権情報を設定したい, so that 自分のサイトに合った表記を表示できる

#### Acceptance Criteria
1. The 設定システム shall 著作権テキストと開始年を設定可能にする
2. When 開始年が設定されたとき, the フッター shall 「開始年 - 現在年」の形式で表示する
3. When 開始年が省略された場合, the フッター shall 現在の年のみを表示する

### Requirement 7: SEO・メタ情報の設定

**Objective:** As a 開発者, I want サイト全体のデフォルトSEO設定を管理したい, so that 検索エンジン最適化とソーシャルメディア共有を効率的に設定できる

#### Acceptance Criteria
1. The 設定システム shall デフォルトのOpenGraph画像パスを設定可能にする
2. When 記事に個別のOG画像が設定されていない場合, the SEOシステム shall デフォルトのOG画像を使用する
3. The 設定システム shall Google Analytics等のトラッキングIDを設定可能にする（オプション）
4. When トラッキングIDが設定されていない場合, the ビルドシステム shall トラッキングスクリプトを出力しない

### Requirement 8: 機能の有効/無効切り替え

**Objective:** As a 開発者, I want 特定の機能を有効/無効に切り替えたい, so that 必要な機能だけを使用したシンプルなサイトを構築できる

#### Acceptance Criteria
1. The 設定システム shall 目次、タグクラウド、関連記事などの機能を個別に有効/無効にする設定を提供する
2. When 機能が無効にされたとき, the テンプレート shall 関連するUIコンポーネントを表示しない
3. The 設定システム shall コメントシステム連携の設定（有効/無効、プロバイダ設定）を提供する
