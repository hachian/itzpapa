import { visit } from 'unist-util-visit';

export default function remarkWikilink() {
  // プラグインの実行順序を早めるために優先度を設定
  const plugin = function transformer(tree, file) {
    
    // 第1パス: テーブル内のWikilinkパイプ文字を一時的に置換
    visit(tree, 'text', (node) => {
      // テーブル内の可能性があるテキストをチェック
      if (node.value.includes('|') && node.value.includes('[[')) {
        // Wikilinkのパイプ文字を一時的なマーカーに置換
        node.value = node.value.replace(/\[\[([^\]]+)\|([^\]]+)\]\]/g, (match, path, alias) => {
          return `[[${path}<<<PIPE>>>${alias}]]`;
        });
      }
    });

    // 第2パス: 画像とリンクのWikilink処理
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || parent.type === 'link') return;

      const text = node.value;
      // 画像とリンクの両方のパターンを処理（画像は!で始まる）
      const wikilinkRegex = /(!?)\[\[([^\]]+?)(?:(?:\||<<<PIPE>>>)([^\]]+?))?\]\]/g;
      
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
        const linkPath = match[2];
        const altOrLinkText = match[3];
        
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
          let url = linkPath;
          
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
            
            // Clean the file path
            const cleanPath = filePath.replace(/^\.\.\//, '').replace(/\.md$/, '').replace(/\/index$/, '');
            
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