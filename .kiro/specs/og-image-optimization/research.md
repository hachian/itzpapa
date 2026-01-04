# Research & Design Decisions

## Summary
- **Feature**: `og-image-optimization`
- **Discovery Scope**: Extension（既存OG画像生成システムの拡張）
- **Key Findings**:
  - sharpはWebP/PNG両形式で詳細な圧縮オプションをサポート
  - 主要SNS（Twitter、Facebook、LinkedIn）は2025年時点でWebPを完全サポート
  - 既存APIシグネチャを維持しながら内部実装の変更が可能

## Research Log

### sharp WebP/PNG 出力オプション
- **Context**: 圧縮設定のカスタマイズ要件を満たすため、sharpのAPI仕様を調査
- **Sources Consulted**: [sharp API Output Documentation](https://sharp.pixelplumbing.com/api-output/)
- **Findings**:
  - WebP: `quality`（1-100、デフォルト80）、`effort`（0-6）、`lossless`オプションあり
  - PNG: `compressionLevel`（0-9、デフォルト6）、`palette`、`effort`オプションあり
  - 両形式とも`force`オプションで強制変換可能
- **Implications**:
  - WebPはquality=80がデフォルトで十分な品質
  - PNG compressionLevel=9で最大圧縮可能だがビルド時間増加

### SNS WebPサポート状況
- **Context**: WebPをデフォルトにしてSNS互換性に問題がないか確認
- **Sources Consulted**: [Ctrl blog](https://www.ctrl.blog/entry/webp-ogp.html), [joost.blog](https://joost.blog/use-avif-webp-share-images/)
- **Findings**:
  - Twitter/X: ✅ サポート
  - Facebook: ✅ サポート（ドキュメント上は非対応と記載だが実動作は対応）
  - LinkedIn: ✅ サポート（2024年12月〜）
  - Xing: ❌ 唯一の非対応プラットフォーム
- **Implications**: WebPデフォルトで問題なし

### 既存実装の拡張ポイント
- **Context**: 既存APIを破壊せずに機能追加する方法を調査
- **Sources Consulted**: `src/utils/og-image/image-generator.ts`、`site.config.ts`
- **Findings**:
  - 現在: `sharp(Buffer.from(svg)).png().toBuffer()` でデフォルトPNG出力
  - 変更点: `.webp({ quality }).toBuffer()` への切り替え
  - `siteConfig.ogImage` に圧縮設定を追加可能
  - 既存関数シグネチャ（`generateOgImage`, `generateHeroImage`, `generateDefaultOgImage`）は変更不要
- **Implications**:
  - 内部実装のみの変更でAPI互換性維持可能
  - APIルートファイル名（`.png.ts`）は維持し、Content-Typeを動的に設定

### ファイル拡張子とURL設計
- **Context**: WebP出力時のURL設計とAstroルーティングの整合性
- **Sources Consulted**: Astro Pages documentation、既存ルート構造
- **Findings**:
  - 現在のルート: `[...slug].png.ts` → URL: `/og/slug.png`
  - SNSクローラーはContent-Typeヘッダーを参照（拡張子ではない）
  - URL変更は既存参照の破壊を伴う
- **Implications**:
  - ルートファイル名は`.png.ts`のまま維持
  - Content-Typeヘッダーで実際のフォーマットを通知
  - URL安定性を優先（breaking change回避）

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| A: 内部変更のみ | 出力フォーマットを変更、URL維持 | API互換性維持、最小変更 | URL拡張子と実フォーマット不一致 | **採用** |
| B: ルートファイル名変更 | `.webp.ts`に変更 | URL・フォーマット一致 | 既存参照の破壊 | 不採用 |
| C: 両拡張子対応 | `.png.ts`と`.webp.ts`両方用意 | 移行容易 | コード重複 | 将来検討可 |

## Design Decisions

### Decision: URL安定性優先
- **Context**: WebPデフォルト化に伴うURL設計
- **Alternatives Considered**:
  1. ルートファイルを`.webp.ts`にリネーム（クリーンだがbreaking change）
  2. URLは`.png`のままWebPを配信（Content-Type正しく設定）
- **Selected Approach**: Option 2 - URL維持、Content-Type動的設定
- **Rationale**: SNSクローラーはContent-Typeを参照。URL変更は既存のOGタグ参照を破壊する
- **Trade-offs**: URL拡張子と実フォーマットの不一致（実害なし）
- **Follow-up**: 将来的に`.webp`ルートを追加し、リダイレクトを設定可能

### Decision: 圧縮設定のデフォルト値
- **Context**: quality/compressionLevelの最適なデフォルト値
- **Alternatives Considered**:
  1. WebP quality=80（sharpデフォルト）
  2. WebP quality=85（高品質寄り）
  3. WebP quality=75（サイズ優先）
- **Selected Approach**: WebP quality=80、PNG compressionLevel=9
- **Rationale**: sharpのデフォルト値は十分な品質。PNGは最大圧縮でサイズ削減
- **Trade-offs**: PNG生成時間がやや増加（許容範囲）
- **Follow-up**: 実際のビルド時間を計測し、必要に応じて調整

## Risks & Mitigations
- **Risk 1**: URL拡張子と実フォーマット不一致による混乱 → Content-Typeヘッダーで明示
- **Risk 2**: 一部SNS（Xing）での表示問題 → 利用者が少数のため許容。PNG fallback設定で対応可
- **Risk 3**: ビルド時間増加 → WebP effort=4（デフォルト）維持で対応

## References
- [sharp API Output](https://sharp.pixelplumbing.com/api-output/) — WebP/PNGオプション詳細
- [Ctrl blog - WebP OGP](https://www.ctrl.blog/entry/webp-ogp.html) — SNS対応状況
- [joost.blog - AVIF/WebP share images](https://joost.blog/use-avif-webp-share-images/) — 最新互換性情報
