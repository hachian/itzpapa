/**
 * rehype-table-wrapper
 *
 * Wraps table elements in a div.table-wrapper for horizontal scroll support.
 * This allows tables to scroll horizontally without affecting the rest of the page.
 */

import { visit } from 'unist-util-visit';

export default function rehypeTableWrapper() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName === 'table' && parent && typeof index === 'number') {
        // Check if already wrapped
        if (parent.tagName === 'div' &&
            parent.properties?.className?.includes('table-wrapper')) {
          return;
        }

        // Create wrapper div
        const wrapper = {
          type: 'element',
          tagName: 'div',
          properties: {
            className: ['table-wrapper']
          },
          children: [node]
        };

        // Replace table with wrapper containing table
        parent.children[index] = wrapper;
      }
    });
  };
}
