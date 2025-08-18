import { visit } from 'unist-util-visit';

// デバッグログの条件付き制御
const DEBUG = process.env.REMARK_MARK_HIGHLIGHT_DEBUG === 'true';
const log = DEBUG ? console.log : () => {};

// 正規表現を事前コンパイル（パフォーマンス最適化）
const MARK_HIGHLIGHT_REGEX = /==([^=\n]+?)==/g;
const HTML_CODE_TAG_REGEX = /<\/?code>/i;
const DANGEROUS_SCHEMES_REGEX = /^(javascript|data|vbscript):/i;
const CONTROL_CHARS_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g;
const UNICODE_INVALID_REGEX = /[\uFFFF\uFFFE\uFDD0-\uFDEF]/g;
const ZERO_WIDTH_REGEX = /[\u200B-\u200D\uFEFF]/g;

export default function remarkMarkHighlight() {
  return function transformer(tree, file) {
    log('=== remarkMarkHighlightプラグイン実行開始 ===');
    
    try {
      // テキストノードを処理
      visit(tree, 'text', (node, index, parent) => {
        try {
          log(`テキスト処理: "${node.value}"`);
          
          // コードブロック、インラインコード内のテキストは無視
          if (!parent || parent.type === 'code' || parent.type === 'inlineCode') {
            log('→ コードブロック内のため無視');
            return;
          }
          
          // 親ノードがコードブロック系の場合も無視
          let currentParent = parent;
          while (currentParent) {
            if (currentParent.type === 'code' || 
                currentParent.type === 'inlineCode' ||
                currentParent.type === 'codeblock') {
              log('→ 祖先がコードブロックのため無視');
              return;
            }
            currentParent = currentParent.parent;
          }
          
          const text = node.value;
          
          // ==が含まれているかの早期チェック（最適化）
          if (!text.includes('==')) {
            log('→ ==が含まれていないため無視');
            return;
          }
          
          log('→ ==が含まれているため処理継続');
          
          // HTMLコードタグ内のチェック（最適化：正規表現使用）
          if (HTML_CODE_TAG_REGEX.test(text)) {
            log('→ HTMLコードタグ内のため無視');
            return;
          }
          
          // テキストをパーツに分割して処理
          log('→ processTextWithMarkHighlightを実行');
          const parts = processTextWithMarkHighlight(text);
          log(`→ ${parts.length}個のパーツを生成`);
          
          // HTMLノードが含まれているか確認
          const hasHtmlNode = parts.some(part => part.type === 'html');
          if (hasHtmlNode) {
            log('→ HTMLノードが含まれているのでノードを置換します');
            // 元のノードを新しいノードリストで置換
            parent.children.splice(index, 1, ...parts);
            return index + parts.length;
          } else {
            log('→ HTMLノードがないため置換しない');
          }
        } catch (error) {
          log('テキストノード処理エラー:', error);
        }
      });
    } catch (error) {
      log('remarkMarkHighlightプラグインエラー:', error);
    }
    
    log('=== remarkMarkHighlightプラグイン実行完了 ===');
  };
}

function processTextWithMarkHighlight(text) {
  log(`  processTextWithMarkHighlight実行: "${text}"`);
  
  // HTMLエンティティをデコードして処理
  const decodedText = decodeHtmlEntities(text);
  log(`  デコード後: "${decodedText}"`);
  
  // 厳密な==記法の検証
  const isValid = isValidMarkHighlightText(decodedText);
  log(`  記法妥当性: ${isValid}`);
  if (!isValid) {
    log(`  → 無効な記法のためスキップ`);
    return [{ type: 'text', value: text }];
  }
  
  // 正規表現をリセットしてマッチング（最適化：事前コンパイルした正規表現使用）
  MARK_HIGHLIGHT_REGEX.lastIndex = 0;
  const parts = [];
  let lastIndex = 0;
  let matchCount = 0;
  
  log(`  正規表現でマッチング開始`);
  let match;
  while ((match = MARK_HIGHLIGHT_REGEX.exec(decodedText)) !== null) {
    matchCount++;
    log(`  マッチ${matchCount}: "${match[0]}", 内容: "${match[1]}"`);
    
    // 前後に等号がないことを確認
    const before = decodedText.charAt(match.index - 1);
    const after = decodedText.charAt(match.index + match[0].length);
    log(`  前後文字: "${before}" | "${after}"`);
    
    if (before === '=' || after === '=') {
      log(`  → 前後に=があるためスキップ`);
      continue;
    }
    
    // マッチ前のテキストを追加
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index);
      log(`  前テキスト追加: "${beforeText}"`);
      parts.push({
        type: 'text',
        value: beforeText
      });
    }
    
    const highlightText = match[1];
    log(`  ハイライトテキスト: "${highlightText}"`);
    
    // 空のハイライト、スペース/タブのみは処理しない（最適化：早期return）
    if (!highlightText || !highlightText.trim()) {
      log(`  → 空またはスペースのみのためスキップ`);
      parts.push({
        type: 'text',
        value: text.slice(match.index, match.index + match[0].length)
      });
      lastIndex = match.index + match[0].length;
      continue;
    }
    
    // 長い文字列制限（10000文字以上は処理しない）
    if (highlightText.length > 10000) {
      log(`  → 長すぎるためスキップ`);
      parts.push({
        type: 'text',
        value: text.slice(match.index, match.index + match[0].length)
      });
      lastIndex = match.index + match[0].length;
      continue;
    }
    
    log(`  → 処理してHTMLノードを作成`);
    
    // 処理済みコンテンツの生成（最適化：統合処理）
    const processedContent = optimizedContentProcessing(highlightText.trim());
    
    // HTMLノードとして追加
    const htmlNode = {
      type: 'html',
      value: `<mark>${processedContent}</mark>`
    };
    log(`  HTMLノード作成: ${DEBUG ? JSON.stringify(htmlNode) : '[HTML Node]'}`);
    parts.push(htmlNode);
    
    lastIndex = match.index + match[0].length;
  }
  
  log(`  マッチ数: ${matchCount}`);
  
  // 残りのテキストを追加
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    log(`  残りテキスト追加: "${remainingText}"`);
    parts.push({
      type: 'text',
      value: remainingText
    });
  }
  
  log(`  最終パーツ数: ${parts.length}`);
  return parts.length > 0 ? parts : [{ type: 'text', value: text }];
}

