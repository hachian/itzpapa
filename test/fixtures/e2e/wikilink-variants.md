---
title: "WikiLink Variants Test"
description: "Tests all WikiLink patterns"
tags: ["test", "wikilink"]
pubDate: 2024-01-03
---

# WikiLink Variants

## Basic Links

[[../simple/index.md]]

[[../another-page/index.md]]

## Links with Aliases

[[../page/index.md|Custom Alias]]

[[../page/index.md|日本語エイリアス]]

[[../page/index.md|Long alias with multiple words]]

## Heading Anchors

[[../page/index.md#section-1]]

[[../page/index.md#section-1|セクション1へ]]

## Path Variations

[[../blog/2024/post/index.md]]

[[../deeply/nested/path/index.md]]

## Multiple Links in One Line

[[../first/index.md]] と [[../second/index.md]] と [[../third/index.md]]

## Links in Context

このページでは [[../reference/index.md|リファレンス]] を参照しています。詳細は [[../details/index.md]] をご覧ください。

## Image WikiLinks

![[../images/test.png]]

![[../images/photo.jpg|代替テキスト]]

## Special Cases

### Empty Path (edge case)

[[]]

### Only Alias (edge case)

[[|just alias]]

### Path with Spaces

[[../my page/index.md]]

### Japanese Path

[[../日本語/記事/index.md]]

[[../日本語/記事/index.md|日本語記事]]
