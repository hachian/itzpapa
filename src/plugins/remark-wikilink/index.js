import { visit } from 'unist-util-visit';
import { buildInternalLinkUrl, normalizeAnchor } from '../utils/index.js';

// モジュールスコープで正規表現を事前コンパイル（パフォーマンス最適化）
// WikiLink URLパターン: [[path]] または [[path|alias]]
const WIKILINK_URL_PATTERN = /^\[\[([^\]]+?)(?:(?:\\\||<<<PIPE>>>|\|)([^\]]+?))?\]\]$/;
// 分断WikiLinkの開始パターン: [[path|
const FRAGMENTED_WIKILINK_START_PATTERN = /\[\[([^\]|]+)\|$/;
// 分断WikiLinkの完全パターン: 前のテキスト + [[path|
const FRAGMENTED_WIKILINK_FULL_PATTERN = /^(.*?)\[\[([^\]|]+)\|$/;
// パイプ文字置換パターン: [[path|alias]]
const WIKILINK_PIPE_REPLACE_PATTERN = /\[\[([^\]|]+)\|((?:[^\]]|\](?!\]))+)\]\]/g;
// メインWikiLinkパターン: 画像(![[]])とリンク([[]])
const WIKILINK_MAIN_PATTERN = /(!?)\[\[([^\]|]+?)(?:(?:\\\||<<<PIPE>>>|\|)((?:[^\]]|\](?!\]))+?))?\]\]/g;
// エイリアス内のMarkdown画像パターン
const IMAGE_IN_ALIAS_PATTERN = /^!\[([^\]]*)\]\(([^)]+)\)$/;
// ファイル拡張子パターン
const FILE_EXTENSION_PATTERN = /\.(md|mdx|png|jpg|jpeg|gif|svg|webp)$/i;
// インデックスサフィックスパターン
const INDEX_SUFFIX_PATTERN = /\/index$/;

