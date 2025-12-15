# Design Document: リストデザイン刷新

## Overview

**Purpose**: ブログ記事本文内のMarkdownリスト（ul/ol）に統一されたスタイリングを提供し、可読性とデザインシステムとの一貫性を向上させる。

**Users**: ブログ読者がリスト形式のコンテンツを視覚的に把握しやすくなる。開発者はデザイントークンを活用した保守性の高いスタイルを利用できる。

**Impact**: 現在ブラウザデフォルトに依存している `.prose ul/ol` のスタイルを、独自のCSSで上書きする。

### Goals

- 順序なし・順序付きリストに統一されたスタイリングを適用
- ネストリストの階層を視覚的に明確化
- デザイントークンを活用した保守性の高い実装
- ダークモード完全対応

### Non-Goals

- リスト以外の要素（テーブル、blockquote等）のスタイル変更
- JavaScriptによるインタラクティブ機能
- カスタムリストマーカーアイコン（絵文字、SVG等）

## Architecture

### Existing Architecture Analysis

現在のリスト関連スタイル：
- `src/styles/japanese-typography.css`: `.prose li { margin-bottom: 0.5em; }` のみ
- `src/styles/global.css`: ul/ol の直接的なスタイル定義なし
- デザイントークン: `src/styles/design-tokens.css` で色・スペーシング変数が定義済み

### Architecture Pattern

**パターン**: 機能別CSSファイル分離（既存パターンに準拠）

既存の `card.css`, `table.css`, `button.css` と同様に、`list.css` を新規作成し `global.css` からインポートする。

```
src/styles/
├── global.css          ← @import './list.css' を追加
├── design-tokens.css   ← 既存変数を活用
├── list.css            ← 新規作成
└── japanese-typography.css ← .prose li の定義を移動
```

### Technology Stack

| Layer | Choice | Role | Notes |
|-------|--------|------|-------|
| Styling | CSS3 | リストスタイル定義 | `::marker` 疑似要素使用 |
| Variables | CSS Custom Properties | デザイントークン | design-tokens.css から継承 |
| Dark Mode | `html.dark` クラス | テーマ切り替え | 既存パターンに準拠 |

## Requirements Traceability

| Requirement | Summary | CSS Selectors |
|-------------|---------|---------------|
| 1.1-1.5 | 順序なしリスト基本スタイル | `.prose ul`, `.prose ul li`, `.prose ul::marker` |
| 2.1-2.5 | 順序付きリスト基本スタイル | `.prose ol`, `.prose ol li`, `.prose ol::marker` |
| 3.1-3.8 | ネストリストスタイル | `.prose ul ul`, `.prose ol ol`, 階層セレクタ |
| 4.1-4.5 | マーカーカスタマイズ | CSS変数、`::marker` 疑似要素 |
| 5.1-5.5 | ダークモード対応 | `html.dark .prose ul/ol` |

## Components and Interfaces

### CSS Files

#### list.css（新規作成）

| Field | Detail |
|-------|--------|
| Intent | `.prose` 内のul/olリストスタイルを一元管理 |
| Requirements | 1.1-1.5, 2.1-2.5, 3.1-3.8, 4.1-4.5, 5.1-5.5 |

**CSS変数定義**:

```css
:root {
  /* List spacing */
  --list-margin-y: 1.25em;
  --list-padding-left: 1.75em;
  --list-item-spacing: 0.5em;
  --list-nested-margin-top: 0.375em;

  /* List marker colors */
  --list-marker-color: var(--color-primary-500);
  --list-marker-color-dark: var(--color-primary-400);

  /* Nested list indent */
  --list-nested-indent: 1.5em;
  --list-deep-nested-indent: 1em;
}
```

**基本セレクタ構造**:

