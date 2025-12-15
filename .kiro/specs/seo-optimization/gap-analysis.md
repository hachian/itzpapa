# Gap Analysis: SEO Optimization

## 1. 現状調査

### 1.1 既存の関連アセット

| ファイル | 役割 | SEO関連機能 |
|---------|------|-------------|
| `src/components/BaseHead.astro` | 共通headタグ出力 | canonical URL、Open Graph、Twitter Card、メタタグ、GA |
| `src/layouts/BlogPost.astro` | ブログ記事レイアウト | OG画像の受け渡し、パンくず表示 |
| `src/components/Breadcrumb.astro` | パンくずナビ | `aria-current="page"`対応済み |
| `site.config.ts` | サイト設定 | タイトル、説明、OG画像、GA ID設定 |
| `src/pages/rss.xml.js` | RSSフィード | draft記事除外済み |
| `astro.config.mjs` | Astro設定 | `@astrojs/sitemap`統合済み |
| `src/plugins/remark-wikilink/` | WikiLink処理 | 内部リンク自動変換済み |

### 1.2 既存の実装パターン

- **メタタグ**: `BaseHead.astro`で一括管理、propsでtitle/description/imageを受け取る
- **画像最適化**: Astro `<Image>`コンポーネント使用、WebP形式、width/height指定
- **遅延読み込み**: ファーストビュー外は`loading="lazy"`、ヒーロー画像は`loading="eager"`
- **フォント**: ローカルフォントで`font-display: swap`設定済み、Google Fontsも`&display=swap`
- **URL構造**: `/blog/{slug}/`、`/tags/{tag}/`形式で統一
- **アクセシビリティ**: `aria-label`、`aria-current`使用済み

### 1.3 統合ポイント

- **構造化データ出力先**: `BaseHead.astro`またはレイアウトコンポーネント
- **記事メタデータ**: `CollectionEntry<'blog'>['data']`から取得（pubDate, updatedDate, tags）
- **サイト情報**: `siteConfig`から取得（author, baseUrl）

---

## 2. 要件別ギャップ分析

### Requirement 1: robots.txt設定

| 受入基準 | 現状 | ギャップ |
|---------|------|---------|
| robots.txt配置 | **Missing** - ファイルなし | 新規作成必要 |
| sitemap参照 | **Missing** | robots.txtに追記 |
| テストページ除外 | **Missing** | `/test-*`パターン除外設定 |

**実装方針**: `public/robots.txt`を新規作成（静的ファイル）

### Requirement 2: 構造化データ（JSON-LD）

| 受入基準 | 現状 | ギャップ |
|---------|------|---------|
| Article型JSON-LD | **Missing** - 実装なし | 新規実装必要 |
| WebSite型JSON-LD | **Missing** | トップページに追加 |
| BreadcrumbList型 | **Missing** | Breadcrumbコンポーネント拡張 |

**実装方針**:
- 新規コンポーネント`JsonLd.astro`を作成し、各ページタイプ別にスキーマ出力
- または`BaseHead.astro`にJSON-LD出力を追加

### Requirement 3: メタタグ最適化

| 受入基準 | 現状 | ギャップ |
|---------|------|---------|
| title/description設定 | **Implemented** | ✅ 対応済み |
| タイトル形式「記事名 \| サイト名」 | **Partial** - 記事タイトルのみ | 形式変更必要 |
| 説明文160文字制限 | **Missing** | ユーティリティ関数追加 |
| article:published_time | **Missing** | BaseHead.astro拡張 |
| article:modified_time | **Missing** | BaseHead.astro拡張 |
| article:tag | **Missing** | BaseHead.astro拡張 |

**実装方針**: `BaseHead.astro`を拡張し、記事用のOGタグを条件付き出力

### Requirement 4: パフォーマンス最適化

| 受入基準 | 現状 | ギャップ |
|---------|------|---------|
| WebP形式画像 | **Implemented** | ✅ `format="webp"`使用 |
| width/height設定 | **Implemented** | ✅ Imageコンポーネントで指定 |
| lazy loading | **Implemented** | ✅ 適切に設定 |
| CSSコード分割 | **Implemented** | ✅ `vite.build.cssCodeSplit: true` |
| font-display: swap | **Implemented** | ✅ ローカル・Google Fonts両対応 |

**実装方針**: 追加実装なし（要件充足済み）

### Requirement 5: アクセシビリティとSEOの統合

