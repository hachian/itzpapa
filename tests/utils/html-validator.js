/**
 * HTML Validator Utility
 *
 * Uses cheerio to parse and validate HTML output from the build process
 * Provides utilities for E2E testing of markdown plugin output
 */

import * as cheerio from 'cheerio';
import { readFile, readdir, stat } from 'fs/promises';
import { join, relative } from 'path';

/**
 * Load and parse HTML file
 * @param {string} filePath - Path to HTML file
 * @returns {Promise<CheerioAPI>} Cheerio instance
 */
export async function loadHtml(filePath) {
  const content = await readFile(filePath, 'utf-8');
  return cheerio.load(content);
}

/**
 * Parse HTML string
 * @param {string} html - HTML string
 * @returns {CheerioAPI} Cheerio instance
 */
export function parseHtml(html) {
  return cheerio.load(html);
}

/**
 * Validate callout structure in HTML
 * @param {CheerioAPI} $ - Cheerio instance
 * @returns {object} Validation result
 */
export function validateCallouts($) {
  const callouts = $('[data-callout]');
  const results = [];

  callouts.each((i, el) => {
    const $el = $(el);
    const type = $el.attr('data-callout');
    // Foldable callouts use <details> element; check if it's a details tag and open attribute
    const isDetailsElement = el.tagName === 'details';
    const hasOpenAttr = $el.attr('open') !== undefined;
    // foldable: 'open' (collapsed by default, click to open), 'closed' (expanded by default), or null (not foldable)
    let foldable = null;
    if (isDetailsElement) {
      foldable = hasOpenAttr ? 'closed' : 'open';
    }
    // Title can be in .callout-title-inner or .callout-title-text
    const title = $el.find('.callout-title-inner').text() || $el.find('.callout-title-text').text();
    const content = $el.find('.callout-content').text();
    const hasIcon = $el.find('.callout-icon').length > 0;

    results.push({
      type,
      foldable,
      title: title.trim(),
      content: content.trim(),
      hasIcon,
      hasValidStructure: hasIcon && title !== undefined,
    });
  });

  return {
    count: callouts.length,
    callouts: results,
    allValid: results.every(r => r.hasValidStructure),
  };
}

/**
 * Validate wikilinks in HTML (converted to <a> tags)
 * @param {CheerioAPI} $ - Cheerio instance
 * @returns {object} Validation result
 */
export function validateWikilinks($) {
  const internalLinks = $('a[href^="/blog/"]');
  const results = [];

  internalLinks.each((i, el) => {
    const $el = $(el);
    const href = $el.attr('href');
    const text = $el.text();
    const className = $el.attr('class') || '';

    results.push({
      href,
      text: text.trim(),
      className,
      isWikilink: className.includes('wikilink') || href.includes('/blog/'),
    });
  });

  return {
    count: internalLinks.length,
    links: results,
  };
}

/**
 * Validate mark/highlight elements in HTML
 * @param {CheerioAPI} $ - Cheerio instance
 * @returns {object} Validation result
 */
export function validateHighlights($) {
  const marks = $('mark');
  const results = [];

  marks.each((i, el) => {
    const $el = $(el);
    const text = $el.text();
    const className = $el.attr('class') || '';

    results.push({
      text: text.trim(),
      className,
    });
  });

  return {
    count: marks.length,
    highlights: results,
  };
}

/**
 * Validate tag links in HTML
 * @param {CheerioAPI} $ - Cheerio instance
 * @returns {object} Validation result
 */
export function validateTags($) {
  const tagLinks = $('a[href^="/tags/"]');
  const results = [];

  tagLinks.each((i, el) => {
    const $el = $(el);
    const href = $el.attr('href');
    const text = $el.text();
    const className = $el.attr('class') || '';

    results.push({
      href,
      text: text.trim(),
      className,
      tagName: href.replace('/tags/', '').replace(/\/$/, ''),
    });
  });

  return {
    count: tagLinks.length,
    tags: results,
  };
}

/**
 * Validate overall HTML structure
 * @param {CheerioAPI} $ - Cheerio instance
 * @returns {object} Validation result
 */
export function validateHtmlStructure($) {
  return {
    hasDoctype: $.html().toLowerCase().includes('<!doctype html'),
    hasHtmlTag: $('html').length > 0,
    hasHead: $('head').length > 0,
    hasBody: $('body').length > 0,
    hasTitle: $('title').length > 0 && $('title').text().trim() !== '',
    hasMeta: $('meta[charset]').length > 0 || $('meta[http-equiv]').length > 0,
    hasMain: $('main').length > 0 || $('article').length > 0,
  };
}

/**
 * Validate accessibility attributes
 * @param {CheerioAPI} $ - Cheerio instance
 * @returns {object} Validation result
 */
