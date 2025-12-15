# ギャップ分析: OG画像対応

## エグゼクティブサマリー

既存のコードベースにはOG画像関連の基盤が**ほぼ揃っている**状態です。主な課題は、BlogPost.astroで`heroImage`が`BaseHead`コンポーネントに渡されていないという1つの欠落に集約されます。

### 主要な発見

1. **基盤は既存**: `og:image`、`twitter:image`メタタグの出力ロジックは`BaseHead.astro`に実装済み
2. **設定構造あり**: `siteConfig.seo.defaultOgImage`でデフォルトOG画像パスが定義可能
3. **接続の欠落**: `BlogPost.astro`が`heroImage`を`BaseHead`に渡していない（31行目）
4. **スキーマ未対応**: コンテンツスキーマに`ogImage`フィールドが存在しない

---

## 1. 現状分析

### 1.1 既存アセット

| コンポーネント | パス | 役割 |
|--------------|------|------|
| BaseHead.astro | `src/components/BaseHead.astro` | OGメタタグ出力（og:image, twitter:image） |
| site.config.ts | `site.config.ts` | サイト設定（defaultOgImage定義あり） |
| site-config.ts (型) | `src/types/site-config.ts` | SeoConfig型定義（defaultOgImage?） |
| content.config.ts | `src/content.config.ts` | コンテンツスキーマ（heroImageのみ） |
| BlogPost.astro | `src/layouts/BlogPost.astro` | 記事レイアウト |

### 1.2 既存実装の詳細

#### BaseHead.astro (行78-85)
```astro
<!-- Open Graph / Facebook -->
<meta property="og:image" content={new URL(image.src, Astro.url)} />

<!-- Twitter -->
<meta property="twitter:image" content={new URL(image.src, Astro.url)} />
```

- `image`プロパティはオプションで、デフォルトは`FallbackImage`（`blog-placeholder-1.jpg`）
- `og:image:width`と`og:image:height`は未実装

#### site.config.ts (行110-111)
```typescript
seo: {
  defaultOgImage: '/og-image.png',
```

- 設定は存在するが、`BaseHead.astro`では使用されていない

#### BlogPost.astro (行31)
```astro
<BaseHead title={title} description={description} />
```

- `heroImage`を`BaseHead`に渡していない

### 1.3 コンベンション

- **命名**: PascalCase（コンポーネント）、kebab-case（ファイル）
- **インポート**: 相対パス使用
- **型安全**: TypeScript strict mode

---

## 2. 要件-アセットマッピング

| 要件 | 必要な技術要素 | 現状 | ギャップ |
|-----|--------------|------|---------|
| **Req 1**: OGメタタグ出力 | og:image, og:image:width/height, twitter:image | 部分実装 | **Missing**: width/height |
| **Req 2**: 記事別OG画像指定 | frontmatter ogImage, スキーマ拡張 | 未実装 | **Missing**: ogImageフィールド |
| **Req 3**: デフォルトOG画像 | heroImageフォールバック、siteConfig連携 | 設定のみ | **Missing**: フォールバックロジック |
| **Req 4**: OG画像仕様準拠 | 絶対URL、サイズ出力 | 部分実装 | **Missing**: サイズメタタグ |
| **Req 5**: 動的OG画像生成 | 画像生成ライブラリ | 未実装 | **Unknown**: 要調査 |

---

## 3. 実装アプローチ

### Option A: 既存コンポーネント拡張

**対象**: `BaseHead.astro`、`BlogPost.astro`、`content.config.ts`の修正

#### 修正箇所

1. **content.config.ts**: `ogImage`フィールドをスキーマに追加
2. **BlogPost.astro**: `heroImage`（または`ogImage`）を`BaseHead`に渡す
3. **BaseHead.astro**:
   - `og:image:width`/`og:image:height`を追加
   - `siteConfig.seo.defaultOgImage`へのフォールバックを実装

#### トレードオフ
- ✅ 最小限の変更で済む
- ✅ 既存パターンに従う
- ❌ BaseHead.astroのprops型を変更する必要あり

### Option B: OG画像専用ユーティリティ作成

**対象**: 新規ユーティリティモジュールの作成

#### 新規ファイル

1. **src/utils/og-image.ts**: OG画像URL解決ロジック
2. 他はOption Aと同様

#### トレードオフ
- ✅ ロジックが分離され再利用可能
- ✅ テストが書きやすい
- ❌ ファイル数が増える
- ❌ この規模では過剰設計の可能性

### Option C: ハイブリッド（推奨）

**対象**: Option Aベース + Requirement 5用に段階的拡張

#### Phase 1: 基本機能（Option A）
- Req 1-4を既存コンポーネント拡張で実装

#### Phase 2: 動的生成（オプション）
- Req 5は別タスクとして切り出し
- satori/resvgなどのライブラリ調査が必要

#### トレードオフ
- ✅ 段階的に実装可能
- ✅ 早期に価値を提供
- ❌ Phase 2は要調査項目が多い

---

## 4. 複雑性とリスク評価

### Phase 1（Req 1-4）

| 項目 | 評価 | 根拠 |
|-----|------|------|
| **工数** | **S** (1-3日) | 既存パターンの拡張、4ファイル程度の修正 |
| **リスク** | **Low** | 明確なスコープ、既知のAstroパターン |

### Phase 2（Req 5: 動的OG画像生成）

| 項目 | 評価 | 根拠 |
|-----|------|------|
| **工数** | **M** (3-7日) | 画像生成ライブラリ選定・統合、フォント設定 |
| **リスク** | **Medium** | 新規技術導入、日本語フォント対応の不確実性 |

---

## 5. 設計フェーズへの推奨事項

### 推奨アプローチ
**Option C（ハイブリッド）** - Phase 1を優先実装

### 決定事項
- Phase 1（Req 1-4）を設計・実装する
- Phase 2（Req 5）は将来のオプションとして記録

### 調査項目（Research Needed）
1. **動的OG画像生成ライブラリ**: satori + resvg vs @vercel/og vs 他の選択肢
2. **日本語フォント**: Noto Sans JP のサブセット対応
3. **ビルド時生成 vs オンデマンド生成**: Astroのエンドポイント機能との統合方法

### キーとなる設計決定（設計フェーズで確定）
1. `ogImage`フィールドの追加か、`heroImage`の自動利用か
2. デフォルトOG画像の解決順序（ogImage → heroImage → defaultOgImage）
3. og:image:width/heightの取得方法（静的値 vs 動的取得）
