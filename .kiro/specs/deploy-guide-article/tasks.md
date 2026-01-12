# Implementation Plan

## Tasks

- [x] 1. 記事ファイルの作成とフロントマター設定
  - `src/content/blog/20260112-deploy-guide/index.md` を作成
  - フロントマター（title, description, category, tags, published）を設定
  - 既存のGuide記事（site-config-guide）のスタイルに準拠
  - _Requirements: 1.1, 1.2, 1.3, 8.1, 8.4_

- [x] 2. 記事コンテンツの作成
- [x] 2.1 はじめにセクションの作成
  - 記事の目的と対象読者を説明
  - 目次から各セクションへナビゲートできる構成を確保
  - _Requirements: 1.4_

- [x] 2.2 (P) プロジェクト取得とセットアップセクションの作成
  - `git clone` によるリポジトリ取得手順を説明
  - `npm install`（Linux/macOS）と `pnpm install`（Windows推奨）の依存関係インストール手順を説明
  - `npm run dev` による開発サーバー起動と動作確認方法を説明
  - ローカルプレビューURL（http://localhost:4321）を明記
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 2.3 (P) デプロイ前の必須設定セクションの作成
  - `site.config.ts`で必須変更が必要な項目を明記
  - `site.title`、`site.author`、`site.baseUrl`の設定方法を説明
  - `features.comments.enabled`（giscusコメント）の設定について説明
  - `astro.config.mjs`の`site`プロパティの変更方法を説明
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 2.4 (P) ビルドセクションの作成
  - `npm run build` と `npm run build:ci` の違いを説明
  - ビルド出力先（`./dist/`）について説明
  - 環境変数の設定方法（`.env`ファイル）について説明
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 2.5 Cloudflare Pagesデプロイセクションの作成
  - GitHub連携による自動デプロイの設定手順を説明
  - Direct Upload（CLI）による手動デプロイ手順を説明
  - ビルド設定項目（フレームワーク、ビルドコマンド、出力ディレクトリ、Node.jsバージョン）を表形式で提示
  - `public/_headers` によるセキュリティヘッダー設定について説明
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 2.6 (P) デプロイ方法の比較セクションの作成
  - GitHub連携とDirect Upload（CLI）の特徴を比較表で提示
  - それぞれの方法のメリット・デメリットを説明
  - _Requirements: 6.1, 6.2_

- [x] 2.7 (P) 画像外部ホスティングセクションの作成
  - 必要な環境変数の設定方法を説明
  - S3とR2の設定例を提示
  - _Requirements: 7.1, 7.2_

- [x] 2.8 まとめセクションの作成
  - 記事全体の要約と次のステップへの誘導
  - _Requirements: 8.1_

- [x] 3. コンテンツ品質の確認と調整
  - コードブロックに適切な言語指定（bash、typescript等）が使用されていることを確認
  - 表が正しくフォーマットされていることを確認
  - 日本語で記述されていることを確認
  - _Requirements: 8.2, 8.3, 8.4_

- [x] 4. ビルド検証
  - `npm run build` でビルドエラーがないことを確認
  - `npm run dev` で記事が正しく表示されることを確認
  - 目次が正しく表示されることを確認
  - コードブロックのシンタックスハイライトが適用されていることを確認
  - _Requirements: 1.4, 8.1_

## Requirements Coverage

| Requirement | Task(s) |
|-------------|---------|
| 1.1, 1.2, 1.3 | 1 |
| 1.4 | 2.1, 4 |
| 2.1, 2.2, 2.3, 2.4 | 2.2 |
| 3.1, 3.2, 3.3, 3.4, 3.5, 3.6 | 2.3 |
| 4.1, 4.2, 4.3 | 2.4 |
| 5.1, 5.2, 5.3, 5.4 | 2.5 |
| 6.1, 6.2 | 2.6 |
| 7.1, 7.2 | 2.7 |
| 8.1 | 1, 2.8, 4 |
| 8.2, 8.3, 8.4 | 1, 3 |
