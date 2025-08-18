import { visit } from 'unist-util-visit';

export default function remarkMarkHighlight() {
  return function transformer(tree, file) {
    console.log('=== remarkMarkHighlightプラグイン実行開始 ===');
    
    // コードブロックとインラインコードの位置を事前に記録
    const codeRanges = [];
    visit(tree, ['code', 'inlineCode'], (node) => {
      if (node.position) {
        codeRanges.push(node.position);
      }
    });
    
    try {
      // テキストノードを処理
      visit(tree, 'text', (node, index, parent) => {
        try {
          console.log(`テキスト処理: "${node.value}"`);
          
          // コードブロック、インラインコード内のテキストは無視
          if (!parent || parent.type === 'code' || parent.type === 'inlineCode') {
            console.log('→ コードブロック内のため無視');
            return;
          }
          
          // 親ノードがコードブロック系の場合も無視
          let currentParent = parent;
          while (currentParent) {
            if (currentParent.type === 'code' || 
                currentParent.type === 'inlineCode' ||
                currentParent.type === 'codeblock') {
              console.log('→ 祖先がコードブロックのため無視');
              return;
            }
            currentParent = currentParent.parent;
          }
          
          const text = node.value;
          
          // ==text== パターンが含まれているかチェック
          if (!text.includes('==')) {
            console.log('→ ==が含まれていないため無視');
            return;
          }
          
          console.log('→ ==が含まれているため処理継続');
          
          // HTMLコードタグ内のチェック（エスケープされたものも含む）
          if (isInsideHtmlCodeTag(text)) {
            console.log('→ HTMLコードタグ内のため無視');
            return;
          }
          
          // テキストをパーツに分割して処理
          console.log('→ processTextWithMarkHighlightを実行');
          const parts = processTextWithMarkHighlight(text);
          console.log(`→ ${parts.length}個のパーツを生成`);
          
          // HTMLノードが含まれているか確認
          const hasHtmlNode = parts.some(part => part.type === 'html');
          if (hasHtmlNode) {
            console.log('→ HTMLノードが含まれているのでノードを置換します');
            // 元のノードを新しいノードリストで置換
            parent.children.splice(index, 1, ...parts);
            return index + parts.length;
          } else {
            console.log('→ HTMLノードがないため置換しない');
          }
        } catch (error) {
          console.error('テキストノード処理エラー:', error);
        }
      });
    } catch (error) {
      console.error('remarkMarkHighlightプラグインエラー:', error);
    }
    
    console.log('=== remarkMarkHighlightプラグイン実行完了 ===');
  };
}

