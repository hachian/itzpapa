# Manual Test Pages

This directory contains Astro components used for manual visual testing of features.
These files are stored here to prevent them from being deployed as production routes in `src/pages/`.

## How to Run

To run these tests, you must temporarily move the file back to `src/pages/`.

Example:

```bash
# Move to src/pages/ to test
mv tests/manual-pages/test-active-toc.astro src/pages/

# ... run dev server ...

# Move back after testing
mv src/pages/test-active-toc.astro tests/manual-pages/
```

## Files

- `test-active-toc.astro`: Tests the "Table of Contents with Active State" feature.
- `test-grid-layout.astro`: Tests the CSS Grid layout for the blog post and TOC.
- `test-toc.astro`: Tests the basic Table of Contents component.

**Note:** The imports in these files are relative to `src/pages/` so they will work correctly when moved there.
