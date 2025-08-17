# remark-tags

Remarkプラグイン - Obsidianスタイルのタグ処理

## 機能

- `#tag` 形式の単純なタグの認識
- `#parent/child/grandchild` 形式の階層タグのサポート
- 日本語タグのサポート
- frontmatterとインラインタグの両方を処理
- タグをクリック可能なリンクに自動変換
- カスタマイズ可能な設定オプション

## 使用方法

```javascript
import remarkTags from './src/plugins/remark-tags/index.js';

// Astro設定での使用例
export default defineConfig({
  markdown: {
    remarkPlugins: [
      [remarkTags, {
        convertToLinks: true,
        tagBasePath: '/tags/',
        maxHierarchyDepth: 5
      }]
    ]
  }
});
```

## オプション

| オプション | デフォルト | 説明 |
|-----------|----------|------|
| `convertToLinks` | `true` | タグをリンクに変換するか |
| `tagBasePath` | `'/tags/'` | タグページのベースパス |
| `tagClassName` | `'tag'` | タグのCSSクラス |
| `hierarchicalTagClassName` | `'tag-hierarchical'` | 階層タグのCSSクラス |
| `tagPrefix` | `'#'` | タグのプレフィックス |
| `hierarchySeparator` | `'/'` | 階層の区切り文字 |
| `maxHierarchyDepth` | `5` | 最大階層深度 |
| `caseSensitive` | `false` | 大文字小文字を区別するか |

## 出力

プラグインは以下のメタデータをfrontmatterに追加します：

- `processedTags`: 処理されたすべてのタグ（重複なし）
- `inlineTags`: 本文中で見つかったタグ
- `allTags`: すべてのタグの統合リスト