function processTextWithMarkHighlight(text) {
  console.log(`  processTextWithMarkHighlight実行: "${text}"`);
  
  // HTMLエンティティをデコードして処理
  const decodedText = decodeHtmlEntities(text);
  console.log(`  デコード後: "${decodedText}"`);
  
  // 厳密な==記法の検証
  const isValid = isValidMarkHighlightText(decodedText);
  console.log(`  記法妥当性: ${isValid}`);
  if (!isValid) {
    console.log(`  → 無効な記法のためスキップ`);
    return [{ type: 'text', value: text }];
  }
  
  // 厳密な==記法のみをマッチ（改行を含まない、前後に=がない）
  const markHighlightRegex = /==([^=\n](?:[^\n]*?[^=\n])?)==/g;
  const parts = [];
  let lastIndex = 0;
  
  console.log(`  正規表現でマッチング開始`);
  let match;
  let matchCount = 0;
  while ((match = markHighlightRegex.exec(decodedText)) !== null) {
    matchCount++;
    console.log(`  マッチ${matchCount}: "${match[0]}", 内容: "${match[1]}"`);
    
    // 前後に等号がないことを確認（lookbehind/lookaheadで既にチェック済みだが、念のため）
    const before = decodedText.charAt(match.index - 1);
    const after = decodedText.charAt(match.index + match[0].length);
    console.log(`  前後文字: "${before}" | "${after}"`);
    
    if (before === '=' || after === '=') {
      console.log(`  → 前後に=があるためスキップ`);
      continue;
    }
    
    // マッチ前のテキストを追加
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index);
      console.log(`  前テキスト追加: "${beforeText}"`);
      parts.push({
        type: 'text',
        value: beforeText
      });
    }
    
    const highlightText = match[1];
    console.log(`  ハイライトテキスト: "${highlightText}"`);
    
    // 空のハイライト、スペース/タブのみは処理しない
    if (!highlightText || !highlightText.trim() || /^\s+$/.test(highlightText)) {
      console.log(`  → 空またはスペースのみのためスキップ`);
      // 元のテキストの対応部分を正確に取得
      const originalMatch = text.substring(match.index, match.index + match[0].length);
      parts.push({
        type: 'text',
        value: originalMatch
      });
      lastIndex = match.index + match[0].length;
      continue;
    }
    
    // 長い文字列制限（10000文字以上は処理しない）
    if (highlightText.length > 10000) {
      console.log(`  → 長すぎるためスキップ`);
      parts.push({
        type: 'text',
        value: text.slice(match.index, match.index + match[0].length)
      });
      lastIndex = match.index + match[0].length;
      continue;
    }
    
    console.log(`  → 処理してHTMLノードを作成`);
    
    // 制御文字とUnicode文字の除去とサニタイズ
    let processedContent = sanitizeText(highlightText.trim());
    
    // インライン記法を手動で処理
    // 太字の処理 (**text** または __text__)
    processedContent = processedContent.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    processedContent = processedContent.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    
    // イタリックの処理 (*text* または _text_)
    processedContent = processedContent.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    processedContent = processedContent.replace(/_([^_]+)_/g, '<em>$1</em>');
    
    // コードの処理 (`text`)
    processedContent = processedContent.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // リンクの処理 ([text](url)) - セキュリティ改善
    processedContent = processedContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      const safeUrl = sanitizeUrl(url);
      return `<a href="${safeUrl}">${text}</a>`;
    });
    
    // 完全なHTMLエスケープとXSS防止
    processedContent = secureHtmlEscape(processedContent);
    
    // HTMLノードとして追加
    const htmlNode = {
      type: 'html',
      value: `<mark>${processedContent}</mark>`
    };
    console.log(`  HTMLノード作成: ${JSON.stringify(htmlNode)}`);
    parts.push(htmlNode);
    
    lastIndex = match.index + match[0].length;
  }
  
  console.log(`  マッチ数: ${matchCount}`);
  
  // 残りのテキストを追加
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    console.log(`  残りテキスト追加: "${remainingText}"`);
    parts.push({
      type: 'text',
      value: remainingText
    });
  }
  
  console.log(`  最終パーツ数: ${parts.length}`);
  return parts.length > 0 ? parts : [{ type: 'text', value: text }];
}

// HTMLコードタグ内のチェック（エスケープされたものも含む）
function isInsideHtmlCodeTag(text) {
  // 生HTMLコードタグ
  if (text.includes('<code>') || text.includes('</code>')) {
    return true;
  }
  
  // エスケープされたHTMLコードタグ
  if (text.includes('&lt;code&gt;') || text.includes('&lt;/code&gt;')) {
    return true;
  }
  
  // バックスラッシュエスケープされたHTMLコードタグ
  if (text.includes('\\<code>') || text.includes('\\</code>')) {
    return true;
  }
  
  return false;
}

// 既存関数（下位互換性のため保持）
function isInsideCodeTag(text) {
  return isInsideHtmlCodeTag(text);
}

// HTMLエンティティデコード関数（二重エスケープ防止）
function decodeHtmlEntities(text) {
  const entityMap = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#39;': "'"
  };
  
  // 二重エスケープを防ぐため、既にデコード済みかチェック
  let decoded = text;
  let previousDecoded;
  let iterations = 0;
  const maxIterations = 3; // 無限ループ防止
  
  do {
    previousDecoded = decoded;
    decoded = decoded.replace(/&(?:amp|lt|gt|quot|#x27|#39);/g, (entity) => {
      return entityMap[entity] || entity;
    });
    iterations++;
  } while (decoded !== previousDecoded && iterations < maxIterations);
  
  return decoded;
}

// 記法の妥当性検証（厳密化）
function isValidMarkHighlightText(text) {
  // 改行を含む記法は無効
  if (text.includes('\n')) {
    // ==記法内に改行がある場合を検出
    const incompletePattern = /==([^=]*\n[^=]*)==?/;
    if (incompletePattern.test(text)) {
      return false;
    }
  }
  
  // 奇数個の等号パターンを厳密に検出
  // 3個以上の連続した等号があり、それが有効な2個ペアでない場合は無効
  const tripleOrMore = /={3,}/g;
  let match;
  while ((match = tripleOrMore.exec(text)) !== null) {
    const equalCount = match[0].length;
    // 奇数個の等号は無効
    if (equalCount % 2 !== 0) {
      return false;
    }
    // 4個以上の偶数個の等号も、ネスト記法として無効
    if (equalCount >= 4) {
      return false;
    }
  }
  
  // スペースのみの内容をチェック
  const potentialMatches = text.match(/==([^=\n]*?)==/g);
  if (potentialMatches) {
    for (const match of potentialMatches) {
      const content = match.slice(2, -2); // == を除去
      if (!content.trim()) {
        return false;
      }
    }
  }
  
  return true;
}

