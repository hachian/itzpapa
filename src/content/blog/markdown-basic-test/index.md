---
title: "基本的なMarkdownのテスト"
pubDate: 2025-08-16
description: "Markdownの基本的な記法をテストするための記事です"
heroImage: "./itzpapa1.jpg"
categories:
  - test
tags:
  - markdown
  - test
draft: true
---

# 基本的なMarkdownのテスト

このページでは、基本的なMarkdown記法の動作を確認します。各セクションでSyntaxとOutputを比較して表示します。

## 1. 見出し (Headings)

#### Syntax

```markdown
# 見出し1
## 見出し2
### 見出し3
#### 見出し4
##### 見出し5
###### 見出し6
```

#### Output

# 見出し1
## 見出し2
### 見出し3
#### 見出し4
##### 見出し5
###### 見出し6

## 2. 段落と改行

#### Syntax

```markdown
これは最初の段落です。
単純な改行でも改行されます。

空行を入れると新しい段落になります。
（段落間は行間が広くなります）
```

#### Output

これは最初の段落です。
単純な改行でも改行されます。

空行を入れると新しい段落になります。
（段落間は行間が広くなります）

## 3. テキストの装飾

#### Syntax

```markdown
**太字のテキスト**
*斜体のテキスト*
***太字かつ斜体***
~~打ち消し線~~
`インラインコード`
```

#### Output

**太字のテキスト**
*斜体のテキスト*
***太字かつ斜体***
~~打ち消し線~~
`インラインコード`

## 4. リスト

### 4.1 順序なしリスト

#### Syntax

```markdown
- アイテム1
- アイテム2
  - サブアイテム2.1
  - サブアイテム2.2
    - サブサブアイテム2.2.1
- アイテム3

* アスタリスクも使える
+ プラス記号も使える
```

#### Output

- アイテム1
- アイテム2
  - サブアイテム2.1
  - サブアイテム2.2
    - サブサブアイテム2.2.1
- アイテム3

* アスタリスクも使える
+ プラス記号も使える

### 4.2 順序付きリスト

#### Syntax

```markdown
1. 最初のアイテム
2. 二番目のアイテム
   1. サブアイテム2.1
   2. サブアイテム2.2
3. 三番目のアイテム

1. 番号は自動的に
1. 振り直される
1. ので1でも大丈夫
```

#### Output

1. 最初のアイテム
2. 二番目のアイテム
   1. サブアイテム2.1
   2. サブアイテム2.2
3. 三番目のアイテム

1. 番号は自動的に
1. 振り直される
1. ので1でも大丈夫

### 4.3 タスクリスト

#### Syntax

```markdown
- [x] 完了したタスク
- [ ] 未完了のタスク
- [ ] 別の未完了タスク
  - [x] サブタスク（完了）
  - [ ] サブタスク（未完了）
```

#### Output

- [x] 完了したタスク
- [ ] 未完了のタスク
- [ ] 別の未完了タスク
  - [x] サブタスク（完了）
  - [ ] サブタスク（未完了）

## 5. リンク

#### Syntax

```markdown
[Google](https://www.google.com)
[タイトル付きリンク](https://www.example.com "Example サイト")
<https://www.example.com>
https://www.example.com

[参照リンク][1]
[別の参照リンク][example]

[1]: https://www.google.com
[example]: https://www.example.com "Example"
```

#### Output

