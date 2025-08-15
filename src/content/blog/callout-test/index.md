---
title: 'Callout Test'
description: 'Testing Obsidian-style callouts'
pubDate: 'Jan 14 2025'
---

# Obsidian Callout Test

## Basic Callouts

> [!note]
> This is a note callout with important information.

> [!tip] Pro Tip
> Custom titles work too!

> [!warning]
> Be careful with this operation.
> It can have serious consequences.

## Foldable Callouts

> [!info]+ Expanded by default
> This callout starts expanded and can be collapsed.

> [!danger]- Collapsed by default
> This sensitive information starts hidden.

## All Callout Types

> [!note]
> Lorem ipsum dolor sit amet

> [!abstract]
> Lorem ipsum dolor sit amet

> [!info]
> Lorem ipsum dolor sit amet

> [!todo]
> Lorem ipsum dolor sit amet

> [!tip]
> Lorem ipsum dolor sit amet

> [!success]
> Lorem ipsum dolor sit amet

> [!question]
> Lorem ipsum dolor sit amet

> [!warning]
> Lorem ipsum dolor sit amet

> [!failure]
> Lorem ipsum dolor sit amet

> [!danger]
> Lorem ipsum dolor sit amet

> [!bug]
> Lorem ipsum dolor sit amet

> [!example]
> Lorem ipsum dolor sit amet

> [!quote]
> Lorem ipsum dolor sit amet

## With Wikilinks

> [!note]
> Check out the [[wikilink-test-suite/index|wikilink test]] for more examples.

## Inline Markdown Elements

> [!note] **Bold Text Test**
> This callout contains **bold text**, *italic text*, `inline code`, and [external links](https://example.com).

> [!tip] Mixed Content
> First line with **bold** content.
> 
> Second paragraph with *italic* and `code` elements.

> [!warning] Code Example
> Use `console.log("Hello World")` for debugging.
> 
> ```javascript
> function greet(name) {
>   return `Hello, ${name}!`;
> }
> ```

## Nested Callouts

> [!warning] Parent Warning
> This is a parent callout with important information.
> 
> > [!tip] Nested Tip
> > This tip is nested inside the warning.
> 
> Back to parent content.

> [!info]+ Expandable with Nested
> This callout can be collapsed.
> 
> > [!danger]- Hidden Danger
> > This nested danger starts collapsed.
> > 
> > > [!note] Triple Nested
> > > Even deeper nesting works!