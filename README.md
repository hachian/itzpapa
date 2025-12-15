# itzpapa - Astro Blog with Obsidian-style Features

[日本語版はこちら / Japanese](./README.ja.md)

An Astro-based blog site that supports Obsidian-style syntax (WikiLink, Callout, Mark Highlight).

## Features

### Core Features
- Markdown & MDX support
- Fast static site generation (Astro v5)
- Simple, customizable design
- High performance architecture
- SEO optimized (canonical URLs, OpenGraph)
- Auto-generated sitemap
- RSS feed support

### Obsidian-style Features
- **WikiLink syntax** - Support for `[[page name]]` link format
  - Handles file names with spaces
  - Anchor links (`[[page#heading]]`)
  - Image embeds (`![[image.jpg]]`)
- **Callout blocks** - Obsidian-style emphasis blocks
  - Various types (note, tip, warning, danger, etc.)
  - Nestable
- **Mark highlight** - Highlight text with `==text==` syntax

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server (localhost:4321) |
| `npm run build` | Build for production (./dist/) |
| `npm run preview` | Preview build locally |
| `npm run test` | Run all tests |

## Project Structure

```
├── public/              # Static files
│   ├── favicon.svg
│   └── fonts/          # Web fonts
├── src/
│   ├── assets/         # Image assets
│   ├── components/     # Astro components
│   ├── content/        # Blog posts (Markdown/MDX)
│   │   └── blog/      # Blog entries
│   ├── layouts/        # Layout templates
│   ├── pages/          # Page components
│   ├── plugins/        # Custom plugins
│   │   ├── remark-wikilink/      # WikiLink support
│   │   └── remark-mark-highlight/ # Mark highlight
│   └── styles/         # Global styles
├── tests/              # Test files
├── astro.config.mjs    # Astro configuration
├── package.json        # Package configuration
└── tsconfig.json       # TypeScript configuration
```

## Dependencies

### Main Dependencies
- **astro** - Static site generator
- **@astrojs/mdx** - MDX integration
- **@astrojs/rss** - RSS feed generation
- **@astrojs/sitemap** - Sitemap generation
- **sharp** - Image processing

### Dev Dependencies
- **remark** - Markdown processor
- **unified** - Text processing interface
- **unist-util-visit** - AST node traversal

## Custom Plugins

### remark-wikilink
Plugin supporting WikiLink syntax (`[[page name]]`).
- Space handling in file names
- Anchor link support
- Image embed support

### remark-mark-highlight
Plugin supporting mark highlight syntax (`==text==`).
- Inline highlight display
- CSS customizable

## Usage

### Creating Blog Posts

1. Create a new folder in `src/content/blog/`
2. Create an `index.md` or `index.mdx` file
3. Add frontmatter and content

#### Frontmatter (Article Metadata)

```markdown
---
title: 'Article Title'           # Required: Page title
description: 'Article summary'   # Required: For SEO and RSS
pubDate: '2024-07-08'           # Required: Publish date (YYYY-MM-DD)
heroImage: './image.jpg'         # Optional: Hero image path
tags:                            # Optional: Tags (array)
  - 'Astro'
  - 'Blog'
draft: false                     # Optional: Draft flag (true = unpublished)
updateDate: '2024-07-09'         # Optional: Update date (YYYY-MM-DD)
---

Article content here...
```

### WikiLink Syntax

```markdown
# Basic link
[[other-page]]

# Anchor link
[[page#heading]]

# Image embed
![[image.jpg]]
```

### Callout Blocks

```markdown
> [!note]
> This is a note callout.

> [!warning]
> This is a warning callout.

> [!tip]
> This is a tip callout.
```

## License

MIT
