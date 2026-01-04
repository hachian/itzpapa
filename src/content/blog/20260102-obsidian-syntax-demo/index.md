---
title: Obsidian Syntax Guide
description: >-
  A guide to Obsidian-compatible syntax and custom extensions supported in
  itzpapa blog
category: Tutorial
tags:
  - obsidian
  - itzpapa
  - demo
published: 2025-12-31
updated: 2026-01-02
---

# Obsidian Syntax Guide

This page demonstrates the Obsidian-compatible syntax and custom extensions supported in itzpapa blog. You can publish your Obsidian notes directly as blog posts.

## WikiLinks (Internal Links)

WikiLinks are a signature feature of Obsidian. Wrap text in double square brackets `[[]]` to create links to other pages easily.

### Basic WikiLink

#### Syntax

```markdown
[[markdown-demo]]
```

#### Output

[[markdown-demo]]

#### Use Cases

- Cross-referencing between blog posts
- Navigation to related content
- Building a knowledge base

### WikiLink with Alias

Use the pipe symbol `|` to specify an alias when you want to change the display text.

#### Syntax

```markdown
[[markdown-demo|Check out the Markdown Guide]]
```

#### Output

[[markdown-demo|Check out the Markdown Guide]]

### Image Embedding with WikiLink

Use `![[]]` syntax to embed images from other articles or directories.

#### Syntax

```markdown
![[../20260103-markdown-demo/sample-image.jpg]]
```

#### Output

![[../20260103-markdown-demo/sample-image.jpg]]

#### Features

- Use `!` prefix to embed instead of link
- Supports relative paths to other directories
- Works with jpg, png, gif, webp, and other image formats

## Mark Highlight

Wrap text with `==` to highlight it. This is useful for emphasizing important information.

### Basic Highlight

#### Syntax

```markdown
This is ==important text== in the sentence.
```

#### Output

This is ==important text== in the sentence.

### Multiple Highlights

#### Syntax

```markdown
Remember ==Point 1== and ==Point 2== for later.
```

#### Output

Remember ==Point 1== and ==Point 2== for later.

#### Use Cases

- Emphasizing key terms
- Marking important points
- Note-taking and study highlights

### Combining with Other Formatting

Highlights can be combined with bold or italic text.

#### Syntax

```markdown
**==Bold and highlighted==**
*==Italic and highlighted==*
```

#### Output

**==Bold and highlighted==**
*==Italic and highlighted==*

