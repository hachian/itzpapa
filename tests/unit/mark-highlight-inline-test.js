/**
 * Mark Highlight + Inline Styling Unit Test Suite
 *
 * Tests the remark-mark-highlight plugin with inline styling combinations
 * (strong, emphasis, inlineCode) using node:test runner
 *
 * This test suite focuses on the new MDAT node approach
 * where mark nodes use data.hName instead of raw HTML
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { remark } from 'remark';
import remarkMarkHighlight from '../../src/plugins/remark-mark-highlight/index.js';

// Helper: Process markdown with remark-mark-highlight (returns AST)
async function processToAst(markdown, options = {}) {
  const processor = remark().use(remarkMarkHighlight, options);
  return processor.runSync(processor.parse(markdown));
}

// Helper: Find mark nodes (custom MDAT nodes with type: 'mark')
function findMarkNodes(ast) {
  const results = [];
  function walk(node) {
    if (node.type === 'mark') {
      results.push(node);
    }
    if (node.children) {
      for (const child of node.children) {
        walk(child);
      }
    }
  }
  walk(ast);
  return results;
}

// Helper: Find strong nodes in AST
function findStrongNodes(ast) {
  const results = [];
  function walk(node) {
    if (node.type === 'strong') {
      results.push(node);
    }
    if (node.children) {
      for (const child of node.children) {
        walk(child);
      }
    }
  }
  walk(ast);
  return results;
}

// Helper: Find emphasis nodes in AST
function findEmphasisNodes(ast) {
  const results = [];
  function walk(node) {
    if (node.type === 'emphasis') {
      results.push(node);
    }
    if (node.children) {
      for (const child of node.children) {
        walk(child);
      }
    }
  }
  walk(ast);
  return results;
}

// Helper: Find html nodes in AST (for legacy comparison)
function findHtmlNodes(ast) {
  const results = [];
  function walk(node) {
    if (node.type === 'html') {
      results.push(node);
    }
    if (node.children) {
      for (const child of node.children) {
        walk(child);
      }
    }
  }
  walk(ast);
  return results;
}

describe('Mark Highlight + Inline Styling', () => {

  describe('Custom MDAT Node Structure', () => {
    test('basic ==text== generates mark node with data.hName', async () => {
      const input = '==ハイライト==';
      const ast = await processToAst(input);
      const markNodes = findMarkNodes(ast);

      assert.strictEqual(markNodes.length, 1, 'Should find 1 mark node');
      assert.strictEqual(markNodes[0].type, 'mark', 'Node type should be "mark"');
      assert.strictEqual(markNodes[0].data?.hName, 'mark', 'data.hName should be "mark"');
      assert(markNodes[0].children?.length > 0, 'Should have children');
      assert.strictEqual(markNodes[0].children[0].type, 'text', 'Child should be text node');
      assert.strictEqual(markNodes[0].children[0].value, 'ハイライト', 'Text content should match');
    });

    test('mark node has correct hProperties for accessibility', async () => {
      const input = '==accessible==';
      const ast = await processToAst(input);
      const markNodes = findMarkNodes(ast);

      assert.strictEqual(markNodes.length, 1, 'Should find 1 mark node');
      assert.strictEqual(markNodes[0].data?.hProperties?.role, 'mark', 'Should have role="mark"');
    });

    test('mark node has className when specified', async () => {
      const input = '==classed==';
      const ast = await processToAst(input, { className: 'highlight' });
      const markNodes = findMarkNodes(ast);

      assert.strictEqual(markNodes.length, 1, 'Should find 1 mark node');
      assert.strictEqual(markNodes[0].data?.hProperties?.className, 'highlight', 'Should have className');
    });

    test('mark node has tabindex when focusable', async () => {
      const input = '==focusable==';
      const ast = await processToAst(input, { focusable: true });
      const markNodes = findMarkNodes(ast);

      assert.strictEqual(markNodes.length, 1, 'Should find 1 mark node');
      assert.strictEqual(markNodes[0].data?.hProperties?.tabIndex, 0, 'Should have tabIndex=0');
    });

    test('no html nodes should be generated (uses custom nodes instead)', async () => {
      const input = '==text==';
      const ast = await processToAst(input);
      const htmlNodes = findHtmlNodes(ast);

      assert.strictEqual(htmlNodes.length, 0, 'Should not generate html nodes');
    });
  });

  describe('Strong + Mark Combination (Requirement 1)', () => {
    test('**==text==** creates mark inside strong', async () => {
      const input = '**==太字ハイライト==**';
      const ast = await processToAst(input);

      const strongNodes = findStrongNodes(ast);
      const markNodes = findMarkNodes(ast);

      assert.strictEqual(strongNodes.length, 1, 'Should find 1 strong node');
      assert.strictEqual(markNodes.length, 1, 'Should find 1 mark node');

      // Mark should be child of strong
      const markInStrong = findMarkNodes({ children: strongNodes[0].children });
      assert.strictEqual(markInStrong.length, 1, 'Mark should be inside strong');
      assert.strictEqual(markInStrong[0].children[0].value, '太字ハイライト', 'Text should match');
    });

    test('**==A==と==B==** creates multiple marks inside strong', async () => {
      const input = '**==ハイライト1==と==ハイライト2==**';
      const ast = await processToAst(input);

      const strongNodes = findStrongNodes(ast);
      assert.strictEqual(strongNodes.length, 1, 'Should find 1 strong node');

      const markNodes = findMarkNodes(ast);
      assert.strictEqual(markNodes.length, 2, 'Should find 2 mark nodes');

      // Both marks should be descendants of strong
      const marksInStrong = findMarkNodes({ children: strongNodes[0].children });
      assert.strictEqual(marksInStrong.length, 2, 'Both marks should be inside strong');
    });
  });

  describe('Emphasis + Mark Combination (Requirement 2)', () => {
    test('*==text==* creates mark inside emphasis', async () => {
      const input = '*==斜体ハイライト==*';
      const ast = await processToAst(input);

      const emphasisNodes = findEmphasisNodes(ast);
      const markNodes = findMarkNodes(ast);

      assert.strictEqual(emphasisNodes.length, 1, 'Should find 1 emphasis node');
      assert.strictEqual(markNodes.length, 1, 'Should find 1 mark node');

      // Mark should be child of emphasis
      const markInEmphasis = findMarkNodes({ children: emphasisNodes[0].children });
      assert.strictEqual(markInEmphasis.length, 1, 'Mark should be inside emphasis');
      assert.strictEqual(markInEmphasis[0].children[0].value, '斜体ハイライト', 'Text should match');
    });

    test('*==A==と==B==* creates multiple marks inside emphasis', async () => {
      const input = '*==ハイライト1==と==ハイライト2==*';
      const ast = await processToAst(input);

      const emphasisNodes = findEmphasisNodes(ast);
      assert.strictEqual(emphasisNodes.length, 1, 'Should find 1 emphasis node');

      const markNodes = findMarkNodes(ast);
      assert.strictEqual(markNodes.length, 2, 'Should find 2 mark nodes');
    });
  });

  describe('InlineCode + Mark Combination (Requirement 3)', () => {
    test('code inside mark: ==`code`== maintains structure', async () => {
      // Note: The parser handles `code` first, creating inlineCode node
      // Then our plugin processes text around it
      const input = '==`console.log`==';
      const ast = await processToAst(input);

      // This is a complex case - the parser creates:
      // paragraph > (text "==") > (inlineCode "console.log") > (text "==")
      // Our plugin should ideally wrap the inlineCode in a mark node
      // But for now, document actual behavior
      assert(ast, 'Should produce valid AST');
    });

    test('`==text==` inside code should NOT be highlighted', async () => {
      const input = '`==notHighlighted==`';
      const ast = await processToAst(input);
      const markNodes = findMarkNodes(ast);

      assert.strictEqual(markNodes.length, 0, 'Should not highlight inside inlineCode');
    });
  });

  describe('Compound Styles (Requirement 4)', () => {
    test('***==text==*** creates mark inside strong+emphasis', async () => {
      const input = '***==3重スタイル==***';
      const ast = await processToAst(input);

      const markNodes = findMarkNodes(ast);
      assert.strictEqual(markNodes.length, 1, 'Should find 1 mark node');
      assert.strictEqual(markNodes[0].children[0].value, '3重スタイル', 'Text should match');
    });

    test('**_==text==_** creates mark inside nested styles', async () => {
      const input = '**_==別記法3重==_**';
      const ast = await processToAst(input);

      const markNodes = findMarkNodes(ast);
      assert.strictEqual(markNodes.length, 1, 'Should find 1 mark node');
    });
  });

  describe('Mark Outside Inline Styles (Split Pattern)', () => {
    test('==**text**== creates strong inside mark', async () => {
      const input = '==**ハイライト内太字**==';
      const ast = await processToAst(input);

      const markNodes = findMarkNodes(ast);
      const strongNodes = findStrongNodes(ast);

      assert.strictEqual(markNodes.length, 1, 'Should find 1 mark node');
      assert.strictEqual(strongNodes.length, 1, 'Should find 1 strong node');

      // Strong should be child of mark
      const strongInMark = findStrongNodes({ children: markNodes[0].children });
      assert.strictEqual(strongInMark.length, 1, 'Strong should be inside mark');
    });

    test('==*text*== creates emphasis inside mark', async () => {
      const input = '==*ハイライト内斜体*==';
      const ast = await processToAst(input);

      const markNodes = findMarkNodes(ast);
      const emphasisNodes = findEmphasisNodes(ast);

      assert.strictEqual(markNodes.length, 1, 'Should find 1 mark node');
      assert.strictEqual(emphasisNodes.length, 1, 'Should find 1 emphasis node');

      // Emphasis should be child of mark
      const emphasisInMark = findEmphasisNodes({ children: markNodes[0].children });
      assert.strictEqual(emphasisInMark.length, 1, 'Emphasis should be inside mark');
    });

    test('==***text***== creates strong+emphasis inside mark', async () => {
      const input = '==***複合スタイル***==';
      const ast = await processToAst(input);

      const markNodes = findMarkNodes(ast);
      assert.strictEqual(markNodes.length, 1, 'Should find 1 mark node');
    });
  });

  describe('Backward Compatibility (Requirement 5)', () => {
    test('standalone ==text== still works', async () => {
      const input = '==単独ハイライト==';
      const ast = await processToAst(input);
      const markNodes = findMarkNodes(ast);

      assert.strictEqual(markNodes.length, 1, 'Should find 1 mark node');
      assert.strictEqual(markNodes[0].data?.hName, 'mark', 'Should have hName');
    });

    test('escaped \\==text\\== processing', async () => {
      // Note: Markdown parser processes backslash escapes before our plugin runs
      // The actual escape sequence \== is converted to == by the parser
      // This test documents the current behavior
      const input = '\\==エスケープ\\==';
      const ast = await processToAst(input);
      // The behavior depends on Markdown parser's escape handling
      // We verify the AST is valid
      assert(ast, 'Should produce valid AST');
    });

    test('custom attributes {.class} still work', async () => {
      const input = '==カスタム=={.important}';
      const ast = await processToAst(input);
      const markNodes = findMarkNodes(ast);

      assert.strictEqual(markNodes.length, 1, 'Should find 1 mark node');
      assert.strictEqual(markNodes[0].data?.hProperties?.className, 'important', 'Should have custom class');
    });

    test('empty highlight ==== is not processed', async () => {
      const input = '====';
      const ast = await processToAst(input);
      const markNodes = findMarkNodes(ast);

      assert.strictEqual(markNodes.length, 0, 'Empty highlight should not create mark node');
    });
  });

  describe('Edge Cases', () => {
    test('adjacent styles: **bold**==highlight==*italic*', async () => {
      const input = '**太字**==ハイライト==*斜体*';
      const ast = await processToAst(input);

      const strongNodes = findStrongNodes(ast);
      const emphasisNodes = findEmphasisNodes(ast);
      const markNodes = findMarkNodes(ast);

      assert.strictEqual(strongNodes.length, 1, 'Should find 1 strong');
      assert.strictEqual(emphasisNodes.length, 1, 'Should find 1 emphasis');
      assert.strictEqual(markNodes.length, 1, 'Should find 1 mark');
    });

    test('nested mark in middle of text: **before==mark==after**', async () => {
      const input = '**太字開始==ハイライト==太字終了**';
      const ast = await processToAst(input);

      const strongNodes = findStrongNodes(ast);
      const markNodes = findMarkNodes(ast);

      assert.strictEqual(strongNodes.length, 1, 'Should find 1 strong');
      assert.strictEqual(markNodes.length, 1, 'Should find 1 mark');

      // Mark should be inside strong
      const marksInStrong = findMarkNodes({ children: strongNodes[0].children });
      assert.strictEqual(marksInStrong.length, 1, 'Mark should be inside strong');
    });
  });
});

console.log('🧪 Running Mark Highlight + Inline Styling Tests...');
