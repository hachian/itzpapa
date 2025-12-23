# Requirements Document

## Introduction

本プロジェクトでは、Astroブログサイトの本番ビルド時に、下書き（`draft: true`）状態のページとそのページに紐づくタグがビルド結果に含まれてしまう問題を修正します。

現在、`src/pages/blog/index.astro` と `src/pages/blog/[...slug].astro` およびRSSフィード（`src/pages/rss.xml.js`）では正しくdraftフィルターが適用されていますが、以下の箇所でフィルターが欠落しています：

- `src/pages/index.astro`（トップページ）
- `src/pages/tags/index.astro`（タグ一覧ページ）
- `src/pages/tags/[...slug].astro`（個別タグページ）

これにより、本番環境でもdraft記事のタグが表示され、タグをクリックすると本来非公開であるべき記事が見えてしまう可能性があります。

## Requirements

### Requirement 1: トップページからのdraft記事除外

**Objective:** As a サイト訪問者, I want トップページにdraft記事が表示されない, so that 公開済みの記事のみを閲覧できる

#### Acceptance Criteria
1. When 本番ビルドを実行する, the Build System shall `src/pages/index.astro` において `draft: true` の記事を除外する
2. While 開発モード（`import.meta.env.DEV`）, the Build System shall draft記事もプレビュー可能とする
3. The Build System shall トップページの「最新記事」セクションに公開済み記事のみを表示する

### Requirement 2: タグ一覧ページからのdraft記事タグ除外

**Objective:** As a サイト訪問者, I want タグ一覧ページにdraft記事のタグが含まれない, so that 実際にアクセス可能なコンテンツのタグのみが表示される

#### Acceptance Criteria
1. When 本番ビルドを実行する, the Build System shall `src/pages/tags/index.astro` において `draft: true` の記事を除外してからタグを収集する
2. While 開発モード, the Build System shall draft記事のタグもプレビュー可能とする
3. The Build System shall タグのカウント数にdraft記事を含めない（本番環境）
4. If あるタグがdraft記事のみに紐づいている, then the Build System shall そのタグをタグ一覧から除外する

### Requirement 3: 個別タグページからのdraft記事除外

**Objective:** As a サイト訪問者, I want 個別タグページにdraft記事が表示されない, so that タグで絞り込んだ際も公開済みの記事のみを閲覧できる

#### Acceptance Criteria
1. When 本番ビルドを実行する, the Build System shall `src/pages/tags/[...slug].astro` において `draft: true` の記事を除外する
2. While 開発モード, the Build System shall draft記事もプレビュー可能とする
3. If あるタグに紐づく公開記事が0件, then the Build System shall そのタグページを生成しない（本番環境）
4. The Build System shall 各タグページの記事カウント数にdraft記事を含めない

### Requirement 4: 一貫したフィルターパターンの適用

**Objective:** As a 開発者, I want draftフィルターのパターンが全ページで一貫している, so that 保守性が向上し将来のバグを防げる

#### Acceptance Criteria
1. The Build System shall 既存の `src/pages/blog/index.astro` と同じフィルターパターン（`import.meta.env.PROD ? data.draft !== true : true`）を全対象ページに適用する
2. The Build System shall RSSフィード（`src/pages/rss.xml.js`）の既存ロジック（常にdraft除外）を維持する
3. When 新しいページでブログ記事を取得する場合, the Build System shall 同一のフィルターパターンを使用する
