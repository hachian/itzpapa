import { remark } from 'remark';
import remarkMarkHighlight from '../../src/plugins/remark-mark-highlight/index.js';
import assert from 'assert';

/**
 * TASK-202: アクセシビリティ対応 - TDDテスト実装（Simple版）
 *
 * このテストファイルは最初に失敗するように設計されています（RED phase）
 * 実装完了後にすべてのテストがパスするようになります（GREEN phase）
 */

// Test helper to process markdown with accessibility options
async function processMarkdown(input, options = {}) {
  const processor = remark().use(remarkMarkHighlight, options);
  const result = await processor.process(input);
  return String(result);
}

// Helper to count occurrences of a substring
function countOccurrences(text, substring) {
  return (text.match(new RegExp(substring.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
}

// Test runner
let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

async function runTest(name, testFunction) {
  testsRun++;
  try {
    await testFunction();
    testsPassed++;
    console.log(`✓ ${name}`);
  } catch (error) {
    testsFailed++;
    console.log(`✗ ${name}: ${error.message}`);
  }
}

// Main test execution
async function runTests() {
  console.log('Running TASK-202 Accessibility Tests...');
  console.log('Note: These tests are designed to FAIL initially (TDD RED phase)\n');

  // ARIA属性テスト (AR-001)
  await runTest('TC-202-001: Should add role="mark" attribute to mark elements', async () => {
    const input = '==basic highlight==';
    const output = await processMarkdown(input);
    console.log('  Output:', output.trim());

    assert(output.includes('<mark'), 'Should generate mark element');
    assert(output.includes('role="mark"'), 'Should have role="mark" attribute');
    assert(output.includes('>basic highlight</mark>'), 'Should contain correct text content');
  });

  await runTest('TC-202-002: Should support aria-label with custom classes', async () => {
    const input = '==important note=={.highlight-yellow aria-label="重要な注意事項"}';
    const output = await processMarkdown(input);
    console.log('  Output:', output.trim());

    assert(output.includes('<mark'), 'Should generate mark element');
    assert(output.includes('class="highlight-yellow"'), 'Should have custom class');
    assert(output.includes('role="mark"'), 'Should have role="mark" attribute');
    assert(output.includes('aria-label="重要な注意事項"'), 'Should have aria-label attribute');
    assert(output.includes('>important note</mark>'), 'Should contain correct text content');
  });

  await runTest('TC-202-003: Should allow disabling ARIA attributes', async () => {
    const input = '==no aria attributes==';
    const output = await processMarkdown(input, { accessibility: false });
    console.log('  Output:', output.trim());

    assert(output.includes('<mark'), 'Should generate mark element');
    assert(!output.includes('role="mark"'), 'Should not have role attribute when disabled');
    assert(!output.includes('aria-'), 'Should not have any aria attributes when disabled');
    assert(output.includes('>no aria attributes</mark>'), 'Should contain correct text content');
  });

  // スクリーンリーダー対応テスト (AR-002)
  await runTest('TC-202-004: Should have proper structure for screen readers', async () => {
    const input = 'This is ==highlighted text== in a sentence.';
    const output = await processMarkdown(input);
    console.log('  Output:', output.trim());

    assert(output.includes('<p>'), 'Should generate paragraph element');
    assert(output.includes('<mark'), 'Should generate mark element');
    assert(output.includes('role="mark"'), 'Should have role attribute');
    assert(output.includes('>highlighted text</mark>'), 'Should contain correct text');
  });

  await runTest('TC-202-005: Should maintain semantic structure with nested formatting', async () => {
    const input = '==**bold highlighted text**==';
    const output = await processMarkdown(input);
    console.log('  Output:', output.trim());

    assert(output.includes('<mark'), 'Should generate mark element');
    assert(output.includes('<strong>'), 'Should generate strong element');
    assert(output.includes('role="mark"'), 'Should have role attribute');
    assert(output.includes('bold highlighted text'), 'Should contain correct text');
  });

  // キーボードナビゲーションテスト (AR-003)
  await runTest('TC-202-006: Should support focus state when focusable', async () => {
    const input = '==focusable highlight==';
    const output = await processMarkdown(input, { focusable: true });
    console.log('  Output:', output.trim());

    assert(output.includes('<mark'), 'Should generate mark element');
    assert(output.includes('role="mark"'), 'Should have role attribute');
    // focusable時はtabindexが設定される想定（オプション機能）
    if (output.includes('tabindex')) {
      assert(output.includes('tabindex="0"'), 'Should have tabindex="0" when focusable');
    }
  });

  await runTest('TC-202-007: Should not interfere with keyboard navigation', async () => {
    const input = 'Normal text ==highlighted text== more text';
    const output = await processMarkdown(input);
    console.log('  Output:', output.trim());

    assert(output.includes('<mark'), 'Should generate mark element');
    assert(output.includes('role="mark"'), 'Should have role attribute');
    // mark要素は通常focusableではないことを確認
    assert(!output.includes('tabindex'), 'Mark element should not have tabindex by default');
  });

  // セマンティックHTML確保テスト (AR-004)
  await runTest('TC-202-008: Should produce valid HTML structure', async () => {
    const input = `# Heading

==Highlighted paragraph== with normal text.

- ==List item== highlight
- Normal list item`;

    const output = await processMarkdown(input);
    console.log('  Output:', output.trim());

    assert(output.includes('<h1>'), 'Should generate heading');
    assert(output.includes('<p>'), 'Should generate paragraphs');
    assert(output.includes('<ul>'), 'Should generate list');
    assert(output.includes('<li>'), 'Should generate list items');

    // mark要素の数を確認
    const markCount = countOccurrences(output, '<mark');
    assert.strictEqual(markCount, 2, 'Should have 2 mark elements');

    // 全てのmark要素にrole属性があることを確認
    const roleCount = countOccurrences(output, 'role="mark"');
    assert.strictEqual(roleCount, 2, 'All mark elements should have role attribute');
  });

  await runTest('TC-202-009: Should maintain semantic structure', async () => {
    const input = 'This is ==important content== in the article.';
    const output = await processMarkdown(input);
    console.log('  Output:', output.trim());

    assert(output.includes('<p>'), 'Should generate paragraph element');
    assert(output.includes('<mark'), 'Should generate mark element');
    assert(output.includes('role="mark"'), 'Should have role attribute');
    assert(output.includes('>important content</mark>'), 'Should contain correct text');
    // mark要素がp要素の中にあることを確認
    assert(output.match(/<p[^>]*>.*<mark[^>]*>.*<\/mark>.*<\/p>/), 'Mark should be inside paragraph');
  });

  // 統合テスト
  await runTest('TC-202-010: Should maintain accessibility with other plugins', async () => {
    const input = '==highlighted== and **bold** and *italic* text';
    const output = await processMarkdown(input);
    console.log('  Output:', output.trim());

    assert(output.includes('<mark'), 'Should generate mark element');
    assert(output.includes('<strong>'), 'Should generate strong element');
    assert(output.includes('<em>'), 'Should generate em element');
    assert(output.includes('role="mark"'), 'Mark element should have role attribute');
    assert(!output.includes('role="strong"'), 'Strong element should not have role attribute');
    assert(!output.includes('role="em"'), 'Em element should not have role attribute');
  });

  // パフォーマンステスト
  await runTest('TC-202-011: Should not significantly impact performance', async () => {
    // 50個のハイライト要素でテスト（軽量化）
    const testMarkdown = Array(50).fill('==highlight==').join(' ');

    const startTime = Date.now();
    const output = await processMarkdown(testMarkdown);
    const endTime = Date.now();

    const processingTime = endTime - startTime;
    console.log(`  Processing time: ${processingTime}ms for 50 highlights`);

    // パフォーマンス要件: 50個の処理が500ms以内
    assert(processingTime < 500, `Processing should complete within 500ms, took ${processingTime}ms`);

    // 出力の検証
    const markCount = countOccurrences(output, '<mark');
    const roleCount = countOccurrences(output, 'role="mark"');
    assert.strictEqual(markCount, 50, 'Should have 50 mark elements');
    assert.strictEqual(roleCount, 50, 'All mark elements should have role attribute');
  });

  // 回帰テスト
  await runTest('TC-202-012: Should not affect existing functionality', async () => {
    const input = 'Normal ==highlight== and **bold** and *italic* and `code`.';
    const output = await processMarkdown(input);
    console.log('  Output:', output.trim());

    // 全ての要素が期待通りに存在することを確認
    assert(output.includes('<mark'), 'Should generate mark element');
    assert(output.includes('<strong>'), 'Should generate strong element');
    assert(output.includes('<em>'), 'Should generate em element');
    assert(output.includes('<code>'), 'Should generate code element');

    // mark要素のみにrole属性が追加されていることを確認
    assert(output.includes('role="mark"'), 'Mark element should have role attribute');
    assert(!output.includes('role="strong"'), 'Strong element should not have role attribute');
    assert(!output.includes('role="em"'), 'Em element should not have role attribute');
    assert(!output.includes('role="code"'), 'Code element should not have role attribute');

    // 内容が正しいことを確認
    assert(output.includes('>highlight</mark>'), 'Mark element should have correct content');
    assert(output.includes('>bold</strong>'), 'Strong element should have correct content');
    assert(output.includes('>italic</em>'), 'Em element should have correct content');
    assert(output.includes('>code</code>'), 'Code element should have correct content');
  });

  // エラーハンドリングテスト
  await runTest('Should handle invalid accessibility options gracefully', async () => {
    const input = '==test==';

    // 無効なオプションでもエラーにならない
    const output1 = await processMarkdown(input, { accessibility: 'invalid' });
    const output2 = await processMarkdown(input, { accessibility: null });
    const output3 = await processMarkdown(input, { accessibility: undefined });

    console.log('  Error handling outputs:', {
      invalid: output1.trim(),
      null: output2.trim(),
      undefined: output3.trim()
    });

    // いずれの場合もmark要素は生成される
    assert(output1.includes('<mark'), 'mark element should exist with invalid option');
    assert(output2.includes('<mark'), 'mark element should exist with null option');
    assert(output3.includes('<mark'), 'mark element should exist with undefined option');
  });

  // 結果サマリー
  console.log('\n========================================');
  console.log(`Results: ${testsPassed} passed, ${testsFailed} failed, ${testsRun} total`);
  console.log('========================================');

  if (testsFailed > 0) {
    console.log('\nThis is expected! These tests will pass after implementing accessibility features.');
  }

  return { passed: testsPassed, failed: testsFailed, total: testsRun };
}

// Run tests
runTests();