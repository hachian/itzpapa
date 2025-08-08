import { visit } from 'unist-util-visit';

export default function remarkWikilink() {
  return function transformer(tree) {

    visit(tree, 'text', (node, index, parent) => {
      if (!parent || parent.type === 'link') return;

      const text = node.value;
      const wikilinkRegex = /\[\[([^\]|]+)(\|([^\]]+))?\]\]/g;
      
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

        // Process the wikilink
        const linkPath = match[1];
        const linkText = match[3] || getDisplayName(linkPath);
        
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
}

function getDisplayName(path) {
  const cleanPath = path.replace(/\.(md|mdx)$/, '').replace(/\/index$/, '');
  const parts = cleanPath.split('/');
  return parts[parts.length - 1];
}