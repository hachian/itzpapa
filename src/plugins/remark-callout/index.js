import { visit, SKIP } from 'unist-util-visit';

/**
 * remark-callout - Obsidianスタイルのコールアウト用remarkプラグイン
 *
 * コールアウト構文をパースし、blockquoteノードにデータを付加する。
 * 最終的なHTML構造への変換は、対応するrehypeプラグインが行う。
 *
 * Obsidian公式13タイプとそのエイリアスをサポート。
 */

// 有効なコールアウトタイプ（Obsidian公式13タイプ）
const VALID_TYPES = [
  'note', 'abstract', 'info', 'todo', 'tip', 'success',
  'question', 'warning', 'failure', 'danger', 'bug', 'example', 'quote'
];

// エイリアス→正規タイプ変換マップ
const TYPE_ALIASES = {
  // abstract aliases
  summary: 'abstract',
  tldr: 'abstract',
  // tip aliases
  hint: 'tip',
  important: 'tip',
  // success aliases
  check: 'success',
  done: 'success',
  // question aliases
  help: 'question',
  faq: 'question',
  // warning aliases
  caution: 'warning',
  attention: 'warning',
  // failure aliases
  fail: 'failure',
  missing: 'failure',
  // danger aliases
  error: 'danger',
  // quote aliases
  cite: 'quote'
};

/**
 * 入力タイプを正規タイプに解決
 * @param {string} rawType - 入力されたタイプ（小文字化済み）
 * @returns {string} - 正規タイプ（未知の場合は'note'）
 */
function resolveType(rawType) {
  if (VALID_TYPES.includes(rawType)) return rawType;
  if (TYPE_ALIASES[rawType]) return TYPE_ALIASES[rawType];
  return 'note';
}

// 各コールアウトタイプとエイリアスのデフォルトタイトル
const DEFAULT_TITLES = {
  // 正規タイプ
  note: 'Note',
  abstract: 'Abstract',
  info: 'Info',
  todo: 'Todo',
  tip: 'Tip',
  success: 'Success',
  question: 'Question',
  warning: 'Warning',
  failure: 'Failure',
  danger: 'Danger',
  bug: 'Bug',
  example: 'Example',
  quote: 'Quote',
  // エイリアス（エイリアス名をそのままタイトルに）
  summary: 'Summary',
  tldr: 'TL;DR',
  hint: 'Hint',
  important: 'Important',
  check: 'Check',
  done: 'Done',
  help: 'Help',
  faq: 'FAQ',
  caution: 'Caution',
  attention: 'Attention',
  fail: 'Fail',
  missing: 'Missing',
  error: 'Error',
  cite: 'Cite'
};

/**
 * テキストからコールアウトヘッダーをパースする
 * @param {string} text - パースするテキスト
 * @returns {Object|null} - パースされたコールアウトヘッダー、またはコールアウトでない場合はnull
 */
function parseCalloutHeader(text) {
  // パターン: [!type](-|+)? (オプションのタイトル)
  const match = text.match(/^\[!(\w*)\]([-+])?\s*(.*)?$/);

  if (!match) {
    return null;
  }

  const rawType = match[1].toLowerCase();
  const foldIndicator = match[2];
  const customTitle = match[3]?.trim() || null;

  // タイプが空の場合はnullを返す
  if (!rawType) {
    return null;
  }

  // コールアウトタイプを決定（エイリアス解決、不明なタイプは'note'にフォールバック）
  const type = resolveType(rawType);

  // 折りたたみ状態を決定
  const foldable = foldIndicator === '-' || foldIndicator === '+';
  const defaultFolded = foldIndicator === '-';

  // タイトルを決定（エイリアス名を優先、なければ正規タイプ名）
  const title = customTitle || DEFAULT_TITLES[rawType] || DEFAULT_TITLES[type] || DEFAULT_TITLES.note;

  return {
    type,
    title,
    foldable,
    defaultFolded,
    originalType: rawType
  };
}

/**
 * blockquoteノードがコールアウトかどうかをチェック
 * @param {Object} node - blockquoteノード
 * @returns {boolean}
 */
