# Requirements Document

## Introduction
本ドキュメントは、itzpapaブログにgiscusを使用したコメントシステムを実装するための要件を定義します。giscusはGitHub Discussionsを活用したコメントシステムで、静的サイトにシームレスに統合できます。

## Requirements

### Requirement 1: giscusコンポーネントの実装
**Objective:** As a 開発者, I want giscusコメントをAstroコンポーネントとして実装したい, so that ブログ記事にコメント欄を表示できるようになる

#### Acceptance Criteria
1. The Comments component shall GitHub Discussionsと連携したgiscusウィジェットを表示する
2. When コメント機能が有効（`features.comments.enabled: true`）の場合, the Comments component shall 記事ページ下部にコメントセクションを表示する
3. When コメント機能が無効（`features.comments.enabled: false`）の場合, the Comments component shall コメントセクションを非表示にする
4. The Comments component shall site.config.tsで設定されたgiscus設定値（repo, repoId, category, categoryId）を使用する

### Requirement 2: BlogPost.astroへの統合
**Objective:** As a 読者, I want ブログ記事ページでコメントを読み書きしたい, so that 記事についてディスカッションできる

#### Acceptance Criteria
1. When 記事ページがレンダリングされる場合, the BlogPost layout shall Commentsコンポーネントを記事本文の後に配置する
2. While コメント機能が有効の場合, the BlogPost layout shall RelatedPostsセクションの前にコメントセクションを表示する
3. The Comments component shall 現在のページURLとタイトルをgiscusに渡す

### Requirement 3: テーマ連携
**Objective:** As a 読者, I want コメント欄がサイトのテーマと一致してほしい, so that 統一感のある閲覧体験が得られる

#### Acceptance Criteria
1. When ライトモードの場合, the Comments component shall giscusをライトテーマで表示する
2. When ダークモードの場合, the Comments component shall giscusをダークテーマで表示する
3. When システムのテーマ設定が変更された場合, the Comments component shall giscusのテーマを動的に切り替える

### Requirement 4: giscus設定の型安全性
**Objective:** As a 開発者, I want giscus設定に型安全なインターフェースを使いたい, so that 設定ミスを防げる

#### Acceptance Criteria
1. The GiscusConfig interface shall repo, repoId, category, categoryIdを必須プロパティとして定義する
2. The GiscusConfig interface shall mapping, reactionsEnabled, inputPosition等のオプショナルプロパティをサポートする
3. When providerが'giscus'に設定されている場合, the CommentsConfig shall config プロパティにGiscusConfig型を適用する

### Requirement 5: ローディング最適化
**Objective:** As a 読者, I want コメント欄の読み込みがページのパフォーマンスに影響しないようにしたい, so that 快適に記事を閲覧できる

#### Acceptance Criteria
1. The Comments component shall giscusスクリプトを遅延読み込み（lazy loading）する
2. While giscusが読み込み中の場合, the Comments component shall ローディング状態を表示してもよい（オプション）
3. The Comments component shall giscusスクリプトにloading="lazy"属性を設定する
