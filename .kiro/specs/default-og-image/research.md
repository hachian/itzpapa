# Research & Design Decisions

## Summary
- **Feature**: `default-og-image`
- **Discovery Scope**: Extension（既存のOG画像システムを動的生成に拡張）
- **Key Findings**:
  - Satori + Sharp の組み合わせがAstroでのOG画像生成のデファクトスタンダード
  - sharpは既存の依存関係として存在、satoriのみ追加が必要
  - 日本語フォントはTTF/OTF/WOFF形式が必要（WOFF2非対応）

## Research Log

### Astroでの動的OG画像生成パターン
- **Context**: 記事ごとにタイトルを含むOG画像を自動生成する方法を調査
- **Sources Consulted**:
  - [Astro OG with Satori - skyfall.dev](https://skyfall.dev/posts/astro-og-with-satori)
  - [Dynamic OG Images with Satori - bepyan.me](https://bepyan.me/en/post/astro-dynamic-og/)
  - [GitHub: vercel/satori](https://github.com/vercel/satori)
- **Findings**:
  - SatoriはHTML/CSSをSVGに変換するVercel製ライブラリ
  - SharpでSVGをPNGに変換（OGはSVG非対応のため）
  - `pages/og/[...slug].png.ts` パターンでビルド時に静的生成
  - `export const prerender = true` で静的生成を保証
- **Implications**:
  - Astroのエンドポイント機能を活用してビルド時に画像生成
  - CloudflareなどのエッジランタイムではSharpが動作しないため、ビルド時生成が必須

### 日本語フォント対応
- **Context**: Satoriで日本語テキストを正しくレンダリングする方法
- **Sources Consulted**:
  - [Satori GitHub - Font Usage](https://github.com/vercel/satori)
  - [Noto Sans JP - Google Fonts](https://fonts.google.com/noto/specimen/Noto+Sans+JP)
- **Findings**:
  - SatoriはTTF、OTF、WOFFをサポート（WOFF2は非対応）
  - フォントはArrayBuffer/Bufferとして渡す必要がある
  - Noto Sans JPは6,355漢字、仮名をカバー
  - `lang="ja-JP"` 属性で日本語レンダリングを指定可能
  - 可変フォントウェイトにバグあり、固定ウェイトを推奨
- **Implications**:
  - Noto Sans JPのTTFファイルをプロジェクトに含める
  - 固定ウェイト（Regular: 400, Bold: 700）を使用

### 既存コードパターン分析
- **Context**: プロジェクト内の既存画像生成パターンを調査
- **Sources Consulted**:
  - `scripts/generate-logo.js` - ロゴ/ファビコン生成
  - `src/components/BaseHead.astro` - OG画像参照
  - `src/layouts/BlogPost.astro` - heroImage表示
- **Findings**:
  - `generate-logo.js`: SVG生成スクリプト、ビルド前に実行
  - sharpは `^0.34.2` で既にインストール済み
  - OG画像フォールバック: Props.image → siteConfig.seo.defaultOgImage → FallbackImage
  - heroImage未設定時は `defaultHeroLight`/`defaultHeroDark` を表示
- **Implications**:
  - 既存パターンに沿ってビルドスクリプトとして実装可能
  - BaseHead.astroとBlogPost.astroの修正が必要

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Astro Endpoint | `pages/og/[...slug].png.ts` でビルド時生成 | Astroネイティブ、静的生成、キャッシュ効率 | ビルド時間増加 | 推奨パターン |
| Build Script | `scripts/generate-og.js` で一括生成 | シンプル、既存パターン踏襲 | Astroコンテンツコレクションとの統合が複雑 | 代替案 |
| Runtime API | サーバーレス関数で動的生成 | オンデマンド、ビルド時間短縮 | エッジランタイム非対応、レイテンシ | SSGプロジェクトには不適 |

**Selected**: Astro Endpoint パターン - SSGの利点を維持しつつAstroネイティブな統合が可能

## Design Decisions

### Decision: 画像生成ライブラリ選定
- **Context**: OG画像に記事タイトルを重ねる機能の実装方法
- **Alternatives Considered**:
  1. Satori + Sharp — HTML/CSSベースのSVG生成 → PNG変換
  2. Sharp単体 — 画像合成とテキスト描画
  3. Canvas (node-canvas) — Canvas APIベースの描画
- **Selected Approach**: Satori + Sharp
- **Rationale**:
  - SatoriはJSX記法でレイアウトを定義可能、デザイン変更が容易
  - Sharpは既存依存関係として存在
  - Astroコミュニティで広く採用されているパターン
- **Trade-offs**:
  - Satori追加（+バンドルサイズ）
  - WOFF2非対応のためフォントファイルサイズ増加
- **Follow-up**: satoriのバージョンはlatest（0.10.x）を使用

### Decision: 日本語フォント戦略
- **Context**: 日本語タイトルの正確なレンダリング
- **Alternatives Considered**:
  1. Noto Sans JP TTF（ローカルファイル）
  2. Google Fonts CDNからランタイム取得
  3. サブセット化した軽量フォント
- **Selected Approach**: Noto Sans JP Regular/Bold TTF（ローカルファイル）
- **Rationale**:
  - ビルド時に確実にフォントが利用可能
  - CDN依存を排除しビルドの安定性確保
  - プロジェクトで既にNoto Sans JPを使用（Google Fonts経由）
- **Trade-offs**:
  - フォントファイル追加（約15MB for full set、サブセットで削減可能）
- **Follow-up**: 必要に応じてサブセット化を検討

### Decision: 画像出力パス設計
- **Context**: 生成されたOG画像とheroImageの配置場所
- **Alternatives Considered**:
  1. `/og/{slug}.png` — OG専用ディレクトリ
  2. `/blog/{slug}/og.png` — 記事ディレクトリ内
  3. `/_generated/og/{slug}.png` — 生成ファイル専用ディレクトリ
- **Selected Approach**:
  - OG画像: `/og/{slug}.png`
  - heroImage: `/hero/{slug}-light.png`, `/hero/{slug}-dark.png`
- **Rationale**:
  - URLがシンプルで予測可能
  - 生成画像と静的コンテンツの分離
  - ダークモード対応のための命名規則
- **Trade-offs**: ディレクトリ構造の変更が必要

## Risks & Mitigations
- **ビルド時間増加** — 画像生成は並列化、キャッシュ戦略を検討
- **フォントファイルサイズ** — 必要に応じてサブセット化ツール（glyphhanger等）を導入
- **Satori/Sharp互換性** — バージョン固定、ビルドテストで検証

## References
- [Satori GitHub](https://github.com/vercel/satori) — Satori公式ドキュメント
- [Astro OG with Satori](https://skyfall.dev/posts/astro-og-with-satori) — Astro実装チュートリアル
- [Dynamic OG Images in Astro](https://bepyan.me/en/post/astro-dynamic-og/) — 詳細な実装例
- [Noto Sans JP - Google Fonts](https://fonts.google.com/noto/specimen/Noto+Sans+JP) — フォント公式ページ