/**
 * 最適化されたコンテンツ処理（統合処理）
 */
function optimizedContentProcessing(text) {
  // 1. 制御文字とUnicode文字の除去とサニタイズ（統合処理）
  let cleaned = text
    .replace(CONTROL_CHARS_REGEX, '')
    .replace(UNICODE_INVALID_REGEX, '')
    .replace(ZERO_WIDTH_REGEX, '');
  
  // 2. インライン記法を手動で処理（統合処理）
  cleaned = cleaned
    // 太字の処理 (**text** または __text__)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    // イタリックの処理 (*text* または _text_)
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    // コードの処理 (`text`)
    .replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // 3. リンクの処理 ([text](url)) - セキュリティ改善（統合処理）
  cleaned = cleaned.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    const safeUrl = DANGEROUS_SCHEMES_REGEX.test(url) ? '#' : url;
    return `<a href="${safeUrl}">${text}</a>`;
  });
  
  // 4. 完全なHTMLエスケープとXSS防止（統合処理）
  return secureHtmlEscape(cleaned);
}

// HTMLエンティティデコード関数（最適化：オブジェクト作成を避ける）
function decodeHtmlEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'");
}

// 記法の妥当性検証（最適化：正規表現使用）
function isValidMarkHighlightText(text) {
  // 3個以上の連続した=を検出
  if (/={3,}/.test(text)) {
    return false;
  }
  
  // 改行を含む記法は無効
  const matches = text.match(MARK_HIGHLIGHT_REGEX);
  if (matches) {
    MARK_HIGHLIGHT_REGEX.lastIndex = 0; // リセット
    for (const match of matches) {
      if (match.includes('\n')) {
        return false;
      }
    }
  }
  
  return true;
}

// 完全なHTMLエスケープ（XSS防止強化）- 最適化版
function secureHtmlEscape(text) {
  // 一時的なプレースホルダーで既存のHTMLタグを保護
  const tags = [];
  let index = 0;
  
  // 安全なHTMLタグのみを保護（strong, em, code, a）
  const tempText = text.replace(/<(\/?)(strong|em|code|a(?:\s+[^>]*)??)>/gi, (match, slash, tagContent) => {
    // aタグの場合、href属性を検証
    if (tagContent && tagContent.startsWith('a ')) {
      const hrefMatch = match.match(/href=["']([^"']+)["']/i);
      if (hrefMatch) {
        const url = hrefMatch[1];
        if (DANGEROUS_SCHEMES_REGEX.test(url)) {
          return match.replace(hrefMatch[0], 'href="#"');
        }
      }
    }
    const placeholder = `__SAFE_TAG_${index}__`;
    tags[index] = match;
    index++;
    return placeholder;
  });
  
  // すべてのHTMLを厳密にエスケープ（統合処理）
  let escaped = tempText
    // HTMLエンティティの二重エスケープを防ぐため、既存のエンティティを一時保護
    .replace(/&(amp|lt|gt|quot|#x27|#39);/g, (match) => {
      const placeholder = `__ENTITY_${index}__`;
      tags[index] = match;
      index++;
      return placeholder;
    })
    // 基本HTMLエスケープ
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    // スクリプト実行可能な文字列を無効化（統合処理）
    .replace(/javascript:/gi, 'javascript&colon;')
    .replace(/vbscript:/gi, 'vbscript&colon;')
    .replace(/data:text\/html/gi, 'data&colon;text/html')
    .replace(/on\w+\s*=/gi, (match) => match.replace('=', '&equals;'))
    // 追加のXSS対策
    .replace(/<script/gi, '&lt;script')
    .replace(/<\/script/gi, '&lt;/script')
    .replace(/<iframe/gi, '&lt;iframe')
    .replace(/<object/gi, '&lt;object')
    .replace(/<embed/gi, '&lt;embed');
  
  // 保護したタグとエンティティを復元
  tags.forEach((tag, i) => {
    escaped = escaped.replace(`__SAFE_TAG_${i}__`, tag);
    escaped = escaped.replace(`__ENTITY_${i}__`, tag);
  });
  
  return escaped;
}

// 下位互換性のため保持
function escapeHtmlExceptTags(text) {
  return secureHtmlEscape(text);
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}