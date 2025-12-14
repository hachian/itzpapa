# Implementation Plan: OG画像対応

## Tasks

- [x] 1. BlogPost.astroでheroImageをBaseHeadに受け渡す
  - 記事レイアウトコンポーネントで、取得したheroImageをヘッドコンポーネントに渡すように修正
  - heroImageが未定義の場合でも、BaseHead側でフォールバック処理されることを前提とする
  - 既存の記事表示ロジックには影響を与えない
  - _Requirements: 3.1_

- [x] 2. BaseHead.astroでOG画像フォールバックとメタタグ拡張を実装
- [x] 2.1 OG画像フォールバックロジックの実装
  - サイト設定からdefaultOgImageを取得し、Propsで画像が渡されない場合のフォールバックとして使用
  - フォールバック優先順位: Props.image → siteConfig.seo.defaultOgImage → FallbackImage
  - 静的パス（string型）とImageMetadata型の両方を適切に処理
  - _Requirements: 2.2, 3.2_

- [x] 2.2 og:image:width/heightメタタグの追加
  - ImageMetadata型の画像の場合、width/heightプロパティからサイズメタタグを出力
  - 静的パス（defaultOgImage等）の場合はサイズメタタグを省略
  - 既存のog:imageとtwitter:imageメタタグ出力は維持
  - _Requirements: 1.1, 1.2, 1.3, 4.2_

- [x] 3. 統合検証
  - ローカル開発環境でheroImage付き記事のOGメタタグ出力を確認
  - heroImage未設定記事でdefaultOgImageへのフォールバックを確認
  - ビルド成功と出力HTMLのメタタグ検証
  - _Requirements: 2.3, 4.2_

## Deferred Requirements

以下の要件は本Phase 1のスコープ外として保留:

- **2.1**: frontmatter ogImageフィールド — 将来の拡張として保留。本Phase 1ではheroImageを使用
- **4.1**: 1200x630px推奨サイズ — コンテンツ作成者の責任。システムは任意サイズを受け入れ
- **4.3**: PNG/JPG/WebP対応 — Astro標準機能で対応済み。追加実装不要
- **5.x**: 動的OG画像生成 — Phase 2として分離

## Requirements Coverage Matrix

| Requirement | Task | Status |
|-------------|------|--------|
| 1.1 | 2.2 | ✅ |
| 1.2 | 2.2 | ✅ |
| 1.3 | 2.2 | ✅ |
| 2.1 | — | 保留 |
| 2.2 | 2.1 | ✅ |
| 2.3 | 3 | ✅ |
| 3.1 | 1 | ✅ |
| 3.2 | 2.1 | ✅ |
| 3.3 | — | 既存設定で対応済み |
| 4.1 | — | コンテンツ作成者責任 |
| 4.2 | 2.2, 3 | ✅ |
| 4.3 | — | Astro標準機能 |
| 5.x | — | Phase 2 |
