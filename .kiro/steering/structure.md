# Project Structure

## Organization Philosophy

機能ベースのディレクトリ構造。Astroの規約に従いつつ、カスタムプラグインとユーティリティを分離。

## Directory Patterns

### Source Code (`src/`)
**Location**: `/src/`
**Purpose**: アプリケーションソースコード
**Subdirectories**:
- `components/`: 再利用可能なAstroコンポーネント
- `layouts/`: ページレイアウトテンプレート
- `pages/`: ルーティング（ファイルベースルーティング）
- `content/`: コンテンツコレクション（ブログ記事）
- `plugins/`: カスタムremark/rehypeプラグイン
- `utils/`: ユーティリティ関数
- `styles/`: グローバルCSS
- `assets/`: 処理対象の画像アセット

### Content Collection (`src/content/blog/`)
**Location**: `/src/content/blog/{slug}/`
**Purpose**: ブログ記事の格納
**Pattern**: フォルダごとに `index.md` と関連画像を配置

### Custom Plugins (`src/plugins/`)
**Location**: `/src/plugins/{plugin-name}/`
**Purpose**: remark/rehypeカスタムプラグイン
**Example**: `remark-wikilink/`, `remark-mark-highlight/`, `remark-tags/`

### Static Files (`public/`)
**Location**: `/public/`
**Purpose**: ビルド時にそのままコピーされる静的ファイル

## Naming Conventions

- **Files (Components)**: PascalCase（例: `TagBadge.astro`, `FormattedDate.astro`）
- **Files (Utils)**: kebab-case（例: `inline-tags.ts`）
- **Files (Content)**: slug形式フォルダ + `index.md`
- **CSS**: kebab-case（例: `table-of-contents.css`）

## Import Organization

```typescript
// Astroコンポーネント
import Header from '../components/Header.astro';

// 相対パス（同一機能内）
import { validateTag } from './validation';
```

**Path Aliases**: なし（相対パス使用）

## Code Organization Principles

- **コンポーネント分離**: UIロジックは `components/`、ページ構造は `pages/`
- **ユーティリティ機能別分割**: `utils/tag/`, `utils/table-of-contents/` のようにサブディレクトリで整理
- **プラグイン独立性**: 各プラグインは独自の `index.js` をエントリポイントとして持つ
- **スタイル分離**: 機能ごとに個別CSSファイル（`callout.css`, `tag.css` 等）

---
_Document patterns, not file trees. New files following patterns shouldn't require updates_