function isCallout(node) {
  if (!node.children || node.children.length === 0) {
    return false;
  }

  const firstChild = node.children[0];

  // 最初の子要素はパラグラフでなければならない
  if (firstChild.type !== 'paragraph' || !firstChild.children || firstChild.children.length === 0) {
    return false;
  }

  const firstTextNode = firstChild.children[0];

  // 最初のテキストノードは[!で始まる必要がある
  if (firstTextNode.type !== 'text' || !firstTextNode.value.trimStart().startsWith('[!')) {
    return false;
  }

  // ヘッダーのパースを試みる
  const firstLine = firstTextNode.value.split(/\r?\n/)[0].trimStart();
  return parseCalloutHeader(firstLine) !== null;
}

/**
 * コールアウトblockquoteノードを処理する
 * コールアウトデータを追加し、コンテンツからヘッダー行を削除する
 * @param {Object} node - blockquoteノード
 * @param {number} depth - 現在のネスト深度
 * @param {number} maxDepth - 最大ネスト深度
 */
function processCallout(node, depth = 0, maxDepth = 3) {
  const firstChild = node.children[0];
  const firstTextNode = firstChild.children[0];

  // 最初の行を取得してヘッダーをパース（CRLF対応）
  const lines = firstTextNode.value.split(/\r?\n/);
  const firstLine = lines[0].trimStart();
  const header = parseCalloutHeader(firstLine);

  if (!header) {
    return;
  }

  // blockquoteノードにコールアウトデータを追加
  node.data = node.data || {};
  node.data.hProperties = node.data.hProperties || {};
  node.data.hProperties.className = ['callout', `callout-${header.type}`];
  node.data.hProperties['data-callout'] = header.type;
  node.data.hProperties['data-callout-title'] = header.title;

  if (header.foldable) {
    node.data.hProperties['data-callout-foldable'] = 'true';
    node.data.hProperties['data-callout-folded'] = header.defaultFolded ? 'true' : 'false';
  }

  if (depth > 0) {
    node.data.hProperties['data-nest-level'] = String(depth);
  }

  // コンテンツからコールアウトヘッダー行を削除
  if (lines.length > 1) {
    const remainingText = lines.slice(1).join('\n');
    if (remainingText.trim()) {
      firstTextNode.value = remainingText;
    } else if (firstChild.children.length > 1) {
      // テキストノードを削除し、他の子要素は保持
      firstChild.children.shift();
    } else {
      // ヘッダーのみだった場合、最初のパラグラフ全体を削除
      node.children.shift();
    }
  } else if (firstChild.children.length > 1) {
    // ヘッダーテキストノードを削除
    firstChild.children.shift();
  } else {
    // 最初のパラグラフ全体を削除
    node.children.shift();
  }

  // ネストされたコールアウトを処理
  processNestedCallouts(node.children, depth, maxDepth);
}

/**
 * コンテンツノード内のネストされたコールアウトを処理
 * @param {Array} nodes - 処理するコンテンツノード
 * @param {number} depth - 現在のネスト深度
 * @param {number} maxDepth - 最大ネスト深度
 */
function processNestedCallouts(nodes, depth, maxDepth) {
  const stack = [...nodes].reverse();

  while (stack.length > 0) {
    const node = stack.pop();

    if (node.type === 'blockquote' && depth < maxDepth && isCallout(node)) {
      processCallout(node, depth + 1, maxDepth);
    } else if (node.children) {
      for (let i = node.children.length - 1; i >= 0; i--) {
        stack.push(node.children[i]);
      }
    }
  }
}

/**
 * remark-calloutプラグイン
 * @param {{maxNestingDepth?: number}} [options] - プラグインオプション
 */
export default function remarkCallout(options = {}) {
  const maxNestingDepth = options.maxNestingDepth ?? 3;

  return function transformer(tree) {
    visit(tree, 'blockquote', (node) => {
      // コールアウトでない場合はスキップ
      if (!isCallout(node)) {
        return;
      }

      // コールアウトを処理（データを追加、構造は変換しない）
      processCallout(node, 0, maxNestingDepth);

      return SKIP;
    });
  };
}
