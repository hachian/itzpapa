# Design Document: Table Design Improvement

## Overview

**Purpose**: Markdownテーブルの視覚的なデザインを改善し、読みやすく美しいテーブル表示を提供する。

**Users**: ブログ読者がテーブルを含む記事を閲覧する際に、データを快適に読み取れるようにする。

**Impact**: 現在の最小限のテーブルスタイル（`width: 100%`のみ）を、境界線・パディング・ゼブラストライプ・ダークモード対応を含む完全なスタイルセットに拡張する。

### Goals
- テーブルの視覚的整形（境界線、パディング、角丸）
- ダークモードでの適切な表示
- モバイルでの水平スクロール対応
- ゼブラストライプとホバーエフェクトによる可読性向上
- 既存デザインシステムとの一貫性維持

### Non-Goals
- テーブルのソート・フィルター機能（JavaScriptは使用しない）
- セル結合やcolspan/rowspanのサポート（Markdown標準外）
- テーブルキャプションのスタイリング（将来の拡張）

## Architecture

### Existing Architecture Analysis
- **現状パターン**: 機能別CSSファイル分離（callout.css, tag.css, mark.css等）
- **インポート方式**: global.cssから`@import`で個別ファイルを読み込み
- **変数管理**: design-tokens.cssでCSS変数を一元管理
- **ダークモード**: `html.dark`セレクタと`@media (prefers-color-scheme: dark)`の併用

### Architecture Pattern & Boundary Map

**Architecture Integration**:
- **Selected pattern**: CSS-only styling（既存パターンに準拠）
- **Domain/feature boundaries**: table.cssは独立したスタイルファイルとして管理
- **Existing patterns preserved**: design-tokens変数の使用、ダークモード二重対応パターン
- **New components rationale**: 既存テーブル要素に対するスタイル強化のみ、新規コンポーネント不要
- **Steering compliance**: 機能別CSS分離、OKLCH色管理、レスポンシブブレイクポイント

### Technology Stack

| Layer | Choice / Version | Role in Feature | Notes |
|-------|------------------|-----------------|-------|
| Frontend / CLI | CSS | テーブルスタイリング | JavaScript不使用 |
| Infrastructure | Astro v5 | CSSインポート処理 | 既存ビルドパイプライン利用 |

## Requirements Traceability

| Requirement | Summary | Components | Interfaces | Flows |
|-------------|---------|------------|------------|-------|
| 1.1 | 境界線表示 | table.css | - | - |
| 1.2 | ヘッダー区別 | table.css | - | - |
| 1.3 | セルパディング | table.css | - | - |
| 1.4 | テーブル角丸 | table.css | - | - |
| 2.1 | ダークモード切替 | table.css | - | - |
| 2.2 | セマンティック変数使用 | table.css | - | - |
| 2.3 | トランジション適用 | table.css | - | - |
| 3.1 | 水平スクロール | table.css | - | - |
| 3.2 | スクロールインジケーター | table.css | - | - |
| 3.3 | 最小セル幅設定 | table.css | - | - |
| 4.1 | ゼブラストライプ | table.css | - | - |
| 4.2 | ホバーエフェクト | table.css | - | - |
| 4.3 | テキスト配置サポート | table.css | - | - |
| 5.1 | カラーパレット使用 | table.css | - | - |
| 5.2 | スペーシング変数使用 | table.css | - | - |
| 5.3 | シャドウ・角丸変数使用 | table.css | - | - |
| 5.4 | 専用CSSファイル実装 | table.css, global.css | - | - |

## Components and Interfaces

| Component | Domain/Layer | Intent | Req Coverage | Key Dependencies | Contracts |
|-----------|--------------|--------|--------------|------------------|-----------|
| table.css | Styles | テーブル要素のスタイリング | 1.1-1.4, 2.1-2.3, 3.1-3.3, 4.1-4.3, 5.1-5.3 | design-tokens.css (P0) | - |
| global.css | Styles | table.cssのインポート | 5.4 | table.css (P0) | - |

### Styles Layer

#### table.css

| Field | Detail |
|-------|--------|
| Intent | Markdownテーブル要素に対する包括的なスタイル定義 |
| Requirements | 1.1-1.4, 2.1-2.3, 3.1-3.3, 4.1-4.3, 5.1-5.3 |

**Responsibilities & Constraints**
- テーブル、ヘッダー、ボディ、行、セルのスタイル定義
- ライトモード・ダークモード両方のカラー管理
- レスポンシブ対応（水平スクロールラッパー）
- design-tokens.cssの変数のみを使用（ハードコードされた値は禁止）

**Dependencies**
- Inbound: global.css — @importでの読み込み (P0)
- External: design-tokens.css — CSS変数の参照 (P0)

