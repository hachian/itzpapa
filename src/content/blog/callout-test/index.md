---
title: 'Callout機能テスト'
description: 'Obsidianスタイルのcallout機能をテストします'
pubDate: '2025-01-15'
heroImage: './itzpapa2.jpg'
---

# Callout機能テスト

## 基本的なcallout

### Note callout

> [!note]
> これはNoteタイプのcalloutです。一般的な情報を表示するのに使用します。

### Warning callout

> [!warning]
> これはWarningタイプのcalloutです。注意が必要な情報を表示します。

### Info callout

> [!info]
> これはInfoタイプのcalloutです。追加の情報を提供します。

### Tip callout

> [!tip]
> これはTipタイプのcalloutです。有用なヒントやアドバイスを提供します。

### Caution callout

> [!caution]
> これはCautionタイプのcalloutです。重要な警告や注意事項を表示します。

## callout内でのMarkdown記法

> [!note]
> callout内では以下のMarkdown記法が使用できます：
> 
> - **太字テキスト**
> - *斜体テキスト*
> - `インラインコード`
> - [リンク](https://example.com)
> 
> ```javascript
> // コードブロックも使用可能
> console.log('Hello, callout!');
> ```

## 複数段落のcallout

> [!info]
> これは複数段落を含むcalloutの例です。
>
> 第二段落はここから始まります。callout内で長い説明を書く際に便利です。
>
> 第三段落も正しく表示されるはずです。

## 折りたたみ機能のテスト

### 折りたたみ可能なcallout（初期状態は展開）

> [!note]-
> これは折りたたみ可能なNoteタイプのcalloutです。`-` 記号を使用して折りたたみ機能を有効にしています。
>
> この部分は折りたたみ可能です。クリックして開閉できるはずです。

### 折りたたみ可能なcallout（タイトル付き）

> [!warning]- 重要な警告
> これは折りたたみ機能とカスタムタイトルを両方使用したcalloutです。
>
> - リスト項目1
> - リスト項目2
> - リスト項目3

## calloutタイトルのテスト

### カスタムタイトル付きcallout

> [!tip] 有用なヒント
> これはカスタムタイトル「有用なヒント」を持つTipタイプのcalloutです。

> [!info] プロジェクト情報
> こちらはプロジェクト情報というタイトルが付いたInfoタイプのcalloutです。
>
> 複数段落でも正しく動作します。

## 通常のblockquote（calloutではない）

> これは通常のblockquoteです。calloutの記法を使用していないため、通常のスタイルで表示されます。