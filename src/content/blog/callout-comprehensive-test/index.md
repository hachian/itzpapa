---
title: "Calloutのテスト"
pubDate: 2025-08-14
description: "Obsidianスタイルのcallout機能の包括的なテストです"
heroImage: "./itzpapa3.jpg"
categories:
  - test
tags:
  - callout
  - obsidian
  - markdown
  - test
---

# Calloutのテスト

このページでは、ObsidianスタイルのCallout機能の動作を確認します。CalloutはObsidianで使用される拡張記法で、注意書きや重要な情報を目立たせるために使用されます。

## 1. 基本的なCalloutタイプ

### 1.1 Note Callout

#### Syntax

```markdown
> [!note]
> これはNoteタイプのcalloutです。一般的な情報を表示するのに使用します。
```

#### Output

> [!note]
> これはNoteタイプのcalloutです。一般的な情報を表示するのに使用します。

### 1.2 Info Callout

#### Syntax

```markdown
> [!info]
> これはInfoタイプのcalloutです。追加の情報を提供します。
```

#### Output

> [!info]
> これはInfoタイプのcalloutです。追加の情報を提供します。

### 1.3 Tip Callout

#### Syntax

```markdown
> [!tip]
> これはTipタイプのcalloutです。有用なヒントやアドバイスを提供します。
```

#### Output

> [!tip]
> これはTipタイプのcalloutです。有用なヒントやアドバイスを提供します。

### 1.4 Warning Callout

#### Syntax

```markdown
> [!warning]
> これはWarningタイプのcalloutです。注意が必要な情報を表示します。
```

#### Output

> [!warning]
> これはWarningタイプのcalloutです。注意が必要な情報を表示します。

### 1.5 Caution Callout

#### Syntax

```markdown
> [!caution]
> これはCautionタイプのcalloutです。重要な警告や注意事項を表示します。
```

#### Output

> [!caution]
> これはCautionタイプのcalloutです。重要な警告や注意事項を表示します。

### 1.6 Important Callout

#### Syntax

```markdown
> [!important]
> これはImportantタイプのcalloutです。特に重要な情報を強調します。
```

#### Output

> [!important]
> これはImportantタイプのcalloutです。特に重要な情報を強調します。

### 1.7 Danger Callout

#### Syntax

```markdown
> [!danger]
> これはDangerタイプのcalloutです。危険な操作や深刻な問題について警告します。
```

#### Output

> [!danger]
> これはDangerタイプのcalloutです。危険な操作や深刻な問題について警告します。

## 2. カスタムタイトル付きCallout

#### Syntax

```markdown
> [!note] カスタムタイトル
> カスタムタイトルを持つNoteタイプのcalloutです。

> [!tip] 有用なヒント
> これはカスタムタイトル「有用なヒント」を持つTipタイプのcalloutです。

> [!warning] 重要な注意事項
> カスタムタイトル「重要な注意事項」付きのWarningタイプです。
```

#### Output

> [!note] カスタムタイトル
> カスタムタイトルを持つNoteタイプのcalloutです。

> [!tip] 有用なヒント
> これはカスタムタイトル「有用なヒント」を持つTipタイプのcalloutです。

> [!warning] 重要な注意事項
> カスタムタイトル「重要な注意事項」付きのWarningタイプです。

## 3. 折りたたみ機能

### 3.1 基本的な折りたたみ

#### Syntax

```markdown
> [!note]-
> これは折りたたみ可能なNoteタイプのcalloutです。
> `-` 記号を使用して折りたたみ機能を有効にしています。
```

#### Output

> [!note]-
> これは折りたたみ可能なNoteタイプのcalloutです。
> `-` 記号を使用して折りたたみ機能を有効にしています。

### 3.2 タイトル付き折りたたみ

#### Syntax

```markdown
> [!warning]- 重要な警告
> これは折りたたみ機能とカスタムタイトルを両方使用したcalloutです。
> クリックして開閉できるはずです。
```

#### Output

> [!warning]- 重要な警告
> これは折りたたみ機能とカスタムタイトルを両方使用したcalloutです。
> クリックして開閉できるはずです。

### 3.3 初期状態で閉じている折りたたみ

#### Syntax

```markdown
> [!info]+ 詳細情報（クリックして展開）
> この内容は初期状態では非表示になっているはずです。
> `+` 記号を使用すると初期状態で折りたたまれます。
```

#### Output

> [!info]+ 詳細情報（クリックして展開）
> この内容は初期状態では非表示になっているはずです。
> `+` 記号を使用すると初期状態で折りたたまれます。

## 4. Callout内のMarkdown記法

#### Syntax

```markdown
> [!note] Markdown記法のテスト
> callout内では以下のMarkdown記法が使用できます：
> 
> - **太字テキスト**
> - *斜体テキスト*
> - ~~打ち消し線~~
> - `インラインコード`
> - [リンク](https://example.com)
> - [[WikiLink]]
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
> > ネストした引用
> 
> ```javascript
> // コードブロックも使用可能
> console.log('Hello, callout!');
> ```
```

#### Output

