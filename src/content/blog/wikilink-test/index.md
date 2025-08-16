---
title: "WikiLink記法のテスト"
pubDate: 2025-08-15
description: "WikiLink記法の動作をテストするための記事です"
heroImage: "./itzpapa2.jpg"
categories:
  - test
tags:
  - wikilink
  - markdown
  - test
---

# WikiLink記法のテスト

このページでは、WikiLink記法の動作を確認します。WikiLinkは`[[]]`で囲むことで内部リンクを簡単に作成できる記法です。

## 1. 基本的なWikiLink

#### Syntax

```markdown
[[../markdown-basic-test/index.md]]
[[../callout-comprehensive-test/index.md]]
[[../math-test/index.md]]
```

#### Output

[[../markdown-basic-test/index.md]]
[[../callout-comprehensive-test/index.md]]
[[../math-test/index.md]]

## 2. エイリアス付きWikiLink

#### Syntax

```markdown
[[../markdown-basic-test/index.md|基本的なMarkdownテスト]]
[[../callout-comprehensive-test/index.md|Callout機能のテスト]]
[[../mermaid-test/index.md|ダイアグラムのテスト]]
```

#### Output

[[../markdown-basic-test/index.md|基本的なMarkdownテスト]]
[[../callout-comprehensive-test/index.md|Callout機能のテスト]]
[[../mermaid-test/index.md|ダイアグラムのテスト]]

## 3. 見出しへのリンク

#### Syntax

```markdown
[[../markdown-basic-test/index.md#テーブル]]
[[../callout-comprehensive-test/index.md#基本的なCalloutタイプ]]
[[#基本的なWikiLink]]
```

#### Output

