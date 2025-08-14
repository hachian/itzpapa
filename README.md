# Astro Starter Kit: Blog

```sh
npm create astro@latest -- --template blog
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

Features:

- ✅ Minimal styling (make it your own!)
- ✅ 100/100 Lighthouse performance
- ✅ SEO-friendly with canonical URLs and OpenGraph data
- ✅ Sitemap support
- ✅ RSS Feed support
- ✅ Markdown & MDX support
- ✅ **Obsidian-style Wikilinks** support (`[[page-name]]`, `[[page|title]]`, `![[image.png]]`)
- ✅ **Obsidian-style Callouts** support with 11 types and nesting capability
- ✅ Comprehensive test suite with 90%+ coverage

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
├── public/
├── src/
│   ├── components/
│   ├── content/
│   ├── layouts/
│   └── pages/
├── astro.config.mjs
├── README.md
├── package.json
└── tsconfig.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

The `src/content/` directory contains "collections" of related Markdown and MDX documents. Use `getCollection()` to retrieve posts from `src/content/blog/`, and type-check your frontmatter using an optional schema. See [Astro's Content Collections docs](https://docs.astro.build/en/guides/content-collections/) to learn more.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |
| `npm test`                | Run comprehensive test suite (wikilinks + callouts) |
| `npm run test:all`        | Run all tests sequentially                       |

## 📝 Obsidian Features

This blog supports Obsidian-style markdown features for better note-taking and content organization.

### Wikilinks

Create internal links between your blog posts using double brackets:

```markdown
Basic link: [[post-name]]
Link with custom title: [[post-name|Custom Title]]
Image embedding: ![[image.png]]
Image with alt text: ![[image.png|Alt Text]]
```

### Callouts

Create beautiful callouts using Obsidian syntax:

```markdown
> [!note]
> This is a basic note callout.

> [!tip] Pro Tip
> Callouts can have custom titles.

> [!warning]+ Expandable Warning
> Use + for expanded by default.

> [!danger]- Collapsed Danger  
> Use - for collapsed by default.

> [!info] Nested Example
> Callouts support nesting.
> 
> > [!success]
> > This is a nested callout.
```

**Available callout types:**
- `note` (blue) - General information
- `tip` (green) - Helpful tips
- `info` (cyan) - Additional information  
- `warning` (amber) - Important warnings
- `danger` (red) - Critical alerts
- `success` (green) - Success messages
- `question` (purple) - Questions or FAQ
- `failure` (red) - Error or failure states
- `bug` (pink) - Bug reports or issues
- `example` (indigo) - Code examples
- `quote` (gray) - Quotations

### Testing

The implementation includes comprehensive testing:

```bash
# Test individual features
npm run test:wikilink          # Basic wikilink functionality
npm run test:image             # Image wikilink support  
npm run test:table             # Table wikilink support
npm run test:callout           # Basic callout functionality
npm run test:callout-markdown  # Markdown within callouts
npm run test:nested-callout    # Nested callout functionality
npm run test:callout-edge-cases    # Edge cases and performance
npm run test:callout-security      # XSS prevention
npm run test:callout-integration   # Plugin integration
```

## 👀 Want to learn more?

Check out [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Credit

This theme is based off of the lovely [Bear Blog](https://github.com/HermanMartinus/bearblog/).
