---
title: 'Wikilink Test Suite'
description: 'Comprehensive test suite for Wikilink functionality'
pubDate: '2025-08-13'
heroImage: 'blog-placeholder-3.jpg'
---

# Wikilink機能テストスイート

このページはWikilink機能の包括的なテストケースを含んでいます。

## 基本的なWikilink

### 1. シンプルな内部リンク
[[../ofm-test/index.md]] - OFMテストページへのリンク

### 2. エイリアス付きリンク
[[../link-test/index.md|リンクテストページ]] - カスタム表示名付き

### 3. index.mdなしのリンク
[[../ofm-test]] - index.mdを省略

## 見出しへのリンク

### 4. 英語の見出し
[[../ofm-test/index.md#Headings]] - Headingsセクションへ

### 5. 日本語の見出し
[[../link-test/index.md#見出しへのリンク]] - 日本語見出しへ

### 6. スペース含む見出し
[[../ofm-test/index.md#Code Blocks]] - スペースを含む見出し

## 複数のWikilink

### 7. 同一行に複数のリンク
[[../ofm-test/index.md|OFMテスト]] と [[../link-test/index.md|リンクテスト]] の両方を参照

### 8. リスト内のWikilink
- [[../ofm-test/index.md]] - 最初のページ
- [[../link-test/index.md|カスタム名]] - 二番目のページ
- [[../ofm-test/index.md#Images]] - 画像セクション

## エッジケース

### 9. 存在しないページへのリンク
[[../non-existent/index.md]] - このページは存在しません

### 10. 深いネストのパス
[[../../../deep/nested/path/index.md]] - 深いパス

### 11. 特殊文字を含む見出し
[[../ofm-test/index.md#H1]] - H1見出し
[[../ofm-test/index.md#H2]] - H2見出し

## 通常のMarkdownリンクとの共存

### 12. 混在するリンクタイプ
Wikilink: [[../ofm-test/index.md|OFM]]  
通常のリンク: [Google](https://www.google.com)  
もう一つのWikilink: [[../link-test/index.md]]

## 画像埋め込み（未実装）

### 13. 画像のWikilink記法
![[blog-placeholder-3.jpg]] - この記法は現在未実装です

## テーブル内のWikilink

| タイプ | リンク | 説明 |
|------|-------|-----|
| Wikilink | [[../ofm-test/index.md]] | 内部リンク |
| エイリアス付き | [[../link-test/index.md\|テスト]] | カスタム表示名 |
| 通常のリンク | [外部](https://example.com) | 外部サイト |

## コードブロック内（処理されない）

```markdown
これはコードブロック内なので処理されません:
[[../ofm-test/index.md]]
```

## 引用内のWikilink

> これは引用文内の [[../ofm-test/index.md|Wikilink]] です。
> 複数行の引用でも [[../link-test/index.md]] が機能します。

## 検証チェックリスト

- [ ] 基本的なWikilinkが正しく変換される
- [ ] エイリアスが正しく表示される
- [ ] 見出しアンカーが適切に処理される
- [ ] 日本語見出しが正しく処理される
- [ ] 複数のWikilinkが同時に機能する
- [ ] 通常のMarkdownリンクと共存できる
- [ ] CSSクラス `wikilink-internal` が付与される
- [ ] パスが正しく `/blog/` プレフィックス付きに変換される

## テスト結果

このページを表示して、上記のすべてのリンクが正しく機能することを確認してください。

---

**Note**: このテストスイートは継続的に更新され、新機能の追加に伴って拡張されます。