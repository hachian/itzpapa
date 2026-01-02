---
title: Site Configuration Guide
description: >-
  How to configure site.config.ts: site info, theme, navigation, social links,
  SEO, and more
category: Guide
tags:
  - config
  - setup
  - guide
published: 2025-12-20T00:00:00.000Z
---

# Site Configuration Guide

Customizing your itzpapa blog is done through the `site.config.ts` file in the project root. This file provides centralized management of all site settings.

## Configuration Structure

`site.config.ts` is organized into the following sections:

| Section | Purpose |
|---------|---------|
| `site` | Basic site information (title, description, author, etc.) |
| `theme` | Theme color settings |
| `navigation` | Navigation menu |
| `social` | Social media links |
| `footer` | Footer settings |
| `seo` | SEO-related settings |
| `features` | Feature flags (table of contents, tag cloud, etc.) |

```typescript
export const siteConfig: SiteConfig = {
  site: { /* Basic site info */ },
  theme: { /* Theme settings */ },
  navigation: [ /* Navigation */ ],
  social: { /* Social links */ },
  footer: { /* Footer */ },
  seo: { /* SEO settings */ },
  features: { /* Feature flags */ },
};
```

Below is a detailed explanation of each section.

---

## Site Information (site)

Configure basic site information including title, description, and author.

### Configuration Options

| Property | Type | Description |
|----------|------|-------------|
| `title` | string | Site title (displayed in browser tab and header) |
| `description` | string \| object | Site description (used in meta tags and RSS feed) |
| `author` | string | Author name |
| `baseUrl` | string | Production base URL (without trailing slash) |
| `language` | 'ja' \| 'en' | Display language |

### Example

```typescript
site: {
  title: 'My Blog',
  description: 'A blog about programming and technology',
  author: 'Your Name',
  baseUrl: 'https://example.com',
  language: 'en',
},
```

### Multi-language Support

`description` can be set as a language-specific object instead of a single string:

```typescript
site: {
  title: 'My Blog',
  description: {
    ja: 'プログラミングと技術についてのブログ',
    en: 'A blog about programming and technology',
  },
  author: 'Your Name',
  baseUrl: 'https://example.com',
  language: 'en', // Choose 'ja' or 'en'
},
```

Setting `language` to `'en'` displays UI text and descriptions in English.

---

## Theme Settings (theme)

Configure the site-wide accent color.

### Configuration Options

| Property | Type | Description |
|----------|------|-------------|
| `primaryHue` | string \| number | Primary color hue |

### Preset Colors

Several preset colors are available:

| Preset Name | Hue Value | Impression |
|-------------|-----------|------------|
| `'purple'` | 293 | Purple - Creativity and luxury |
| `'ocean'` | 200 | Ocean blue - Trust and calm |
| `'forest'` | 145 | Forest green - Nature and growth |
| `'sunset'` | 25 | Sunset orange - Warmth and energy |
| `'mono'` | 240 | Monochrome - Simple and refined |

### Example

```typescript
// Using preset name
theme: {
  primaryHue: 'purple',
},

// Using numeric value (0-360)
theme: {
  primaryHue: 293,
},
```

### Custom Colors

Specify any hue value from 0 to 360:

| Value | Color |
|-------|-------|
| 0 | Red |
| 60 | Yellow |
| 120 | Green |
| 180 | Cyan |
| 240 | Blue |
| 300 | Magenta |

```typescript
// Red accent color
theme: {
  primaryHue: 0,
},

// Teal/Cyan accent
theme: {
  primaryHue: 180,
},
```

---

## Navigation Menu (navigation)

Configure the navigation menu displayed in the header.

### Configuration Options

Each menu item has these properties:

| Property | Type | Description |
|----------|------|-------------|
| `label` | string | Display text |
| `href` | string | Link URL |

### Example

```typescript
navigation: [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Tags', href: '/tags/' },
  { label: 'About', href: '/about/' },
],
```

### External Links

URLs starting with `http://` or `https://` automatically open in a new tab:

```typescript
navigation: [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'GitHub', href: 'https://github.com/username' },
],
```

### Adding/Removing Menu Items

Add or remove items from the array to customize the menu:

```typescript
// Adding custom pages
navigation: [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Projects', href: '/projects/' },  // Added
  { label: 'Contact', href: '/contact/' },     // Added
],
```

---

## Social Links (social)

Configure social media icon links displayed in the header and footer.

### Supported Platforms

| Property | Platform |
|----------|----------|
| `github` | GitHub |
| `twitter` | Twitter (X) |
| `youtube` | YouTube |
| `bluesky` | Bluesky |
| `instagram` | Instagram |
| `linkedin` | LinkedIn |
| `mastodon` | Mastodon |
| `threads` | Threads |