[[../markdown-basic-test/index.md#テーブル]]
[[../callout-comprehensive-test/index.md#基本的なCalloutタイプ]]
[[#基本的なWikiLink]]

## 4. エイリアスと見出しの組み合わせ

#### Syntax

```markdown
[[../markdown-basic-test/index.md#コードブロック|コードの例を見る]]
[[../callout-comprehensive-test/index.md#折りたたみ機能|折りたたみ機能について]]
```

#### Output

[[../markdown-basic-test/index.md#コードブロック|コードの例を見る]]
[[../callout-comprehensive-test/index.md#折りたたみ機能|折りたたみ機能について]]

## 5. インライン記法との組み合わせ

#### Syntax

```markdown
**[[../markdown-basic-test/index.md|太字のWikiLink]]**
*[[../callout-comprehensive-test/index.md|斜体のWikiLink]]*
`[[コード内のWikiLink]]`は動作しない
~~[[../math-test/index.md|打ち消し線のWikiLink]]~~
```

#### Output

**[[../markdown-basic-test/index.md|太字のWikiLink]]**
*[[../callout-comprehensive-test/index.md|斜体のWikiLink]]*
`[[コード内のWikiLink]]`は動作しない
~~[[../math-test/index.md|打ち消し線のWikiLink]]~~

## 6. リスト内のWikiLink

#### Syntax

```markdown
- [[../markdown-basic-test/index.md|リストアイテム1]]
- [[../callout-comprehensive-test/index.md|リストアイテム2]]
  - [[../math-test/index.md|ネストされたリンク]]
  - 通常のテキストと[[../mermaid-test/index.md|混在]]も可能

1. [[../image-test/index.md|番号付きリスト1]]
2. [[../markdown-basic-test/index.md|番号付きリスト2]]
```

#### Output

- [[../markdown-basic-test/index.md|リストアイテム1]]
- [[../callout-comprehensive-test/index.md|リストアイテム2]]
  - [[../math-test/index.md|ネストされたリンク]]
  - 通常のテキストと[[../mermaid-test/index.md|混在]]も可能

1. [[../image-test/index.md|番号付きリスト1]]
2. [[../markdown-basic-test/index.md|番号付きリスト2]]

## 7. 引用内のWikiLink

#### Syntax

```markdown
> [[../markdown-basic-test/index.md|引用内のリンク]]も動作します。
> [[../callout-comprehensive-test/index.md|別のページ]]への参照。
>> ネストされた引用内の[[../math-test/index.md|WikiLink]]
```

#### Output

> [[../markdown-basic-test/index.md|引用内のリンク]]も動作します。
> [[../callout-comprehensive-test/index.md|別のページ]]への参照。
>> ネストされた引用内の[[../math-test/index.md|WikiLink]]

## 8. テーブル内のWikiLink

#### Syntax

```markdown
| カラム1 | カラム2 | カラム3 |
|---------|---------|---------|
| [[../markdown-basic-test/index.md\|リンク1]] | 通常テキスト | [[../callout-comprehensive-test/index.md\|リンク2]] |
| テキスト | [[../math-test/index.md\|表示名]] | [[../mermaid-test/index.md#フローチャート|見出しリンク]] |
```

#### Output

| カラム1 | カラム2 | カラム3 |
|---------|---------|---------|
| [[../markdown-basic-test/index.md\|リンク1]] | 通常テキスト | [[../callout-comprehensive-test/index.md\|リンク2]] |
| テキスト | [[../math-test/index.md\|表示名]] | [[../mermaid-test/index.md#フローチャート\|見出しリンク]] |
| [[../test page/index.md\|スペース含有ページ]] | [[../my test page/index.md\|複数単語ページ]] | [[../test page/index.md#Test Heading\|スペース含有見出し]] |

## 9. 特殊文字を含むWikiLink

#### Syntax

```markdown
[[ページ (括弧付き)]]
[[ページ-with-hyphen]]
[[ページ_with_underscore]]
[[ページ.with.dot]]
[[ページ/with/slash]]
[[ページ & アンパサンド]]
```

#### Output

[[ページ (括弧付き)]]
[[ページ-with-hyphen]]
[[ページ_with_underscore]]
[[ページ.with.dot]]
[[ページ/with/slash]]
[[ページ & アンパサンド]]

## 10. 空白を含むWikiLink

#### Syntax

```markdown
[[ページ 名前]]
[[複数 の 空白]]
[[  前後に空白  ]]
[[../test page/index.md|実際のスペース含有ページ]]
[[../my test page/index.md|複数単語のテストページ]]
[[../test page/index.md#Heading with Spaces|スペース含有見出しへのリンク]]
[[../my test page/index.md#Another Multi Word Heading|複数単語見出しへのリンク]]
[[../test page/index.md#日本語 見出し|日本語スペース見出し]]
```

#### Output

[[ページ 名前]]
[[複数 の 空白]]
[[  前後に空白  ]]
[[../test page/index.md|実際のスペース含有ページ]]
[[../my test page/index.md|複数単語のテストページ]]
[[../test page/index.md#Heading with Spaces|スペース含有見出しへのリンク]]
[[../my test page/index.md#Another Multi Word Heading|複数単語見出しへのリンク]]
[[../test page/index.md#日本語 見出し|日本語スペース見出し]]

## 10.5. 先頭・末尾空白の自動除去テスト (TASK-002)

#### Syntax

```markdown
[[  ../test page/index.md  |通常エイリアス]]
[[  ../my test page/index.md  |タブ文字テスト]]
[[  ../test page/index.md  |  前後に空白のエイリアス  ]]
[[   ../test page/index.md#Heading with Spaces   |   空白除去+見出し   ]]
```

#### Output

[[  ../test page/index.md  |通常エイリアス]]
[[  ../my test page/index.md  |タブ文字テスト]]
[[  ../test page/index.md  |  前後に空白のエイリアス  ]]
[[   ../test page/index.md#Heading with Spaces   |   空白除去+見出し   ]]

**期待される動作**:
- パス部分の先頭・末尾空白は自動除去される
- エイリアス部分の空白は保持される
- タブ文字や混合空白文字も適切に処理される

## 10.6. 見出しアンカーのスペース処理テスト (TASK-003)

#### Syntax

```markdown
[[../test page/index.md#Test Heading]]
[[../test page/index.md#日本語 見出し]]
[[../test page/index.md#Test Heading|カスタム表示名]]
[[../test page/index.md#English and 日本語 Mixed]]
[[../test page/index.md#Multiple   Spaces   Test]]
[[../my test page/index.md#Another Multi Word Heading]]
```

#### Output

[[../test page/index.md#Test Heading]]
[[../test page/index.md#日本語 見出し]]
[[../test page/index.md#Test Heading|カスタム表示名]]
[[../test page/index.md#English and 日本語 Mixed]]
[[../test page/index.md#Multiple   Spaces   Test]]
[[../my test page/index.md#Another Multi Word Heading]]

**期待される動作**:
- 見出しのスペースは自動的にハイフンに変換される
- 英字は小文字化される
- 日本語文字は保持される
- 連続スペースは一つのハイフンになる

## 10.7. 連続スペース正規化テスト (TASK-005)

#### Syntax

```markdown
[[../page   name/index.md|連続スペース基本]]
[[../page     with     many     spaces/index.md|極端な例]]
[[../page		  	 name/index.md|タブと混合]]
[[../page　　name/index.md|全角スペース]]
[[../page/index.md#Multiple     Spaces     Test|連続スペース見出し]]
```

#### Output

[[../page   name/index.md|連続スペース基本]]
[[../page     with     many     spaces/index.md|極端な例]]
[[../page		  	 name/index.md|タブと混合]]
[[../page　　name/index.md|全角スペース]]
[[../page/index.md#Multiple     Spaces     Test|連続スペース見出し]]

**期待される動作**:
- 連続する空白文字は単一のハイフンに正規化される
- タブ文字と通常スペースの混合も適切に処理される
- Unicode空白文字（全角スペースなど）も正規化される
- 見出しアンカー内でも連続スペースが正規化される

## 10.8. 日本語文字セット対応テスト (TASK-006)

#### Syntax

```markdown
[[../ページ　名前/index.md|全角スペースパス]]
[[../test　テスト page/index.md|混在文字セット]]
[[../日本語ページ/index.md|日本語表示名]]
[[../English　日本語 Mixed/index.md|全角半角混在]]
[[../page/index.md#日本語　見出し|全角スペース見出し]]
```

#### Output

[[../ページ　名前/index.md|全角スペースパス]]
[[../test　テスト page/index.md|混在文字セット]]
[[../日本語ページ/index.md|日本語表示名]]
[[../English　日本語 Mixed/index.md|全角半角混在]]
[[../page/index.md#日本語　見出し|全角スペース見出し]]

**期待される動作**:
- 全角スペース（U+3000）は適切にハイフンに変換される
- 英数字と日本語の混在パスが正しく処理される
- 日本語文字はUTF-8エンコーディングで保持される
- エイリアス部分の日本語は適切に表示される

## 11. 通常のMarkdownリンクとの混在

#### Syntax

```markdown
これは[[../markdown-basic-test/index.md|WikiLink]]で、これは[通常のリンク](https://example.com)です。

[[../callout-comprehensive-test/index.md|内部リンク]]と[外部リンク](https://google.com)を同じ文章で使用。

参照リンク[^1]と[[../math-test/index.md|WikiLink]]の組み合わせ。

[^1]: 脚注の内容
```

#### Output

これは[[../markdown-basic-test/index.md|WikiLink]]で、これは[通常のリンク](https://example.com)です。

[[../callout-comprehensive-test/index.md|内部リンク]]と[外部リンク](https://google.com)を同じ文章で使用。

参照リンク[^1]と[[../math-test/index.md|WikiLink]]の組み合わせ。

[^1]: 脚注の内容

## 12. エッジケース

#### Syntax

```markdown
[[]]（空のWikiLink）
[[|エイリアスのみ]]
[[#]]（見出しのみ）
[[[トリプルブラケット]]]
[[リンク1]][[リンク2]]（連続したWikiLink）
テキスト[[インライン]]テキスト
```

#### Output

[[]]（空のWikiLink）
[[|エイリアスのみ]]
[[#]]（見出しのみ）
[[[トリプルブラケット]]]
[[リンク1]][[リンク2]]（連続したWikiLink）
テキスト[[インライン]]テキスト

## 13. コードブロック内のWikiLink（動作しない例）

#### Syntax

````markdown
```
[[これはコードブロック内なので動作しない]]
```

```javascript
// [[コメント内のWikiLink]]も動作しない
const link = "[[文字列内のWikiLink]]";
```
````

#### Output

```
[[これはコードブロック内なので動作しない]]
```

```javascript
// [[コメント内のWikiLink]]も動作しない
const link = "[[文字列内のWikiLink]]";
```

## 14. 画像とWikiLinkの組み合わせ

#### Syntax

```markdown
[![画像リンク](./itzpapa2.jpg)]([[../markdown-basic-test/index.md]])

[[../image-test/index.md|![代替テキスト](./itzpapa2.jpg)]]
```

#### Output

[![画像リンク](./itzpapa2.jpg)]([[../markdown-basic-test/index.md]])

[[../image-test/index.md|![代替テキスト](./itzpapa2.jpg)]]

## 15. 長いページ名とエイリアス

#### Syntax

```markdown
[[../markdown-basic-test/index.md|短縮名]]

[[../callout-comprehensive-test/index.md|Short Name]]
```

#### Output

[[../markdown-basic-test/index.md|短縮名]]

[[../callout-comprehensive-test/index.md|Short Name]]

## まとめ

WikiLink記法は内部リンクを簡単に作成できる便利な機能です。通常のMarkdown記法と組み合わせて使用することで、より効率的にドキュメントを作成できます。