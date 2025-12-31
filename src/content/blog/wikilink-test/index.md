---
title: WikiLink記法のテスト
description: WikiLink記法の動作をテストするための記事です
categories:
  - test
tags:
  - wikilink
  - markdown
  - test
draft: true
published: 2025-08-15T00:00:00.000Z
image: ./itzpapa2.jpg
---

# WikiLink記法のテスト

このページでは、WikiLink記法の動作を確認します。WikiLinkは`[[]]`で囲むことで内部リンクを簡単に作成できる記法です。

## 1. 基本的なWikiLink

#### Syntax

```markdown
1. [[../markdown-basic-test/index.md]]
2. [[../callout-comprehensive-test/index.md]]
3. [[../math-test/index.md]]
```

#### Output

1. [[../markdown-basic-test/index.md]]
2. [[../callout-comprehensive-test/index.md]]
3. [[../math-test/index.md]]

## 2. エイリアス付きWikiLink

#### Syntax

```markdown
1. [[../markdown-basic-test/index.md|基本的なMarkdownテスト]]
2. [[../callout-comprehensive-test/index.md|Callout機能のテスト]]
3. [[../mermaid-test/index.md|ダイアグラムのテスト]]
```

#### Output

1. [[../markdown-basic-test/index.md|基本的なMarkdownテスト]]
2. [[../callout-comprehensive-test/index.md|Callout機能のテスト]]
3. [[../mermaid-test/index.md|ダイアグラムのテスト]]

## 3. 見出しへのリンク

### Test Heading with Spaces

このセクションは、スペースを含む見出しへのリンクをテストするためのものです。

#### 同じページ内のリンクテスト

```markdown
1. [[#Test Heading with Spaces]]
2. [[#1. 基本的なWikiLink]] <!-- test -->
```

