# Requirements Document

## Introduction

itzpapaブログシステムにおいて、画像ファイルを外部ホスティングサービス（CDN、クラウドストレージ等）から配信できるオプション機能を追加します。現在、画像は `src/content/blog/{slug}/` 内に記事と同梱されていますが、この機能により外部URLから画像を取得する選択肢を提供します。

## Requirements

### Requirement 1: 外部画像URLの設定機能

**Objective:** As a サイト運営者, I want 画像の配信元を外部ホスティングサービスに切り替えられる設定, so that CDNやクラウドストレージを活用してパフォーマンスを向上できる

#### Acceptance Criteria
1. The Image Service shall 設定ファイルで外部画像ホスティングのベースURLを指定できる機能を提供する
2. When 外部ホスティングが有効化されている場合, the Image Service shall ローカル画像パスを外部URLに変換する
3. When 外部ホスティングが無効化されている場合, the Image Service shall 従来通りローカル画像パスを使用する
4. The Image Service shall 記事ごと、または画像ごとに外部ホスティングの使用可否を制御できる

### Requirement 2: Markdown画像参照の変換処理

**Objective:** As a コンテンツ作成者, I want Markdownで記述した画像参照が自動的に外部URLに変換される, so that 記事の書き方を変えずに外部ホスティングを利用できる

#### Acceptance Criteria
1. When Markdownに相対パスの画像参照 (`![alt](./image.png)`) がある場合, the Remark Plugin shall 外部ホスティング設定に基づいてURLを変換する
2. When 画像参照が既に絶対URLの場合, the Remark Plugin shall 変換せずそのまま出力する
3. When 画像ファイルが外部ホスティングに存在しない可能性がある場合, the Remark Plugin shall フォールバック動作（ローカルパス使用またはエラー表示）を設定可能にする

### Requirement 3: Astro画像コンポーネントとの互換性

**Objective:** As a 開発者, I want Astroの `<Image>` コンポーネントと外部ホスティング機能が連携する, so that 画像最適化機能を維持しながら外部配信できる

#### Acceptance Criteria
1. While 外部ホスティングが有効な場合, the Image Component shall 外部URLからの画像読み込みをサポートする
2. The Image Component shall 外部画像に対してもwidth/height属性を適切に処理する
3. If 外部画像の読み込みに失敗した場合, the Image Component shall プレースホルダーまたはエラー状態を表示する

### Requirement 4: ビルド時の画像パス解決

**Objective:** As a サイト運営者, I want ビルド時に画像パスが正しく解決される, so that 本番環境で画像が正しく表示される

#### Acceptance Criteria
1. When ビルドを実行する場合, the Build Process shall 外部ホスティング設定に基づいて全ての画像参照を解決する
2. The Build Process shall 設定された外部ホスティングURLが有効な形式であることを検証する
3. When 開発モード (`npm run dev`) の場合, the Build Process shall ローカル画像と外部画像の両方をプレビューできる
4. When 外部ホスティングが有効な場合, the Build Process shall 画像ファイルをdist出力に含めない（ビルドサイズ削減）
5. When 外部ホスティングが無効な場合, the Build Process shall 従来通り画像をdistに含める

### Requirement 5: 設定の柔軟性

**Objective:** As a サイト運営者, I want S3・Cloudflare R2を中心とした外部ホスティング設定, so that 主要なクラウドストレージサービスを簡単に利用できる

#### Acceptance Criteria
1. The Configuration System shall S3およびCloudflare R2を優先的にサポートし、それぞれのプロバイダー向けプリセット設定を提供する
2. The Configuration System shall 環境変数による設定上書きをサポートする（`IMAGE_HOST_URL`等）
3. The Configuration System shall カスタムCDNにも対応できる汎用的なベースURL設定をサポートする

### Requirement 6: ビルド時の画像自動アップロード

**Objective:** As a サイト運営者, I want ビルド時にローカル画像がS3/R2へ自動アップロードされる, so that 手動でのアップロード作業を省略できる

#### Acceptance Criteria
1. When `npm run build` を実行する場合, the Build Process shall ローカル画像をS3/R2へ自動アップロードする
2. The Upload Service shall 環境変数でAPIキー（アクセスキー、シークレットキー、バケット名、リージョン等）を設定できる
3. When 画像が既にアップロード済みの場合, the Upload Service shall 差分チェックを行いスキップする（ハッシュまたは更新日時ベース）
4. If アップロードに失敗した場合, the Build Process shall エラーを報告しビルドを中断するか続行するかを設定可能にする
5. The Upload Service shall アップロード対象のディレクトリ/ファイルパターンを設定でフィルタリングできる
6. While アップロード処理中, the Build Process shall 進捗状況をコンソールに表示する

### Requirement 7: 認証情報の安全な管理

**Objective:** As a サイト運営者, I want APIキーを安全に管理できる, so that 認証情報の漏洩リスクを最小化できる

#### Acceptance Criteria
1. The Configuration System shall APIキーを環境変数（`AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、`R2_ACCESS_KEY_ID`等）から読み取る
2. The Configuration System shall 設定ファイルに認証情報を直接記載しない設計とする
3. When 必要な認証情報が未設定の場合, the Build Process shall 明確なエラーメッセージを表示しアップロード機能をスキップする
