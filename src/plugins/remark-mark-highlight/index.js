import { visit } from 'unist-util-visit';

// Pre-compiled regex for performance (optimized)
const MARK_HIGHLIGHT_REGEX = /==([^=]+)==(?:\{([^}]+)\})?/g;
const ESCAPE_REGEX = /\\==/g;
const SIMPLE_HIGHLIGHT_CHECK = /==/; // Simple check without capture groups

// Simple LRU cache for processed results
class SimpleCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear() {
    this.cache.clear();
  }
}

export default function remarkMarkHighlight(options = {}) {
  const {
    className = '',
    enabled = true,
    accessibility = true,
    focusable = false,
    cache = true,
    maxInputLength = 100000, // DoS攻撃対策: 最大入力長（100KB）
    maxNestingDepth = 10,    // 深いネスト対策: 最大ネスト深度
    securityMode = 'auto'    // セキュリティモード: 'auto', 'strict', 'disabled'
  } = options;

  // Create cache instance
  const processCache = cache ? new SimpleCache() : null;

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

      // セキュリティチェック: 入力長制限
      if (securityMode !== 'disabled' && text.length > maxInputLength) {
        console.warn(`[remark-mark-highlight] Input too long: ${text.length} chars, max: ${maxInputLength}`);
        return; // 処理を停止して安全を確保
      }

      // Early return if no highlight syntax found (performance optimization)
      // Use faster test without string creation
      if (!SIMPLE_HIGHLIGHT_CHECK.test(text)) {
        return;
      }

      // Check cache first
      if (processCache) {
        const cacheKey = `${text}:${className}:${accessibility}:${focusable}`;
        const cached = processCache.get(cacheKey);
        if (cached) {
          parent.children.splice(index, 1, ...cached);
          return index + cached.length;
        }
      }

      // Escape processing: handle \== sequences
      // Temporarily replace escaped sequences to prevent processing
      const escapeToken = '__ESCAPED_MARK_TOKEN__';
      const escapedSequences = [];

      // Handle escaped equals - both start and end of potential highlight sequences
      text = text.replace(ESCAPE_REGEX, (match) => {
        const token = `${escapeToken}${escapedSequences.length}${escapeToken}`;
        escapedSequences.push('==');
        return token;
      });

      // Use pre-compiled regex
      MARK_HIGHLIGHT_REGEX.lastIndex = 0;

      // Early return if no highlight syntax found
      if (!MARK_HIGHLIGHT_REGEX.test(text)) {
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
      MARK_HIGHLIGHT_REGEX.lastIndex = 0;

      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = MARK_HIGHLIGHT_REGEX.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
          parts.push({
            type: 'text',
            value: text.slice(lastIndex, match.index)
          });
        }

        const highlightedText = match[1];
        const customAttributes = match[2]; // Optional custom attributes {.class attr="value"}

        // Handle empty highlight (e.g., ====) - leave as-is
        if (!highlightedText || highlightedText.length === 0) {
          parts.push({
            type: 'text',
            value: match[0]
          });
        } else {
          // Create HTML node for <mark> element with escaped content and accessibility attributes
          const attributes = [];

          // Parse custom attributes if provided (optimized)
          let customClass = '';
          let customAriaLabel = '';

          if (customAttributes) {
            // Fast parsing with pre-compiled regex (cache these if needed)
            if (customAttributes.startsWith('.')) {
              const spaceIndex = customAttributes.indexOf(' ');
              customClass = spaceIndex === -1
                ? customAttributes.slice(1)
                : customAttributes.slice(1, spaceIndex);
            }

            // Parse aria-label with optimized approach
            const ariaIndex = customAttributes.indexOf('aria-label=');
            if (ariaIndex !== -1) {
              const start = ariaIndex + 11; // 'aria-label='.length
              const quote = customAttributes[start];
              if (quote === '"' || quote === "'") {
                const end = customAttributes.indexOf(quote, start + 1);
                if (end !== -1) {
                  customAriaLabel = customAttributes.slice(start + 1, end);
                }
              }
            }
          }

          // Add class attribute (prioritize custom class, fallback to plugin option)
          const finalClass = customClass || className;
          if (finalClass) {
            attributes.push(`class="${finalClass}"`);
          }

          // Add accessibility attributes if enabled
          if (accessibility) {
            attributes.push('role="mark"');

            // Add custom aria-label if specified
            if (customAriaLabel) {
              attributes.push(`aria-label="${escapeHtml(customAriaLabel, securityMode)}"`);
            }
          }

          // Add focusable attribute if enabled
          if (focusable) {
            attributes.push('tabindex="0"');
          }

          const attributeString = attributes.length > 0 ? ` ${attributes.join(' ')}` : '';

          const markNode = {
            type: 'html',
            value: `<mark${attributeString}>${escapeHtml(highlightedText, securityMode)}</mark>`
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
        // Cache the result if caching is enabled
        if (processCache) {
          const cacheKey = `${node.value}:${className}:${accessibility}:${focusable}`;
          processCache.set(cacheKey, [...parts]); // Clone array for cache
        }

        parent.children.splice(index, 1, ...parts);
        // Adjust index to skip the newly inserted nodes
        return index + parts.length;
      }
    });
  };
}

// Helper function to escape HTML with enhanced security
function escapeHtml(text, securityMode = 'auto') {
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  // 基本的なHTMLエスケープ
  let escaped = text.replace(/[&<>"']/g, (match) => htmlEscapes[match]);

  // strictモードでは追加のセキュリティチェック
  if (securityMode === 'strict') {
    // 制御文字の除去
    escaped = escaped.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Unicode zero-width characters の除去
    escaped = escaped.replace(/[\u200B-\u200D\uFEFF]/g, '');

    // 潜在的に危険なプロトコルの検出と無効化
    escaped = escaped.replace(/javascript:/gi, 'javascript&#58;');
    escaped = escaped.replace(/vbscript:/gi, 'vbscript&#58;');
    escaped = escaped.replace(/data:/gi, 'data&#58;');
  }

  return escaped;
}