> [!note] Markdown記法のテスト
> callout内では以下のMarkdown記法が使用できます：
> 
> - **太字テキスト**
> - *斜体テキスト*
> - ~~打ち消し線~~
> - `インラインコード`
> - [リンク](https://example.com)
> - [[WikiLink]]
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
> > ネストした引用
> 
> ```javascript
> // コードブロックも使用可能
> console.log('Hello, callout!');
> ```

## 5. 複数段落のCallout

#### Syntax

```markdown
> [!info] 複数段落の例
> これは複数段落を含むcalloutの例です。
> 
> 第二段落はここから始まります。callout内で長い説明を書く際に便利です。
> 
> 第三段落も正しく表示されるはずです。段落間の間隔も適切に保たれます。
> 
> 最後の段落です。
```

#### Output

> [!info] 複数段落の例
> これは複数段落を含むcalloutの例です。
> 
> 第二段落はここから始まります。callout内で長い説明を書く際に便利です。
> 
> 第三段落も正しく表示されるはずです。段落間の間隔も適切に保たれます。
> 
> 最後の段落です。

## 6. ネストしたCallout

#### Syntax

```markdown
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
```

#### Output

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

## 7. 連続するCallout

#### Syntax

```markdown
> [!note]
> 最初のcalloutです。

> [!warning]
> 二番目のcalloutです。

> [!tip]
> 三番目のcalloutです。
```

#### Output

> [!note]
> 最初のcalloutです。

> [!warning]
> 二番目のcalloutです。

> [!tip]
> 三番目のcalloutです。

## 8. 長いコンテンツのCallout

#### Syntax

```markdown
> [!info]- 長いコンテンツの例
> これは非常に長いコンテンツを含むcalloutの例です。実際のドキュメントでは、このような長い説明が必要な場合があります。
> 
> ### 技術的な詳細
> 
> この機能の実装には以下の技術が使用されています：
> 
> - **Frontend**: Astro, TypeScript, CSS
> - **Backend**: Node.js
> - **スタイリング**: カスタムCSS with CSS Variables
> 
> ### 使用例
> 
> ```typescript
> interface CalloutConfig {
>   type: 'note' | 'info' | 'tip' | 'warning' | 'caution' | 'important' | 'danger';
>   title?: string;
>   collapsible?: boolean;
>   collapsed?: boolean;
> }
> 
> const callout: CalloutConfig = {
>   type: 'info',
>   title: 'カスタムタイトル',
>   collapsible: true,
>   collapsed: false
> };
> ```
> 
> ### 注意事項
> 
> 1. Calloutのネストは3レベルまでサポートされています
> 2. 折りたたみ機能はJavaScriptが有効な場合のみ動作します
> 3. カスタムCSSでスタイルをオーバーライドできます
> 
> この説明が長すぎる場合は、折りたたみ機能を使用して初期状態では非表示にすることを推奨します。
```

#### Output

> [!info]- 長いコンテンツの例
> これは非常に長いコンテンツを含むcalloutの例です。実際のドキュメントでは、このような長い説明が必要な場合があります。
> 
> ### 技術的な詳細
> 
> この機能の実装には以下の技術が使用されています：
> 
> - **Frontend**: Astro, TypeScript, CSS
> - **Backend**: Node.js
> - **スタイリング**: カスタムCSS with CSS Variables
> 
> ### 使用例
> 
> ```typescript
> interface CalloutConfig {
>   type: 'note' | 'info' | 'tip' | 'warning' | 'caution' | 'important' | 'danger';
>   title?: string;
>   collapsible?: boolean;
>   collapsed?: boolean;
> }
> 
> const callout: CalloutConfig = {
>   type: 'info',
>   title: 'カスタムタイトル',
>   collapsible: true,
>   collapsed: false
> };
> ```
> 
> ### 注意事項
> 
> 1. Calloutのネストは3レベルまでサポートされています
> 2. 折りたたみ機能はJavaScriptが有効な場合のみ動作します
> 3. カスタムCSSでスタイルをオーバーライドできます
> 
> この説明が長すぎる場合は、折りたたみ機能を使用して初期状態では非表示にすることを推奨します。

## 9. エッジケース

### 9.1 空のCallout

#### Syntax

```markdown
> [!note]

> [!warning] 空のコンテンツ
```

#### Output

> [!note]

> [!warning] 空のコンテンツ

### 9.2 不正なCalloutタイプ

#### Syntax

```markdown
> [!unknown]
> 未定義のCalloutタイプです。デフォルトスタイルで表示されるはずです。

> [!]
> タイプが指定されていないCalloutです。
```

#### Output

> [!unknown]
> 未定義のCalloutタイプです。デフォルトスタイルで表示されるはずです。

> [!]
> タイプが指定されていないCalloutです。

### 9.3 特殊文字を含むタイトル

#### Syntax

```markdown
> [!note] タイトル (括弧付き)
> 括弧を含むタイトルのテスト

> [!tip] タイトル-with-hyphen
> ハイフンを含むタイトルのテスト

> [!warning] タイトル & アンパサンド
> 特殊文字を含むタイトルのテスト
```

#### Output

> [!note] タイトル (括弧付き)
> 括弧を含むタイトルのテスト

> [!tip] タイトル-with-hyphen
> ハイフンを含むタイトルのテスト

> [!warning] タイトル & アンパサンド
> 特殊文字を含むタイトルのテスト

## 10. 通常のBlockquoteとの比較

#### Syntax

```markdown
> これは通常のblockquoteです。
> calloutの記法を使用していないため、通常のスタイルで表示されます。
> 
> 複数段落も可能です。

> [!note]
> こちらはCalloutです。
> アイコンと色分けされたスタイルで表示されます。
```

#### Output

> これは通常のblockquoteです。
> calloutの記法を使用していないため、通常のスタイルで表示されます。
> 
> 複数段落も可能です。

> [!note]
> こちらはCalloutです。
> アイコンと色分けされたスタイルで表示されます。

## まとめ

Callout機能は、ドキュメント内で重要な情報を視覚的に目立たせるための強力なツールです。以下の特徴があります：

- 7つの基本的なタイプ（note, info, tip, warning, caution, important, danger）
- カスタムタイトルのサポート
- 折りたたみ機能（展開/折りたたみ状態の制御）
- Markdown記法の完全サポート
- ネスト機能
- 通常のblockquoteとの明確な区別

これらの機能により、技術文書やブログ記事で効果的に情報を整理・提示できます。