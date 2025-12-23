# Research & Design Decisions

## Summary
- **Feature**: fix-draft-pages-in-build
- **Discovery Scope**: Extension（既存システムの拡張）
- **Key Findings**:
  - 既存のdraftフィルターパターンが `src/pages/blog/index.astro` に実装済み
  - Astro の `getCollection` 第2引数でフィルター関数を受け取る仕様
  - `import.meta.env.PROD` で本番/開発環境を判定可能

## Research Log

### 既存draftフィルターパターン調査
- **Context**: 修正対象ページに適用すべきパターンを特定
- **Sources Consulted**: `src/pages/blog/index.astro`, `src/pages/rss.xml.js`
- **Findings**:
  - ブログ一覧: `getCollection('blog', ({ data }) => import.meta.env.PROD ? data.draft !== true : true)`
  - RSS: `getCollection('blog', ({ data }) => data.draft !== true)` — 常にdraft除外
  - 開発モードでは全記事表示、本番モードではdraft除外
- **Implications**: 同一パターンを3箇所（index.astro, tags/index.astro, tags/[...slug].astro）に適用

### タグページの構造調査
- **Context**: タグページでのdraftフィルター適用方法を検討
- **Sources Consulted**: `src/pages/tags/index.astro`, `src/pages/tags/[...slug].astro`
- **Findings**:
  - タグ一覧: `getCollection` 後に `TagService` でタグを収集
  - 個別タグ: `getStaticPaths()` 内で記事取得・タグ収集 → ページ生成
  - draft記事のみのタグは本番でページ生成不要
- **Implications**:
  - フィルター適用箇所は `getCollection` 呼び出し直後
  - `getStaticPaths()` での公開記事0件タグはパス生成をスキップ

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 直接フィルター適用 | 各ページで `getCollection` にフィルター関数を追加 | シンプル、既存パターン踏襲 | 重複コード | 3箇所のみのため許容範囲 |
| 共通ユーティリティ関数 | `getPublishedPosts()` を作成 | DRY原則 | 新規ファイル追加、過剰抽象化 | 今回は不採用 |

## Design Decisions

### Decision: 直接フィルター適用パターンの採用
- **Context**: 3箇所のページで同じフィルターロジックが必要
- **Alternatives Considered**:
  1. 各ページに直接フィルター追加 — シンプル、既存パターン踏襲
  2. 共通ユーティリティ関数 — DRYだが過剰な抽象化
- **Selected Approach**: 各ページに直接フィルター追加
- **Rationale**:
  - 既存の `blog/index.astro` と完全に一致するパターン
  - 修正箇所が3箇所のみで管理容易
  - ユーティリティ追加による複雑化を回避
- **Trade-offs**: 軽微なコード重複 vs シンプルさ
- **Follow-up**: 将来的に5箇所以上に増えた場合は共通化を検討

## Risks & Mitigations
- **Risk 1**: タグページで公開記事0件のタグページが生成される → `getStaticPaths()` でフィルター後の記事数チェックを追加
- **Risk 2**: 開発モードでdraft記事が見えなくなる → 環境判定 `import.meta.env.PROD` で開発時は全記事表示を維持

## References
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) — `getCollection` フィルター機能
- [Astro Environment Variables](https://docs.astro.build/en/guides/environment-variables/) — `import.meta.env.PROD/DEV`
