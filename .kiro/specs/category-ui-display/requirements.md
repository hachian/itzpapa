# Requirements Document

## Introduction
ブログ記事のフロントマターに定義されている`category`フィールドをUIに表示する機能を実装する。カテゴリはタグとは異なり、記事の主要な分類を表す単一の値である。記事詳細ページおよび記事一覧ページにおいて、カテゴリ情報を視覚的に表示し、同一カテゴリの記事をグルーピングできるようにする。

## Requirements

### Requirement 1: 記事詳細ページでのカテゴリ表示
**Objective:** As a 読者, I want 記事のカテゴリを記事詳細ページで確認できる, so that 記事の分類を一目で把握できる

#### Acceptance Criteria
1. When 記事詳細ページが表示された時, the BlogPostレイアウト shall カテゴリバッジを記事メタデータエリアに表示する
2. If カテゴリが空または未設定の場合, then the BlogPostレイアウト shall カテゴリバッジを非表示にする
3. The カテゴリバッジ shall タグバッジとは視覚的に区別できるスタイルを持つ
4. When カテゴリバッジがクリックされた時, the システム shall 該当カテゴリの記事一覧ページに遷移する

### Requirement 2: 記事一覧ページでのカテゴリ表示
**Objective:** As a 読者, I want 記事一覧で各記事のカテゴリを確認できる, so that 興味のあるカテゴリの記事を見つけやすい

#### Acceptance Criteria
1. When 記事一覧ページが表示された時, the 記事カード shall 各記事のカテゴリを表示する
2. If 記事にカテゴリが設定されていない場合, then the 記事カード shall カテゴリ表示エリアを非表示にする
3. The カテゴリ表示 shall タグ一覧とは別の位置に配置される

### Requirement 3: カテゴリ別記事一覧ページ
**Objective:** As a 読者, I want 特定のカテゴリに属する記事を一覧で確認できる, so that 同じカテゴリの記事を効率的に閲覧できる

#### Acceptance Criteria
1. When `/category/[category-name]`にアクセスした時, the システム shall 該当カテゴリの記事一覧を表示する
2. The カテゴリ記事一覧ページ shall カテゴリ名をページタイトルとして表示する
3. The カテゴリ記事一覧ページ shall 該当カテゴリの記事数を表示する
4. If 指定されたカテゴリの記事が存在しない場合, then the システム shall 「記事がありません」メッセージを表示する
5. The カテゴリ記事一覧ページ shall パンくずリストにカテゴリ名を含める

### Requirement 4: カテゴリ一覧ページ
**Objective:** As a 読者, I want 全てのカテゴリを一覧で確認できる, so that ブログのコンテンツ構成を把握できる

#### Acceptance Criteria
1. When `/category/`にアクセスした時, the システム shall 全カテゴリの一覧を表示する
2. The カテゴリ一覧 shall 各カテゴリの記事数を表示する
3. The カテゴリ一覧 shall カテゴリ名のアルファベット順でソートされる
4. When カテゴリがクリックされた時, the システム shall 該当カテゴリの記事一覧ページに遷移する

### Requirement 5: カテゴリバッジコンポーネント
**Objective:** As a 開発者, I want 再利用可能なカテゴリバッジコンポーネントを使用できる, so that 一貫したUI表示を実現できる

#### Acceptance Criteria
1. The CategoryBadgeコンポーネント shall カテゴリ名とリンクを受け取り表示する
2. The CategoryBadgeコンポーネント shall ダークモードに対応したスタイルを持つ
3. The CategoryBadgeコンポーネント shall ホバー時に視覚的なフィードバックを提供する
4. The CategoryBadgeコンポーネント shall アクセシビリティ要件（適切なコントラスト比、フォーカス表示）を満たす

### Requirement 6: 国際化対応
**Objective:** As a 多言語サイト運営者, I want カテゴリ関連のUIテキストが翻訳される, so that 多言語対応サイトでも一貫した体験を提供できる

#### Acceptance Criteria
1. The カテゴリ一覧ページ shall i18n翻訳キーを使用したラベルを表示する
2. The カテゴリバッジ shall スクリーンリーダー向けのアクセシブルラベルを翻訳対応で提供する
3. The パンくずリスト shall カテゴリ関連のテキストを翻訳対応で表示する
