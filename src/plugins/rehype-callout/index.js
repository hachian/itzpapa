import { visit } from 'unist-util-visit';

/**
 * rehype-callout - Transform blockquotes with callout data to final HTML structure
 *
 * This rehype plugin runs AFTER Astro's image optimization, so images inside
 * callouts will be properly processed with optimized paths.
 */

// SVG icons for each callout type (Lucide icons)
// Obsidian公式13タイプ対応
const CALLOUT_ICONS = {
  // note: pencil
  note: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>',
  // abstract: clipboard-list
  abstract: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>',
  // info: info
  info: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
  // todo: list-todo (circle-check-big)
  todo: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  // tip: lightbulb
  tip: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>',
  // success: circle-check
  success: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>',
  // question: circle-help
  question: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>',
  // warning: triangle-alert
  warning: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
  // failure: x-circle
  failure: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
  // danger: zap
  danger: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>',
  // bug: bug
  bug: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>',
  // example: folder-open
  example: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/></svg>',
  // quote: quote
  quote: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/></svg>'
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