> [!note]
> Bold and italic have custom styles in this blog. See the [Markdown Syntax Guide](../markdown-demo/index#text-emphasis) for details.

## Callouts

Callouts are block elements that make notes, warnings, and supplementary information stand out. They use the same syntax as Obsidian.

### Basic Callout

#### Syntax

```markdown
> [!note]
> This is a note. Use it for supplementary information.
```

#### Output

> [!note]
> This is a note. Use it for supplementary information.

### Callout Types

#### Note

> [!note]
> Use notes for supplementary information and additional explanations.

#### Info

> [!info]
> Use info callouts for background information and references.

#### Tip

> [!tip]
> Use tips for helpful hints and best practices.

#### Warning

> [!warning]
> Use warnings for cautionary notes and potential issues.

#### Caution

> [!caution]
> Use caution for dangerous operations or serious consequences.

#### Important

> [!important]
> Use important callouts to highlight critical information.

### Callouts with Custom Titles

You can add custom titles to callouts.

#### Syntax

```markdown
> [!tip] Pro Tip
> Learning keyboard shortcuts will boost your productivity.
```

#### Output

> [!tip] Pro Tip
> Learning keyboard shortcuts will boost your productivity.

### Foldable Callouts

Add `-` after the type to make the callout collapsed by default. Add `+` to make it expanded by default.

#### Syntax

```markdown
> [!note]- Click to expand
> This content is collapsed by default.
> Click to expand it.

> [!info]+ Expanded by default
> This content is expanded by default.
> Click to collapse it.
```

#### Output

> [!note]- Click to expand
> This content is collapsed by default.
> Click to expand it.

> [!info]+ Expanded by default
> This content is expanded by default.
> Click to collapse it.

#### When to Use Each Type

- **note**: General supplementary information
- **info**: Background information and references
- **tip**: Best practices and shortcuts
- **warning**: Cautionary notes and known issues
- **caution**: Warnings about dangerous operations
- **important**: Critical information that shouldn't be missed

## Task Status (Extended Checkboxes)

itzpapa supports Obsidian-style extended task status with 22 different checkbox types. Each status has a unique icon and color for visual distinction.

### Basic Task Status

Core task states for tracking progress.

#### Syntax

```markdown
- [ ] To-do (space)
- [/] Incomplete (in progress)
- [x] Done (completed)
- [-] Canceled
```

#### Output

- [ ] To-do (space)
- [/] Incomplete (in progress)
- [x] Done (completed)
- [-] Canceled

### Scheduling Status

Track task scheduling and forwarding.

#### Syntax

```markdown
- [>] Forwarded (moved to later)
- [<] Scheduling (to be scheduled)
```

#### Output

- [>] Forwarded (moved to later)
- [<] Scheduling (to be scheduled)

### Priority & State Markers

Indicate importance and special states.

#### Syntax

```markdown
- [?] Question (needs clarification)
- [!] Important (high priority)
- [*] Star (favorite)
```

#### Output

- [?] Question (needs clarification)
- [!] Important (high priority)
- [*] Star (favorite)

### Reference & Information Markers

Mark references and metadata.

#### Syntax

```markdown
- ["] Quote
- [l] Location
- [b] Bookmark
- [i] Information
```

#### Output

- ["] Quote
- [l] Location
- [b] Bookmark
- [i] Information

### Idea & Evaluation Markers

Track ideas and pros/cons.

#### Syntax

```markdown
- [S] Savings
- [I] Idea (lightbulb)
- [p] Pros (positive)
- [c] Cons (negative)
```

#### Output

- [S] Savings
- [I] Idea (lightbulb)
- [p] Pros (positive)
- [c] Cons (negative)

### Action & Result Markers

Indicate actions and outcomes.

#### Syntax

```markdown
- [f] Fire (urgent)
- [k] Key (important)
- [w] Win (success)
- [u] Up (trending up)
- [d] Down (trending down)
```

#### Output

- [f] Fire (urgent)
- [k] Key (important)
- [w] Win (success)
- [u] Up (trending up)
- [d] Down (trending down)

### Complete Status Reference

| Syntax | Name | Use Case |
|--------|------|----------|
| `[ ]` | To-do | Pending task |
| `[/]` | Incomplete | Work in progress |
| `[x]` | Done | Completed task |
| `[-]` | Canceled | No longer needed |
| `[>]` | Forwarded | Moved to later |
| `[<]` | Scheduling | Needs scheduling |
| `[?]` | Question | Needs clarification |
| `[!]` | Important | High priority |
| `[*]` | Star | Favorite/highlight |
| `["]` | Quote | Citation or quote |
| `[l]` | Location | Place reference |
| `[b]` | Bookmark | Saved for later |
| `[i]` | Information | Reference info |
| `[S]` | Savings | Cost savings |
| `[I]` | Idea | New idea |
| `[p]` | Pros | Positive point |
| `[c]` | Cons | Negative point |
| `[f]` | Fire | Urgent/hot |
| `[k]` | Key | Key point |
| `[w]` | Win | Success |
| `[u]` | Up | Trending up |
| `[d]` | Down | Trending down |

### Nested Tasks Example

#### Syntax

```markdown
- [x] Project planning
  - [/] Implementation in progress
  - [ ] Pending review
  - [!] Critical bug fix needed
```

#### Output

- [x] Project planning
  - [/] Implementation in progress
  - [ ] Pending review
  - [!] Critical bug fix needed

## Tags

Tags help you categorize and organize your articles. itzpapa supports both frontmatter tags and inline tags.

### Inline Tags

Write `#tagname` anywhere in the article body to create an inline tag. This is a quick way to tag content directly while writing.

#### Syntax

```markdown
This article is about #obsidian and #markdown syntax.
You can also use #web/frontend for hierarchical tags.
```

#### Output

This article is about #obsidian and #markdown syntax.
You can also use #web/frontend for hierarchical tags.

#### Features

- Inline tags are automatically linked to the tag archive page
- Supports hierarchical tags with `/` (e.g., `#tech/web`)
- Can be placed anywhere in the article body
- Useful for quick categorization while writing

### Setting Tags in Frontmatter

Set tags in the frontmatter (YAML block at the beginning of the article).

#### Syntax

```yaml
---
title: "Article Title"
pubDate: 2025-01-01
description: "Article description"
tags:
  - javascript
  - web-development
  - tutorial
---
```

Looking at this article's frontmatter, you can see the tags `obsidian`, `itzpapa`, and `demo` are set.

### Hierarchical Tags

Use forward slashes `/` to create hierarchical tags. This enables more granular categorization.

#### Syntax

```yaml
tags:
  - tech/web
  - tech/web/frontend
  - programming/javascript
```

#### Use Cases

- **tech/web**: General web technologies
- **tech/web/frontend**: Web frontend specifically
- **programming/javascript**: JavaScript programming

Hierarchical tags allow you to search articles by parent tag or filter by child tags.

### Tag Examples

| Tag | Purpose |
|-----|---------|
| `tutorial` | Tutorial articles |
| `tech/web` | Web technology related |
| `tools/obsidian` | Obsidian tool |
| `project/itzpapa` | itzpapa project |

## Summary

This page covered the Obsidian-compatible syntax available in itzpapa blog:

- **WikiLinks**: Cross-linking between articles
- **Mark Highlight**: Emphasizing important text
- **Callouts**: Displaying notes and warnings
- **Task Status**: 22 extended checkbox types for tracking
- **Tags**: Inline tags and frontmatter tags for categorization

Using these features, you can publish your Obsidian notes directly as blog posts.

For standard Markdown syntax, see the [Markdown Syntax Guide](../markdown-demo/index).