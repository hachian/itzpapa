import { visit } from 'unist-util-visit';

/**
 * Remarkプラグイン - タグ処理
 * Obsidianスタイルのタグ（#tag, #parent/child）をサポート
 */
export default function remarkTags(options = {}) {
  // デフォルトオプション
  const defaultOptions = {
    // タグをリンクに変換するか
    convertToLinks: true,
    // タグページのベースパス
    tagBasePath: '/tags/',
    // タグのCSSクラス
    tagClassName: 'tag',
    // 階層タグのCSSクラス
    hierarchicalTagClassName: 'tag-hierarchical',
    // タグプレフィックス（デフォルトは#）
    tagPrefix: '#',
    // 階層セパレーター（デフォルトは/）
    hierarchySeparator: '/',
    // 最大階層深度
    maxHierarchyDepth: 5,
    // 大文字小文字を区別するか
    caseSensitive: false
  };
  
  const config = { ...defaultOptions, ...options };
  
  return function transformer(tree, file) {
    // ファイルのメタデータにタグ情報を格納するための初期化
    if (!file.data.astro) {
      file.data.astro = {};
    }
    if (!file.data.astro.frontmatter) {
      file.data.astro.frontmatter = {};
    }
    
    // タグを格納する配列
    const collectedTags = new Set();
    const inlineTags = [];
    
    // frontmatterからタグを収集（もし存在すれば）
    if (file.data.astro.frontmatter.tags) {
      const frontmatterTags = Array.isArray(file.data.astro.frontmatter.tags)
        ? file.data.astro.frontmatter.tags
        : [file.data.astro.frontmatter.tags];
      
      frontmatterTags.forEach(tag => {
        const normalizedTag = normalizeTag(tag, config);
        if (normalizedTag) {
          collectedTags.add(normalizedTag);
        }
      });
    }
    
    // テキストノードを訪問してインラインタグを処理
    visit(tree, 'text', (node, index, parent) => {
      // リンク内のテキストは処理しない
      if (!parent || parent.type === 'link') return;
      
      const text = node.value;
      
      // タグパターン: #で始まり、スペースまたは句読点で終わる
      // 日本語、英数字、ハイフン、アンダースコア、スラッシュを含む
      const tagRegex = new RegExp(
        `${escapeRegExp(config.tagPrefix)}([a-zA-Z0-9\\-_\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF\\u3400-\\u4DBF]+(?:${escapeRegExp(config.hierarchySeparator)}[a-zA-Z0-9\\-_\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF\\u3400-\\u4DBF]+)*)(?=\\s|$|[,.!?;:）」』】）])`,
        'g'
      );
      
      // タグが含まれていない場合は早期リターン
      if (!tagRegex.test(text)) {
        return;
      }
      
      // regexをリセット
      tagRegex.lastIndex = 0;
      
      let match;
      const parts = [];
      let lastIndex = 0;
      
      while ((match = tagRegex.exec(text)) !== null) {
        // マッチ前のテキストを追加
        if (match.index > lastIndex) {
          parts.push({
            type: 'text',
            value: text.slice(lastIndex, match.index)
          });
        }
        
        const fullMatch = match[0];
        const tagName = match[1];
        const normalizedTag = normalizeTag(tagName, config);
        
        // 階層深度チェック
        const hierarchyDepth = tagName.split(config.hierarchySeparator).length;
        if (hierarchyDepth > config.maxHierarchyDepth) {
          // 階層が深すぎる場合は通常のテキストとして扱う
          parts.push({
            type: 'text',
            value: fullMatch
          });
        } else {
          // タグを収集
          collectedTags.add(normalizedTag);
          inlineTags.push({
            tag: normalizedTag,
            position: match.index
          });
          
          if (config.convertToLinks) {
            // タグをリンクに変換
            const slug = tagToSlug(normalizedTag, config);
            const isHierarchical = normalizedTag.includes(config.hierarchySeparator);
            
            parts.push({
              type: 'link',
              url: `${config.tagBasePath}${slug}`,
              title: `タグ: ${normalizedTag}`,
              children: [{
                type: 'text',
                value: fullMatch
              }],
              data: {
                hProperties: {
                  className: [
                    config.tagClassName,
                    isHierarchical ? config.hierarchicalTagClassName : null
                  ].filter(Boolean).join(' ')
                }
              }
            });
          } else {
            // タグをspanでラップ（リンクにしない場合）
            const isHierarchical = normalizedTag.includes(config.hierarchySeparator);
            
            parts.push({
              type: 'emphasis',
              data: {
                hName: 'span',
                hProperties: {
                  className: [
                    config.tagClassName,
                    isHierarchical ? config.hierarchicalTagClassName : null
                  ].filter(Boolean).join(' ')
                }
              },
              children: [{
                type: 'text',
                value: fullMatch
              }]
            });
          }
        }
        
        lastIndex = match.index + fullMatch.length;
      }
      
      // 残りのテキストを追加
      if (lastIndex < text.length) {
        parts.push({
          type: 'text',
          value: text.slice(lastIndex)
        });
      }
      
      // ノードを置換
      if (parts.length > 0) {
        parent.children.splice(index, 1, ...parts);
        return index + parts.length;
      }
    });
    
    // メタデータにタグ情報を追加
    file.data.astro.frontmatter.processedTags = Array.from(collectedTags);
    file.data.astro.frontmatter.inlineTags = inlineTags.map(t => t.tag);
    file.data.astro.frontmatter.allTags = Array.from(collectedTags);
  };
}

/**
 * タグを正規化する
 */
function normalizeTag(tag, config) {
  // プレフィックスを除去
  let normalized = tag;
  if (normalized.startsWith(config.tagPrefix)) {
    normalized = normalized.slice(config.tagPrefix.length);
  }
  
  // トリミング
  normalized = normalized.trim();
  
  // 連続するスラッシュを単一に
  normalized = normalized.replace(
    new RegExp(`${escapeRegExp(config.hierarchySeparator)}+`, 'g'),
    config.hierarchySeparator
  );
  
  // 先頭と末尾のスラッシュを除去
  normalized = normalized
    .replace(new RegExp(`^${escapeRegExp(config.hierarchySeparator)}+`), '')
    .replace(new RegExp(`${escapeRegExp(config.hierarchySeparator)}+$`), '');
  
  // 大文字小文字の処理
  if (!config.caseSensitive) {
    normalized = normalized.toLowerCase();
  }
  
  return normalized;
}

/**
 * タグをURLセーフなスラッグに変換
 */
function tagToSlug(tag, config) {
  // スラッシュをハイフンに置換
  let slug = tag.replace(
    new RegExp(escapeRegExp(config.hierarchySeparator), 'g'),
    '-'
  );
  
  // URLエンコード（日本語文字を含む場合）
  slug = encodeURIComponent(slug);
  
  return slug;
}

/**
 * 正規表現の特殊文字をエスケープ
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}