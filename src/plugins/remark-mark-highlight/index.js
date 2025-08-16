import { visit } from 'unist-util-visit';

export default function remarkMarkHighlight() {
  const plugin = function transformer(tree, file) {
    
    // テキストノードを走査して ==text== パターンを検出
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || parent.type === 'code' || parent.type === 'inlineCode') {
        // コードブロック内では処理しない
        return;
      }

      let text = node.value;
      
      // ==text== パターンの正規表現
      const markHighlightRegex = /==([^=\n]+)==/g;
      
      // マークハイライトが含まれていない場合は早期リターン
      if (!markHighlightRegex.test(text)) {
        return;
      }
      
      // regexをリセット
      markHighlightRegex.lastIndex = 0;
      
      let match;
      const parts = [];
      let lastIndex = 0;

      while ((match = markHighlightRegex.exec(text)) !== null) {
        // マッチ前のテキストを追加
        if (match.index > lastIndex) {
          parts.push({
            type: 'text',
            value: text.slice(lastIndex, match.index)
          });
        }

        const highlightText = match[1].trim();
        
        // 空のハイライトは処理しない
        if (!highlightText || highlightText.length === 0) {
          parts.push({
            type: 'text',
            value: match[0]  // 元のテキストをそのまま保持
          });
          lastIndex = markHighlightRegex.lastIndex;
          continue;
        }
        
        // markタグを作成
        parts.push({
          type: 'html',
          value: `<mark>${escapeHtml(highlightText)}</mark>`
        });

        lastIndex = markHighlightRegex.lastIndex;
      }

      // 残りのテキストを追加
      if (lastIndex < text.length) {
        parts.push({
          type: 'text',
          value: text.slice(lastIndex)
        });
      }

      // ノードを置き換え（ハイライトが見つかった場合のみ）
      if (parts.length > 1 || (parts.length === 1 && parts[0].type !== 'text')) {
        parent.children.splice(index, 1, ...parts);
        return index + parts.length;
      }
    });
  };

  // 優先度を設定（wikilinkより後、calloutより前に実行）
  plugin.priority = 500;
  
  return plugin;
}

// HTMLエスケープ関数（XSS防止）
function escapeHtml(text) {
  const div = { innerHTML: '', textContent: '' };
  div.textContent = text;
  return div.innerHTML || text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}