1. [[#Test Heading with Spaces]]
2. [[#1. 基本的なWikiLink]]

## 3.1. 他ページの見出しへのリンク

#### Syntax

```markdown
1. [[../markdown-basic-test/index.md#10. テーブル]]
2. [[../callout-comprehensive-test/index.md#1. 基本的なCalloutタイプ]]
```

#### Output

1. [[../markdown-basic-test/index.md#10. テーブル]]
2. [[../callout-comprehensive-test/index.md#1. 基本的なCalloutタイプ]]

## 4. エイリアスと見出しの組み合わせ

#### Syntax

```markdown
1. [[../markdown-basic-test/index.md#8. コードブロック|コードの例を見る]]
2. [[../callout-comprehensive-test/index.md#3. 折りたたみ機能|折りたたみ機能について]]
```

#### Output

1. [[../markdown-basic-test/index.md#8. コードブロック|コードの例を見る]]
2. [[../callout-comprehensive-test/index.md#3. 折りたたみ機能|折りたたみ機能について]]

## 5. インライン記法との組み合わせ

#### Syntax

```markdown
1. **[[../markdown-basic-test/index.md|太字のWikiLink]]**
2. *[[../callout-comprehensive-test/index.md|斜体のWikiLink]]*
3. `[[コード内のWikiLink]]`は動作しない
4. ~~[[../math-test/index.md|打ち消し線のWikiLink]]~~
```

#### Output

1. **[[../markdown-basic-test/index.md|太字のWikiLink]]**
2. *[[../callout-comprehensive-test/index.md|斜体のWikiLink]]*
3. `[[コード内のWikiLink]]`は動作しない
4. ~~[[../math-test/index.md|打ち消し線のWikiLink]]~~

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
| テキスト | [[../math-test/index.md\|表示名]] | [[../mermaid-test/index.md#1. フローチャート|見出しリンク]] |
```

#### Output

| カラム1 | カラム2 | カラム3 |
|---------|---------|---------|
| [[../markdown-basic-test/index.md\|リンク1]] | 通常テキスト | [[../callout-comprehensive-test/index.md\|リンク2]] |
| テキスト | [[../math-test/index.md\|表示名]] | [[../mermaid-test/index.md#1. フローチャート\|見出しリンク]] |
| [[../test-page/index.md\|スペース含有ページ]] | [[../my-test-page/index.md\|複数単語ページ]] | [[../test-page/index.md#Test Heading\|スペース含有見出し]] |

## 9. 特殊文字を含むWikiLink

#### Syntax

```markdown
1. [[ページ (括弧付き)]]
2. [[ページ-with-hyphen]]
3. [[ページ_with_underscore]]
4. [[ページ.with.dot]]
5. [[ページ/with/slash]]
6. [[ページ & アンパサンド]]
```

#### Output

1. [[ページ (括弧付き)]]
2. [[ページ-with-hyphen]]
3. [[ページ_with_underscore]]
4. [[ページ.with.dot]]
5. [[ページ/with/slash]]
6. [[ページ & アンパサンド]]

## 10. 空白を含むWikiLink

#### Syntax

```markdown
1. [[ページ 名前]]
2. [[複数 の 空白]]
3. [[  前後に空白  ]]
4. [[../test-page/index.md|実際のスペース含有ページ]]
5. [[../my-test-page/index.md|複数単語のテストページ]]
6. [[../test-page/index.md#Heading with Spaces|スペース含有見出しへのリンク]]
7. [[../my-test-page/index.md#Another Multi Word Heading|複数単語見出しへのリンク]]
8. [[../test-page/index.md#日本語 見出し|日本語スペース見出し]]
```

#### Output

1. [[ページ 名前]]
2. [[複数 の 空白]]
3. [[  前後に空白  ]]
4. [[../test-page/index.md|実際のスペース含有ページ]]
5. [[../my-test-page/index.md|複数単語のテストページ]]
6. [[../test-page/index.md#Heading with Spaces|スペース含有見出しへのリンク]]
7. [[../my-test-page/index.md#Another Multi Word Heading|複数単語見出しへのリンク]]
8. [[../test-page/index.md#日本語 見出し|日本語スペース見出し]]

## 11. 先頭・末尾空白の自動除去テスト

#### Syntax

```markdown
1. [[  ../test-page/index.md  |通常エイリアス]]
2. [[  ../my-test-page/index.md  |タブ文字テスト]]
3. [[  ../test-page/index.md  |  前後に空白のエイリアス  ]]
4. [[   ../test-page/index.md#Heading with Spaces   |   空白除去+見出し   ]]
```

#### Output

1. [[  ../test-page/index.md  |通常エイリアス]]
2. [[  ../my-test-page/index.md  |タブ文字テスト]]
3. [[  ../test-page/index.md  |  前後に空白のエイリアス  ]]
4. [[   ../test-page/index.md#Heading with Spaces   |   空白除去+見出し   ]]

**期待される動作**:
- パス部分の先頭・末尾空白は自動除去される
- エイリアス部分の空白は保持される
- タブ文字や混合空白文字も適切に処理される

## 12. 見出しアンカーのスペース処理テスト

#### Syntax

```markdown
1. [[../test-page/index.md#Test Heading]]
2. [[../test-page/index.md#日本語 見出し]]
3. [[../test-page/index.md#Test Heading|カスタム表示名]]
4. [[../test-page/index.md#English and 日本語 Mixed]]
5. [[../test-page/index.md#Multiple   Spaces   Test]]
6. [[../my-test-page/index.md#Another Multi Word Heading]]
```

#### Output

1. [[../test-page/index.md#Test Heading]]
2. [[../test-page/index.md#日本語 見出し]]
3. [[../test-page/index.md#Test Heading|カスタム表示名]]
4. [[../test-page/index.md#English and 日本語 Mixed]]
5. [[../test-page/index.md#Multiple   Spaces   Test]]
6. [[../my-test-page/index.md#Another Multi Word Heading]]

**期待される動作**:
- 見出しのスペースは自動的にハイフンに変換される
- 英字は小文字化される
- 日本語文字は保持される
- 連続スペースは一つのハイフンになる

## 13. 連続スペース正規化テスト

#### Syntax

```markdown
1. [[../page   name/index.md|連続スペース基本]]
2. [[../page     with     many     spaces/index.md|極端な例]]
3. [[../page		  	 name/index.md|タブと混合]]
4. [[../page　　name/index.md|全角スペース]]
5. [[../page/index.md#Multiple     Spaces     Test|連続スペース見出し]]
```

#### Output

1. [[../page   name/index.md|連続スペース基本]]
2. [[../page     with     many     spaces/index.md|極端な例]]
3. [[../page		  	 name/index.md|タブと混合]]
4. [[../page　　name/index.md|全角スペース]]
5. [[../page/index.md#Multiple     Spaces     Test|連続スペース見出し]]

**期待される動作**:
- 連続する空白文字は単一のハイフンに正規化される
- タブ文字と通常スペースの混合も適切に処理される
- Unicode空白文字（全角スペースなど）も正規化される
- 見出しアンカー内でも連続スペースが正規化される

## 14. 日本語文字セット対応テスト

#### Syntax

```markdown
1. [[../ページ　名前/index.md|全角スペースパス]]
2. [[../test　テスト page/index.md|混在文字セット]]
3. [[../日本語ページ/index.md|日本語表示名]]
4. [[../English　日本語 Mixed/index.md|全角半角混在]]
5. [[../page/index.md#日本語　見出し|全角スペース見出し]]
```

#### Output

1. [[../ページ　名前/index.md|全角スペースパス]]
2. [[../test　テスト page/index.md|混在文字セット]]
3. [[../日本語ページ/index.md|日本語表示名]]
4. [[../English　日本語 Mixed/index.md|全角半角混在]]
5. [[../page/index.md#日本語　見出し|全角スペース見出し]]

**期待される動作**:
- 全角スペース（U+3000）は適切にハイフンに変換される
- 英数字と日本語の混在パスが正しく処理される
- 日本語文字はUTF-8エンコーディングで保持される
- エイリアス部分の日本語は適切に表示される

## 15. 基本的なエラーハンドリングテスト

#### Syntax

```markdown
1. [[   ]] 空白のみのパス
2. [[		]] タブのみのパス
3. [[  |エイリアス]] 空のパスでエイリアス
4. [[  ../valid/path  ]] 有効なパス（トリム後）
5. [[../page name/index.md]] 正常なパス
```

#### Output

1. [[   ]] 空白のみのパス
2. [[		]] タブのみのパス
3. [[  |エイリアス]] 空のパスでエイリアス
4. [[  ../valid/path  ]] 有効なパス（トリム後）
5. [[../page name/index.md]] 正常なパス

**期待される動作**:
- 空白のみのパスは無効として扱われ、元のテキストが保持される
- タブのみのパスも無効として扱われる
- 空のパスでエイリアスのみの場合も無効として扱われる
- トリム後に有効になるパスは正常に処理される
- 制御文字を含むパスは適切に処理される

## 16. 通常のMarkdownリンクとの混在

#### Syntax

```markdown
1. これは[[../markdown-basic-test/index.md|WikiLink]]で、これは[通常のリンク](https://example.com)です。
2. [[../callout-comprehensive-test/index.md|内部リンク]]と[外部リンク](https://google.com)を同じ文章で使用。
3. 参照リンク[^1]と[[../math-test/index.md|WikiLink]]の組み合わせ。

[^1]: 脚注の内容
```

#### Output

1. これは[[../markdown-basic-test/index.md|WikiLink]]で、これは[通常のリンク](https://example.com)です。
2. [[../callout-comprehensive-test/index.md|内部リンク]]と[外部リンク](https://google.com)を同じ文章で使用。
3. 参照リンク[^1]と[[../math-test/index.md|WikiLink]]の組み合わせ。

[^1]: 脚注の内容

## 17. エッジケース

#### Syntax

```markdown
1. [[]]（空のWikiLink）
2. [[|エイリアスのみ]]
3. [[#]]（見出しのみ）
4. [[[トリプルブラケット]]]
5. [[リンク1]][[リンク2]]（連続したWikiLink）
6. テキスト[[インライン]]テキスト
```

#### Output

1. [[]]（空のWikiLink）
2. [[|エイリアスのみ]]
3. [[#]]（見出しのみ）
4. [[[トリプルブラケット]]]
5. [[リンク1]][[リンク2]]（連続したWikiLink）
6. テキスト[[インライン]]テキスト

## 18. コードブロック内のWikiLink（動作しない例）

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

## 19. 画像とWikiLinkの組み合わせ

#### Syntax

```markdown
1. [![画像リンク](./itzpapa2.jpg)]([[../markdown-basic-test/index.md]])
2. [[../image-test/index.md|![代替テキスト](./itzpapa2.jpg)]]
```

#### Output

1. [![画像リンク](./itzpapa2.jpg)]([[../markdown-basic-test/index.md]])
2. [[../image-test/index.md|![代替テキスト](./itzpapa2.jpg)]]

## 20. 長いページ名とエイリアス

#### Syntax

```markdown
1. [[../markdown-basic-test/index.md|短縮名]]
2. [[../callout-comprehensive-test/index.md|Short Name]]
```

#### Output

1. [[../markdown-basic-test/index.md|短縮名]]
2. [[../callout-comprehensive-test/index.md|Short Name]]

## まとめ

WikiLink記法は内部リンクを簡単に作成できる便利な機能です。通常のMarkdown記法と組み合わせて使用することで、より効率的にドキュメントを作成できます。
