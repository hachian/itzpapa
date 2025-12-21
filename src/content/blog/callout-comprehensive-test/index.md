---
title: "Calloutのテスト"
pubDate: 2025-08-14
description: "Obsidianスタイルのcallout機能の包括的なテストです（13タイプ + エイリアス対応）"
heroImage: "./itzpapa3.jpg"
categories:
  - test
tags:
  - callout
  - obsidian
  - markdown
  - test
draft: true
---

# Calloutのテスト

このページでは、ObsidianスタイルのCallout機能の動作を確認します。Obsidian公式の**13タイプ**と**14種類のエイリアス**をすべてサポートしています。

## 1. Obsidian公式13タイプのCallout

### 1.1 Note（ノート）

> [!note]
> これはNoteタイプのcalloutです。一般的な情報やメモを表示するのに使用します。

### 1.2 Abstract（要約）

> [!abstract]
> これはAbstractタイプのcalloutです。要約や概要を表示するのに使用します。

### 1.3 Info（情報）

> [!info]
> これはInfoタイプのcalloutです。追加の情報を提供します。

### 1.4 Todo（タスク）

> [!todo]
> これはTodoタイプのcalloutです。やるべきタスクや作業項目を表示します。

### 1.5 Tip（ヒント）

> [!tip]
> これはTipタイプのcalloutです。有用なヒントやアドバイスを提供します。

### 1.6 Success（成功）

> [!success]
> これはSuccessタイプのcalloutです。成功メッセージや完了した項目を表示します。

### 1.7 Question（質問）

> [!question]
> これはQuestionタイプのcalloutです。FAQ形式や疑問点を表示するのに使用します。

### 1.8 Warning（警告）

> [!warning]
> これはWarningタイプのcalloutです。注意が必要な情報を表示します。

### 1.9 Failure（失敗）

> [!failure]
> これはFailureタイプのcalloutです。失敗メッセージやエラー状態を表示します。

### 1.10 Danger（危険）

> [!danger]
> これはDangerタイプのcalloutです。危険な操作や深刻な問題について警告します。

### 1.11 Bug（バグ）

> [!bug]
> これはBugタイプのcalloutです。既知のバグや問題を報告するのに使用します。

### 1.12 Example（例）

> [!example]
> これはExampleタイプのcalloutです。使用例やサンプルコードを表示します。

### 1.13 Quote（引用）

> [!quote]
> これはQuoteタイプのcalloutです。引用文や名言を表示するのに使用します。

---

## 2. エイリアス（別名）のテスト

Obsidianでは、いくつかのcalloutタイプにエイリアス（別名）が用意されています。

### 2.1 Abstract のエイリアス

#### summary → abstract

> [!summary]
> `[!summary]`は`[!abstract]`のエイリアスです。要約として表示されます。

#### tldr → abstract

> [!tldr]
> `[!tldr]`（Too Long; Didn't Read）も`[!abstract]`のエイリアスです。

### 2.2 Tip のエイリアス

#### hint → tip

> [!hint]
> `[!hint]`は`[!tip]`のエイリアスです。ヒントとして表示されます。

#### important → tip

> [!important]
> `[!important]`も`[!tip]`のエイリアスです。重要な情報として表示されます。

### 2.3 Success のエイリアス

#### check → success

> [!check]
> `[!check]`は`[!success]`のエイリアスです。チェック済み項目として表示されます。

#### done → success

> [!done]
> `[!done]`も`[!success]`のエイリアスです。完了した項目として表示されます。

### 2.4 Question のエイリアス

#### help → question

> [!help]
> `[!help]`は`[!question]`のエイリアスです。ヘルプ情報として表示されます。

#### faq → question

> [!faq]
> `[!faq]`も`[!question]`のエイリアスです。FAQ形式で表示されます。

### 2.5 Warning のエイリアス

#### caution → warning

> [!caution]
> `[!caution]`は`[!warning]`のエイリアスです。注意事項として表示されます。

#### attention → warning

> [!attention]
> `[!attention]`も`[!warning]`のエイリアスです。注目すべき情報として表示されます。

### 2.6 Failure のエイリアス

#### fail → failure

> [!fail]
> `[!fail]`は`[!failure]`のエイリアスです。失敗情報として表示されます。

#### missing → failure

> [!missing]
> `[!missing]`も`[!failure]`のエイリアスです。欠落した情報として表示されます。

### 2.7 Danger のエイリアス

#### error → danger

> [!error]
> `[!error]`は`[!danger]`のエイリアスです。エラー情報として表示されます。

### 2.8 Quote のエイリアス

#### cite → quote

> [!cite]
> `[!cite]`は`[!quote]`のエイリアスです。引用として表示されます。

---

## 3. 大文字小文字のテスト

Calloutタイプは大文字小文字を区別しません。

> [!NOTE]
> 大文字の`[!NOTE]`も正しく動作します。

> [!Warning]
> 混在した`[!Warning]`も正しく動作します。

> [!TLDR]
> エイリアスの大文字`[!TLDR]`も正しく動作します。

---

## 4. カスタムタイトル付きCallout

### 各タイプにカスタムタイトルを設定