**Implementation Notes**
- **Integration**: global.cssの既存@importブロック後に`@import './table.css';`を追加
- **Validation**: 既存ブログ記事のテーブルで視覚的検証
- **Risks**: 水平スクロールラッパーが必要な場合、Markdown処理との連携が必要になる可能性（研究の結果、CSSのみで対応可能と判断）

## Data Models

本機能はCSSのみの変更であり、データモデルの変更はなし。

## Error Handling

### Error Strategy
CSSはエラーが発生しても無視されるため、明示的なエラーハンドリングは不要。フォールバック値を使用。

### Error Categories and Responses
- **CSS変数未定義**: フォールバック値を常に指定（例: `var(--space-4, 1rem)`）
- **古いブラウザ**: design-tokens.cssの@supportsフォールバックで対応済み

## Testing Strategy

### Unit Tests
該当なし（CSSファイルのみ）

### Visual Tests
- ライトモードでのテーブル表示確認
- ダークモードでのテーブル表示確認
- モバイル幅での水平スクロール動作確認
- 長いテーブル（10行以上）でのゼブラストライプ確認
- ホバー時のハイライト確認

### Cross-Browser Tests
- Chrome、Firefox、Safariでの表示確認
- OKLCHフォールバック動作確認（古いブラウザ）

## CSS Structure Specification

### 1. CSS変数定義（:root）

```css
:root {
  /* Table-specific variables */
  --table-border-color: var(--color-gray-200);
  --table-header-bg: var(--color-gray-100);
  --table-row-even-bg: var(--color-gray-50);
  --table-row-hover-bg: var(--color-primary-500-alpha08);
}

html.dark {
  --table-border-color: var(--color-gray-700);
  --table-header-bg: var(--color-gray-800);
  --table-row-even-bg: var(--color-gray-800);
  --table-row-hover-bg: var(--color-primary-dark-alpha20);
}
```

### 2. 基本テーブルスタイル

```css
/* Table wrapper for horizontal scroll */
.table-wrapper {
  overflow-x: auto;
  margin: var(--space-4) 0;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

/* Base table styles */
table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  font-size: var(--font-size-base);
}

/* Header cells */
th {
  background-color: var(--table-header-bg);
  font-weight: var(--font-weight-semibold);
  text-align: left;
  padding: var(--space-3) var(--space-4);
  border-bottom: 2px solid var(--table-border-color);
}

/* Body cells */
td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--table-border-color);
  min-width: 100px;
}

/* Zebra stripes */
tbody tr:nth-child(even) {
  background-color: var(--table-row-even-bg);
}

/* Hover effect */
tbody tr:hover {
  background-color: var(--table-row-hover-bg);
}
```

### 3. スクロールインジケーター（影）

```css
.table-wrapper {
  position: relative;
}

.table-wrapper::before,
.table-wrapper::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 20px;
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--duration-fast);
}

.table-wrapper::before {
  left: 0;
  background: linear-gradient(to right, var(--color-surface), transparent);
}

.table-wrapper::after {
  right: 0;
  background: linear-gradient(to left, var(--color-surface), transparent);
}

.table-wrapper.scrollable-left::before,
.table-wrapper.scrollable-right::after {
  opacity: 1;
}
```

**注意**: スクロールインジケーターの動的制御はJavaScriptが必要。CSSのみでは静的な影を適用する簡易版で実装する。

### 4. レスポンシブ対応

```css
@media (max-width: 767px) {
  th, td {
    padding: var(--space-2) var(--space-3);
    font-size: var(--font-size-sm);
  }
}
```

### 5. テキスト配置クラス

```css
/* Alignment classes (for Markdown extensions if needed) */
td[align="center"], th[align="center"] {
  text-align: center;
}

td[align="right"], th[align="right"] {
  text-align: right;
}
```

## Implementation Notes

### ファイル変更一覧
1. **新規作成**: `src/styles/table.css` — テーブルスタイル定義
2. **修正**: `src/styles/global.css` — `@import './table.css';`追加

### スクロールラッパーについて
Markdownから生成されるテーブルには自動的に`.table-wrapper`が付かないため、以下の選択肢がある：

1. **CSSのみ（採用）**: prose内のtableに直接`overflow-x: auto`を適用。影インジケーターは省略。
2. **rehypeプラグイン（将来拡張）**: テーブルをdivでラップするプラグインを作成。

### 角丸の制約
`border-collapse: collapse`と角丸は併用できない。以下の回避策を採用：
- テーブル自体ではなく、ラッパー（または直接的に最初と最後のセル）に角丸を適用
- `border-collapse: separate`と`border-spacing: 0`の組み合わせで角丸を実現