### Configuration Options

Each social platform has these properties:

| Property | Type | Description |
|----------|------|-------------|
| `enabled` | boolean | Whether to display the icon |
| `url` | string | Profile page URL |

### Example

```typescript
social: {
  github: { enabled: true, url: 'https://github.com/username' },
  twitter: { enabled: true, url: 'https://twitter.com/username' },
  youtube: { enabled: false, url: '' },
  bluesky: { enabled: false, url: '' },
  instagram: { enabled: false, url: '' },
  linkedin: { enabled: false, url: '' },
  mastodon: { enabled: false, url: '' },
  threads: { enabled: false, url: '' },
},
```

### Enabling Social Links

Set `enabled` to `true` and provide the URL for platforms you want to display:

```typescript
// Display GitHub and Twitter
social: {
  github: { enabled: true, url: 'https://github.com/username' },
  twitter: { enabled: true, url: 'https://twitter.com/username' },
  // Keep others as enabled: false
},
```

> [!tip]
> Keep `enabled: false` for platforms you don't use - their icons won't be displayed.

---

## Footer Settings (footer)

Configure the copyright information displayed at the bottom of the page.

### Configuration Options

| Property | Type | Description |
|----------|------|-------------|
| `copyrightText` | string | Copyright text |
| `startYear` | number | Copyright start year (optional) |

### Example

```typescript
footer: {
  copyrightText: 'All rights reserved.',
  startYear: 2024,
},
```

### Display Format

- With `startYear`: Displays as "2024 - 2025"
- Without `startYear`: Displays current year only

```typescript
// "© 2024 - 2025 Your Name. All rights reserved."
footer: {
  copyrightText: 'All rights reserved.',
  startYear: 2024,
},

// "© 2025 Your Name. All rights reserved."
footer: {
  copyrightText: 'All rights reserved.',
  // startYear omitted
},
```

---

## SEO Settings (seo)

Configure search engine optimization and analytics settings.

### Configuration Options

| Property | Type | Description |
|----------|------|-------------|
| `defaultOgImage` | string | Default OG image path |
| `googleAnalyticsId` | string | Google Analytics tracking ID |

### Example

```typescript
seo: {
  defaultOgImage: '/og-image.png',
  googleAnalyticsId: 'G-XXXXXXXXXX',
},
```

### OG Image

- `defaultOgImage` is used when an article doesn't have its own OG image
- Place the image in the `public/` folder
- Recommended size: 1200 x 630 pixels

### Google Analytics

- Set the tracking ID in `googleAnalyticsId` to enable analytics
- Leave empty or undefined to disable tracking

```typescript
// Enable Google Analytics
seo: {
  defaultOgImage: '/og-image.png',
  googleAnalyticsId: 'G-XXXXXXXXXX',
},

// Disable Google Analytics
seo: {
  defaultOgImage: '/og-image.png',
  googleAnalyticsId: '',
},
```

---

## Feature Flags (features)

Toggle various features on or off.

### Configuration Options

| Property | Type | Description |
|----------|------|-------------|
| `tableOfContents` | boolean | Show table of contents |
| `tagCloud` | boolean | Show tag cloud |
| `relatedPosts` | boolean | Show related posts |
| `comments` | object | Comment system settings |

### Example

```typescript
features: {
  tableOfContents: true,
  tagCloud: true,
  relatedPosts: true,
  comments: {
    enabled: false,
  },
},
```

### Table of Contents

Set `tableOfContents: true` to display a table of contents on article pages:

```typescript
features: {
  tableOfContents: true,  // Show TOC
  // or
  tableOfContents: false, // Hide TOC
},
```

### Tag Cloud

Set `tagCloud: true` to display a tag cloud in the sidebar.

### Related Posts

Set `relatedPosts: true` to display related articles at the bottom of posts.

### Comment System

Enable comment systems like Giscus:

```typescript
features: {
  comments: {
    enabled: true,
    provider: 'giscus',
    config: {
      repo: 'owner/repo',
      repoId: 'R_xxxxx',
      category: 'Comments',
      categoryId: 'DIC_xxxxx',
    },
  },
},
```

> [!note]
> Get your Giscus configuration values from [giscus.app](https://giscus.app/).

---

## Summary

By editing `site.config.ts`, you can customize:

- **site**: Basic site information and multi-language support
- **theme**: Theme colors
- **navigation**: Navigation menu
- **social**: Social media links
- **footer**: Footer copyright
- **seo**: OG image and analytics
- **features**: Table of contents, tag cloud, related posts, comments

After making changes, restart the development server to see them:

```bash
npm run dev
```

Other syntax guides:
- [Markdown Syntax Guide](../markdown-demo/index)
- [Obsidian Syntax Guide](../obsidian-syntax-demo/index)
