# Research & Design Decisions

## Summary
- **Feature**: blog-pagination
- **Discovery Scope**: Extension（既存のブログ一覧ページへの機能追加）
- **Key Findings**:
  - Astro標準の`paginate()`関数がページネーションを完全サポート
  - `[...page].astro`パターンで1ページ目を`/blog/`、2ページ目以降を`/blog/page/2/`形式で生成可能
  - 既存の`site.config.ts`パターンに`pagination`セクションを追加する設計

## Research Log

### Astro Pagination API
- **Context**: ページネーション実装に最適なAstro機能の調査
- **Sources Consulted**:
  - [Astro Routing Reference](https://docs.astro.build/en/reference/routing-reference/)
  - [Astro Routing Guide](https://docs.astro.build/en/guides/routing/)
- **Findings**:
  - `getStaticPaths()`から`paginate()`を返すことで自動ページ生成
  - `[...page].astro`ファイル名で1ページ目はパラメータなし（`/blog/`）、2ページ目以降は`/blog/page/2/`形式
  - `page` propに豊富なメタデータ（`currentPage`, `lastPage`, `url.prev`, `url.next`等）
- **Implications**:
  - 外部ライブラリ不要、Astro標準機能のみで実装可能
  - TypeScript型安全性も`GetStaticPaths`型で確保可能

### 既存コードベースパターン分析
- **Context**: 既存実装との整合性確認
- **Sources Consulted**:
  - `src/pages/blog/index.astro` - 現在のブログ一覧実装
  - `site.config.ts` - 設定ファイル構造
  - `src/types/site-config.ts` - 型定義パターン
  - `src/i18n/translations.ts` - 多言語対応パターン
- **Findings**:
  - 設定は`SiteConfig`インターフェースで型定義、`site.config.ts`で値設定
  - i18n対応済み（`t()`関数、`TranslationKeys`型）
  - コンポーネントはPascalCase、ファイル名も`.astro`
  - BaseHeadコンポーネントでcanonical URL、メタタグを一元管理
- **Implications**:
  - 新規`PaginationConfig`型を`src/types/site-config.ts`に追加
  - ページネーション関連の翻訳キーを`translations.ts`に追加

### URL構造設計
- **Context**: SEOとユーザビリティを両立するURL設計
- **Sources Consulted**: Astro公式ドキュメント、SEOベストプラクティス
- **Findings**:
  - `[...page].astro`（rest parameter）を使用すると1ページ目のURLがクリーン
  - `/blog/` → 1ページ目、`/blog/page/2/` → 2ページ目
  - rel="prev"/"next"リンクでSEO対応
- **Implications**:
  - `src/pages/blog/[...page].astro`に移行（`index.astro`から）
  - BaseHeadに`prev`/`next`リンク追加のprops拡張

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Astro paginate() | 標準paginate関数 | ゼロ依存、型安全、公式サポート | なし | 採用 |
| カスタム実装 | 独自ページネーションロジック | 柔軟性 | 保守コスト、バグリスク | 不採用 |

## Design Decisions

### Decision: ファイル構造
- **Context**: ページネーション導入に伴うファイル構成変更
- **Alternatives Considered**:
  1. `index.astro`維持 + `page/[page].astro`追加
  2. `[...page].astro`に統合
- **Selected Approach**: `[...page].astro`に統合
- **Rationale**:
  - 1ページ目と2ページ目以降のロジック統一
  - コードの重複排除
  - Astro推奨パターン
- **Trade-offs**: 既存`index.astro`からの移行作業が必要
- **Follow-up**: 既存URLへのリダイレクト不要（URLは変わらない）

### Decision: 設定構造
- **Context**: ページネーション設定の配置場所
- **Alternatives Considered**:
  1. `features`セクションに追加
  2. 新規`pagination`トップレベルセクション
- **Selected Approach**: 新規`pagination`トップレベルセクション
- **Rationale**:
  - 他の設定（`theme`, `navigation`等）と同レベルの独立性
  - 将来的な設定拡張に対応しやすい
- **Trade-offs**: SiteConfig型への変更が必要

## Risks & Mitigations
- **既存URL互換性** — `[...page].astro`パターンにより`/blog/`URLは維持される。リスク低。
- **パフォーマンス** — ビルド時に全ページを静的生成するため、記事数増加に比例してビルド時間増加。許容範囲内と判断。

## References
- [Astro Routing Reference](https://docs.astro.build/en/reference/routing-reference/) — paginate()関数の公式ドキュメント
- [Astro Routing Guide](https://docs.astro.build/en/guides/routing/) — 動的ルーティングの詳細