// 個別記法パターンの妥当性チェック
function isValidMarkPattern(match, index, fullText) {
  // 前後の文字をチェックして、より大きなネスト記法の一部でないことを確認
  const before = fullText.charAt(index - 1);
  const after = fullText.charAt(index + match.length);
  
  if (before === '=' || after === '=') {
    return false;
  }
  
  // マッチした内容をさらに詳しくチェック
  const content = match.slice(2, -2); // == を除去
  
  // 空白のみの内容は無効
  if (/^\s*$/.test(content)) {
    return false;
  }
  
  return true;
}

// テキストサニタイズ（制御文字・Unicode文字除去）
function sanitizeText(text) {
  // 制御文字を除去（\x00-\x1F, \x7F-\x9F）
  // ただし、タブ(\x09)、改行(\x0A)、キャリッジリターン(\x0D)は保持
  let cleaned = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
  
  // 不正なUnicode文字を除去
  cleaned = cleaned.replace(/[\uFFFF\uFFFE\uFDD0-\uFDEF]/g, '');
  
  // ゼロ幅文字を除去
  cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, '');
  
  return cleaned;
}

// URL サニタイズ（XSS防止）
function sanitizeUrl(url) {
  // 危険なスキームを無効化
  const dangerousSchemes = /^(javascript|data|vbscript|on\w+):/i;
  if (dangerousSchemes.test(url)) {
    return '#';
  }
  return url;
}

// 完全なHTMLエスケープ（XSS防止強化、二重エスケープ防止）
function secureHtmlEscape(text) {
  // 既存のHTMLエンティティを検出して保護
  const protectedEntities = [];
  let entityIndex = 0;
  
  // 既存のHTMLエンティティを一時的に保護
  let protectedText = text.replace(/&(amp|lt|gt|quot|#x27|#39);/g, (match) => {
    const placeholder = `__PROTECTED_ENTITY_${entityIndex}__`;
    protectedEntities[entityIndex] = match;
    entityIndex++;
    return placeholder;
  });
  
  // 安全なHTMLタグを保護
  const protectedTags = [];
  let tagIndex = 0;
  protectedText = protectedText.replace(/<(\/?)(strong|em|code|a(?:\s+[^>]*)?)>/gi, (match, slash, tagContent) => {
    // aタグの場合、href属性を検証
    if (tagContent && tagContent.startsWith('a ')) {
      const hrefMatch = match.match(/href=["']([^"']+)["']/i);
      if (hrefMatch) {
        const url = hrefMatch[1];
        if (/^(javascript|data|vbscript):/i.test(url)) {
          // 危険なURLスキームは無効化
          return match.replace(hrefMatch[0], 'href="#"');
        }
      }
    }
    const placeholder = `__PROTECTED_TAG_${tagIndex}__`;
    protectedTags[tagIndex] = match;
    tagIndex++;
    return placeholder;
  });
  
  // 基本HTMLエスケープを実行
  let escaped = protectedText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    // 追加のXSS対策
    .replace(/javascript:/gi, 'javascript&colon;')
    .replace(/vbscript:/gi, 'vbscript&colon;')
    .replace(/data:text\/html/gi, 'data&colon;text/html')
    .replace(/on\w+\s*=/gi, (match) => match.replace('=', '&equals;'));
  
  // 保護したタグを復元
  protectedTags.forEach((tag, i) => {
    escaped = escaped.replace(`__PROTECTED_TAG_${i}__`, tag);
  });
  
  // 保護したエンティティを復元（二重エスケープ防止）
  protectedEntities.forEach((entity, i) => {
    escaped = escaped.replace(`__PROTECTED_ENTITY_${i}__`, entity);
  });
  
  return escaped;
}

// HTMLエスケープ関数（既存のHTMLタグは保護）- 下位互換性のため保持
function escapeHtmlExceptTags(text) {
  return secureHtmlEscape(text);
}

// HTMLエスケープ関数（XSS防止）- 下位互換性のため保持 
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}