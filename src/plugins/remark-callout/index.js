import { visit } from 'unist-util-visit';

/**
 * remark-callout - Obsidian-style callout plugin for remark
 *
 * This remark plugin parses callout syntax and adds data to blockquote nodes.
 * A companion rehype plugin transforms them to the final HTML structure.
 *
 * Supports: note, info, tip, warning, caution, important, danger
 */

// Valid callout types
const VALID_TYPES = ['note', 'info', 'tip', 'warning', 'caution', 'important', 'danger'];

// Default titles for each callout type
const DEFAULT_TITLES = {
  note: 'Note',
  info: 'Info',
  tip: 'Tip',
  warning: 'Warning',
  caution: 'Caution',
  important: 'Important',
  danger: 'Danger'
};

/**
 * Parse callout header from text
 * @param {string} text - The text to parse
 * @returns {Object|null} - Parsed callout header or null if not a callout
 */
function parseCalloutHeader(text) {
  // Pattern: [!type](-|+)? (optional title)
  const match = text.match(/^\[!(\w*)\]([-+])?\s*(.*)?$/);

  if (!match) {
    return null;
  }

  const rawType = match[1].toLowerCase();
  const foldIndicator = match[2];
  const customTitle = match[3]?.trim() || null;

  // If type is empty, return null
  if (!rawType) {
    return null;
  }

  // Determine callout type (fallback to 'note' for unknown types)
  const type = VALID_TYPES.includes(rawType) ? rawType : 'note';

  // Determine fold state
  const foldable = foldIndicator === '-' || foldIndicator === '+';
  const defaultFolded = foldIndicator === '+';

  // Determine title
  const title = customTitle || DEFAULT_TITLES[type] || DEFAULT_TITLES.note;

  return {
    type,
    title,
    foldable,
    defaultFolded,
    originalType: rawType
  };
}

/**
 * Check if a blockquote node is a callout
 * @param {Object} node - The blockquote node
 * @returns {boolean}
 */
function isCallout(node) {
  if (!node.children || node.children.length === 0) {
    return false;
  }

  const firstChild = node.children[0];

  // First child should be a paragraph
  if (firstChild.type !== 'paragraph' || !firstChild.children || firstChild.children.length === 0) {
    return false;
  }

  const firstTextNode = firstChild.children[0];

  // First text node should start with [!
  if (firstTextNode.type !== 'text' || !firstTextNode.value.trimStart().startsWith('[!')) {
    return false;
  }

  // Try to parse the header
  const firstLine = firstTextNode.value.split('\n')[0].trimStart();
  return parseCalloutHeader(firstLine) !== null;
}

/**
 * Process a callout blockquote node
 * Adds callout data and removes the header line from content
 * @param {Object} node - The blockquote node
 * @param {number} depth - Current nesting depth
 * @param {number} maxDepth - Maximum nesting depth
 */
function processCallout(node, depth = 0, maxDepth = 3) {
  const firstChild = node.children[0];
  const firstTextNode = firstChild.children[0];

  // Get the first line and parse the header
  const lines = firstTextNode.value.split('\n');
  const firstLine = lines[0].trimStart();
  const header = parseCalloutHeader(firstLine);

  if (!header) {
    return;
  }

  // Add callout data to the blockquote node
  node.data = node.data || {};
  node.data.hProperties = node.data.hProperties || {};
  node.data.hProperties.className = ['callout', `callout-${header.type}`];
  node.data.hProperties['data-callout'] = header.type;
  node.data.hProperties['data-callout-title'] = header.title;

  if (header.foldable) {
    node.data.hProperties['data-callout-foldable'] = 'true';
    node.data.hProperties['data-callout-folded'] = header.defaultFolded ? 'true' : 'false';
  }

  if (depth > 0) {
    node.data.hProperties['data-nest-level'] = String(depth);
  }

  // Remove the callout header line from content
  if (lines.length > 1) {
    const remainingText = lines.slice(1).join('\n');
    if (remainingText.trim()) {
      firstTextNode.value = remainingText;
    } else if (firstChild.children.length > 1) {
      // Remove the text node, keep other children
      firstChild.children.shift();
    } else {
      // Remove the first paragraph entirely if it only had the header
      node.children.shift();
    }
  } else if (firstChild.children.length > 1) {
    // Remove the header text node
    firstChild.children.shift();
  } else {
    // Remove the first paragraph entirely
    node.children.shift();
  }

  // Process nested callouts
  processNestedCallouts(node.children, depth, maxDepth);
}

/**
 * Process nested callouts in content nodes
 * @param {Array} nodes - Content nodes to process
 * @param {number} depth - Current nesting depth
 * @param {number} maxDepth - Maximum nesting depth
 */
function processNestedCallouts(nodes, depth, maxDepth) {
  for (const node of nodes) {
    if (node.type === 'blockquote' && depth < maxDepth && isCallout(node)) {
      processCallout(node, depth + 1, maxDepth);
    } else if (node.children) {
      processNestedCallouts(node.children, depth, maxDepth);
    }
  }
}

/**
 * remark-callout plugin
 * @param {Object} options - Plugin options
 * @param {number} options.maxNestingDepth - Maximum nesting depth (default: 3)
 * @returns {Function}
 */
export default function remarkCallout(options = {}) {
  const maxNestingDepth = options.maxNestingDepth ?? 3;

  return function transformer(tree) {
    visit(tree, 'blockquote', (node) => {
      // Skip if not a callout
      if (!isCallout(node)) {
        return;
      }

      // Process the callout (adds data, doesn't transform structure)
      processCallout(node, 0, maxNestingDepth);
    });
  };
}
