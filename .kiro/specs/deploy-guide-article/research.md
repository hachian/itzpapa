# Research & Design Decisions

## Summary
- **Feature**: `deploy-guide-article`
- **Discovery Scope**: Simple Addition（Markdown記事の追加のみ、コード変更なし）
- **Key Findings**:
  - 既存記事（site-config-guide）の構造をテンプレートとして使用可能
  - フロントマターはcontent.config.tsのスキーマに準拠が必要
  - 日本語記事として作成（spec.json.language: ja）

## Research Log

### 既存記事構造の分析
- **Context**: 新しい記事が既存のスタイルと一貫性を持つように調査
- **Sources Consulted**: `src/content/blog/20260101-site-config-guide/index.md`、`src/content.config.ts`
- **Findings**:
  - フロントマター必須項目: `title`, `published`
  - フロントマターオプション項目: `description`, `tags`, `category`, `image`, `draft`, `lang`
  - 記事構造: H1タイトル → 概要 → セクション（H2）→ サブセクション（H3）
  - コードブロック: 言語指定必須（bash, typescript等）
  - 表: 設定項目や比較情報に使用
- **Implications**: 同じ構造に従うことで、サイト全体の一貫性を維持

### ファイル命名規則
- **Context**: ブログ記事のディレクトリ命名パターンを確認
- **Sources Consulted**: `.kiro/steering/structure.md`、既存記事ディレクトリ
- **Findings**:
  - 日付プレフィックス形式: `YYYYMMDD-slug/index.md`（例: `20260101-site-config-guide`）
  - または単純なslug形式: `slug/index.md`
  - Guideカテゴリの記事は日付プレフィックス形式を使用
- **Implications**: `20260112-deploy-guide/index.md` として作成

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 単一Markdown記事 | すべてのデプロイ情報を1つの記事に集約 | 一箇所で完結、参照しやすい | 記事が長くなる可能性 | 採用 |

## Design Decisions

### Decision: 記事配置場所
- **Context**: 新しい記事の配置パスを決定
- **Alternatives Considered**:
  1. `deploy-guide/index.md` - シンプルなslug
  2. `20260112-deploy-guide/index.md` - 日付プレフィックス付き
- **Selected Approach**: `20260112-deploy-guide/index.md`
- **Rationale**: 既存のGuide記事（site-config-guide）と同じ命名規則に従う
- **Trade-offs**: 日付が固定されるが、published日付との整合性が取れる

### Decision: セクション構成
- **Context**: 記事の論理的な流れを決定
- **Selected Approach**:
  1. プロジェクト取得 → 2. 必須設定 → 3. ビルド → 4. デプロイ方法 → 5. 比較表 → 6. オプション機能
- **Rationale**: 初めてのユーザーが順番に読んで実行できるフロー

## Risks & Mitigations
- **リスク**: 記事が長くなりすぎて読みにくい → 目次の自動生成機能で対応（tableOfContents: true）
- **リスク**: 外部サービス（Cloudflare Pages）の手順が変わる可能性 → 公式ドキュメントへのリンクを含める

## References
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/) - デプロイ手順の参照元
- [Astro Deployment Guide](https://docs.astro.build/en/guides/deploy/) - Astro公式デプロイガイド
