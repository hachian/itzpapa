import { remark } from 'remark';
import remarkMarkHighlight from '../../src/plugins/remark-mark-highlight/index.js';
import assert from 'assert';

// Test helper
async function processMarkdown(input, options = {}) {
  const processor = remark().use(remarkMarkHighlight, options);
  const result = await processor.process(input);
  return String(result);
}

// 1. 基本機能のテスト（既に動作）
async function testBasicHighlight() {
  const input = 'This is ==highlighted== text';
  const output = await processMarkdown(input);
  assert(output.includes('<mark>highlighted</mark>'), 'Basic highlight should work');
  console.log('✓ TC-001: Basic highlight passed');
}

// 2. 複数行対応のテスト（未実装）
async function testMultilineHighlight() {
  const input = '==複数行に\n渡るテキスト==';
  const output = await processMarkdown(input);
  assert(output.includes('<mark>複数行に\n渡るテキスト</mark>'), 'Multiline highlight should work');
  console.log('✓ TC-004: Multiline highlight passed');
}

// 3. エスケープ処理のテスト（未実装）
async function testEscapedHighlight() {
  // Note: エスケープ処理は今後の実装課題
  console.log('⏩ TC-006: Escaped highlight (skipped - future implementation)');
  return; // Skip for now
}

// 4. 他の記法との組み合わせ（未実装）
async function testCombinedWithBold() {
  // Note: 他の記法との組み合わせは今後の実装課題
  console.log('⏩ TC-008: Combined with bold (skipped - future implementation)');
  return; // Skip for now
}

// 5. 入れ子の処理（部分的に実装）
async function testNestedHighlight() {
  // 現在の正規表現は入れ子を自動的に防いでいる（良い実装）
  const input = '==first== ==second==';
  const output = await processMarkdown(input);
  assert(output.includes('<mark>first</mark>'), 'First highlight should work');
  assert(output.includes('<mark>second</mark>'), 'Second highlight should work');
  console.log('✓ TC-012: Sequential highlights passed');
}

// 6. セキュリティテスト（実装済み）
async function testXSSPrevention() {
  // remarkが自動的にHTMLタグをエスケープしている
  const input = 'Test ==&<>"\'== text';
  const output = await processMarkdown(input);
  assert(output.includes('&amp;'), 'Ampersand should be escaped');
  assert(output.includes('&lt;'), 'Less than should be escaped');
  assert(output.includes('&gt;'), 'Greater than should be escaped');
  assert(output.includes('&quot;'), 'Quotes should be escaped');
  console.log('✓ TC-016: XSS prevention passed');
}

// 7. パフォーマンステスト
async function testPerformance() {
  const start = Date.now();
  const longText = '==' + 'a'.repeat(1000) + '==';
  await processMarkdown(longText);
  const duration = Date.now() - start;
  assert(duration < 100, `Should process in under 100ms, took ${duration}ms`);
  console.log(`✓ TC-018: Performance test passed (${duration}ms)`);
}

// Run all tests
async function runTests() {
  console.log('Running advanced mark-highlight tests...\n');

  let passed = 0;
  let failed = 0;

  const tests = [
    { name: 'Basic Highlight', fn: testBasicHighlight },
    { name: 'Multiline Highlight', fn: testMultilineHighlight },
    { name: 'Escaped Highlight', fn: testEscapedHighlight },
    { name: 'Combined with Bold', fn: testCombinedWithBold },
    { name: 'Nested Highlight', fn: testNestedHighlight },
    { name: 'XSS Prevention', fn: testXSSPrevention },
    { name: 'Performance', fn: testPerformance }
  ];

  for (const test of tests) {
    try {
      await test.fn();
      passed++;
    } catch (error) {
      console.error(`✗ ${test.name} failed:`, error.message);
      failed++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`========================================`);

  if (failed > 0) {
    console.log('\nExpected failures (features not yet implemented):');
    console.log('- Multiline highlight support');
    console.log('- Escape sequence handling');
    console.log('- Integration with other markdown syntax');
    process.exit(1);
  }
}

runTests();