export default function remarkWikilink() {
  // プラグインの実行順序を早めるために優先度を設定
  const plugin = function transformer(tree, file) {

    // リンクURL内のWikiLinkを解決する + 通常のMarkdownリンクも処理
    visit(tree, 'link', (node) => {
      if (node.url && node.url.includes('[[') && node.url.includes(']]')) {
        // WikiLink形式のURLを解決
        const wikilinkMatch = node.url.match(WIKILINK_URL_PATTERN);
        if (wikilinkMatch) {
          const linkPath = wikilinkMatch[1].trim();

          if (linkPath && linkPath.startsWith('../')) {
            // 内部リンクの処理
            node.url = buildInternalLinkUrl(linkPath);
          }
        }
      } else if (node.url && node.url.startsWith('../')) {
        // 通常のMarkdownリンク（../で始まる相対リンク）も日付プレフィックス除去を適用
        node.url = buildInternalLinkUrl(node.url);
      }
    });

    // 分断されたWikiLinkを処理（画像がエイリアスとして含まれる場合）
    // 例: [[../path|![alt](url)]] → text("[[../path|") + image + text("]]")
    // パラグラフとリストアイテムの両方を処理
    const processFragmentedWikilinks = (node) => {
      const children = node.children;
      if (!children || children.length < 3) return;

      for (let i = 0; i < children.length - 2; i++) {
        const first = children[i];
        const second = children[i + 1];
        const third = children[i + 2];

        // パターン: text("[[path|") + image + text("]]")
        if (
          first.type === 'text' &&
          second.type === 'image' &&
          third.type === 'text' &&
          FRAGMENTED_WIKILINK_START_PATTERN.test(first.value) &&
          third.value.startsWith(']]')
        ) {
          const pathMatch = first.value.match(FRAGMENTED_WIKILINK_FULL_PATTERN);
          if (pathMatch) {
            const beforeText = pathMatch[1];
            const linkPath = pathMatch[2].trim();
            const afterText = third.value.slice(2); // "]]"を除去

            // リンクURLを構築
            const url = linkPath.startsWith('../')
              ? buildInternalLinkUrl(linkPath)
              : linkPath;

            // 新しいノードを構築
            const newNodes = [];

            if (beforeText) {
              newNodes.push({ type: 'text', value: beforeText });
            }

            newNodes.push({
              type: 'link',
              url: url,
              title: null,
              children: [second], // 画像ノードをchildrenとして使用
              data: {
                hProperties: {
                  className: ['wikilink-internal']
                }
              }
            });

            if (afterText) {
              newNodes.push({ type: 'text', value: afterText });
            }

            // 元の3ノードを新しいノードで置換
            children.splice(i, 3, ...newNodes);

            // インデックスを調整して再処理
            i += newNodes.length - 1;
          }
        }
      }
    };

    // パラグラフとリストアイテムの両方で分断されたWikiLinkを処理
    visit(tree, 'paragraph', processFragmentedWikilinks);
    visit(tree, 'listItem', processFragmentedWikilinks);

    // 最適化: 単一パスでテーブル処理とWikilink変換を同時実行
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || parent.type === 'link') return;

      let text = node.value;
      
      // テーブル内のWikilinkパイプ文字を一時的に置換（必要な場合のみ）
      // エイリアス内に]が含まれる場合（例：![alt](url)）も処理できるよう正規表現を改善
      if (text.includes('|') && text.includes('[[')) {
        WIKILINK_PIPE_REPLACE_PATTERN.lastIndex = 0; // グローバル正規表現のリセット
        text = text.replace(WIKILINK_PIPE_REPLACE_PATTERN, (match, path, alias) => {
          return `[[${path}<<<PIPE>>>${alias}]]`;
        });
      }

      // 画像とリンクの両方のパターンを処理（画像は!で始まる）
      // パスは]と|を含まない、エイリアスは]]以外の]を許容（Markdown画像等に対応）
      // モジュールスコープの正規表現を使用
      WIKILINK_MAIN_PATTERN.lastIndex = 0; // グローバル正規表現のリセット
      const wikilinkRegex = WIKILINK_MAIN_PATTERN;
      
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
        // マッチ前のテキストを追加
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
          let url = linkPath;  // 内部リンクの場合は以下で更新される
          
          // 内部リンクの処理（../で始まる）
          if (linkPath.startsWith('../')) {
            url = buildInternalLinkUrl(linkPath);
          } else if (linkPath.startsWith('#')) {
            // 同一ページ内アンカーリンクの処理
            url = normalizeAnchor(linkPath);
          } else {
            // その他のパスはトリム済みのlinkPathを使用
            url = linkPath;
          }

          // エイリアスがMarkdown画像構文かどうかをチェック
          const imageInAliasMatch = linkText.match(IMAGE_IN_ALIAS_PATTERN);

          let children;
          if (imageInAliasMatch) {
            // エイリアスがMarkdown画像の場合、画像ノードを作成
            const imgAlt = imageInAliasMatch[1];
            let imgSrc = imageInAliasMatch[2];

            // 画像パスの正規化
            if (!imgSrc.startsWith('http://') && !imgSrc.startsWith('https://') && !imgSrc.startsWith('/')) {
              if (!imgSrc.startsWith('./') && !imgSrc.startsWith('../')) {
                imgSrc = './' + imgSrc;
              }
            }

            children = [{
              type: 'image',
              url: imgSrc,
              alt: imgAlt,
              title: null
            }];
          } else {
            // 通常のテキストエイリアス
            children = [{ type: 'text', value: linkText }];
          }

          parts.push({
            type: 'link',
            url: url,
            title: null,
            children: children,
            data: {
              hProperties: {
                className: ['wikilink-internal']
              }
            }
          });
        }

        lastIndex = wikilinkRegex.lastIndex;
      }

      // 残りのテキストを追加
      if (lastIndex < text.length) {
        parts.push({
          type: 'text',
          value: text.slice(lastIndex)
        });
      }

      // Wikilinkが見つかった場合はノードを置換
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
  // 画像拡張子も含めて削除（モジュールスコープの正規表現を使用）
  const cleanPath = path
    .replace(FILE_EXTENSION_PATTERN, '')
    .replace(INDEX_SUFFIX_PATTERN, '');
  const parts = cleanPath.split('/');
  return parts[parts.length - 1];
}