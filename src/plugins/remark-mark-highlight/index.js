import { visit } from 'unist-util-visit';
import { escapeHtml } from '../utils/index.js';

// パフォーマンス最適化のための事前コンパイル済み正規表現
const MARK_HIGHLIGHT_REGEX = /==([^=]+)==(?:\{([^}]+)\})?/g;
const ESCAPE_REGEX = /\\==/g;
const SIMPLE_HIGHLIGHT_CHECK = /==/; // キャプチャグループなしの簡易チェック

// 処理結果用のシンプルなLRUキャッシュ
class SimpleCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    if (this.cache.has(key)) {
      // 末尾に移動（最近使用したものとして）
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
      // 最も使われていないもの（最初のアイテム）を削除
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

  // キャッシュインスタンスを作成
  const processCache = cache ? new SimpleCache() : null;

  if (!enabled) {
    return (tree) => tree;
  }

  // Helper: Create mark node with hProperties
  function createMarkNode(children) {
    const hProperties = {};

    if (className) {
      hProperties.className = className;
    }

    if (accessibility) {
      hProperties.role = 'mark';
    }

    if (focusable) {
      hProperties.tabIndex = 0;
    }

    return {
      type: 'mark',
      children: children,
      data: {
        hName: 'mark',
        hProperties: Object.keys(hProperties).length > 0 ? hProperties : undefined
      }
    };
  }

  // Helper: Process split mark patterns like ==**text**==
  // Where == is split across multiple nodes due to Markdown parsing
  function processSplitMarkPatterns(parent) {
    if (!parent.children || parent.children.length < 3) return;

    const children = parent.children;
    let i = 0;

    while (i < children.length) {
      const child = children[i];

      // Look for text node ending with ==
      if (child.type === 'text' && child.value.endsWith('==')) {
        // Search for matching == in subsequent nodes
        for (let j = i + 1; j < children.length; j++) {
          const endChild = children[j];

          // Found text node starting with ==
          if (endChild.type === 'text' && endChild.value.startsWith('==')) {
            // Extract content before == in start node
            const beforeMark = child.value.slice(0, -2);
            // Extract content after == in end node
            const afterMark = endChild.value.slice(2);

            // Collect nodes between start and end
            const markChildren = [];
            for (let k = i + 1; k < j; k++) {
              markChildren.push(children[k]);
            }

            // Build new children array
            const newChildren = [];

            // Add text before mark if exists
            if (beforeMark) {
              newChildren.push({ type: 'text', value: beforeMark });
            }

            // Add mark node wrapping the middle content
            if (markChildren.length > 0) {
              newChildren.push(createMarkNode(markChildren));
            }

            // Add text after mark if exists
            if (afterMark) {
              newChildren.push({ type: 'text', value: afterMark });
            }

            // Replace the range [i, j] with new children
            const deleteCount = j - i + 1;
            children.splice(i, deleteCount, ...newChildren);

            // Continue from current position (may have new patterns)
            i = 0;
            break;
          }

          // If we hit another == ending, stop searching (nested not supported yet)
          if (endChild.type === 'text' && endChild.value.includes('==')) {
            break;
          }
        }
      }

      i++;
    }
  }

  return function transformer(tree) {
    // First pass: Process text nodes with ==text== pattern
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index === null) return;

      // リンク、コード、その他の特殊ノード内はスキップ
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

      // ハイライト構文がない場合は早期リターン（パフォーマンス最適化）
      // 文字列生成なしの高速テストを使用
      if (!SIMPLE_HIGHLIGHT_CHECK.test(text)) {
        return;
      }

      // まずキャッシュを確認
      if (processCache) {
        const cacheKey = `${text}:${className}:${accessibility}:${focusable}`;
        const cached = processCache.get(cacheKey);
        if (cached) {
          parent.children.splice(index, 1, ...cached);
          return index + cached.length;
        }
      }

      // エスケープ処理: \==シーケンスを処理
      // エスケープされたシーケンスを一時的に置換して処理を防ぐ
      const escapeToken = '__ESCAPED_MARK_TOKEN__';
      const escapedSequences = [];

      // エスケープされた等号を処理 - ハイライトシーケンスの開始と終了の両方
      text = text.replace(ESCAPE_REGEX, (match) => {
        const token = `${escapeToken}${escapedSequences.length}${escapeToken}`;
        escapedSequences.push('==');
        return token;
      });

