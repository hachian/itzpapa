import { visit } from 'unist-util-visit';
import { toString } from 'hast-util-to-string';
import { isElement } from 'hast-util-is-element';

/**
 * Rehype plugin for Obsidian-style callouts
 * Converts blockquotes with [!type] syntax into callout elements
 * Supports nested callouts
 */
export default function rehypeCallout(options = {}) {
  const config = {
    types: ['note', 'tip', 'info', 'warning', 'danger', 'success', 'question', 'failure', 'bug', 'example', 'quote'],
    maxNestLevel: 20,
    enableFolding: true,
    customTypes: [],
    ...options
  };

  // Combine default and custom types into Set for O(1) lookup
  const allTypes = new Set([...config.types, ...config.customTypes]);
  
  // Pre-compile regex for better performance
  const calloutRegex = /^\[!(\w+)\]([+-]?)(?:\s+(.+))?$/;
  
  // Cache for capitalized type names
  const capitalizedCache = new Map();
  
  // Track nesting depth to prevent infinite recursion
  let currentNestLevel = 0;

  /**
   * Get cached capitalized version of a string
   * @param {string} str - Input string
   * @returns {string} Cached capitalized string
   */
  function getCachedCapitalized(str) {
    if (capitalizedCache.has(str)) {
      return capitalizedCache.get(str);
    }
    const capitalized = str.charAt(0).toUpperCase() + str.slice(1);
    capitalizedCache.set(str, capitalized);
    return capitalized;
  }

  /**
   * Process a blockquote node and convert to callout if applicable
   * @param {Object} node - The blockquote node
   * @param {number} nestLevel - Current nesting level
   * @returns {Object|null} - The converted callout node or null
   */
  function processBlockquote(node, nestLevel = 0) {
    if (!isElement(node, 'blockquote')) return null;
    
    // Check max nesting level
    if (nestLevel >= config.maxNestLevel) {
      console.warn(`Max nesting level (${config.maxNestLevel}) exceeded`);
      return null;
    }

    // Get the first paragraph to check for callout syntax
    let firstParagraph = null;
    for (const child of node.children) {
      if (isElement(child, 'p')) {
        firstParagraph = child;
        break;
      }
    }
    
    if (!firstParagraph) return null;
    
    // Get text content of the first paragraph
    const firstParagraphText = toString(firstParagraph);
    
    // Check if this blockquote contains a callout pattern (use pre-compiled regex)
    const firstLine = firstParagraphText.split('\n')[0];
    const calloutMatch = firstLine.match(calloutRegex);
    
    if (!calloutMatch) return null; // Not a callout
    
    const [, rawType, foldIndicator, customTitle] = calloutMatch;
    
    // Validate callout type (use Set for O(1) lookup)
    const type = rawType.toLowerCase();
    const validType = allTypes.has(type) ? type : 'note';
    
    // Determine if this is foldable
    const isFoldable = Boolean(foldIndicator);
    const isInitiallyFolded = foldIndicator === '-';
    
    // Create the callout structure
    const calloutNode = {
      type: 'element',
      tagName: 'div',
      properties: {
        className: [
          'callout',
          `callout-${validType}`,
          ...(isFoldable ? ['callout-foldable'] : []),
          ...(isInitiallyFolded ? ['callout-folded'] : [])
        ],
        'data-nest-level': nestLevel.toString()
      },
      children: []
    };

    // Determine title text (use cached capitalization)
    const titleText = customTitle || getCachedCapitalized(validType);
    
    // Determine title text (use cached capitalization)
    const titleText = customTitle || getCachedCapitalized(validType);

    // Process content: collect all blockquote children EXCEPT the callout declaration line
    const contentChildren = [];
    
    // Process the first paragraph to remove callout declaration and preserve remaining content
    const lines = firstParagraphText.split('\n');
    const remainingLines = lines.slice(1); // Remove first line (callout declaration)
    
    if (remainingLines.length > 0 && remainingLines.some(line => line.trim())) {
      // Create a new paragraph with the remaining content from the first paragraph
      const newParagraph = {
        type: 'element',
        tagName: 'p',
        properties: {},
        children: [
          {
            type: 'text',
            value: remainingLines.join('\n')
          }
        ]
      };
      contentChildren.push(newParagraph);
    }
    
    // Process remaining children (skip the first paragraph as we already processed it)
    let foundFirst = false;
    for (const child of node.children) {
      if (isElement(child, 'p')) {
        if (!foundFirst) {
          foundFirst = true;
          continue; // Skip the first paragraph we already processed above
        }
        // For other paragraphs, keep as-is
        contentChildren.push(JSON.parse(JSON.stringify(child)));
      } else if (isElement(child, 'blockquote')) {
        // Recursively process nested blockquotes
        const nestedCallout = processBlockquote(child, nestLevel + 1);
        if (nestedCallout) {
          contentChildren.push(nestedCallout);
        } else {
          // If not a callout, keep as blockquote
          contentChildren.push(JSON.parse(JSON.stringify(child)));
        }
      } else if (child.type === 'element') {
        // Keep other elements as-is
        contentChildren.push(JSON.parse(JSON.stringify(child)));
      }
    }

    // Create content element
    const contentElement = {
      type: 'element',
      tagName: 'div',
      properties: {
        className: ['callout-content']
      },
      children: contentChildren
    };

    // Create title/summary structure based on foldable state
    if (isFoldable) {
      // For foldable callouts, use details/summary
      const detailsNode = {
        type: 'element',
        tagName: 'details',
        properties: isInitiallyFolded ? {} : { open: true },
        children: [
          {
            type: 'element',
            tagName: 'summary',
            properties: {
              className: ['callout-title']
            },
            children: [
              {
                type: 'text',
                value: titleText
              }
            ]
          },
          contentElement
        ]
      };
      calloutNode.children = [detailsNode];
    } else {
      // For non-foldable callouts, use div structure
      const titleElement = {
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['callout-title']
        },
        children: [
          {
            type: 'text',
            value: titleText
          }
        ]
      };
      calloutNode.children = [titleElement, contentElement];
    }

    return calloutNode;
  }

  return function transformer(tree) {
    // Process all blockquotes, handling nesting properly
    visit(tree, 'element', (node, index, parent) => {
      if (!isElement(node, 'blockquote')) return;
      
      // Only process top-level blockquotes in the visit
      // Nested ones will be handled recursively
      const calloutNode = processBlockquote(node, 0);
      
      if (calloutNode) {
        // Replace the blockquote with the callout
        parent.children[index] = calloutNode;
      }
    });
    
    // Also process nested blockquotes within callouts
    visit(tree, 'element', (node) => {
      if (node.properties && node.properties.className && 
          node.properties.className.includes('callout-content')) {
        // Process children for nested blockquotes
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];
          if (isElement(child, 'blockquote')) {
            const nestLevel = parseInt(node.parent?.properties?.['data-nest-level'] || '0') + 1;
            const nestedCallout = processBlockquote(child, nestLevel);
            if (nestedCallout) {
              node.children[i] = nestedCallout;
            }
          }
        }
      }
    });
  };
}

/**
 * Capitalize first letter of a string
 * @param {string} str - Input string
 * @returns {string} Capitalized string
 */
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}