# Design Document: prose-blog-padding

## Overview
**Purpose**: ブログ記事本文（`.prose`クラス）のパディングを調整し、読みやすさを向上させる。
**Users**: ブログ閲覧者がより快適に記事を読めるようになる。
**Impact**: `BlogPost.astro`内のスタイル定義を調整。他のコンポーネントへの影響なし。

### Goals
- `.prose.blog-content`のパディングを適切な値に調整
- デスクトップ・モバイル両方で読みやすい余白を確保
- 既存のレイアウト（目次付き・目次なし）との整合性維持

### Non-Goals
- 新規CSSファイルの作成
- `.prose`以外の要素のスタイル変更
- Callout、テーブル、コードブロック等の子要素への影響

## Architecture

### Existing Architecture Analysis
現在の`.prose`スタイルは`BlogPost.astro`内の`<style>`タグで定義されている:
- `.prose`: 基本スタイル（`max-width: 720px`, `padding: var(--space-4)`）
- `.prose.blog-content`: 本文エリア（`padding: var(--space-8)`、背景・角丸・シャドウ付き）
- `.blog-layout-with-toc .prose`: 目次付きレイアウト時の調整（`padding: 0`）
- モバイル用メディアクエリ: `.prose`と`.prose.blog-content`の調整

### Architecture Pattern & Boundary Map
**Architecture Integration**:
- Selected pattern: 既存コンポーネント内スタイル修正（変更最小化）
- Domain/feature boundaries: BlogPost.astroのstyleタグ内に閉じる
- Existing patterns preserved: CSS変数（design-tokens.css）の利用継続
- New components rationale: 新規コンポーネント不要
- Steering compliance: 最小限の変更、既存パターン尊重

### Technology Stack

| Layer | Choice / Version | Role in Feature | Notes |
|-------|------------------|-----------------|-------|
| Frontend | Astro v5 | レイアウトコンポーネント | 既存 |
| Styling | CSS (design-tokens) | パディング値定義 | `--space-*`変数使用 |
| Testing | Playwright | 表示確認 | スナップショット取得 |

## Requirements Traceability

| Requirement | Summary | Components | Interfaces | Flows |
|-------------|---------|------------|------------|-------|
| 1.1 | proseに適切なパディング適用 | BlogPost.astro | CSS Style | - |
| 1.2 | デスクトップ時の左右パディング | BlogPost.astro | CSS Style | - |
| 1.3 | モバイル時のパディング調整 | BlogPost.astro | CSS Media Query | - |
| 1.4 | 既存レイアウトとの整合性 | BlogPost.astro | CSS Style | - |
| 2.1 | ブレークポイント対応 | BlogPost.astro | CSS Media Query | - |
| 2.2 | 目次付きレイアウト対応 | BlogPost.astro | CSS Style | - |
| 2.3 | japanese-typography競合回避 | BlogPost.astro | CSS Specificity | - |
| 3.1 | 変更ファイル数最小化 | BlogPost.astro | - | - |
| 3.2 | prose以外への影響なし | BlogPost.astro | CSS Selector | - |
| 3.3 | 既存子要素への影響なし | BlogPost.astro | CSS Selector | - |
| 3.4 | CSS変数命名規則統一 | - | - | - |
| 4.1 | Playwrightスナップショット | - | Playwright API | 確認フロー |
| 4.2 | デスクトップ確認（1280px） | - | Playwright API | 確認フロー |
| 4.3 | モバイル確認（375px） | - | Playwright API | 確認フロー |
| 4.4 | 両レイアウト確認 | - | Playwright API | 確認フロー |

## Components and Interfaces

| Component | Domain/Layer | Intent | Req Coverage | Key Dependencies | Contracts |
|-----------|--------------|--------|--------------|------------------|-----------|
| BlogPost.astro | UI/Layout | ブログ記事レイアウト | 1.1-1.4, 2.1-2.3, 3.1-3.3 | design-tokens.css (P0) | Style |

### UI Layer

#### BlogPost.astro (Style Modification)

| Field | Detail |
|-------|--------|
| Intent | `.prose`および`.prose.blog-content`のパディング値調整 |
| Requirements | 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3 |

**Responsibilities & Constraints**
- `.prose.blog-content`のpaddingプロパティを調整
- 既存のメディアクエリ構造を維持
- 目次付きレイアウト（`.blog-layout-with-toc`）のスタイルを保持

**Dependencies**
- Inbound: design-tokens.css — スペーシング変数（P0）
- Outbound: なし
- External: なし

**Contracts**: Style [x]

##### Style Contract
現在の値と変更対象:
```css
/* 変更対象: .prose.blog-content のパディング */
.prose.blog-content {
  padding: var(--space-8); /* 現在: 32px */
}

/* モバイル時 */
@media (max-width: 767px) {
  .prose.blog-content {
    padding: var(--space-4); /* 現在: 16px */
  }
}
```

**Implementation Notes**
- Integration: BlogPost.astro内のstyleタグを直接編集
- Validation: Playwrightで表示確認
- Risks: 特になし（影響範囲が限定的）

## Testing Strategy

### E2E Tests (Playwright)
1. デスクトップ表示（1280px幅）でブログ記事ページを開き、`.prose.blog-content`のパディングを確認
2. モバイル表示（375px幅）でブログ記事ページを開き、パディングを確認
3. 目次付き記事ページでレイアウトが崩れないことを確認
4. 目次なし記事ページでパディングが適用されていることを確認
5. Callout、テーブル、コードブロックの表示が変わっていないことを確認
