import { visit } from 'unist-util-visit';

export default function remarkWikilink() {
  // プラグインの実行順序を早めるために優先度を設定
  const plugin = function transformer(tree, file) {
    
    // 最適化: 単一パスでテーブル処理とWikilink変換を同時実行
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || parent.type === 'link') return;

      let text = node.value;
      
      // テーブル内のWikilinkパイプ文字を一時的に置換（必要な場合のみ）
      if (text.includes('|') && text.includes('[[')) {
        text = text.replace(/\[\[([^\]]+)\|([^\]]+)\]\]/g, (match, path, alias) => {
          return `[[${path}<<<PIPE>>>${alias}]]`;
        });
      }
      
      // 画像とリンクの両方のパターンを処理（画像は!で始まる）
      const wikilinkRegex = /(!?)\[\[([^\]]+?)(?:(?:\\\||<<<PIPE>>>|\|)([^\]]+?))?\]\]/g;
      
      // 最適化: Wikilinkが含まれていない場合は早期リターン
      if (!wikilinkRegex.test(text)) {
        return;
      }
      
      // regexをリセット
      wikilinkRegex.lastIndex = 0;
      
      let match;
      const parts = [];
      let lastIndex = 0;

      while ((match = wikilinkRegex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
          parts.push({
            type: 'text',
            value: text.slice(lastIndex, match.index)
          });
        }

        const isImage = match[1] === '!';
        const linkPath = match[2].trim();  // Remove leading/trailing whitespace from path
        // エスケープされたパイプ文字を復元（\|を|に戻す）エイリアス部分は空白保持
        const altOrLinkText = match[3] ? match[3].replace(/\\\|/g, '|') : match[3];
        
        // TASK-007: エラーハンドリング - 無効なパスの検出
        if (!linkPath || linkPath.length === 0) {
          // 空白のみのパスまたは空のパスは無効として扱い、元のテキストを保持
          parts.push({
            type: 'text',
            value: match[0]  // 元のwikilink文字列をそのまま保持
          });
          lastIndex = wikilinkRegex.lastIndex;
          continue;
        }
        
        if (isImage) {
          // 画像の処理
          const altText = altOrLinkText || getDisplayName(linkPath);
          let imagePath = linkPath;
          
          // パスの正規化
          if (!linkPath.startsWith('http://') && !linkPath.startsWith('https://')) {
            if (linkPath.startsWith('/')) {
              // 絶対パスはそのまま
              imagePath = linkPath;
            } else if (linkPath.startsWith('../')) {
              // 相対パスはそのまま保持
              imagePath = linkPath;
            } else {
              // その他は./を付ける
              imagePath = './' + linkPath;
            }
          }
          
          parts.push({
            type: 'image',
            url: imagePath,
            alt: altText,
            title: null
          });
        } else {
          // 通常のリンクの処理
          const linkText = altOrLinkText || getDisplayName(linkPath);
          let url = linkPath;  // Will be updated below if internal link
          
          // Handle internal links (starting with ../)
          if (linkPath.startsWith('../')) {
            // Split path and hash
            const hashIndex = linkPath.indexOf('#');
            let filePath = linkPath;
            let hash = '';
            
            if (hashIndex !== -1) {
              filePath = linkPath.slice(0, hashIndex);
              hash = linkPath.slice(hashIndex);
            }
            
            // Clean the file path and normalize for URL
            const cleanPath = filePath
              .replace(/^\.\.\//, '')
              .replace(/\.md$/, '')
              .replace(/\/index$/, '')
              .replace(/\s+/g, '-')  // Convert spaces to hyphens
              .toLowerCase();        // Lowercase for URL consistency
            
            // Convert hash to proper anchor format (spaces to hyphens, lowercase, etc.)
            let cleanHash = hash;
            if (hash) {
              // Remove the # and convert to proper anchor format
              const hashText = hash.slice(1);
              cleanHash = '#' + hashText.toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '');
            }
            
            url = `/blog/${cleanPath}${cleanHash}`;
          } else {
            // For non-relative paths, use the trimmed linkPath
            url = linkPath;
          }

          parts.push({
            type: 'link',
            url: url,
            title: null,
            children: [{ type: 'text', value: linkText }],
            data: {
              hProperties: {
                className: ['wikilink-internal']
              }
            }
          });
        }

        lastIndex = wikilinkRegex.lastIndex;
      }

      // Add remaining text
      if (lastIndex < text.length) {
        parts.push({
          type: 'text',
          value: text.slice(lastIndex)
        });
      }

      // Replace the node if we found wikilinks
      if (parts.length > 1 || (parts.length === 1 && parts[0].type !== 'text')) {
        parent.children.splice(index, 1, ...parts);
        return index + parts.length;
      }
    });
  };

  // 優先度を高く設定してGFMより先に実行されるようにする
  plugin.priority = 1000;
  
  return plugin;
}

function getDisplayName(path) {
  // 画像拡張子も含めて削除
  const cleanPath = path
    .replace(/\.(md|mdx|png|jpg|jpeg|gif|svg|webp)$/i, '')
    .replace(/\/index$/, '');
  const parts = cleanPath.split('/');
  return parts[parts.length - 1];
}