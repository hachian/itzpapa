import { visit } from 'unist-util-visit';

export default function remarkMarkHighlight() {
  return function transformer(tree, file) {
    
    // テキストノードを処理
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || parent.type === 'code' || parent.type === 'inlineCode') {
        return;
      }

      const text = node.value;
      
      // ==text== パターンが含まれているかチェック
      if (!text.includes('==')) {
        return;
      }
      
      // ==text== パターンの正規表現
      const markHighlightRegex = /==([^=\n]+)==/g;
      
      if (!markHighlightRegex.test(text)) {
        return;
      }
      
      // テキストをパーツに分割して処理
      const parts = processTextWithMarkHighlight(text);
      
      if (parts.length > 1) {
        // 元のノードを新しいノードリストで置換
        parent.children.splice(index, 1, ...parts);
        return index + parts.length;
      }
    });
  };
}

function processTextWithMarkHighlight(text) {
  const markHighlightRegex = /==([^=\n]+)==/g;
  const parts = [];
  let lastIndex = 0;
  
  let match;
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
        value: match[0]
      });
      lastIndex = markHighlightRegex.lastIndex;
      continue;
    }
    
    // インライン記法を手動で処理
    let processedContent = highlightText;
    
    // 太字の処理 (**text** または __text__)
    processedContent = processedContent.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    processedContent = processedContent.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    
    // イタリックの処理 (*text* または _text_)
    processedContent = processedContent.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    processedContent = processedContent.replace(/_([^_]+)_/g, '<em>$1</em>');
    
    // コードの処理 (`text`)
    processedContent = processedContent.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // リンクの処理 ([text](url))
    processedContent = processedContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    
    // HTMLエスケープ（ただし、すでに処理したHTMLタグは除く）
    processedContent = escapeHtmlExceptTags(processedContent);
    
    // HTMLノードとして追加
    parts.push({
      type: 'html',
      value: `<mark>${processedContent}</mark>`
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
  
  return parts.length > 0 ? parts : [{ type: 'text', value: text }];
}

// HTMLエスケープ関数（既存のHTMLタグは保護）
function escapeHtmlExceptTags(text) {
  // 一時的なプレースホルダーでHTMLタグを保護
  const tags = [];
  let index = 0;
  
  // HTMLタグを一時的に置換
  const tempText = text.replace(/<(\/?)(\w+)([^>]*)>/g, (match) => {
    const placeholder = `__TAG_${index}__`;
    tags[index] = match;
    index++;
    return placeholder;
  });
  
  // HTMLエスケープ
  let escaped = tempText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  
  // HTMLタグを復元
  tags.forEach((tag, i) => {
    escaped = escaped.replace(`__TAG_${i}__`, tag);
  });
  
  return escaped;
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