import { visit } from 'unist-util-visit';

/**
 * remark-callout - Obsidian-style callout plugin for remark
 *
 * This remark plugin parses callout syntax and adds data to blockquote nodes.
 * A companion rehype plugin transforms them to the final HTML structure.
 *
 * Supports Obsidian's 13 official callout types and their aliases.
 */

// Valid callout types (Obsidian公式13タイプ)
const VALID_TYPES = [
  'note', 'abstract', 'info', 'todo', 'tip', 'success',
  'question', 'warning', 'failure', 'danger', 'bug', 'example', 'quote'
];

// エイリアス→正規タイプ変換マップ
const TYPE_ALIASES = {
  // abstract aliases
  summary: 'abstract',
  tldr: 'abstract',
  // tip aliases
  hint: 'tip',
  important: 'tip',
  // success aliases
  check: 'success',
  done: 'success',
  // question aliases
  help: 'question',
  faq: 'question',
  // warning aliases
  caution: 'warning',
  attention: 'warning',
  // failure aliases
  fail: 'failure',
  missing: 'failure',
  // danger aliases
  error: 'danger',
  // quote aliases
  cite: 'quote'
};

/**
 * 入力タイプを正規タイプに解決
 * @param {string} rawType - 入力されたタイプ（小文字化済み）
 * @returns {string} - 正規タイプ（未知の場合は'note'）
 */
function resolveType(rawType) {
  if (VALID_TYPES.includes(rawType)) return rawType;
  if (TYPE_ALIASES[rawType]) return TYPE_ALIASES[rawType];
  return 'note';
}

// Default titles for each callout type and aliases (with alias support)
const DEFAULT_TITLES = {
  // 正規タイプ
  note: 'Note',
  abstract: 'Abstract',
  info: 'Info',
  todo: 'Todo',
  tip: 'Tip',
  success: 'Success',
  question: 'Question',
  warning: 'Warning',
  failure: 'Failure',
  danger: 'Danger',
  bug: 'Bug',
  example: 'Example',
  quote: 'Quote',
  // エイリアス（エイリアス名をそのままタイトルに）
  summary: 'Summary',
  tldr: 'TL;DR',
  hint: 'Hint',
  important: 'Important',
  check: 'Check',
  done: 'Done',
  help: 'Help',
  faq: 'FAQ',
  caution: 'Caution',
  attention: 'Attention',
  fail: 'Fail',
  missing: 'Missing',
  error: 'Error',
  cite: 'Cite'
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

  // Determine callout type (resolve aliases and fallback to 'note' for unknown types)
  const type = resolveType(rawType);

  // Determine fold state
  const foldable = foldIndicator === '-' || foldIndicator === '+';
  const defaultFolded = foldIndicator === '+';

  // Determine title (エイリアス名を優先、なければ正規タイプ名)
  const title = customTitle || DEFAULT_TITLES[rawType] || DEFAULT_TITLES[type] || DEFAULT_TITLES.note;

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
