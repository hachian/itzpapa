# Requirements Document

## Introduction

本ドキュメントは、itzpapa（Obsidian→Astroブログソリューション）におけるOG画像（Open Graph画像）対応機能の要件を定義します。SNSでブログ記事が共有された際に、視覚的に魅力的なプレビュー画像を自動生成・表示することで、クリック率とユーザーエンゲージメントの向上を目指します。

## Requirements

### Requirement 1: OG画像メタタグ出力

**Objective:** As a ブログ管理者, I want 記事ページにOG画像メタタグが自動出力される, so that SNS共有時に適切な画像がプレビュー表示される

#### Acceptance Criteria
1. When 記事ページがレンダリングされる, the OGメタタグ生成システム shall `<meta property="og:image">` タグをHTMLヘッドに出力する
2. When 記事ページがレンダリングされる, the OGメタタグ生成システム shall `<meta property="og:image:width">` と `<meta property="og:image:height">` タグを出力する
3. The OGメタタグ生成システム shall Twitter Card用の `<meta name="twitter:image">` タグも同時に出力する

### Requirement 2: 記事別OG画像指定

**Objective:** As a コンテンツ作成者, I want 記事ごとにカスタムOG画像を指定できる, so that 記事の内容に合った画像をSNSプレビューに使用できる

#### Acceptance Criteria
1. When 記事のfrontmatterに `ogImage` フィールドが指定されている, the OG画像システム shall その画像パスをOGメタタグに使用する
2. If `ogImage` フィールドが指定されていない, then the OG画像システム shall デフォルトのOG画像を使用する
3. When `ogImage` に記事フォルダ内の相対パスが指定される, the OG画像システム shall 正しい絶対URLに解決する

### Requirement 3: デフォルトOG画像

**Objective:** As a ブログ管理者, I want サイト全体のデフォルトOG画像を設定できる, so that OG画像未指定の記事でも適切なプレビューが表示される

#### Acceptance Criteria
1. When 記事に `ogImage` が指定されていない and `heroImage` も指定されていない, the OG画像システム shall サイト設定のデフォルトOG画像を使用する
2. If 記事に `ogImage` が指定されていない and `heroImage` が指定されている, then the OG画像システム shall `heroImage` をOG画像として使用する
3. The サイト設定 shall デフォルトOG画像のパスを `src/consts.ts` で定義できる

### Requirement 4: OG画像仕様準拠

**Objective:** As a ブログ管理者, I want OG画像が主要SNSプラットフォームの仕様に準拠する, so that 各SNSで最適な表示が保証される

#### Acceptance Criteria
1. The OG画像システム shall 推奨サイズ（1200x630px）の画像を出力する
2. The OG画像システム shall 画像URLに絶対URL形式（https://で始まるURL）を使用する
3. The OG画像システム shall PNG、JPG、WebP形式の画像をサポートする

### Requirement 5: 動的OG画像生成（オプション）

**Objective:** As a ブログ管理者, I want 記事タイトルを含むOG画像を自動生成できる, so that カスタム画像を手動作成する手間を省ける

#### Acceptance Criteria
1. Where 動的OG画像生成機能が有効, the OG画像生成システム shall 記事タイトルを含むOG画像を自動生成する
2. Where 動的OG画像生成機能が有効, the OG画像生成システム shall サイトロゴまたはブランドカラーを画像に含める
3. If 動的生成に失敗した場合, then the OG画像システム shall デフォルトOG画像にフォールバックする