```css
/* 基本リストスタイル */
.prose ul,
.prose ol {
  margin: var(--list-margin-y) 0;
  padding-left: var(--list-padding-left);
  line-height: var(--line-height-relaxed);
}

/* リストアイテム */
.prose li {
  margin-bottom: var(--list-item-spacing);
}

/* 最後のアイテムの余白削除 */
.prose li:last-child {
  margin-bottom: 0;
}

/* マーカースタイル */
.prose ul > li::marker {
  color: var(--list-marker-color);
}

.prose ol > li::marker {
  color: var(--list-marker-color);
  font-weight: var(--font-weight-semibold);
}
```

**ネストリストスタイル**:

```css
/* ネストリスト共通 */
.prose li > ul,
.prose li > ol {
  margin-top: var(--list-nested-margin-top);
  margin-bottom: 0;
}

/* 順序なしリスト - 階層別マーカー */
.prose ul { list-style-type: disc; }
.prose ul ul { list-style-type: circle; }
.prose ul ul ul { list-style-type: square; }
.prose ul ul ul ul { list-style-type: disc; }

/* 順序付きリスト - 階層別番号スタイル */
.prose ol { list-style-type: decimal; }
.prose ol ol { list-style-type: lower-alpha; }
.prose ol ol ol { list-style-type: lower-roman; }
.prose ol ol ol ol { list-style-type: decimal; }

/* 深いネスト時のインデント調整 */
.prose ul ul ul ul,
.prose ol ol ol ol {
  padding-left: var(--list-deep-nested-indent);
}
```

**ダークモード**:

```css
html.dark .prose ul > li::marker,
html.dark .prose ol > li::marker {
  color: var(--list-marker-color-dark);
}

@media (prefers-color-scheme: dark) {
  :root:not(.light) .prose ul > li::marker,
  :root:not(.light) .prose ol > li::marker {
    color: var(--list-marker-color-dark);
  }
}
```

#### global.css（修正）

**変更内容**: `@import './list.css';` を追加

```css
/* Import list styles */
@import './list.css';
```

#### japanese-typography.css（修正）

**変更内容**: `.prose li` のルールを削除（list.css に移動）

削除対象:
```css
/* リストアイテムの行間調整 */
.prose li {
  margin-bottom: 0.5em;
}
```

## Data Models

該当なし（CSS変更のみ）

## Error Handling

該当なし（CSS変更のみ）

## Testing Strategy

### Visual Testing

1. **基本リスト表示**: ul/ol が正しいマーカーとインデントで表示される
2. **ネストリスト**: 2-4階層のネストで異なるマーカースタイルが適用される
3. **項目間余白**: ネストの深さに関わらず一定の余白が維持される
4. **ダークモード**: ライト/ダーク切り替えでマーカー色が適切に変化する
5. **レスポンシブ**: モバイル幅でもリストが正しく表示される

### Test Cases

| テストケース | 確認項目 |
|-------------|----------|
| 単純なul（3項目） | disc マーカー、0.5em 間隔 |
| 単純なol（5項目） | decimal マーカー、番号の色 |
| 2階層ネストul | circle マーカーへの変化 |
| 3階層ネストol | lower-roman マーカーへの変化 |
| ul内にolをネスト | マーカースタイルの混在 |
| ネスト解消後の余白 | 親項目との間隔が0.5em |
| ダークモード切り替え | マーカー色の変化 |

### Test Content

以下のMarkdownをテスト記事で使用:

```markdown
## テスト用リスト

### 順序なしリスト
- 項目1
- 項目2
  - ネスト項目A
  - ネスト項目B
    - 深いネスト1
    - 深いネスト2
  - ネスト項目C
- 項目3

### 順序付きリスト
1. 手順1
2. 手順2
   1. サブ手順A
   2. サブ手順B
      1. 詳細手順i
      2. 詳細手順ii
   3. サブ手順C
3. 手順3

### 混在リスト
- 項目1
  1. 番号付きサブ項目
  2. 番号付きサブ項目
- 項目2
```