      // 事前コンパイル済み正規表現を使用
      MARK_HIGHLIGHT_REGEX.lastIndex = 0;

      // ハイライト構文がない場合は早期リターン
      if (!MARK_HIGHLIGHT_REGEX.test(text)) {
        // リターン前にエスケープされたシーケンスを復元
        escapedSequences.forEach((sequence, index) => {
          const token = `${escapeToken}${index}${escapeToken}`;
          text = text.replace(token, sequence);
        });

        if (text !== node.value) {
          node.value = text;
        }
        return;
      }

      // 正規表現をリセット
      MARK_HIGHLIGHT_REGEX.lastIndex = 0;

      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = MARK_HIGHLIGHT_REGEX.exec(text)) !== null) {
        // マッチ前のテキストを追加
        if (match.index > lastIndex) {
          parts.push({
            type: 'text',
            value: text.slice(lastIndex, match.index)
          });
        }

        const highlightedText = match[1];
        const customAttributes = match[2]; // オプションのカスタム属性 {.class attr="value"}

        // 空のハイライト（例：====）はそのまま残す
        if (!highlightedText || highlightedText.length === 0) {
          parts.push({
            type: 'text',
            value: match[0]
          });
        } else {
          // カスタム属性をパース（最適化済み）
          let customClass = '';
          let customAriaLabel = '';

          if (customAttributes) {
            // 事前コンパイル済み正規表現による高速パース（必要に応じてキャッシュ）
            if (customAttributes.startsWith('.')) {
              const spaceIndex = customAttributes.indexOf(' ');
              customClass = spaceIndex === -1
                ? customAttributes.slice(1)
                : customAttributes.slice(1, spaceIndex);
            }

            // 最適化されたアプローチでaria-labelをパース
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

          // Build hProperties for mdast-util-to-hast conversion
          const hProperties = {};

          // class属性を追加（カスタムクラスを優先、なければプラグインオプション）
          const finalClass = customClass || className;
          if (finalClass) {
            hProperties.className = finalClass;
          }

          // アクセシビリティ属性を追加（有効な場合）
          if (accessibility) {
            hProperties.role = 'mark';

            // 指定されている場合はカスタムaria-labelを追加
            if (customAriaLabel) {
              hProperties['aria-label'] = escapeHtml(customAriaLabel, securityMode);
            }
          }

          // フォーカス可能属性を追加（有効な場合）
          if (focusable) {
            hProperties.tabIndex = 0;
          }

          // Create custom MDAT node with data.hName for remark-rehype
          const markNode = {
            type: 'mark',
            children: [{ type: 'text', value: escapeHtml(highlightedText, securityMode) }],
            data: {
              hName: 'mark',
              hProperties: Object.keys(hProperties).length > 0 ? hProperties : undefined
            }
          };
          parts.push(markNode);
        }

        lastIndex = match.index + match[0].length;
      }

      // 最後のマッチ後の残りのテキストを追加
      if (lastIndex < text.length) {
        parts.push({
          type: 'text',
          value: text.slice(lastIndex)
        });
      }

      // 全テキストノードでエスケープされたシーケンスを復元
      if (escapedSequences.length > 0) {
        parts.forEach(part => {
          if (part.type === 'text') {
            escapedSequences.forEach((sequence, index) => {
              const token = `${escapeToken}${index}${escapeToken}`;
              part.value = part.value.replaceAll(token, sequence);
            });
          }
        });
      }

      // 元のノードを処理済みパーツで置換
      if (parts.length > 0) {
        // キャッシュが有効な場合は結果をキャッシュ
        if (processCache) {
          const cacheKey = `${node.value}:${className}:${accessibility}:${focusable}`;
          processCache.set(cacheKey, [...parts]); // キャッシュ用に配列を複製
        }

        parent.children.splice(index, 1, ...parts);
        // 新しく挿入されたノードをスキップするためにインデックスを調整
        return index + parts.length;
      }
    });

    // Second pass: Process split mark patterns like ==**text**==
    // These patterns have == split across multiple nodes due to Markdown parsing
    const parentTypes = ['paragraph', 'heading', 'tableCell', 'listItem', 'blockquote'];
    visit(tree, (node) => {
      if (parentTypes.includes(node.type) || node.type === 'strong' || node.type === 'emphasis') {
        processSplitMarkPatterns(node);
      }
    });
  };
}