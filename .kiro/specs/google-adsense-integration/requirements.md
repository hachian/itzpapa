# Requirements Document

## Introduction
本ドキュメントは、itzpapaブログにGoogle AdSense広告を統合するための要件を定義します。サイト運営者が `site.config.ts` を通じてAdSenseパブリッシャーIDを設定し、ブログページに広告を表示できるようにすることを目的とします。

## Requirements

### Requirement 1: AdSense設定管理
**Objective:** As a サイト運営者, I want `site.config.ts` でAdSenseのパブリッシャーIDを設定できる機能, so that 他のサイト設定と同様の方法でAdSenseを管理できる

#### Acceptance Criteria
1. The サイト shall `siteConfig.seo.googleAdsenseId` プロパティでパブリッシャーIDを受け付ける
2. When `googleAdsenseId` に有効なIDが設定されている, the サイト shall 当該IDをAdSenseスクリプトに適用する
3. If `googleAdsenseId` が空文字または未設定, then the サイト shall AdSense関連のスクリプトを一切出力しない
4. The サイト shall パブリッシャーIDを `ca-pub-XXXXXXXXXXXXXXXX` 形式で受け付ける
5. The 設定 shall `googleAnalyticsId` と同じパターン（`seo` セクション内、空文字で無効化）に従う

### Requirement 2: AdSenseスクリプト読み込み
**Objective:** As a サイト訪問者, I want ページ読み込み時にAdSenseスクリプトが適切に読み込まれる, so that 広告が正しく表示される

#### Acceptance Criteria
1. When AdSenseが有効化されている, the サイト shall `<head>` 内にAdSense自動広告スクリプトを挿入する
2. The サイト shall AdSenseスクリプトを `async` 属性付きで読み込む
3. The サイト shall `pagead2.googlesyndication.com` からスクリプトを読み込む

### Requirement 3: 自動広告表示
**Objective:** As a サイト運営者, I want Google AdSenseの自動広告機能を使用する, so that Googleのアルゴリズムで最適な位置に広告が表示される

#### Acceptance Criteria
1. When AdSenseが有効化されている, the サイト shall 自動広告（Auto ads）を有効にするスクリプトを出力する
2. The サイト shall 広告の配置をGoogleの自動広告アルゴリズムに委任する

### Requirement 4: 開発環境対応
**Objective:** As a 開発者, I want 開発環境でAdSenseスクリプトの動作を確認できる, so that 本番デプロイ前に設定が正しいか検証できる

#### Acceptance Criteria
1. When 開発サーバーで実行中, the サイト shall AdSenseスクリプトを通常通り出力する（ただし広告はGoogleの審査通過後のみ表示）
2. The サイト shall 開発環境と本番環境で同一のAdSense設定ロジックを使用する

### Requirement 5: パフォーマンスへの配慮
**Objective:** As a サイト訪問者, I want AdSenseスクリプトによるページ読み込み遅延を最小限に抑える, so that 快適にブログを閲覧できる

#### Acceptance Criteria
1. The サイト shall AdSenseスクリプトを非同期（`async`）で読み込む
2. The サイト shall AdSenseスクリプトをレンダリングブロッキングしない方法で読み込む