> [!note] メモ: 重要なポイント
> カスタムタイトルを持つNoteです。

> [!abstract] 概要
> カスタムタイトルを持つAbstractです。

> [!tip] プロのヒント
> カスタムタイトルを持つTipです。

> [!success] タスク完了！
> カスタムタイトルを持つSuccessです。

> [!question] よくある質問
> カスタムタイトルを持つQuestionです。

> [!warning] 注意してください
> カスタムタイトルを持つWarningです。

> [!danger] 危険: この操作は元に戻せません
> カスタムタイトルを持つDangerです。

> [!bug] 既知のバグ #123
> カスタムタイトルを持つBugです。

> [!example] 使用例
> カスタムタイトルを持つExampleです。

> [!quote] アインシュタイン
> 「想像力は知識より重要だ」

---

## 5. 折りたたみ機能

### 5.1 展開状態（`-`）

> [!note]- クリックで折りたためます
> これは展開状態で表示される折りたたみcalloutです。
> `-`記号を使用しています。

> [!tip]- ヒントを表示
> 役立つヒントがここに表示されています。

### 5.2 折りたたみ状態（`+`）

> [!info]+ クリックで展開できます
> これは初期状態で折りたたまれているcalloutです。
> `+`記号を使用しています。

> [!warning]+ 詳細な警告を表示
> この警告の詳細内容は初期状態では非表示です。

### 5.3 各タイプの折りたたみ

> [!abstract]- 要約を折りたたむ
> Abstractタイプの折りたたみ

> [!todo]- タスクリスト
> - [ ] タスク1
> - [ ] タスク2
> - [x] タスク3

> [!success]- 成功の詳細
> Successタイプの折りたたみ

> [!failure]- エラーログ
> Failureタイプの折りたたみ

> [!bug]- バグの詳細
> Bugタイプの折りたたみ

> [!example]- コード例
> ```javascript
> console.log('Hello, World!');
> ```

> [!quote]- 引用元
> Quoteタイプの折りたたみ

---

## 6. Callout内のMarkdown記法

> [!note] Markdown記法のテスト
> callout内では以下のMarkdown記法が使用できます：
>
> - **太字テキスト**
> - *斜体テキスト*
> - ~~打ち消し線~~
> - `インラインコード`
> - [リンク](https://example.com)
> - ==ハイライト==
>
> ### 見出しも使用可能
>
> 1. 順序付きリスト
> 2. 項目2
>    - ネストしたリスト
>    - 項目2
>
> | テーブル | も使える |
> |----------|----------|
> | セル1    | セル2    |
>
> ```javascript
> // コードブロックも使用可能
> console.log('Hello, callout!');
> ```

---

## 7. ネストしたCallout

> [!note] 外側のCallout
> これは外側のNoteタイプのcalloutです。
>
> > [!warning] 内側のCallout
> > 内側にWarningタイプのcalloutをネストしています。
> >
> > > [!tip] さらに内側
> > > 三重にネストしたTipタイプのcalloutです。
>
> 外側のcalloutの続きです。

---

## 8. 連続するCallout（全13タイプ一覧）

> [!note]
> Note

> [!abstract]
> Abstract

> [!info]
> Info

> [!todo]
> Todo

> [!tip]
> Tip

> [!success]
> Success

> [!question]
> Question

> [!warning]
> Warning

> [!failure]
> Failure

> [!danger]
> Danger

> [!bug]
> Bug

> [!example]
> Example

> [!quote]
> Quote

---

## 9. エッジケース

### 9.1 空のCallout

> [!note]

### 9.2 未知のタイプ（noteにフォールバック）

> [!unknown]
> 未定義のCalloutタイプです。noteタイプとして表示されます。

### 9.3 特殊文字を含むタイトル

> [!note] タイトル (括弧付き)
> 括弧を含むタイトルのテスト

> [!tip] タイトル & アンパサンド
> 特殊文字を含むタイトルのテスト

> [!warning] <script>alert('XSS')</script>
> HTMLタグを含むタイトルのテスト（エスケープされるべき）

---

## 10. 通常のBlockquoteとの比較

> これは通常のblockquoteです。
> calloutの記法を使用していないため、通常のスタイルで表示されます。

> [!note]
> こちらはCalloutです。
> アイコンと色分けされたスタイルで表示されます。

---

## まとめ

Callout機能は、ドキュメント内で重要な情報を視覚的に目立たせるための強力なツールです：

| 機能 | 説明 |
|------|------|
| **13タイプ** | note, abstract, info, todo, tip, success, question, warning, failure, danger, bug, example, quote |
| **14エイリアス** | summary, tldr, hint, important, check, done, help, faq, caution, attention, fail, missing, error, cite |
| **カスタムタイトル** | `[!type] タイトル` で設定 |
| **折りたたみ** | `-`（展開）/ `+`（折りたたみ）|
| **ネスト** | 最大3レベルまで |
| **Markdown対応** | 完全サポート |
| **大文字小文字** | 区別しない |
| **未知タイプ** | noteにフォールバック |

これらの機能により、技術文書やブログ記事で効果的に情報を整理・提示できます。
