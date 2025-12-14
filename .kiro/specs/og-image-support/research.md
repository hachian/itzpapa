# Research & Design Decisions: OG画像対応

---
**Purpose**: OG画像対応機能の設計を支援するための調査結果と意思決定の記録

---

## Summary
- **Feature**: `og-image-support`
- **Discovery Scope**: Extension（既存システムの拡張）
- **Key Findings**:
  - BaseHead.astroに既存のOGメタタグ出力基盤が存在
  - BlogPost.astroからBaseHeadへのheroImage受け渡しが欠落
  - Astroの`image()`スキーマ関数とImageMetadata型を活用可能

## Research Log

### 既存OGメタタグ実装の分析
- **Context**: 現在のOG画像処理フローを理解し、拡張ポイントを特定
- **Sources Consulted**:
  - `src/components/BaseHead.astro`
  - `src/layouts/BlogPost.astro`
  - `src/content.config.ts`
- **Findings**:
  - BaseHead.astroはPropsで`image?: ImageMetadata`を受け取る設計
  - デフォルト値として`FallbackImage`（`blog-placeholder-1.jpg`）を使用
  - `new URL(image.src, Astro.url)`で絶対URLを生成
  - BlogPost.astroは`heroImage`を受け取るが、BaseHeadに渡していない
- **Implications**:
  - 最小限の変更で実装可能（BlogPost.astroの1行修正 + BaseHead.astroの拡張）
  - 既存のImageMetadata型とimage()スキーマを活用できる

### OG画像仕様の確認
- **Context**: 主要SNSプラットフォームのOG画像要件を確認
- **Sources Consulted**: Open Graph Protocol、Twitter Card仕様
- **Findings**:
  - 推奨サイズ: 1200x630px（1.91:1アスペクト比）
  - 必須メタタグ: `og:image`
  - 推奨メタタグ: `og:image:width`, `og:image:height`, `og:image:type`
  - Twitter Card: `twitter:image`（og:imageと同じURLで可）
  - 絶対URLが必須
- **Implications**:
  - width/heightメタタグの追加が必要
  - 既存の絶対URL生成ロジックはそのまま使用可能

### siteConfig連携の調査
- **Context**: デフォルトOG画像設定の利用方法を確認
- **Sources Consulted**:
  - `src/site.config.ts`
  - `src/types/site-config.ts`
- **Findings**:
  - `siteConfig.seo.defaultOgImage`が定義済み（値: `/og-image.png`）
  - 型定義: `defaultOgImage?: string`（静的パス文字列）
  - 現在BaseHead.astroでは使用されていない
- **Implications**:
  - BaseHead.astroでsiteConfigをインポートしフォールバックに使用可能
  - 静的ファイル（publicフォルダ）とImageMetadataの両方をサポートする設計が必要

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| A: 既存コンポーネント拡張 | BaseHead/BlogPostの修正のみ | 最小変更、既存パターン踏襲 | BaseHead.astroの責務が増加 | **採用** |
| B: ユーティリティ分離 | og-image.tsに解決ロジックを外出し | テスト容易、再利用可能 | 過剰設計の可能性 | 将来的な選択肢として保留 |

## Design Decisions

### Decision: OG画像フォールバック優先順位
- **Context**: 複数の画像ソースがある場合の優先順位を決定
- **Alternatives Considered**:
  1. ogImage → heroImage → defaultOgImage
  2. heroImage → defaultOgImage（ogImageフィールド追加なし）
  3. ogImage → defaultOgImage（heroImageスキップ）
- **Selected Approach**: Option 2（heroImage → defaultOgImage）
- **Rationale**:
  - スキーマ変更を最小化
  - heroImageがすでにOG画像として適切なサイズ・内容であるケースが多い
  - 既存記事の修正が不要
- **Trade-offs**:
  - heroImageとOG画像を個別に設定する柔軟性は将来の拡張に委ねる
  - シンプルさと即時実現性を優先
- **Follow-up**:
  - 将来的にogImageフィールド追加が必要になった場合はスキーマ拡張を検討

### Decision: og:image:width/heightの値
- **Context**: 画像サイズメタタグの値をどのように取得するか
- **Alternatives Considered**:
  1. ImageMetadataから動的に取得（image.width, image.height）
  2. 固定値（1200x630）を常に使用
  3. 条件分岐（ImageMetadata利用時は動的、静的パス利用時は固定）
- **Selected Approach**: Option 1（ImageMetadataから動的取得）
- **Rationale**:
  - AstroのImageMetadata型にはwidth/heightプロパティが含まれる
  - 実際の画像サイズを反映する方が正確
  - heroImageは既にImageMetadata型で処理されている
- **Trade-offs**:
  - 静的パス（defaultOgImage）使用時はサイズ不明のためメタタグ省略
- **Follow-up**:
  - 静的パスでもサイズを指定したい場合はsiteConfig拡張を検討

### Decision: Requirement 5（動的OG画像生成）の取り扱い
- **Context**: 動的OG画像生成機能のスコープを決定
- **Alternatives Considered**:
  1. Phase 1に含める
  2. 別specとして完全分離
  3. Phase 2として本spec内で管理
- **Selected Approach**: Option 3（Phase 2として本spec内で管理）
- **Rationale**:
  - 関連性の高い機能を同一specで追跡
  - Phase 1完了後に実装判断が可能
  - 調査項目として記録を維持
- **Trade-offs**:
  - 本specの完了定義が曖昧になる可能性
  - Phase 2は別途要件承認が必要
- **Follow-up**:
  - Phase 1完了後にPhase 2実装の要否を判断

## Risks & Mitigations
- **静的defaultOgImageパスとImageMetadataの型不一致** → BaseHead.astroでユニオン型またはオーバーロード対応
- **既存FallbackImageとの競合** → defaultOgImage優先、FallbackImage削除または統合
- **heroImage未設定記事でのフォールバック失敗** → 明示的なnullチェックとデフォルト画像保証

## References
- [Open Graph Protocol](https://ogp.me/) — OGメタタグ仕様
- [Twitter Card Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/summary-card-with-large-image) — Twitter Card仕様
- [Astro Images](https://docs.astro.build/en/guides/images/) — Astroの画像処理ドキュメント
