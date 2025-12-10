import { visit } from 'unist-util-visit';

// Cache bust: 2025-12-10-v2
/**
 * ステータス文字からステータス名へのマッピング
 */
const STATUS_MAP = {
  ' ': 'todo',
  'x': 'done',
  'X': 'done',
  '/': 'incomplete',
  '-': 'canceled',
  '>': 'forwarded',
  '<': 'scheduling',
  '?': 'question',
  '!': 'important',
  '*': 'star',
  '"': 'quote',
  '"': 'quote',  // スマート引用符（左）
  '"': 'quote',  // スマート引用符（右）
  "'": 'quote',  // シングルクォート
  'Q': 'quote',  // 大文字Q（引用符の代替）
  'l': 'location',
  'b': 'bookmark',
  'i': 'information',
  'S': 'savings',
  'I': 'idea',
  'p': 'pros',
  'c': 'cons',
  'f': 'fire',
  'k': 'key',
  'w': 'win',
  'u': 'up',
  'd': 'down'
};

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

// タスク構文を検出する正規表現: [x] の形式（xは任意の1文字）
// 任意の1文字を許可し、STATUS_MAPにない場合はunknownとしてフォールバック
const TASK_PATTERN = /^\[(.)\]\s/;

/**
 * リストアイテムの最初のテキストノードからタスク構文を検出
 * @param {object} node - リストアイテムノード
 * @returns {{char: string, statusName: string, textContent: string} | null}
 */
function extractTaskStatus(node) {
  // listItemの子ノードを確認
  if (!node.children || node.children.length === 0) {
    return null;
  }

  // 最初の子ノードがparagraphの場合
  const firstChild = node.children[0];
  if (firstChild.type !== 'paragraph' || !firstChild.children || firstChild.children.length === 0) {
    return null;
  }

  // paragraphの最初の子がtextの場合
  const textNode = firstChild.children[0];

  if (textNode.type !== 'text') {
    return null;
  }

  const text = textNode.value;
  const match = text.match(TASK_PATTERN);

  if (!match) {
    return null;
  }

  const char = match[1];
  // 引用符のcharCodeで直接判定
  // U+0022 = 34 ("), U+201C = 8220 ("), U+201D = 8221 ("), U+0051 = 81 (Q)
  const charCode = char.charCodeAt(0);
  let statusName;
  if (charCode === 34 || charCode === 8220 || charCode === 8221 || charCode === 81) {
    statusName = 'quote';
  } else {
    statusName = STATUS_MAP[char] || 'unknown';
  }
  // タスク構文を除いた残りのテキスト
  const textContent = text.slice(match[0].length);

  return { char, statusName, textContent };
}

/**
 * GFMで処理されたタスクリストアイテムを検出
 * @param {object} node - リストアイテムノード
 * @returns {{statusName: string} | null}
 */
function extractGfmTaskStatus(node) {
  // GFMのタスクリストはcheckedプロパティを持つ
  if (typeof node.checked === 'boolean') {
    return {
      statusName: node.checked ? 'done' : 'todo'
    };
  }
  return null;
}

/**
 * remarkプラグイン: Obsidian形式のタスク構文を処理
 * @param {object} options - プラグインオプション
 * @param {string} options.className - チェックボックスのCSSクラス名
 * @param {boolean} options.enabled - プラグインの有効/無効
 * @param {boolean} options.accessibility - アクセシビリティ属性を追加するか
 */
export default function remarkTaskStatus(options = {}) {
  const {
    className = 'task-checkbox',
    enabled = true,
    accessibility = true
  } = options;

  if (!enabled) {
    return (tree) => tree;
  }

  return function transformer(tree) {
    visit(tree, 'listItem', (node, index, parent) => {
      if (!parent || index === null) return;

      // まずカスタムタスク構文を検出（GFMで処理されない拡張ステータス）
      const taskInfo = extractTaskStatus(node);

      if (taskInfo) {
        // カスタムタスク構文が見つかった場合
        const { statusName, textContent } = taskInfo;
        const ariaLabel = ARIA_LABELS[statusName] || ARIA_LABELS['unknown'];

        // アクセシビリティ属性の構築
        const accessibilityAttrs = accessibility
          ? ` aria-label="${ariaLabel}"`
          : '';

        // タスクチェックボックスのHTML生成
        const checkboxHtml = `<span class="${className}" data-task-status="${statusName}"${accessibilityAttrs}><span class="task-icon" aria-hidden="true"></span></span>`;

        // リストアイテムの内容を更新
        const firstChild = node.children[0];

        // テキストノードを新しい構造に置き換え
        const newChildren = [
          {
            type: 'html',
            value: checkboxHtml
          },
          {
            type: 'html',
            value: '<span class="task-text">'
          }
        ];

        // 残りのテキストがある場合は追加
        if (textContent) {
          newChildren.push({
            type: 'text',
            value: textContent
          });
        }

        // 元の子ノードのうち、最初のテキストノード以外を保持
        const remainingChildren = firstChild.children.slice(1);

        // 閉じタグを追加
        const closingTag = {
          type: 'html',
          value: '</span>'
        };

        // paragraphの子を更新（開始タグ + コンテンツ + 閉じタグ）
        firstChild.children = [...newChildren, ...remainingChildren, closingTag];

        // リストアイテムにタスククラスを追加
        applyTaskStyles(node, statusName);

        // GFMのcheckedプロパティを削除（カスタム処理を優先）
        delete node.checked;

        return;
      }

      // GFMで処理されたタスクリスト（[ ] と [x]）を検出
      const gfmTaskInfo = extractGfmTaskStatus(node);

      if (gfmTaskInfo) {
        const { statusName } = gfmTaskInfo;
        const ariaLabel = ARIA_LABELS[statusName];

        // アクセシビリティ属性の構築
        const accessibilityAttrs = accessibility
          ? ` aria-label="${ariaLabel}"`
          : '';

        // タスクチェックボックスのHTML生成
        const checkboxHtml = `<span class="${className}" data-task-status="${statusName}"${accessibilityAttrs}><span class="task-icon" aria-hidden="true"></span></span>`;

        // リストアイテムの内容を更新
        const firstChild = node.children[0];
        if (firstChild && firstChild.type === 'paragraph' && firstChild.children) {
          // 既存の子ノードをtask-textでラップ
          const existingChildren = [...firstChild.children];
          firstChild.children = [
            {
              type: 'html',
              value: checkboxHtml
            },
            {
              type: 'html',
              value: '<span class="task-text">'
            },
            ...existingChildren,
            {
              type: 'html',
              value: '</span>'
            }
          ];
        }

        // リストアイテムにタスククラスを追加
        applyTaskStyles(node, statusName);

        // GFMのcheckedプロパティを削除（カスタムチェックボックスを使用するため）
        delete node.checked;
      }
    });
  };
}

/**
 * リストアイテムにタスクスタイルを適用
 */
function applyTaskStyles(node, statusName) {
  if (!node.data) {
    node.data = {};
  }
  if (!node.data.hProperties) {
    node.data.hProperties = {};
  }
  node.data.hProperties.className = node.data.hProperties.className
    ? `${node.data.hProperties.className} task-list-item`
    : 'task-list-item';
  node.data.hProperties['data-task'] = statusName;
}

// ステータスマップをエクスポート（テスト用）
export { STATUS_MAP, ARIA_LABELS };
