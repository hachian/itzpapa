---
title: "TASK-103 統合テスト"
pubDate: 2025-01-01
description: "Markdown記法の統合テスト"
heroImage: "./itzpapa2.jpg"
categories:
  - test
tags:
  - test
  - integration
draft: true
---

# Markdown記法統合テスト

## GFM記法との統合

### 太字とハイライトの統合
- 太字内ハイライト: **==bold highlight==**
- ハイライト内太字: ==**inner bold**==

### 斜体とハイライトの統合
- 斜体内ハイライト: *==italic highlight==*
- ハイライト内斜体: ==*inner italic*==

### 取り消し線とハイライトの統合
- 取り消し線内ハイライト: ~~==strikethrough highlight==~~
- ハイライト内取り消し線: ==~~inner strikethrough~~==

### リンクとハイライトの統合
- リンク内ハイライト: [==link text==](https://example.com)
- ハイライト内リンク: ==[example link](https://example.com)==

## WikiLinkとハイライトの統合

### WikiLink優先処理
- WikiLink内ハイライト: [[==highlighted page==]]
- ハイライト内WikiLink: ==[[wikilink]] highlighted==
- 独立処理: [[page1]] and ==highlight== text

## タグ記法との統合

### タグとハイライトの併用
- ハイライト内タグ: ==highlighted #tag==
- 独立処理: #tag ==highlight==

## 複合記法のテスト

### 多重ネスト
- 複合1: **==*nested italic*==**
- 複合2: *==**nested bold**==*
- 複合3: #tag ==**bold highlight**==

### コード内の除外確認
- インラインコード: `==code==`
- コードブロック内:
```
==this should not be highlighted==
```

## セキュリティテスト

### XSS防止
- HTMLエスケープ: ==<script>alert('xss')</script>==
- HTMLタグ: ==<div>content</div>==