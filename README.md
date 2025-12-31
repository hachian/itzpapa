# itzpapa - Astro Blog with Obsidian-style Features

[日本語版はこちら / Japanese](./README.ja.md)

An Astro-based blog site that supports Obsidian-style syntax (WikiLink, Callout, Inline Tags, Mark Highlight) with powerful customization options.

## Features

### Core Features
- Markdown & MDX support
- Fast static site generation (Astro v5)
- Simple, customizable design with centralized configuration (`site.config.ts`)
- High performance architecture
- SEO optimized (canonical URLs, OpenGraph)
- **Dynamic OG image generation** - Auto-generates OG images with article titles
- **Auto-generated logo/favicon** - Colors adapt to your primaryHue setting
- Auto-generated sitemap
- RSS feed support
- **Multilingual support (i18n)** - Japanese and English
- **giscus comment system** - GitHub Discussions-based comments
- **Breadcrumb navigation** - For blog and tag pages

### Obsidian-style Features
- **WikiLink syntax** - Support for `[[page name]]` link format
  - Handles file names with spaces
  - Anchor links (`[[page#heading]]`)
  - Image embeds (`![[image.jpg]]`)
- **Callout blocks** - Obsidian-style emphasis blocks
  - 13 official types + 14 aliases (note, tip, warning, danger, abstract, summary, info, todo, success, question, failure, bug, example, quote, etc.)
  - Foldable and nestable
- **Mark highlight** - Highlight text with `==text==` syntax
- **Inline tags** - `#tag` format auto-linked to tag pages
  - Hierarchical tags: `#parent/child`
  - Japanese tag support
- **Single line breaks** - Single newline creates a line break (remark-breaks)

### Theme Customization
Customize your site's color scheme using `primaryHue` in `site.config.ts`:

```typescript
theme: {
  // Use preset names or numeric values (0-360)
  primaryHue: 'purple'  // or 293
}
```

**Presets:**
- `purple` (293) - Creativity and elegance
- `ocean` (200) - Trust and calm
- `forest` (145) - Nature and growth
- `sunset` (25) - Warmth and energy
- `mono` (240) - Simple and refined

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

## Configuration

All site settings are centralized in `site.config.ts` at the project root:

```typescript
export const siteConfig = {
  site: {
    title: 'Your Site Title',
    description: { ja: '日本語説明', en: 'English description' },
    author: 'Your Name',
    baseUrl: 'https://your-site.com',
    language: 'en',  // 'ja' or 'en'
  },
  theme: {
    primaryHue: 'purple',  // Preset or 0-360
  },
  navigation: [...],
  social: { github: {...}, twitter: {...}, ... },
  features: {
    tableOfContents: true,
    tagCloud: true,
    relatedPosts: true,
    comments: { enabled: true, provider: 'giscus', config: {...} },
  },
};
```

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
│   │   ├── remark-mark-highlight/ # Mark highlight
│   │   ├── remark-tags/          # Inline tag support
│   │   └── rehype-callout/       # Callout blocks
│   └── styles/         # Global styles
├── tests/              # Test files
├── site.config.ts      # Centralized site configuration
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

### remark-tags
Plugin supporting inline tag syntax (`#tag`).
- Hierarchical tags (`#parent/child`)
- Japanese tag support
- Auto-linking to tag pages

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

### Inline Tags

```markdown
This is a #tutorial about #astro/blog development.

Use #日本語タグ for Japanese tags.
```

### Callout Blocks

```markdown
> [!note]
> This is a note callout.

> [!warning]
> This is a warning callout.

> [!tip]
> This is a tip callout.

> [!abstract]
> This is an abstract/summary callout.
```

**Available callout types:** note, abstract, summary, tldr, info, todo, tip, hint, important, success, check, done, question, help, faq, warning, caution, attention, failure, fail, missing, danger, error, bug, example, quote, cite

## Deployment

### Cloudflare Pages

This project includes configuration for Cloudflare Pages deployment:
- `wrangler.toml` - Cloudflare configuration
- Security headers configured in `_headers`

## License

MIT
