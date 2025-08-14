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

> [!success]
> Operation completed successfully!

> [!question]
> Have you considered all options?

> [!failure]
> The operation failed.

> [!bug]
> Known issue with workaround.

> [!example]
> Here's a practical example.

> [!quote]
> "The only way to do great work is to love what you do." - Steve Jobs

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