---
title: "Complete Markdown Test"
description: "Tests all markdown plugins together"
tags: ["test", "markdown"]
pubDate: 2024-01-01
---

# Complete Markdown Plugin Test

This document tests all Obsidian-style markdown plugins working together.

## WikiLinks

Basic wikilink: [[../test-page/index.md]]

WikiLink with alias: [[../test-page/index.md|テストページへのリンク]]

Multiple wikilinks: [[../first/index.md]] と [[../second/index.md]]

## Mark Highlight

Basic highlight: ==重要なテキスト==

Multiple highlights: ==first== と ==second== と ==third==

## Tags

Basic tag: #programming

Multiple tags: #javascript #typescript #astro

Japanese tags: #日本語 #プログラミング

Hierarchical tag: #web/frontend/react

## Callouts

> [!note] シンプルなノート
> これはノートコールアウトです。

> [!warning] 警告
> これは警告コールアウトです。

> [!tip] ヒント
> これはヒントコールアウトです。

> [!info]+ 展開可能（デフォルト開）
> クリックで折りたたみ可能です。

> [!caution]- 折りたたみ可能（デフォルト閉）
> クリックで展開可能です。

## Combined Features

> [!note] WikiLinkとハイライト付きノート
> [[../reference/index.md]] を参照してください。
> ==重要== な情報が含まれています。
> #documentation タグ付き。

Inline combination: ==[[../page/index.md]]== と #tag の組み合わせ。

## Edge Cases

### Japanese Content

日本語のテキスト中に #日本語タグ と [[../日本語記事/index.md|日本語リンク]] があります。

### Special Characters

Link with spaces: [[../my page/index.md]]

Tag with hyphen: #kebab-case

Tag with underscore: #snake_case

### Nested Callouts

> [!note] 外側のノート
> 外側のコンテンツ
> > [!tip] 内側のヒント
> > 内側のコンテンツ
