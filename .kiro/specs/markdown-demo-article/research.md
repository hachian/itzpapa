# Research & Design Decisions

## Summary
- **Feature**: markdown-demo-article
- **Discovery Scope**: Simple Addition（既存コンテンツパターンに従った記事追加）
- **Key Findings**:
  - 既存の `markdown-basic-test` 記事が基本Markdown記法の包括的なデモを既に提供している
  - 記事構造は `src/content/blog/{slug}/index.md` + 同一フォルダ内に画像配置
  - frontmatterスキーマ: title, pubDate, description, heroImage, categories, tags, draft

## Research Log

### 既存コンテンツ分析
- **Context**: 新規記事作成前に既存パターンを確認
- **Sources Consulted**: `src/content/blog/` 配下の既存記事
- **Findings**:
  - `markdown-basic-test/`: 基本Markdown記法の詳細なSyntax/Outputデモ（見出し、段落、装飾、リスト、リンク、画像、引用、コード、テーブル、HTML、エスケープ、脚注、定義リスト）
  - `integration-test/`: GFM記法とObsidian記法の統合テスト
  - `callout-comprehensive-test/`, `callout-edge-cases/`: Calloutのテスト
  - `wikilink-test/`, `mark-highlight-test/`: 個別機能テスト
- **Implications**: 基本Markdown記事は既存記事をベースに公開用として整理、独自記法記事は新規作成

### frontmatterスキーマ
- **Context**: 記事メタデータの必須・オプションフィールド確認
- **Findings**:
  - 必須: `title`, `pubDate`, `description`
  - オプション: `heroImage`, `categories`, `tags`, `draft`
  - `draft: true` でビルド時に除外される
- **Implications**: 公開用記事は `draft: false` または `draft` フィールド省略

### site.config.ts 構造
- **Context**: 設定ガイド記事の内容確認
- **Findings**:
  - 8つのセクション: site, theme, navigation, social, footer, seo, features
  - 多言語対応: `description` はオブジェクト形式可能、`language` で表示言語切替
  - テーマカラー: プリセット名または数値（0-360）
  - 機能フラグ: tableOfContents, tagCloud, relatedPosts, comments
- **Implications**: 設定ガイド記事はセクション別に説明と設定例を提示

## Architecture Pattern Evaluation

| Option | Description | Strengths | Notes |
|--------|-------------|-----------|-------|
| 既存記事リファクタリング | `markdown-basic-test` を公開用にリネーム | 既存コンテンツ活用 | 既存テスト記事が失われる |
| 新規記事作成 | 既存記事をベースに新規作成 | テスト記事と分離 | 採用 |

## Design Decisions

### Decision: 記事構成
- **Context**: GitHub公開用として整理された3記事の作成
- **Selected Approach**:
  1. `markdown-demo/` - 基本Markdown記法デモ（既存 `markdown-basic-test` ベース、公開用に整理）
  2. `obsidian-syntax-demo/` - Obsidian互換記法デモ（WikiLink、ハイライト、Callout、タグ）
  3. `site-config-guide/` - site.config.ts設定ガイド
- **Rationale**: 既存テスト記事は `draft: true` のまま保持し、公開用記事を別途作成
- **Trade-offs**: コンテンツの重複が発生するが、テスト目的と公開目的の分離が可能

## Risks & Mitigations
- Risk: 既存記事との内容重複 → 公開記事は説明文を充実させ差別化
- Risk: 画像アセットの管理 → 各記事フォルダに必要な画像を配置

## References
- 既存記事: `src/content/blog/markdown-basic-test/index.md`
- 設定ファイル: `site.config.ts`
- プロジェクト構造: `.kiro/steering/structure.md`
