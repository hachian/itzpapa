# Implementation Plan: Lighthouse Performance Improvement

## Tasks

- [x] 1. セキュリティヘッダー設定
- [x] 1.1 (P) Cloudflare Pages用セキュリティヘッダーファイルを作成する
  - X-Frame-Options, X-Content-Type-Options, Referrer-Policyなどの基本ヘッダーを設定
  - Strict-Transport-Securityでmax-age 1年間のHSTSを有効化
  - Permissions-Policyでカメラ・マイク・位置情報を無効化
  - Content-Security-Policy-Report-Onlyでレポートモードからの段階的CSP導入
  - Google Analytics、Google Fonts、Cloudflare Insightsの許可ドメインを含める
  - _Requirements: 3.6, 3.7_

- [x] 2. Lighthouse CI設定
- [x] 2.1 (P) Lighthouse CI設定ファイルを作成する
  - テスト対象URL（トップページ、ブログ一覧、タグ一覧）を指定
  - 各カテゴリ（Performance, Accessibility, Best Practices, SEO）に90点の閾値を設定
  - 閾値未達時はWarningとし、ビルドをブロックしない設定
  - 一時的なパブリックストレージへのレポートアップロードを有効化
  - _Requirements: 5.1, 5.2_

- [x] 2.2 GitHub Actions Workflowを作成する
  - mainブランチへのpushとPR時にトリガーする設定
  - Node.js 20とnpmキャッシュを使用したビルド環境のセットアップ
  - Astroビルド完了後にLighthouse CIを3回実行してmedian値を取得
  - レポートをGitHub Artifactsとして保存
  - _Requirements: 5.1, 5.2, 5.4_
  - _Note: 2.1の設定ファイルに依存_

- [x] 3. パフォーマンスガイドライン作成
- [x] 3.1 (P) パフォーマンス維持のためのガイドラインドキュメントを作成する
  - 画像最適化のベストプラクティス（Astro Image使用、WebP形式、適切なサイズ指定）
  - CSS最適化（コード分割、不要なスタイル削減）
  - JavaScript最適化（非同期読み込み、バンドルサイズ監視）
  - Lighthouse CIの使用方法とスコア解釈ガイド
  - スコア低下時のトラブルシューティング手順
  - _Requirements: 5.3_

- [x] 4. 既存実装の検証
- [x] 4.1 (P) Performance関連の既存実装を検証する
  - 画像最適化（WebP形式、loading属性）の動作確認
  - フォントプリロードとGoogle Fonts非同期読み込みの確認
  - CSS code splittingが有効であることの確認
  - リソースヒント（preconnect, dns-prefetch）の動作確認
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 4.2 (P) Accessibility関連の既存実装を検証する
  - セマンティックHTML要素（header, nav, main, article, footer）の使用確認
  - ARIA属性とフォーカスインジケータの動作確認
  - 色コントラスト比のWCAG AA基準適合チェック
  - 見出し階層（h1→h2→h3）の論理的構造確認
  - タッチターゲットサイズ（44x44px）の確認
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 4.3 (P) Best Practices関連の既存実装を検証する
  - HTTPS配信と有効なSSL証明書の確認
  - 非推奨APIやブラウザ機能の使用がないことの確認
  - JavaScriptコンソールエラーがないことの確認
  - 外部リソースのHTTPS読み込みの確認
  - doctype宣言とcharsetエンコーディングの確認
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4.4 (P) SEO関連の既存実装を検証する
  - 各ページのtitleタグとmeta descriptionの確認
  - canonical URLの設定確認
  - robots.txtとXMLサイトマップの妥当性確認
  - Open GraphとTwitter Cardsメタタグの確認
  - JSON-LD構造化データの確認
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

- [x] 5. 統合テストとスコア計測
- [x] 5.1 ローカル環境でLighthouse CIを実行してベースラインスコアを計測する
  - lhci autorunコマンドでローカル実行
  - 各カテゴリのスコアを記録
  - 90点未満のカテゴリがある場合は問題点を特定
  - _Requirements: 1.6, 1.7, 1.8, 5.1_
  - _Note: タスク1, 2, 4の完了が前提_

- [x] 5.2 本番デプロイ後にセキュリティヘッダーを検証する
  - securityheaders.comでセキュリティヘッダーのスコアを確認
  - CSP Report-Onlyモードで違反レポートを監視
  - 全ヘッダーが正しく適用されていることを確認
  - _Requirements: 3.6_
  - _Note: タスク1.1のデプロイ後に実行_

- [x] 5.3 GitHub Actions Workflowの動作を確認する
  - PRを作成してワークフローが自動実行されることを確認
  - Lighthouse CIレポートがArtifactsに保存されることを確認
  - スコアが閾値を満たした場合にStatus Checkが成功することを確認
  - _Requirements: 5.1, 5.2, 5.4_
  - _Note: タスク2の完了後に実行_

## Requirements Coverage Summary

| Requirement | Tasks |
|-------------|-------|
| 1.1-1.5 | 4.1（既存実装の検証） |
| 1.6-1.8 | 5.1（スコア計測） |
| 2.1-2.7 | 4.2（既存実装の検証） |
| 3.1-3.5 | 4.3（既存実装の検証） |
| 3.6, 3.7 | 1.1, 5.2 |
| 4.1-4.8 | 4.4（既存実装の検証） |
| 4.9 | N/A（単一言語サイト） |
| 5.1, 5.2 | 2.1, 2.2, 5.1, 5.3 |
| 5.3 | 3.1 |
| 5.4 | 2.2, 5.3 |
