import { visit } from 'unist-util-visit';

export default function remarkMarkHighlight(options = {}) {
  const {
    className = '',
    enabled = true
  } = options;

  if (!enabled) {
    return (tree) => tree;
  }

  return function transformer(tree) {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index === null) return;

      // Skip if already inside a link, code, or other special nodes
      if (
        parent.type === 'link' ||
        parent.type === 'inlineCode' ||
        parent.type === 'code'
      ) {
        return;
      }

      const text = node.value;

      // Pattern to match ==text== for highlighting
      // Supports multi-line and nested inline elements
      const markHighlightRegex = /==([^=]+)==/g;

      // Early return if no highlight syntax found
      if (!markHighlightRegex.test(text)) {
        return;
      }

      // Reset regex
      markHighlightRegex.lastIndex = 0;

      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = markHighlightRegex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
          parts.push({
            type: 'text',
            value: text.slice(lastIndex, match.index)
          });
        }

        // Create mark element
        const highlightedText = match[1];

        // Handle empty highlight (====)
        if (!highlightedText || highlightedText.length === 0) {
          parts.push({
            type: 'text',
            value: match[0]
          });
        } else {
          // Create HTML node for <mark> element
          const markNode = {
            type: 'html',
            value: `<mark${className ? ` class="${className}"` : ''}>${escapeHtml(highlightedText)}</mark>`
          };
          parts.push(markNode);
        }

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text after last match
      if (lastIndex < text.length) {
        parts.push({
          type: 'text',
          value: text.slice(lastIndex)
        });
      }

      // Replace the original node with the processed parts
      if (parts.length > 0) {
        parent.children.splice(index, 1, ...parts);
        // Adjust index to skip the newly inserted nodes
        return index + parts.length;
      }
    });
  };
}

// Helper function to escape HTML
function escapeHtml(text) {
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  return text.replace(/[&<>"']/g, (match) => htmlEscapes[match]);
}