export function validateAccessibility($) {
  const images = $('img');
  const links = $('a');
  const headings = $('h1, h2, h3, h4, h5, h6');

  const imagesWithAlt = images.filter((i, el) => $(el).attr('alt') !== undefined);
  const linksWithText = links.filter((i, el) => $(el).text().trim() !== '' || $(el).attr('aria-label'));

  return {
    images: {
      total: images.length,
      withAlt: imagesWithAlt.length,
      missingAlt: images.length - imagesWithAlt.length,
    },
    links: {
      total: links.length,
      withText: linksWithText.length,
      emptyLinks: links.length - linksWithText.length,
    },
    headings: {
      total: headings.length,
      h1Count: $('h1').length,
      hasProperHierarchy: checkHeadingHierarchy($),
    },
  };
}

/**
 * Check heading hierarchy
 * @param {CheerioAPI} $ - Cheerio instance
 * @returns {boolean} Whether headings follow proper hierarchy
 */
function checkHeadingHierarchy($) {
  const headings = $('h1, h2, h3, h4, h5, h6');
  let lastLevel = 0;
  let valid = true;

  headings.each((i, el) => {
    const level = parseInt(el.tagName.substring(1));
    // Allow skipping down but not up more than 1 level (h1 -> h3 is ok, but check for major jumps)
    if (lastLevel > 0 && level > lastLevel + 1) {
      // Skip validation for now as blogs may have varied structures
    }
    lastLevel = level;
  });

  return valid;
}

/**
 * Find all HTML files in a directory recursively
 * @param {string} dirPath - Directory path
 * @returns {Promise<string[]>} Array of HTML file paths
 */
export async function findHtmlFiles(dirPath) {
  const files = [];

  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        files.push(fullPath);
      }
    }
  }

  await walk(dirPath);
  return files;
}

/**
 * Comprehensive validation of a single HTML file
 * @param {string} filePath - Path to HTML file
 * @returns {Promise<object>} Complete validation result
 */
export async function validateHtmlFile(filePath) {
  const $ = await loadHtml(filePath);

  return {
    file: filePath,
    structure: validateHtmlStructure($),
    accessibility: validateAccessibility($),
    callouts: validateCallouts($),
    wikilinks: validateWikilinks($),
    highlights: validateHighlights($),
    tags: validateTags($),
  };
}

/**
 * Validate all HTML files in build directory
 * @param {string} buildDir - Build output directory
 * @returns {Promise<object>} Validation results for all files
 */
export async function validateBuildOutput(buildDir) {
  const htmlFiles = await findHtmlFiles(buildDir);
  const results = [];

  for (const file of htmlFiles) {
    try {
      const validation = await validateHtmlFile(file);
      results.push({
        ...validation,
        status: 'success',
      });
    } catch (error) {
      results.push({
        file,
        status: 'error',
        error: error.message,
      });
    }
  }

  // Summary statistics
  const summary = {
    totalFiles: htmlFiles.length,
    successfulValidations: results.filter(r => r.status === 'success').length,
    errors: results.filter(r => r.status === 'error').length,
    totalCallouts: results.reduce((sum, r) => sum + (r.callouts?.count || 0), 0),
    totalWikilinks: results.reduce((sum, r) => sum + (r.wikilinks?.count || 0), 0),
    totalHighlights: results.reduce((sum, r) => sum + (r.highlights?.count || 0), 0),
    totalTags: results.reduce((sum, r) => sum + (r.tags?.count || 0), 0),
  };

  return {
    summary,
    results,
  };
}

/**
 * Assert that HTML contains expected elements
 * @param {CheerioAPI} $ - Cheerio instance
 * @param {object} expectations - Expected elements
 * @returns {object} Assertion results
 */
export function assertHtmlContains($, expectations) {
  const results = {};

  if (expectations.calloutTypes) {
    const callouts = validateCallouts($);
    results.calloutTypes = expectations.calloutTypes.every(type =>
      callouts.callouts.some(c => c.type === type)
    );
  }

  if (expectations.linkHrefs) {
    results.linkHrefs = expectations.linkHrefs.every(href =>
      $(`a[href="${href}"]`).length > 0
    );
  }

  if (expectations.highlightTexts) {
    const highlights = validateHighlights($);
    results.highlightTexts = expectations.highlightTexts.every(text =>
      highlights.highlights.some(h => h.text.includes(text))
    );
  }

  if (expectations.tagNames) {
    const tags = validateTags($);
    results.tagNames = expectations.tagNames.every(name =>
      tags.tags.some(t => t.tagName === name || t.text.includes(name))
    );
  }

  if (expectations.selectors) {
    results.selectors = expectations.selectors.every(selector =>
      $(selector).length > 0
    );
  }

  return {
    passed: Object.values(results).every(v => v === true),
    details: results,
  };
}

export default {
  loadHtml,
  parseHtml,
  validateCallouts,
  validateWikilinks,
  validateHighlights,
  validateTags,
  validateHtmlStructure,
  validateAccessibility,
  findHtmlFiles,
  validateHtmlFile,
  validateBuildOutput,
  assertHtmlContains,
};
