import { visit } from 'unist-util-visit';

/**
 * ステータスごとのアクセシビリティラベル
 */
const ARIA_LABELS = {
  'todo': '未完了',
  'done': '完了',
  'incomplete': '進行中',
  'canceled': 'キャンセル',
  'forwarded': '転送',
  'scheduling': 'スケジューリング',
  'question': '質問',
  'important': '重要',
  'star': 'スター',
  'quote': '引用',
  'location': '場所',
  'bookmark': 'ブックマーク',
  'information': '情報',
  'savings': '貯蓄',
  'idea': 'アイデア',
  'pros': '賛成',
  'cons': '反対',
  'fire': '緊急',
  'key': 'キー',
  'win': '勝利',
  'up': '上昇',
  'down': '下降',
  'unknown': '不明'
};

/**
 * rehypeプラグイン: GFMのcheckbox要素をカスタムスタイルに置き換える
 */
export default function rehypeTaskStatus(options = {}) {
  const {
    className = 'task-checkbox',
    accessibility = true
  } = options;

  return function transformer(tree) {
    visit(tree, 'element', (node, index, parent) => {
      // input[type="checkbox"]を検出
      if (
        node.tagName === 'input' &&
        node.properties &&
        node.properties.type === 'checkbox'
      ) {
        const isChecked = node.properties.checked === true;
        const statusName = isChecked ? 'done' : 'todo';
        const ariaLabel = ARIA_LABELS[statusName];

        // カスタムspan要素に置き換え
        const customCheckbox = {
          type: 'element',
          tagName: 'span',
          properties: {
            className: [className],
            'data-task-status': statusName,
            ...(accessibility && { role: 'img', 'aria-label': ariaLabel })
          },
          children: [
            {
              type: 'element',
              tagName: 'span',
              properties: {
                className: ['task-icon'],
                'aria-hidden': 'true'
              },
              children: []
            }
          ]
        };

        // 親要素のchildrenを更新
        if (parent && typeof index === 'number') {
          parent.children[index] = customCheckbox;

          // 親のliにtask-list-itemクラスを追加
          const grandparent = findParentLi(tree, parent);
          if (grandparent && grandparent.tagName === 'li') {
            if (!grandparent.properties) {
              grandparent.properties = {};
            }
            const existingClass = grandparent.properties.className || [];
            const classArray = Array.isArray(existingClass) ? existingClass : [existingClass];
            if (!classArray.includes('task-list-item')) {
              grandparent.properties.className = [...classArray, 'task-list-item'];
            }
            grandparent.properties['data-task'] = statusName;
          }
        }
      }
    });
  };
}

/**
 * 親のli要素を探す（簡易実装）
 */
function findParentLi(tree, targetParent) {
  let result = null;

  visit(tree, 'element', (node) => {
    if (node.tagName === 'li' && node.children) {
      // targetParentを含むかチェック
      const containsTarget = node.children.some(child => {
        if (child === targetParent) return true;
        if (child.children) {
          return child.children.includes(targetParent);
        }
        return false;
      });

      if (containsTarget) {
        result = node;
      }
    }
  });

  return result;
}
