# Research & Design Decisions

## Summary
- **Feature**: `related-posts`
- **Discovery Scope**: Extension（既存BlogPostレイアウトへの機能追加）
- **Key Findings**:
  - タグベースのスコアリングは既存の `tags` 配列を活用可能
  - `getCollection` API は記事ページ内で利用可能（SSG時に実行）
  - 既存の `FormattedDate`, `TagList` コンポーネントを再利用可能

## Research Log

### Astro Content Collections API
- **Context**: 関連記事取得のAPIパターンを確認
- **Sources Consulted**: 既存コード `src/pages/blog/[...slug].astro`, `src/pages/tags/[...slug].astro`
- **Findings**:
  - `getCollection('blog')` で全記事取得可能
  - フィルタ関数でドラフト記事除外パターンが確立済み
  - `CollectionEntry<'blog'>` 型でタイプセーフにアクセス可能
- **Implications**: 関連記事取得ロジックは既存パターンに従い実装可能

### 記事データスキーマ
- **Context**: 関連記事判定に必要なフィールドを確認
- **Sources Consulted**: `src/content.config.ts`
- **Findings**:
  - `tags: z.array(z.string()).optional().default([])` - タグは配列
  - `published: z.coerce.date()` - ソート用日付
  - `description: z.string().optional().default('')` - カード表示用
  - `image: image().optional()` - アイキャッチ画像
- **Implications**: 必要なフィールドはすべて既存スキーマで対応

### BlogPost レイアウト構造
- **Context**: 関連記事セクションの挿入位置を特定
- **Sources Consulted**: `src/layouts/BlogPost.astro`
- **Findings**:
  - `Comments` コンポーネントの直前（447行目付近）が適切な挿入位置
  - `features` オブジェクトで機能フラグを参照するパターンが確立済み
  - 既存のスタイル変数（`--space-*`, `--color-*`）を使用すべき
- **Implications**: 既存パターンに従い `features.relatedPosts` でフラグ制御

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| ユーティリティ関数 + Astroコンポーネント | 関連記事取得ロジックをutilsに分離、表示はAstroコンポーネント | 関心の分離、テスト容易性 | ファイル数増加 | 推奨アプローチ |
| コンポーネント内完結 | 全ロジックをRelatedPostsコンポーネント内に実装 | シンプル | ロジックのテストが困難 | 小規模機能には過剰 |

## Design Decisions

### Decision: ユーティリティ関数 + Astroコンポーネント構成
- **Context**: 関連記事機能の実装アーキテクチャ選択
- **Alternatives Considered**:
  1. コンポーネント内完結 - 実装はシンプルだがテスト困難
  2. ユーティリティ分離 - テスト可能だがファイル増
- **Selected Approach**: ユーティリティ関数でスコアリングロジックを分離
- **Rationale**: プロジェクト既存パターン（`src/utils/`）と整合、ロジックの単体テストが可能
- **Trade-offs**: ファイル数は増えるが保守性向上
- **Follow-up**: ユーティリティ関数の単体テスト実装

### Decision: タグスコアリングアルゴリズム
- **Context**: 関連記事の判定方法
- **Alternatives Considered**:
  1. 共通タグ数のみ
  2. TF-IDFベースのスコアリング
  3. カテゴリ＋タグの複合スコア
- **Selected Approach**: 共通タグ数をスコアとして計算、同点時は公開日降順
- **Rationale**: 要件に明記されたシンプルなアプローチ、実装・保守コストが低い
- **Trade-offs**: 高度なレコメンデーションには不向きだが、ブログ規模では十分
- **Follow-up**: 将来的にカテゴリ重み付けを追加可能な設計に

## Risks & Mitigations
- **記事数が少ない場合**: 関連記事が0件の場合はセクション自体を非表示（要件1.2で対応済み）
- **ビルド時間増加**: 各記事ページで全記事をスキャン → Astro Content Collectionsはキャッシュされるため影響は軽微
- **スタイル不整合**: 既存のCSS変数とコンポーネントパターンを厳守

## References
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) - 公式ドキュメント
- 既存コード: `src/pages/blog/[...slug].astro` - 記事取得パターン
- 既存コード: `src/components/FormattedDate.astro` - 日付表示コンポーネント
