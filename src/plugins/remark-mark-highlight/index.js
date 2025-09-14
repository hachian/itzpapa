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
        parent.type === 'code' ||
        parent.type === 'linkReference' ||
        parent.type === 'imageReference' ||
        parent.type === 'footnoteReference' ||
        parent.type === 'math' ||
        parent.type === 'inlineMath'
      ) {
        return;
      }

      let text = node.value;

      // Escape processing: handle \== sequences
      // Temporarily replace escaped sequences to prevent processing
      const escapeToken = '__ESCAPED_MARK_TOKEN__';
      const escapedSequences = [];

      // Handle escaped equals - both start and end of potential highlight sequences
      text = text.replace(/\\==/g, (match) => {
        const token = `${escapeToken}${escapedSequences.length}${escapeToken}`;
        escapedSequences.push('==');
        return token;
      });

      // Pattern to match ==text== for highlighting
      // [^=]+ prevents nested highlights (e.g., ==outer ==inner== text== won't match)
      // This is the desired behavior for safety and clarity
      const markHighlightRegex = /==([^=]+)==/g;

      // Early return if no highlight syntax found
      if (!markHighlightRegex.test(text)) {
        // Restore escaped sequences before returning
        escapedSequences.forEach((sequence, index) => {
          const token = `${escapeToken}${index}${escapeToken}`;
          text = text.replace(token, sequence);
        });

        if (text !== node.value) {
          node.value = text;
        }
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

        const highlightedText = match[1];

        // Handle empty highlight (e.g., ====) - leave as-is
        if (!highlightedText || highlightedText.length === 0) {
          parts.push({
            type: 'text',
            value: match[0]
          });
        } else {
          // Create HTML node for <mark> element with escaped content
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

      // Restore escaped sequences in all text nodes
      if (escapedSequences.length > 0) {
        parts.forEach(part => {
          if (part.type === 'text') {
            escapedSequences.forEach((sequence, index) => {
              const token = `${escapeToken}${index}${escapeToken}`;
              part.value = part.value.replace(new RegExp(token, 'g'), sequence);
            });
          }
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