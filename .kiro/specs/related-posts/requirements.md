# Requirements Document

## Introduction

ブログ記事ページの下部に、現在閲覧中の記事と関連性の高い記事を表示する機能を実装する。関連性はタグの共通性に基づいて判定し、読者が興味のある関連コンテンツを発見しやすくする。

既存の設定 `site.config.features.relatedPosts` フラグで機能の有効/無効を制御する。

## Requirements

### Requirement 1: 関連記事の表示

**Objective:** As a 読者, I want 現在読んでいる記事に関連する他の記事を発見したい, so that 興味のあるトピックをより深く探索できる

#### Acceptance Criteria

1. When ブログ記事ページを表示する, the RelatedPosts コンポーネント shall 関連記事を最大5件表示する
2. When 関連記事が存在しない, the RelatedPosts コンポーネント shall 関連記事セクション自体を非表示にする
3. Where `site.config.features.relatedPosts` が `false` に設定されている, the BlogPost レイアウト shall 関連記事セクションを表示しない
4. The RelatedPosts コンポーネント shall 現在閲覧中の記事自身を関連記事リストから除外する

### Requirement 2: 関連性の判定ロジック

**Objective:** As a 開発者, I want タグベースで関連記事を判定したい, so that 実装がシンプルで保守しやすい

#### Acceptance Criteria

1. The 関連記事判定ロジック shall 現在の記事と共通するタグの数をスコアとして計算する
2. When 複数の記事が同じスコアを持つ, the 関連記事判定ロジック shall 公開日の新しい順でソートする
3. When タグが設定されていない記事, the 関連記事判定ロジック shall その記事を関連記事候補から除外する
4. The 関連記事判定ロジック shall 共通タグが1つ以上ある記事のみを関連記事として扱う

### Requirement 3: 関連記事カードのUI

**Objective:** As a 読者, I want 関連記事の情報を一目で把握したい, so that クリックするかどうかを素早く判断できる

#### Acceptance Criteria

1. The RelatedPostCard コンポーネント shall 記事のタイトル、公開日、説明文（存在する場合）を表示する
2. The RelatedPostCard コンポーネント shall 記事のアイキャッチ画像（存在する場合）を表示する
3. When ダークモードが有効, the RelatedPostCard コンポーネント shall ダークモード用のスタイルを適用する
4. The RelatedPosts セクション shall レスポンシブデザインを適用する（モバイルでは1列、デスクトップでは複数列）
5. When 関連記事カードをクリック, the RelatedPostCard コンポーネント shall 該当記事ページへ遷移する

### Requirement 4: パフォーマンス

**Objective:** As a 開発者, I want ビルド時に関連記事を計算したい, so that ランタイムパフォーマンスに影響を与えない

#### Acceptance Criteria

1. The 関連記事判定ロジック shall Astroのビルド時（SSG）に実行される
2. The RelatedPosts コンポーネント shall 追加のJavaScriptをクライアントに配信しない（静的HTML出力のみ）
