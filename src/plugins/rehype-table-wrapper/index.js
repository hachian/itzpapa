/**
 * rehype-table-wrapper
 *
 * テーブル要素をdiv.table-wrapperでラップし、水平スクロールをサポートする。
 * これにより、テーブルがページの他の部分に影響を与えずに水平スクロールできる。
 */

import { visit } from 'unist-util-visit';

export default function rehypeTableWrapper() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName === 'table' && parent && typeof index === 'number') {
        // 既にラップされているかチェック
        if (parent.tagName === 'div' &&
            parent.properties?.className?.includes('table-wrapper')) {
          return;
        }

        // ラッパーdivを作成
        const wrapper = {
          type: 'element',
          tagName: 'div',
          properties: {
            className: ['table-wrapper']
          },
          children: [node]
        };

        // テーブルをラッパー付きのテーブルに置換
        parent.children[index] = wrapper;
      }
    });
  };
}
