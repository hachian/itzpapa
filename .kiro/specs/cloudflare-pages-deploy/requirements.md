# Requirements Document

## Introduction

本仕様は、itzpapa（Astro v5ベースのObsidian互換ブログ）をCloudflare Pagesにデプロイするための要件を定義します。静的サイトジェネレーターであるAstroの特性を活かし、Cloudflare Pagesのエッジネットワークで高速配信を実現します。

## Requirements

### Requirement 1: Cloudflare Pages アダプター統合

**Objective:** As a 開発者, I want Astroプロジェクトにcloudflare pagesアダプターを統合したい, so that Cloudflare Pagesへのデプロイに最適化されたビルド出力を得られる

#### Acceptance Criteria
1. The itzpapa build system shall install `@astrojs/cloudflare` adapter as a project dependency
2. The itzpapa build system shall configure Astro to use `@astrojs/cloudflare` adapter in `astro.config.mjs`
3. When `npm run build` is executed, the build system shall generate Cloudflare Pages互換の出力を `dist/` ディレクトリに生成する
4. The itzpapa build system shall maintain existing remark/rehype plugin configurations after adapter integration

### Requirement 2: Cloudflare Pagesデプロイ設定

**Objective:** As a 開発者, I want Cloudflare Pagesでのビルド・デプロイ設定を構成したい, so that GitHubリポジトリからの自動デプロイが可能になる

#### Acceptance Criteria
1. The deployment configuration shall specify `npm run build` as the build command
2. The deployment configuration shall specify `dist/` as the output directory
3. The deployment configuration shall specify Node.js version compatible with the project (Node.js 18以上)
4. The deployment configuration shall enable automatic deployments on push to the main branch

### Requirement 3: 環境変数とシークレット管理

**Objective:** As a 開発者, I want Cloudflare Pages環境での環境変数を適切に管理したい, so that サイトURLなどの設定値を本番環境に合わせて構成できる

#### Acceptance Criteria
1. The deployment configuration shall support `SITE` environment variable for production URL configuration
2. If environment-specific values are required, the build system shall use Cloudflare Pages環境変数機能を活用する
3. The project shall document required environment variables in deployment documentation

### Requirement 4: プレビュー環境

**Objective:** As a 開発者, I want プルリクエストごとにプレビュー環境を確認したい, so that 本番デプロイ前に変更内容を検証できる

#### Acceptance Criteria
1. When a pull request is opened, Cloudflare Pages shall generate a preview deployment
2. The preview deployment shall be accessible via a unique URL
3. When the pull request is merged or closed, the preview deployment shall remain accessible for reference

### Requirement 5: ビルド互換性の確保

**Objective:** As a 開発者, I want 既存のビルドプロセスがCloudflare Pages環境でも正常に動作することを確認したい, so that デプロイ後にサイトが正しく表示される

#### Acceptance Criteria
1. The build system shall successfully compile all remark plugins (WikiLink, Mark Highlight, Tags, Callout, Task Status)
2. The build system shall successfully compile all rehype plugins (Table Wrapper, Task Status)
3. The build system shall generate sitemap and RSS feed as configured
4. When the build completes, all static assets shall be correctly included in the output
5. The deployed site shall serve pages with correct `trailingSlash: 'always'` behavior
