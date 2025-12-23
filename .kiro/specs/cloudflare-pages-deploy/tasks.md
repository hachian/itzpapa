# Implementation Plan

## Tasks

- [x] 1. ローカル環境準備とビルド検証
- [x] 1.1 Wrangler設定ファイルの作成
  - プロジェクトルートにwrangler.jsoncを作成し、itzpapaプロジェクト名とdist出力ディレクトリを設定
  - .gitignoreに`.wrangler/`ディレクトリを追加してローカルキャッシュを除外
  - _Requirements: 1.3, 2.1, 2.2_

- [x] 1.2 ローカルビルドの動作確認
  - `npm run build`を実行し、すべてのremark/rehypeプラグインが正常にコンパイルされることを確認
  - dist/ディレクトリにsitemap.xmlとrss.xmlが生成されていることを確認
  - 生成された静的アセット（画像、CSS、JS）が正しく出力されていることを確認
  - _Requirements: 1.3, 1.4, 5.1, 5.2, 5.3, 5.4_

- [x] 1.3 (P) Wranglerによるローカルプレビュー確認
  - `wrangler pages dev ./dist`でローカルサーバーを起動
  - トップページ、ブログ記事、タグページの表示を確認
  - WikiLink、Callout、Mark Highlight等のObsidian記法が正しくレンダリングされることを確認
  - URL末尾スラッシュ（trailingSlash: 'always'）の動作を確認
  - _Requirements: 5.1, 5.2, 5.5_

- [x] 2. Cloudflare Pagesプロジェクト設定（手動）
  - Cloudflare Pagesダッシュボードで新規プロジェクトを作成し、GitHubリポジトリを連携
  - ビルド設定：Framework preset「Astro」、Build command「npm run build」、Output directory「dist」
  - 環境変数：NODE_VERSION=18を設定（全環境）
  - 環境変数：SITE=https://itzpapa.hachian.com を本番環境に設定（オプション）
  - main branchへの自動デプロイを有効化
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2_

- [x] 3. デプロイ検証
- [x] 3.1 本番デプロイの動作確認
  - main branchにpushして初回デプロイを実行
  - Cloudflare Pagesビルドログでビルド成功を確認
  - Production URLでサイトにアクセスし、トップページが正常表示されることを確認
  - _Requirements: 2.4, 5.4_

- [x] 3.2 (P) コンテンツ・機能検証
  - ブログ記事ページでObsidian記法（WikiLink、Callout、Mark Highlight、タグ）が正しく表示されることを確認
  - タグページ、アーカイブページの動作確認
  - sitemap.xml、rss.xmlへのアクセス確認
  - 画像アセットの表示確認
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 3.3 (P) プレビューデプロイの確認
  - テスト用PRを作成してプレビューデプロイをトリガー
  - プレビューURLが生成され、アクセス可能であることを確認
  - PR マージ後もプレビューURLが維持されていることを確認
  - _Requirements: 4.1, 4.2, 4.3_

## Deferred Requirements

以下の要件は設計フェーズで「不要」と判断されました：
- **1.1, 1.2**: 静的サイト（SSG）では`@astrojs/cloudflare`アダプターが不要のため、インストール・設定タスクなし（詳細は`research.md`参照）

以下の要件はデプロイ後のドキュメント作業として別途対応：
- **3.3**: デプロイドキュメントの作成（実装タスクの対象外）
