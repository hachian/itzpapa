# Requirements Document

## Introduction

itzpapaブログのデプロイ方法を解説するMarkdown記事を作成する。この記事だけを読めば、プロジェクトの取得から本番公開まで完結できる包括的なガイドを提供する。Cloudflare Pagesを中心に、GitHubを経由する方法とGitHubを使わない方法の両方をカバーする。

## Requirements

### Requirement 1: 記事の基本構造

**Objective:** As a ブログ読者, I want デプロイ方法が体系的に整理された記事を読みたい, so that 自分の環境に適したデプロイ方法を選択できる

#### Acceptance Criteria
1. The 記事 shall `src/content/blog/` 配下にフォルダベースで配置される（例: `deploy-guide/index.md`）
2. The 記事 shall 必須フロントマター（title, description, published, tags）を含む
3. The 記事 shall 適切なカテゴリ（Guide）を設定する
4. The 記事 shall 目次から各セクションへナビゲートできる構成とする

### Requirement 2: プロジェクトの取得とセットアップ

**Objective:** As a 初めてのユーザー, I want プロジェクトを自分の環境に準備する方法を知りたい, so that ローカルで開発・ビルドができる

#### Acceptance Criteria
1. The 記事 shall `git clone` によるリポジトリ取得手順を説明する
2. The 記事 shall `npm install`（Linux/macOS）と `pnpm install`（Windows推奨）の依存関係インストール手順を説明する
3. The 記事 shall `npm run dev` による開発サーバー起動と動作確認方法を説明する
4. The 記事 shall ローカルプレビューURL（http://localhost:4321）を明記する

### Requirement 3: デプロイ前の必須設定

**Objective:** As a 初めてデプロイするユーザー, I want デプロイ前に必ず変更すべき設定を知りたい, so that 自分のサイトとして正しく公開できる

#### Acceptance Criteria
1. The 記事 shall `site.config.ts`で必須変更が必要な項目を明記する
2. The 記事 shall `site.title`（サイトタイトル）の設定方法を説明する
3. The 記事 shall `site.author`（著者名）の設定方法を説明する
4. The 記事 shall `site.baseUrl`（本番サイトURL）の設定方法を説明する
5. The 記事 shall `features.comments.enabled`（giscusコメント）を無効化するか自分用に設定する必要があることを説明する
6. The 記事 shall `astro.config.mjs`の`site`プロパティも変更が必要なことを説明する

### Requirement 4: ビルドプロセスの解説

**Objective:** As a 開発者, I want ビルドコマンドの違いと用途を理解したい, so that 環境に応じて適切なビルドを実行できる

#### Acceptance Criteria
1. The 記事 shall `npm run build` と `npm run build:ci` の違いを説明する
2. The 記事 shall ビルド出力先（`./dist/`）について説明する
3. The 記事 shall 環境変数の設定方法（`.env`ファイル）について説明する

### Requirement 5: Cloudflare Pagesデプロイ

**Objective:** As a ユーザー, I want Cloudflare Pagesへのデプロイ手順を知りたい, so that 推奨される方法でサイトを公開できる

#### Acceptance Criteria
1. The 記事 shall GitHub連携による自動デプロイの設定手順を説明する
2. The 記事 shall Direct Upload（CLI）による手動デプロイ手順を説明する
3. The 記事 shall ビルド設定項目（フレームワーク、ビルドコマンド、出力ディレクトリ、Node.jsバージョン）を表形式で提示する
4. The 記事 shall `public/_headers` によるセキュリティヘッダー設定について説明する

### Requirement 6: デプロイ方法の比較

**Objective:** As a 初心者ユーザー, I want GitHub連携とDirect Uploadの違いを理解したい, so that 自分に最適な方法を素早く判断できる

#### Acceptance Criteria
1. The 記事 shall GitHub連携とDirect Upload（CLI）の特徴を比較表で提示する
2. The 記事 shall それぞれの方法のメリット・デメリットを説明する

### Requirement 7: 画像外部ホスティング（オプション）

**Objective:** As a 上級ユーザー, I want 画像をS3/R2にホスティングする方法を知りたい, so that CDNを活用した高速配信を実現できる

#### Acceptance Criteria
1. Where 画像外部ホスティングを使用する場合, the 記事 shall 必要な環境変数の設定方法を説明する
2. Where 画像外部ホスティングを使用する場合, the 記事 shall S3とR2の設定例を提示する

### Requirement 8: コンテンツ品質

**Objective:** As a ブログ運営者, I want 記事がプロジェクトの他の記事と一貫性を持つようにしたい, so that サイト全体の品質が維持される

#### Acceptance Criteria
1. The 記事 shall 既存記事（site-config-guide等）のスタイルに準拠する
2. The 記事 shall コードブロックに適切な言語指定（bash、typescript等）を使用する
3. The 記事 shall 表を使用して情報を整理する
4. The 記事 shall 日本語で記述する（本プロジェクトの主要言語）
