import { visit } from 'unist-util-visit';
import { toString } from 'hast-util-to-string';
import { isElement } from 'hast-util-is-element';

/**
 * Rehype plugin for Obsidian-style callouts
 * Converts blockquotes with [!type] syntax into callout elements
 */
export default function rehypeCallout(options = {}) {
  const config = {
    types: ['note', 'tip', 'info', 'warning', 'danger', 'success', 'question', 'failure', 'bug', 'example', 'quote'],
    maxNestLevel: 20,
    enableFolding: true,
    customTypes: [],
    ...options
  };

  // Combine default and custom types
  const allTypes = [...config.types, ...config.customTypes];

  return function transformer(tree, file) {
    // Visit all blockquote elements in the HTML AST
    visit(tree, 'element', (node, index, parent) => {
      if (!isElement(node, 'blockquote')) return;

      // Get the text content of the blockquote
      const content = toString(node);
      
      // Check if this blockquote contains a callout pattern
      const calloutMatch = content.match(/^\s*\[!(\w+)\]([+-]?)(\s+(.+))?\s*\n?(.*)/s);
      
      if (!calloutMatch) return; // Not a callout, skip

      const [, rawType, foldIndicator, , customTitle, bodyContent] = calloutMatch;
      
      // Validate callout type (case-insensitive)
      const type = rawType.toLowerCase();
      const validType = allTypes.includes(type) ? type : 'note';
      
      // Determine if this is foldable and initial state
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
          ]
        },
        children: []
      };

      // Create title element
      const titleText = customTitle || capitalizeFirst(validType);
      const titleElement = {
        type: 'element',
        tagName: isFoldable ? 'details' : 'div',
        properties: {
          className: ['callout-title'],
          ...(isFoldable && isInitiallyFolded ? {} : { open: true })
        },
        children: [
          {
            type: 'element',
            tagName: isFoldable ? 'summary' : 'span',
            properties: {},
            children: [
              {
                type: 'text',
                value: titleText
              }
            ]
          }
        ]
      };

      // Create content element
      const contentElement = {
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['callout-content']
        },
        children: bodyContent.trim() ? [
          {
            type: 'element',
            tagName: 'p',
            properties: {},
            children: [
              {
                type: 'text',
                value: bodyContent.trim()
              }
            ]
          }
        ] : []
      };

      // For foldable callouts, wrap content in details
      if (isFoldable) {
        titleElement.children.push(contentElement);
        calloutNode.children = [titleElement];
      } else {
        calloutNode.children = [titleElement, contentElement];
      }

      // Replace the blockquote with the callout
      parent.children[index] = calloutNode;
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