[Google](https://www.google.com)
[タイトル付きリンク](https://www.example.com "Example サイト")
<https://www.example.com>
https://www.example.com

[参照リンク][1]
[別の参照リンク][example]

[1]: https://www.google.com
[example]: https://www.example.com "Example"

## 6. 画像

#### Syntax

```markdown
![代替テキスト](./itzpapa1.jpg)
![タイトル付き画像](./itzpapa1.jpg "画像タイトル")

[![リンク付き画像](./itzpapa1.jpg)](https://www.example.com)
```

#### Output

![代替テキスト](./itzpapa1.jpg)
![タイトル付き画像](./itzpapa1.jpg "画像タイトル")

[![リンク付き画像](./itzpapa1.jpg)](https://www.example.com)

## 7. 引用

#### Syntax

```markdown
> これは引用文です。
> 複数行にわたることもできます。
>
> 段落を分けることもできます。

> ネストした引用も可能です。
>> これはネストされた引用です。
>>> さらに深くネストすることも。
```

#### Output

> これは引用文です。
> 複数行にわたることもできます。
>
> 段落を分けることもできます。

> ネストした引用も可能です。
>> これはネストされた引用です。
>>> さらに深くネストすることも。

## 8. コードブロック

#### Syntax

````markdown
```
プレーンなコードブロック
複数行のコード
```

```javascript
// シンタックスハイライト付き
function hello(name) {
  console.log(`Hello, ${name}!`);
}
```

```python
# Pythonの例
def greet(name):
    print(f"Hello, {name}!")
```
````

#### Output

```
プレーンなコードブロック
複数行のコード
```

```javascript
// シンタックスハイライト付き
function hello(name) {
  console.log(`Hello, ${name}!`);
}
```

```python
# Pythonの例
def greet(name):
    print(f"Hello, {name}!")
```

## 9. 水平線

#### Syntax

```markdown
---
***
___
```

#### Output

---
***
___

## 10. テーブル

#### Syntax

```markdown
| ヘッダー1 | ヘッダー2 | ヘッダー3 |
|-----------|-----------|-----------|
| セル1-1   | セル1-2   | セル1-3   |
| セル2-1   | セル2-2   | セル2-3   |

| 左寄せ | 中央寄せ | 右寄せ |
|:-------|:--------:|-------:|
| 左     | 中央     | 右     |
| L      | C        | R      |
```

#### Output

| ヘッダー1 | ヘッダー2 | ヘッダー3 |
|-----------|-----------|-----------|
| セル1-1   | セル1-2   | セル1-3   |
| セル2-1   | セル2-2   | セル2-3   |

| 左寄せ | 中央寄せ | 右寄せ |
|:-------|:--------:|-------:|
| 左     | 中央     | 右     |
| L      | C        | R      |

## 11. HTMLタグ

#### Syntax

```markdown
<div style="color: blue;">
  これは青色のテキストです。
</div>

<details>
<summary>クリックで展開</summary>
隠されたコンテンツがここに表示されます。
</details>

<kbd>Ctrl</kbd> + <kbd>C</kbd>
<mark>ハイライトされたテキスト</mark>
```

#### Output

<div style="color: blue;">
  これは青色のテキストです。
</div>

<details>
<summary>クリックで展開</summary>
隠されたコンテンツがここに表示されます。
</details>

<kbd>Ctrl</kbd> + <kbd>C</kbd>
<mark>ハイライトされたテキスト</mark>

## 12. エスケープ文字

#### Syntax

```markdown
\*アスタリスクをエスケープ\*
\# ハッシュをエスケープ
\[角括弧をエスケープ\]
\`バッククォートをエスケープ\`
```

#### Output

\*アスタリスクをエスケープ\*
\# ハッシュをエスケープ
\[角括弧をエスケープ\]
\`バッククォートをエスケープ\`

## 13. 脚注

#### Syntax

```markdown
これは脚注付きのテキストです[^1]。
別の脚注もあります[^note]。

[^1]: これが脚注の内容です。
[^note]: 名前付き脚注の内容。
```

#### Output

これは脚注付きのテキストです[^1]。
別の脚注もあります[^note]。

[^1]: これが脚注の内容です。
[^note]: 名前付き脚注の内容。

## 14. 定義リスト

#### Syntax

```markdown
用語1
: 定義1
: 別の定義1

用語2
: 定義2
```

#### Output

用語1
: 定義1
: 別の定義1

用語2
: 定義2

## まとめ

このテスト記事では、Markdownの基本的な記法をすべてカバーしました。これらの記法が正しくレンダリングされることを確認してください。