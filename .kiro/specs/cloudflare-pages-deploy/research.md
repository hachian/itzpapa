# Research & Design Decisions

## Summary
- **Feature**: cloudflare-pages-deploy
- **Discovery Scope**: Extension（既存のAstro静的サイトにデプロイ設定を追加）
- **Key Findings**:
  - 静的サイト（SSG）の場合、`@astrojs/cloudflare`アダプターは不要
  - Cloudflare Pagesはビルドプリセット「Astro」をサポートしており、`npm run build`と`dist/`の設定で即座にデプロイ可能
  - Wranglerファイル（`wrangler.jsonc`）はオプションだが、ローカル開発・デバッグに有用

## Research Log

### Astroアダプター要否の調査
- **Context**: Requirement 1で`@astrojs/cloudflare`アダプターの統合が要件として定義されていた
- **Sources Consulted**:
  - [Astro Cloudflare Deploy Guide](https://docs.astro.build/en/guides/deploy/cloudflare/)
  - [Cloudflare Pages Astro Framework Guide](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/)
- **Findings**:
  - `@astrojs/cloudflare`アダプターはSSR（サーバーサイドレンダリング）使用時のみ必要
  - 静的サイト（デフォルトのAstro設定）ではアダプター不要で、`npm run build`の出力をそのままデプロイ可能
  - 現プロジェクト（itzpapa）は`output: 'server'`設定がなく、純粋な静的サイト
- **Implications**:
  - アダプターインストールは不要 → 要件1の修正が必要
  - 依存関係の追加なしでデプロイ可能

### Cloudflare Pages ビルド設定
- **Context**: GitHub連携での自動デプロイ設定を調査
- **Sources Consulted**:
  - [Cloudflare Pages Build Configuration](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/)
- **Findings**:
  - Framework preset: `Astro`を選択すると自動設定
  - Build command: `npm run build`
  - Output directory: `dist`
  - Node.js version: Cloudflare Pagesで設定可能（環境変数`NODE_VERSION`）
  - 自動Preview deploymentはGitHub連携で標準サポート
- **Implications**:
  - 最小限の設定でデプロイ可能
  - wrangler.jsonc作成はオプション（ローカルテスト用）

### Node.jsバージョン互換性
- **Context**: プロジェクトがCloudflare Pages環境で動作するか確認
- **Sources Consulted**: プロジェクトのpackage.json、Astro v5ドキュメント
- **Findings**:
  - Astro v5はNode.js 18.14.1以上を要求
  - Cloudflare PagesはNODE_VERSION環境変数で指定可能
  - sharpパッケージ（画像最適化）はNode.js 18+で動作
- **Implications**: NODE_VERSION=18を明示的に設定することを推奨

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Static Site (SSG) | デフォルトのAstroビルド、静的HTML生成 | 依存関係なし、高速、シンプル | SSR機能は使用不可 | 現プロジェクトに適合 |
| SSR with Adapter | `@astrojs/cloudflare`使用、Pages Functions活用 | 動的レンダリング可能 | 追加依存、複雑性増加 | 現時点では不要 |

**選択**: Static Site (SSG) - アダプターなしでのデプロイ

## Design Decisions

### Decision: アダプターなしの静的サイトデプロイ
- **Context**: Requirement 1では`@astrojs/cloudflare`アダプターの統合を想定していたが、調査の結果不要と判明
- **Alternatives Considered**:
  1. アダプターをインストールしてSSR対応 — 将来の動的機能に備える
  2. アダプターなしで静的サイトとしてデプロイ — 現行機能を維持
- **Selected Approach**: アダプターなしの静的サイトデプロイ
- **Rationale**:
  - 現プロジェクトは完全に静的サイトとして設計されている
  - 不要な依存関係の追加を避ける
  - シンプルさと保守性を優先
- **Trade-offs**: 将来SSR機能が必要になった場合はアダプター追加が必要
- **Follow-up**: 要件1の受入基準を静的デプロイ向けに修正

### Decision: wrangler.jsonc の作成
- **Context**: ローカル開発とデプロイ検証のためのWrangler設定
- **Alternatives Considered**:
  1. wrangler.jsonc作成 — ローカルでPages環境をエミュレート可能
  2. Wrangler設定なし — Cloudflareダッシュボードのみで管理
- **Selected Approach**: wrangler.jsonc作成（オプション、推奨）
- **Rationale**:
  - `wrangler pages dev`でローカルプレビュー可能
  - CI/CD設定の明文化
- **Trade-offs**: ファイル追加によるリポジトリ管理コスト（最小）
- **Follow-up**: `.gitignore`への`.wrangler/`追加確認

## Risks & Mitigations
- **Risk 1**: sharpパッケージがCloudflare Pagesビルド環境で動作しない可能性
  - **Mitigation**: 事前にビルドテストを実施、必要に応じて画像最適化設定を調整
- **Risk 2**: Node.jsバージョン不整合によるビルド失敗
  - **Mitigation**: NODE_VERSION環境変数を明示的に設定
- **Risk 3**: trailingSlash設定がCloudflare Pagesで正しく機能しない
  - **Mitigation**: デプロイ後にリダイレクト動作を検証

## References
- [Deploy your Astro Site to Cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare/) — Astro公式デプロイガイド
- [Cloudflare Pages Astro Framework Guide](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/) — Cloudflare公式ガイド
- [@astrojs/cloudflare Adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) — SSR使用時のアダプター設定