| 受入基準 | 現状 | ギャップ |
|---------|------|---------|
| 意味のあるalt属性 | **Partial** - 装飾画像は`alt=""`だが、コンテンツ画像のalt改善余地あり | 監査・改善必要 |
| 見出し階層 | **Implemented** | ✅ h1→h2→h3維持 |
| 単一h1 | **Implemented** | ✅ 各ページに1つ |
| aria-label設定 | **Implemented** | ✅ ナビゲーション対応済み |
| aria-current | **Implemented** | ✅ Breadcrumb対応済み |

**実装方針**: コンテンツ監査（運用ガイドライン整備）

### Requirement 6: URL構造最適化

| 受入基準 | 現状 | ギャップ |
|---------|------|---------|
| /blog/{slug}/ | **Implemented** | ✅ 対応済み |
| /tags/{tag}/ | **Implemented** | ✅ 対応済み |
| 末尾スラッシュ統一 | **Partial** | Astro設定確認必要 |
| canonical URL | **Implemented** | ✅ BaseHead対応済み |

**実装方針**: `astro.config.mjs`で`trailingSlash`設定確認・統一

### Requirement 7: 内部リンク構造

| 受入基準 | 現状 | ギャップ |
|---------|------|---------|
| 関連タグリンク | **Implemented** | ✅ BlogPost.astro対応済み |
| パンくずリンク | **Implemented** | ✅ Breadcrumb対応済み |
| WikiLink変換 | **Implemented** | ✅ remark-wikilinkプラグイン |
| タグ→記事リンク | **Implemented** | ✅ tags/[...slug].astro対応済み |

**実装方針**: 追加実装なし（要件充足済み）

---

## 3. 実装アプローチオプション

### Option A: BaseHead.astro拡張アプローチ

**概要**: 既存の`BaseHead.astro`を拡張してすべてのSEO機能を追加

**対象要件**: Req 2（部分）, Req 3

**トレードオフ**:
- ✅ 単一ファイルで管理、変更箇所が明確
- ✅ 既存パターンを踏襲
- ❌ BaseHeadが肥大化する可能性
- ❌ ページタイプ別の条件分岐が複雑化

### Option B: 新規コンポーネント分離アプローチ

**概要**: JSON-LD用に`JsonLd.astro`、記事用OGタグに`ArticleMeta.astro`を新規作成

**対象要件**: Req 2, Req 3

**トレードオフ**:
- ✅ 責務が明確に分離
- ✅ 再利用性が高い
- ❌ ファイル数増加
- ❌ 呼び出し元での組み込みが必要

### Option C: ハイブリッドアプローチ（推奨）

**概要**:
- JSON-LDは新規コンポーネント`JsonLd.astro`で分離（複雑なスキーマ構造）
- OGタグは`BaseHead.astro`を拡張（シンプルな条件分岐）
- robots.txtは静的ファイルとして`public/`に配置

**対象要件**: 全要件

**トレードオフ**:
- ✅ 複雑な部分のみ分離、シンプルな部分は既存拡張
- ✅ 段階的に実装可能
- ❌ 判断基準を明確にする必要あり

---

## 4. 実装複雑度・リスク評価

| 要件 | 工数 | リスク | 理由 |
|------|------|--------|------|
| Req 1: robots.txt | **S** | **Low** | 静的ファイル作成のみ |
| Req 2: JSON-LD | **M** | **Medium** | スキーマ構造の理解必要、テスト必要 |
| Req 3: メタタグ | **S** | **Low** | 既存パターン拡張 |
| Req 4: パフォーマンス | **-** | **-** | 実装済み |
| Req 5: アクセシビリティ | **S** | **Low** | 監査・ガイドライン整備 |
| Req 6: URL構造 | **S** | **Low** | 設定確認・調整 |
| Req 7: 内部リンク | **-** | **-** | 実装済み |

**総合工数**: **M**（3-5日）
**総合リスク**: **Low-Medium**

---

## 5. 設計フェーズへの推奨事項

### 優先アプローチ

**Option C（ハイブリッドアプローチ）** を推奨。理由：
1. JSON-LDの複雑なスキーマは独立コンポーネントが適切
2. OGタグ拡張はBaseHeadの既存パターンに沿う
3. robots.txtは静的ファイルで簡潔に実装

### 設計フェーズで決定すべき事項

1. **JSON-LDコンポーネント設計**:
   - 単一の汎用コンポーネント vs ページタイプ別コンポーネント
   - propsインターフェース設計

2. **タイトルテンプレート**:
   - 「記事タイトル | サイト名」形式の実装箇所（BaseHead vs 呼び出し元）

3. **説明文切り詰め**:
   - ユーティリティ関数の配置場所（`src/utils/seo/`など）

### Research Needed（要調査）

- JSON-LDスキーマの最新ベストプラクティス（Google Search Central）
- Astroの`trailingSlash`設定オプション確認
