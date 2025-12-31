# Research & Design Decisions

## Summary
- **Feature**: category-ui-display
- **Discovery Scope**: Extension（既存システムの拡張）
- **Key Findings**:
  - タグ実装パターン（TagBadge/TagList）が参照可能
  - BlogPost.astro の article-meta セクションにカテゴリ表示を追加可能
  - タグページ構造（index.astro + [...slug].astro）をカテゴリにも適用可能

## Research Log

### 既存タグ実装パターン
- **Context**: カテゴリUIはタグUIと類似機能のため、既存パターンを調査
- **Sources Consulted**: `src/components/TagBadge.astro`, `src/components/TagList.astro`
- **Findings**:
  - TagBadge: CSS変数によるテーマ対応、ダークモード、アクセシビリティ（aria-label, role, tabindex）
  - Props: `tag`, `href`, `count`, `className`, `ariaLabel`
  - スタイル: border-radius, transition, hover効果
- **Implications**: CategoryBadgeはTagBadgeと同様のパターンで実装可能。ただし視覚的区別のためCSS変数を別途定義

### 記事詳細ページ構造
- **Context**: カテゴリ表示位置の特定
- **Sources Consulted**: `src/layouts/BlogPost.astro`
- **Findings**:
  - メタデータ: `.article-meta` 内に公開日・更新日・読了時間を表示
  - タグ表示: `.article-tags` と `.article-footer-tags` の2箇所
  - Props: `title`, `description`, `published`, `updated`, `image`, `tags`, `headings`, `readingTime`, `slug`
- **Implications**: カテゴリは `article-meta` 内に追加。Propsに `category` を追加

### 記事一覧ページ構造
- **Context**: 記事カードへのカテゴリ表示追加
- **Sources Consulted**: `src/pages/blog/index.astro`
- **Findings**:
  - `.post-card__content` 内に title, description, date を表示
  - カテゴリ表示位置: タイトル上部または日付横が適切
- **Implications**: `.post-card__category` クラスを追加

### タグページ構造
- **Context**: カテゴリページの参照モデル
- **Sources Consulted**: `src/pages/tags/index.astro`, `src/pages/tags/[...slug].astro`
- **Findings**:
  - index.astro: 全タグ一覧、記事数表示、アルファベット順ソート
  - [...slug].astro: 特定タグの記事一覧、パンくずリスト、getStaticPaths使用
- **Implications**: `/category/` と `/category/[name]/` で同様の構造を実装

### i18n実装パターン
- **Context**: 翻訳キー追加方法
- **Sources Consulted**: `src/i18n/translations.ts`
- **Findings**:
  - `TranslationKeys` インターフェースで型定義
  - ja/en の両言語に対応
  - 命名規則: `category.key` 形式
- **Implications**: `category.*` 翻訳キーを追加

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| タグと統合 | TagBadgeを拡張してカテゴリも表示 | コード重複削減 | タグとの視覚的区別が困難 | 却下 |
| 独立コンポーネント | CategoryBadge を新規作成 | 独立した進化が可能、明確な責務分離 | 類似コード発生 | **採用** |

## Design Decisions

### Decision: CategoryBadgeを独立コンポーネントとして実装
- **Context**: タグとカテゴリは意味論的に異なる（タグ=複数、カテゴリ=単一分類）
- **Alternatives Considered**:
  1. TagBadgeを拡張してtype propで切り替え
  2. 共通BaseBadgeを作成して両者を継承
  3. 独立したCategoryBadgeを作成
- **Selected Approach**: 独立したCategoryBadge.astroを作成
- **Rationale**:
  - タグとカテゴリは将来的に異なる機能拡張が想定される
  - コードの見通しが良い
  - タグの既存コードへの影響がない
- **Trade-offs**: 類似CSSが発生するが、CSS変数で管理可能
- **Follow-up**: 将来的に共通化の必要性が出れば BaseBadge を検討

### Decision: カテゴリページURLは `/category/[name]/` 形式
- **Context**: URL設計の決定
- **Alternatives Considered**:
  1. `/categories/[name]/`（複数形）
  2. `/category/[name]/`（単数形）
- **Selected Approach**: `/category/[name]/`
- **Rationale**: 単一カテゴリを表すため単数形が適切
- **Trade-offs**: なし

## Risks & Mitigations
- **Risk 1**: カテゴリ未設定記事の表示崩れ → 条件付きレンダリングで対応（if category）
- **Risk 2**: タグとの視覚的混同 → 異なるカラースキーム（例: 青系 vs 緑系）で区別
- **Risk 3**: SEO影響 → カテゴリページにも適切なメタタグを設定

## References
- [Astro Dynamic Routes](https://docs.astro.build/en/guides/routing/#dynamic-routes)
- 既存実装: `src/components/TagBadge.astro`, `src/pages/tags/`
