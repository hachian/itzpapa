# Requirements Document

## Introduction
本文中のObsidianスタイルのインラインタグ（`#タグ`形式）がremarkプラグインによってリンクに変換される際、生成されるURLに末尾スラッシュが付与されていない問題を修正する。

### 問題の背景
コミット788c98fで`src/utils/tag/inline-tags.ts`の`generateTagUrl`関数は修正済みだが、実際にMarkdown本文中のタグを処理する`src/plugins/remark-tags/index.js`は独自の`tagToSlug`関数を使用しており、こちらは未修正。

### 現状の処理パス

| 処理箇所 | 使用関数 | 末尾スラッシュ |
|---------|---------|--------------|
| `src/utils/tag/inline-tags.ts` | `generateTagUrl` | ✅ 修正済み |
| `src/plugins/remark-tags/index.js` | 独自の`tagToSlug` | ❌ 未修正 |

### 問題箇所
`src/plugins/remark-tags/index.js`の119行目：
```javascript
url: `${config.tagBasePath}${slug}`,  // → /tags/test（末尾スラッシュなし）
```

## Requirements

### Requirement 1: remark-tagsプラグインの末尾スラッシュ付与
**Objective:** サイト運営者として、remark-tagsプラグインが生成するインラインタグリンクに末尾スラッシュを付与したい。これにより、URLの一貫性を保ちSEOを改善できる。

#### Acceptance Criteria
1. When インラインタグ（例：`#test`）がMarkdown本文に記述されている場合, the remark-tagsプラグイン shall 末尾スラッシュ付きのURL（例：`/tags/test/`）を持つリンクを生成する
2. When 階層タグ（例：`#parent/child`）がMarkdown本文に記述されている場合, the remark-tagsプラグイン shall 末尾スラッシュ付きのURL（例：`/tags/parent-child/`）を持つリンクを生成する
3. When 日本語タグ（例：`#日本語`）がMarkdown本文に記述されている場合, the remark-tagsプラグイン shall 正しくエンコードされた末尾スラッシュ付きのURLを持つリンクを生成する

### Requirement 2: 既存機能との整合性
**Objective:** サイト運営者として、インラインタグの修正が既存のタグ関連機能と整合性を保つことを確認したい。これにより、サイト全体でリンクが一貫して動作する。

#### Acceptance Criteria
1. The remark-tagsプラグインのリンク shall `inline-tags.ts`の`generateTagUrl`関数と同じURL形式（末尾スラッシュ付き）を生成する
2. The remark-tagsプラグインのリンク shall TagBadge.astroコンポーネントが生成するリンクと同じURL形式を使用する
3. When ユーザーがインラインタグリンクをクリックした場合, the ブラウザ shall 対応するタグページに正常に遷移する

### Requirement 3: 後方互換性
**Objective:** サイト運営者として、修正後も既存のブログ記事が正常に表示されることを確認したい。これにより、既存コンテンツへの影響を最小限に抑えられる。

#### Acceptance Criteria
1. While 既存のブログ記事がインラインタグを含んでいる場合, the ビルドプロセス shall 正常に完了する
2. The 既存のタグページへのルーティング shall 修正後も正常に動作する
