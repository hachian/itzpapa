# Requirements Document

## Introduction

本仕様は、既存のパンくずリストコンポーネント（`Breadcrumb.astro`）をタグ一覧ページ（`/tags/`）、個別タグページ（`/tags/[slug]/`）、およびブログ一覧ページ（`/blog/`）に適用することを目的とする。現在、これらのページにはパンくずリストがないか独自のナビゲーション実装があるが、サイト全体で一貫したナビゲーション体験を提供するため、既存のBreadcrumbコンポーネントを活用した統一的な実装に置き換える。

## Requirements

### Requirement 1: ブログ一覧ページへのパンくずリスト追加

**Objective:** ユーザーとして、ブログ一覧ページ（`/blog/`）でパンくずリストを確認したい。これにより、サイト構造における現在位置を把握でき、ホームページへ容易に戻ることができる。

#### Acceptance Criteria

1. When ユーザーがブログ一覧ページ（`/blog/`）にアクセスした場合, the Breadcrumb component shall 「ホーム › ブログ」の形式でパンくずリストを表示する
2. When ユーザーがパンくずリストの「ホーム」リンクをクリックした場合, the system shall ホームページ（`/`）へ遷移する
3. The Breadcrumb component shall ブログ一覧ページを表す最終要素を現在のページとして表示する（リンクなし、`aria-current="page"`属性付き）

### Requirement 2: タグ一覧ページへのパンくずリスト追加

**Objective:** ユーザーとして、タグ一覧ページ（`/tags/`）でパンくずリストを確認したい。これにより、サイト構造における現在位置を把握でき、ホームページへ容易に戻ることができる。

#### Acceptance Criteria

1. When ユーザーがタグ一覧ページ（`/tags/`）にアクセスした場合, the Breadcrumb component shall 「ホーム › タグ」の形式でパンくずリストを表示する
2. When ユーザーがパンくずリストの「ホーム」リンクをクリックした場合, the system shall ホームページ（`/`）へ遷移する
3. The Breadcrumb component shall タグ一覧ページを表す最終要素を現在のページとして表示する（リンクなし、`aria-current="page"`属性付き）

### Requirement 3: 個別タグページへのパンくずリスト追加

**Objective:** ユーザーとして、個別タグページ（`/tags/[tag-name]/`）でパンくずリストを確認したい。これにより、タグ階層構造を理解し、上位階層へ簡単に移動できる。

#### Acceptance Criteria

1. When ユーザーがフラットタグ（階層なし）のタグページにアクセスした場合, the Breadcrumb component shall 「ホーム › タグ › [タグ名]」の形式でパンくずリストを表示する
2. When ユーザーが階層タグ（例: `parent/child`）のタグページにアクセスした場合, the Breadcrumb component shall 「ホーム › タグ › [親タグ] › [子タグ]」の形式で階層を反映したパンくずリストを表示する
3. When ユーザーがパンくずリスト内の親タグリンクをクリックした場合, the system shall 該当する親タグページへ遷移する
4. The Breadcrumb component shall タグ名の最終要素を現在のページとして表示する（リンクなし）

### Requirement 4: 既存独自ナビゲーションの置き換え

**Objective:** 開発者として、タグページ内の既存のカスタムパンくずリスト実装を、共通のBreadcrumbコンポーネントに置き換えたい。これにより、コードの一貫性と保守性が向上する。

#### Acceptance Criteria

1. When タグ詳細ページ（`[...slug].astro`）が描画される場合, the system shall 既存の`.breadcrumbs`クラスによる独自実装を削除し、Breadcrumbコンポーネントを使用する
2. When タグ詳細ページが描画される場合, the system shall 既存の「戻る」リンク（`← タグ一覧に戻る`）を削除し、パンくずリストによるナビゲーションに統一する
3. The system shall 既存のカスタムパンくずリスト用CSSスタイル（`.breadcrumbs`, `.breadcrumb-item`, `.breadcrumb-link`, `.breadcrumb-separator`）を削除する

### Requirement 5: 多言語対応（i18n）

**Objective:** ユーザーとして、パンくずリストのラベルが現在の言語設定に応じて表示されることを期待する。

#### Acceptance Criteria

1. The Breadcrumb component shall 「ホーム」ラベルを現在のロケールに応じて表示する（日本語: 「ホーム」、英語: 「Home」）
2. The Breadcrumb component shall 「ブログ」ラベルを現在のロケールに応じて表示する（日本語: 「ブログ」、英語: 「Blog」）
3. The Breadcrumb component shall 「タグ」ラベルを現在のロケールに応じて表示する（日本語: 「タグ」、英語: 「Tags」）
4. The Breadcrumb component shall `aria-label`属性を現在のロケールに応じて設定する

### Requirement 6: アクセシビリティ

**Objective:** スクリーンリーダー利用者として、パンくずリストを適切に認識し、ナビゲーションできることを期待する。

#### Acceptance Criteria

1. The Breadcrumb component shall `<nav>`要素と適切な`aria-label`属性を使用してセマンティックなマークアップを維持する
2. The Breadcrumb component shall 順序付きリスト（`<ol>`）を使用してパンくずリスト項目を構造化する
3. The Breadcrumb component shall 区切り文字に`aria-hidden="true"`属性を設定してスクリーンリーダーから非表示にする
4. The Breadcrumb component shall 現在のページ要素に`aria-current="page"`属性を設定する

### Requirement 7: スタイルの一貫性

**Objective:** デザイナーとして、パンくずリストがサイト全体で一貫したスタイルで表示されることを期待する。

#### Acceptance Criteria

1. The Breadcrumb component shall 既存のBreadcrumb.astroで定義されたスタイル（CSS変数使用）を維持する
2. The Breadcrumb component shall ダークモード対応を維持する
3. The Breadcrumb component shall レスポンシブ対応（折り返し表示）を維持する
