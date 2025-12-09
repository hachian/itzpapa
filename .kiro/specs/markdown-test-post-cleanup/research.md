# Research & Design Decisions: markdown-test-post-cleanup

## Summary
- **Feature**: `markdown-test-post-cleanup`
- **Discovery Scope**: Simple Addition（ファイル操作とコンテンツ編集のみ、コード開発不要）
- **Key Findings**:
  - draft機能は既に完全実装済み（content.config.ts、各ページコンポーネント）
  - テストポスト間でWikiLink相互参照が存在（リネーム時に更新必要）
  - 15件中14件にdraft: trueフラグ追加が必要

## Research Log

### WikiLink相互参照の調査
- **Context**: リネーム時のリンク切れリスク評価
- **Sources Consulted**: `src/content/blog/`配下の全.mdファイルをGrep検索
- **Findings**:
  - テストポスト間で相互参照あり（wikilink-test → markdown-basic-test, callout-comprehensive-test等）
  - `my test page` → `test page`, `wikilink-test`への参照あり
  - `callout-wikilink-test` → `image-test`, `wikilink-test`への参照あり
  - 画像WikiLinkも複数存在（`![[../image-test/test-image.png]]`等）
- **Implications**:
  - リネーム時は参照元のWikiLinkパスも同時更新必要
  - 相対パス形式（`../xxx/index.md`）のため、フォルダ名変更がそのまま影響

### draft機能の実装状況確認
- **Context**: 要件4の達成可否確認
- **Sources Consulted**: `src/content.config.ts`, `src/pages/blog/[...slug].astro`, `src/pages/blog/index.astro`, `src/pages/rss.xml.js`
- **Findings**:
  - スキーマ: `draft: z.boolean().optional().default(false)` 定義済み
  - ブログ一覧: `import.meta.env.PROD ? data.draft !== true : true` で本番除外
  - 個別ページ: 同上のフィルタリング
  - RSS: `data.draft !== true` で常時除外
- **Implications**: 追加実装不要。フロントマターに`draft: true`追加のみで機能

### テストポスト構造の分析
- **Context**: 要件2（ディレクトリ構造統一）の対象特定
- **Findings**:
  - 非フォルダ形式: `table-style-test.md`（1件）
  - スペース含むフォルダ: `test page/`, `my test page/`（2件）
  - 命名不統一: `callout-*`, `*-test`等の混在（全15件）
- **Implications**:
  - `table-style-test.md` → `test-table/index.md`に移行必要
  - スペースフォルダ → ケバブケースにリネーム必要

## Architecture Pattern Evaluation

本タスクはファイル操作のみのため、アーキテクチャパターン評価は不要。

## Design Decisions

### Decision: 段階的実装アプローチの採用

- **Context**: 要件全体を一括実装するか、段階的に実装するかの判断
- **Alternatives Considered**:
  1. Option A: 最小変更（draft追加 + 構造統一のみ）
  2. Option B: 命名規則統一含む
  3. Option C: 完全統合（重複テスト統合含む）
- **Selected Approach**: Option A（最小変更）を基本とし、必要に応じてOption Bに拡張
- **Rationale**:
  - 要件4（本番除外）が最優先かつ即時効果あり
  - WikiLink参照更新の工数を最小化
  - リスクの低い変更から着手
- **Trade-offs**:
  - 命名規則完全統一は先送り
  - 重複テストは維持（統合は将来オプション）
- **Follow-up**: 命名統一の必要性を実装後に再評価

### Decision: WikiLink参照の同時更新

- **Context**: フォルダリネーム時の参照整合性維持
- **Selected Approach**: リネーム対象フォルダを参照するWikiLinkを全て同時更新
- **Rationale**: テスト記事として機能するためにはリンクが動作する必要がある
- **Trade-offs**: 更新作業量増加だが、テスト品質維持

## Risks & Mitigations

- **WikiLink切れリスク** — リネーム前に参照箇所を特定し、一括更新スクリプトまたは手動で対応
- **画像パス切れリスク** — フォルダ移動時に同梱画像も移動し、相対パス維持
- **ビルドエラーリスク** — 変更後に`npm run build`で検証

## References

- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) — コンテンツスキーマの公式ドキュメント
- [Astro環境変数](https://docs.astro.build/en/guides/environment-variables/) — `import.meta.env.PROD`の使用方法
