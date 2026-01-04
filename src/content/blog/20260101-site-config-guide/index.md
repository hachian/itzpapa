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
published: 2026-01-01
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
| `ogImage` | OG image background settings |
| `imageHosting` | External image hosting settings (S3/R2) |

```typescript
export const siteConfig: SiteConfig = {
  site: { /* Basic site info */ },
  theme: { /* Theme settings */ },
  navigation: [ /* Navigation */ ],
  social: { /* Social links */ },
  footer: { /* Footer */ },
  seo: { /* SEO settings */ },
  features: { /* Feature flags */ },
  ogImage: { /* OG image settings */ },
};
```

Below is a detailed explanation of each section.

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

## SEO Settings (seo)

Configure search engine optimization, analytics, and ad settings.

### Configuration Options

| Property | Type | Description |
|----------|------|-------------|
| `googleAnalyticsId` | string | Google Analytics tracking ID |
| `googleAdsenseId` | string | Google AdSense publisher ID |

### Example

```typescript
seo: {
  googleAnalyticsId: 'G-XXXXXXXXXX',
  googleAdsenseId: 'ca-pub-XXXXXXXXXXXXXXXX',
},
```

### OG Image

OG images are automatically generated for each article at `/og/{slug}.png`. The default OG image is located at `/og/default.png`.

To customize the background images used for OG image generation, see [OG Image Settings](#og-image-settings-ogimage).

### Google Analytics

- Set the tracking ID in `googleAnalyticsId` to enable analytics
- Leave empty or undefined to disable tracking

```typescript
// Enable Google Analytics
seo: {
  googleAnalyticsId: 'G-XXXXXXXXXX',
},

// Disable Google Analytics
seo: {
  googleAnalyticsId: '',
},
```

### Google AdSense

- Set the publisher ID in `googleAdsenseId` to enable auto ads
- Publisher ID format: `ca-pub-XXXXXXXXXXXXXXXX` (16-digit number)
- Leave empty or undefined to disable AdSense

```typescript
// Enable Google AdSense
seo: {
  googleAdsenseId: 'ca-pub-1234567890123456',
},

// Disable Google AdSense
seo: {
  googleAdsenseId: '',
},
```

> [!note]
> Google AdSense uses automatic ad placement. After setting the publisher ID, Google's algorithm will determine optimal ad positions on your pages.

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

## OG Image Settings (ogImage)

Configure the background images used for auto-generated OG images.

### Configuration Options

| Property | Type | Description |
|----------|------|-------------|
| `lightBackground` | string | Light mode background image (relative path from `src/assets/`) |
| `darkBackground` | string | Dark mode background image (relative path from `src/assets/`) |

### Example

```typescript
ogImage: {
  lightBackground: 'itzpapa-light_16_9.png',
  darkBackground: 'itzpapa-dark_16_9.png',
},
```

### Custom Background Images

To use your own background images:

1. Place your images in the `src/assets/` directory
2. Images should be 16:9 aspect ratio (recommended: 1200×630px or larger)
3. Update the configuration with your filenames

```typescript
// Using custom background images
ogImage: {
  lightBackground: 'my-custom-light-bg.png',
  darkBackground: 'my-custom-dark-bg.jpg',
},
```

> [!tip]
> Both PNG and JPEG formats are supported. The OG image generator automatically detects the format from the file extension.

### Default Values

If `ogImage` is not configured, these defaults are used:

- Light mode: `itzpapa-light_16_9.png`
- Dark mode: `itzpapa-dark_16_9.png`

## Image External Hosting (imageHosting)

Configure external image hosting to serve images from S3 or Cloudflare R2 CDN. This reduces your deployment size and improves load times through CDN delivery.

### How It Works

When enabled, the build process:

1. **Collects images** from the `dist` directory based on include/exclude patterns
2. **Uploads to S3/R2** with differential upload (skips unchanged files)
3. **Rewrites HTML** to replace local image URLs with external CDN URLs
4. **Deletes images** from `dist` to reduce deployment size

### Configuration Options (site.config.ts)

| Property | Type | Description |
|----------|------|-------------|
| `include` | string[] | Glob patterns for files to upload |
| `exclude` | string[] | Glob patterns for files to exclude |
| `failOnError` | boolean | Abort build on upload failure |
| `useExternalUrlInDev` | boolean | Use external URLs in development |

### Example

```typescript
imageHosting: {
  include: ['**/*.{png,jpg,jpeg,gif,webp,svg}'],
  exclude: [],
  failOnError: false,
  useExternalUrlInDev: false,
},
```

> [!tip]
> By default, all images are uploaded to external hosting. Use `exclude` patterns (e.g., `['hero/**', 'og/**']`) if you need to keep specific images in the local build output.

### Environment Variables (.env)

Sensitive configuration is stored in environment variables:

| Variable | Description |
|----------|-------------|
| `IMAGE_HOSTING_ENABLED` | Enable/disable image hosting (`true`/`false`) |
| `IMAGE_HOSTING_PROVIDER` | Provider type: `S3` or `R2` |
| `IMAGE_HOSTING_BUCKET` | Bucket name |
| `IMAGE_HOST_URL` | CDN base URL for serving images |

#### Cloudflare R2 Configuration

```bash
# R2 Credentials (from R2 API Token)
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_ACCOUNT_ID=your_account_id
```

#### AWS S3 Configuration

```bash
# S3 Credentials
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
```

### Complete .env Example (R2)

```bash
# Image Hosting Configuration
IMAGE_HOSTING_ENABLED=true
IMAGE_HOSTING_PROVIDER=R2
IMAGE_HOSTING_BUCKET=my-images-bucket
IMAGE_HOST_URL=https://images.example.com

# R2 Credentials
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_ACCOUNT_ID=your_account_id
```

### Setting Up Cloudflare R2

1. **Create an R2 bucket** in your Cloudflare dashboard
2. **Create an API token** with R2 read/write permissions
3. **Configure a custom domain** (optional but recommended for CDN caching)
4. **Copy credentials** to your `.env` file

> [!note]
> The `IMAGE_HOST_URL` should be your custom domain or R2 public URL. Images will be served from `{IMAGE_HOST_URL}/{relative-path}`.

### Benefits

- **Reduced deployment size**: Images are removed from `dist` after upload
- **CDN delivery**: Faster image loading through edge caching
- **Differential uploads**: Only changed files are uploaded on subsequent builds
- **Immutable caching**: Images are uploaded with `Cache-Control: max-age=31536000, immutable`

## Summary

By editing `site.config.ts`, you can customize:

- **site**: Basic site information and multi-language support
- **theme**: Theme colors
- **navigation**: Navigation menu
- **social**: Social media links
- **footer**: Footer copyright
- **seo**: Analytics settings
- **features**: Table of contents, tag cloud, related posts, comments
- **ogImage**: OG image background images
- **imageHosting**: External image hosting (S3/R2)

After making changes, restart the development server to see them:

```bash
npm run dev
```

Other syntax guides:
- [Markdown Syntax Guide](../markdown-demo/index)
- [Obsidian Syntax Guide](../obsidian-syntax-demo/index)
