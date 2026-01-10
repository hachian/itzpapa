# Research & Design Decisions

## Summary
- **Feature**: search-feature
- **Discovery Scope**: Extension（既存のAstroブログサイトへの機能追加）
- **Key Findings**:
  - Astroの静的サイト生成の特性上、クライアントサイド検索が最適
  - `getCollection('blog')` で全記事の `body` (Markdownの生テキスト) を取得可能
  - 既存の `Pagination` コンポーネントを再利用可能
  - i18n システム (`src/i18n/`) が整備されており、検索UIの翻訳対応が容易

## Research Log

### Astro静的サイトでの検索実装アプローチ
- **Context**: SSGサイトでの検索機能実装方法の検討
- **Sources Consulted**: Astro公式ドキュメント、既存コードベース分析
- **Findings**:
  - Astroは静的サイト生成（SSG）のため、サーバーサイド検索は不可
  - 選択肢: (1) 外部検索サービス (Algolia等)、(2) クライアントサイド検索
  - クライアントサイド検索はビルド時にインデックスを生成し、ブラウザで検索実行
- **Implications**: シンプルさとコスト面からクライアントサイド検索を採用

### コンテンツ構造の分析
- **Context**: ブログ記事データの取得方法と構造の確認
- **Sources Consulted**: `src/pages/blog/[...slug].astro`, `src/pages/blog/[...page].astro`
- **Findings**:
  - `getCollection('blog')` で全記事取得可能
  - 各記事は `id`, `data` (frontmatter), `body` (Markdown生テキスト) を持つ
  - `data.draft === true` の記事は本番除外のパターンが確立
  - slugは `YYYYMMDD-` プレフィックスを除去して生成
- **Implications**: `body` フィールドで部分一致検索が実現可能

### 検索結果からのページ内ナビゲーション
- **Context**: 検索結果クリック時に該当箇所までスクロールする方法
- **Findings**:
  - URLフラグメント (`#search-hit-xxx`) でページ内位置を指定
  - `Element.scrollIntoView()` または CSSの `:target` 擬似クラスでスクロール
  - Markdownから生成されるHTMLには既存のheading IDがある
  - 検索ヒット箇所には動的にIDを付与する必要あり
- **Implications**:
  - 記事ページ側でクエリパラメータからハイライト処理を実行
  - ヒット箇所のテキストをもとにDOM内を検索してスクロール

### 既存Paginationコンポーネントの分析
- **Context**: 検索結果でのページネーション再利用可能性
- **Sources Consulted**: `src/components/Pagination.astro`
- **Findings**:
  - Props: `currentPage`, `lastPage`, `prevUrl`, `nextUrl`, `baseUrl`
  - レスポンシブ対応、ダークモード対応済み
  - 7ページ以下は全表示、超過時は省略記号使用
- **Implications**: 検索結果用に軽微な調整で再利用可能（URLにクエリパラメータ追加）

### i18nシステムの分析
- **Context**: 検索UI翻訳対応の確認
- **Sources Consulted**: `src/i18n/index.ts`, `src/i18n/translations.ts`
- **Findings**:
  - `t(key)` 関数で翻訳テキスト取得
  - `TranslationKeys` インターフェースに新キー追加で対応
  - 日本語・英語の2言語対応
- **Implications**: 検索関連の翻訳キーを `TranslationKeys` に追加

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| ビルド時インデックス生成 + クライアント検索 | ビルド時にJSONインデックスを生成し、クライアントで検索 | シンプル、外部依存なし、コスト0 | 大量記事時のインデックスサイズ | 現時点の記事数では問題なし |
| 外部検索サービス (Algolia) | 専用検索エンジンに委託 | 高速、スケーラブル | 有料、外部依存 | 現時点では過剰 |

## Design Decisions

### Decision: クライアントサイド検索の採用
- **Context**: SSGサイトでの検索機能実装方法
- **Alternatives Considered**:
  1. 外部検索サービス (Algolia, MeiliSearch) — 高機能だが有料・外部依存
  2. クライアントサイド検索 (ビルド時インデックス) — シンプル、無料
- **Selected Approach**: クライアントサイド検索
- **Rationale**:
  - 現在の記事数（約20件）では軽量なインデックスで十分
  - 外部サービスへの依存を避け、シンプルな構成を維持
  - Astroのビルドプロセスとの親和性が高い
- **Trade-offs**: 記事数が数百を超えるとインデックスサイズが課題になる可能性
- **Follow-up**: 将来的に記事が大量になった場合、外部サービスへの移行を検討

### Decision: 検索インデックスの構造
- **Context**: 部分一致検索とコンテキスト表示のためのデータ構造
- **Selected Approach**:
  - 記事ごとに `slug`, `title`, `body`（プレーンテキスト化）を含むJSONを生成
  - 検索時にクライアントで `body.toLowerCase().includes(query)` を実行
- **Rationale**:
  - 複雑な全文検索ライブラリを避け、シンプルな部分一致で要件を満たす
  - プレーンテキスト化により、Markdown記法を除去した検索が可能
- **Trade-offs**: 高度な検索機能（フレーズ検索、ファジーマッチ）は非対応

### Decision: ヒット箇所へのスクロール実装
- **Context**: 検索結果クリック時に記事内の該当箇所にスクロールする方法
- **Selected Approach**:
  - URLクエリパラメータ `?highlight=検索語` を使用
  - 記事ページのクライアントスクリプトでテキストノードを検索
  - 最初のヒット箇所に `<mark>` タグを挿入しスクロール
- **Rationale**:
  - フラグメントID方式は事前にIDが必要で動的検索と相性が悪い
  - クエリパラメータ方式ならビルド済みページでも動的対応可能
- **Trade-offs**: JavaScriptが無効な環境では機能しない

## Risks & Mitigations
- **Risk**: 記事数増加によるインデックスサイズ肥大化
  - **Mitigation**: 将来的にはインデックスの分割やlazy loadを検討
- **Risk**: 長文記事での検索パフォーマンス低下
  - **Mitigation**: Web Workerでの検索処理検討（現時点では不要）
- **Risk**: Markdown記法がプレーンテキスト化で完全に除去されない
  - **Mitigation**: テスト時に確認、必要に応じて正規表現を調整

## References
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) — コンテンツ取得API
- 既存コードベース: `src/pages/blog/[...page].astro` — ページネーションパターン
- 既存コードベース: `src/components/Pagination.astro` — 再利用コンポーネント
