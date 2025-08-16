---
title: 'Callout + Wikilink統合テスト'
description: 'callout内でのwikilink機能をテストします'
pubDate: '2025-01-15'
heroImage: './itzpapa3.jpg'
---

# Callout + Wikilink統合テスト

## callout内での基本的なwikilink

> [!note] ページリンクテスト
> 他のページへのリンク：[[../image-test/index.md]]
>
> カスタム名付きリンク：[[../link-test/index.md|リンクテストページ]]

## callout内でのwikilink画像表示

### 基本的な画像wikilink

> [!info] 画像表示テスト
> 基本的な画像：![[../image-test/test-image.png]]
>
> この画像は正しく表示されるはずです。

### Alt付き画像wikilink

> [!tip] Alt属性付き画像
> Alt属性付きの画像：![[../image-test/test-image.png|テスト画像の説明]]
>
> この画像にはカスタムのalt属性が設定されています。

### 相対パス画像wikilink

> [!warning] 相対パス画像
> 相対パスでの画像：![[../link-test/blog-placeholder-3.jpg]]
>
> 異なるディレクトリの画像も正しく表示されるはずです。

## 折りたたみcallout内でのwikilink画像

> [!note]- 折りたたみ可能な画像ギャラリー
> 折りたたみ可能なcallout内の画像：
>
> ![[../image-test/test-image.png|折りたたみ内の画像1]]
>
> ![[../image-test/another-image.jpg|折りたたみ内の画像2]]
>
> 複数の画像が正しく表示され、折りたたみ機能も動作するはずです。

## 複合的なwikilink使用

> [!caution] 複合テスト
> このcalloutには以下が含まれています：
>
> - テキストリンク：[[../wikilink-test-suite/index.md|Wikilink テストスイート]]
> - 画像：![[../image-test/test-image.png]]
> - 別の画像：![[../link-test/blog-placeholder-3.jpg|プレースホルダー画像]]
>
> すべての要素が正しく動作するはずです。

## 日本語ファイル名対応

> [!info] 日本語ファイル名テスト
> 日本語ファイル名も対応している場合：
>
> テストファイル：[[../image-test/index.md|画像テストページ]]
>
> 日本語を含むパスでも正しく動作するはずです。

## 回帰テスト

### 既存wikilink機能の確認

通常のwikilink機能が維持されているかの確認：

[[../image-test/index.md|画像テストページ]]

![[../image-test/test-image.png|通常のwikilink画像]]

### 通常のMarkdown記法との混在

Markdownの通常のリンクとwikilinkの混在：

- 通常のMarkdownリンク：[Image Test Page](../image-test/)
- Wikilinkリンク：[[../image-test/index.md]]
- 通常の画像：![Test Image](../image-test/test-image.png)
- Wikilink画像：![[../image-test/test-image.png]]