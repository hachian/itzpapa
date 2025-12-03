import { visit } from 'unist-util-visit';

/**
 * rehype-callout - Transform blockquotes with callout data to final HTML structure
 *
 * This rehype plugin runs AFTER Astro's image optimization, so images inside
 * callouts will be properly processed with optimized paths.
 */

// SVG icons for each callout type
const CALLOUT_ICONS = {
  note: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4"/><path d="M12 16h.01"/><circle cx="12" cy="12" r="10"/></svg>',
  info: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
  tip: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>',
  warning: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
  caution: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>',
  important: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>',
  danger: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.28 10.4a7 7 0 1 0-9.56 9.56"/><path d="M7.5 10.4 11 7l3.28 3.28"/><path d="m2 2 20 20"/></svg>'
};

// Fold icon for collapsible callouts
const FOLD_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="callout-fold-icon"><path d="m6 9 6 6 6-6"/></svg>';

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string}
 */
function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Create a HAST element node
 * @param {string} tagName - HTML tag name
 * @param {Object} properties - Element properties
 * @param {Array} children - Child nodes
 * @returns {Object} - HAST element node
 */
function h(tagName, properties = {}, children = []) {
  return {
    type: 'element',
    tagName,
    properties,
    children
  };
}

/**
 * Create a raw HTML node
 * @param {string} html - Raw HTML string
 * @returns {Object} - HAST raw node
 */
function raw(html) {
  return {
    type: 'raw',
    value: html
  };
}

/**
 * Check if a HAST element is a callout blockquote
 * @param {Object} node - HAST node
 * @returns {boolean}
 */
function isCalloutBlockquote(node) {
  return (
    node.type === 'element' &&
    node.tagName === 'blockquote' &&
    node.properties &&
    node.properties['data-callout']
  );
}

/**
 * Transform a callout blockquote to the final HTML structure
 * @param {Object} node - HAST blockquote node with callout data
 * @returns {Object} - Transformed HAST node
 */
function transformCallout(node) {
  const props = node.properties;
  const calloutType = props['data-callout'];
  const calloutTitle = props['data-callout-title'] || calloutType;
  const isFoldable = props['data-callout-foldable'] === 'true';
  const isFolded = props['data-callout-folded'] === 'true';
  const nestLevel = props['data-nest-level'];

  const icon = CALLOUT_ICONS[calloutType] || CALLOUT_ICONS.note;

  // Build class names
  const classNames = props.className || [];
  if (!classNames.includes('callout')) {
    classNames.unshift('callout');
  }

  // Build properties for the wrapper element
  const wrapperProps = {
    className: classNames,
    'data-callout': calloutType
  };

  if (nestLevel) {
    wrapperProps['data-nest-level'] = nestLevel;
  }

  // Create title structure
  const titleChildren = [
    raw(`<div class="callout-icon">${icon}</div>`),
    raw(`<div class="callout-title-inner">${escapeHtml(calloutTitle)}</div>`)
  ];

  if (isFoldable) {
    titleChildren.push(raw(FOLD_ICON_SVG));
  }

  // Create content wrapper with original blockquote children
  const contentWrapper = h('div', { className: ['callout-content'] }, node.children);

  if (isFoldable) {
    // Foldable callout: use details/summary structure
    if (!isFolded) {
      wrapperProps.open = true;
    }

    const summaryNode = h('summary', { className: ['callout-title'] }, titleChildren);

    return h('details', wrapperProps, [summaryNode, contentWrapper]);
  } else {
    // Non-foldable callout: use div structure
    const titleNode = h('div', { className: ['callout-title'] }, titleChildren);

    return h('div', wrapperProps, [titleNode, contentWrapper]);
  }
}

/**
 * rehype-callout plugin
 * @returns {Function}
 */
export default function rehypeCallout() {
  return function transformer(tree) {
    visit(tree, 'element', (node, index, parent) => {
      if (!parent || index === null || index === undefined) {
        return;
      }

      // Check if this is a callout blockquote
      if (!isCalloutBlockquote(node)) {
        return;
      }

      // Transform to callout structure
      const calloutNode = transformCallout(node);

      // Replace the blockquote with the callout
      parent.children[index] = calloutNode;
    });
  };
}
