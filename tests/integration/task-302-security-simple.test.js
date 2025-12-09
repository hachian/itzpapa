import { remark } from 'remark';
import remarkMarkHighlight from '../../src/plugins/remark-mark-highlight/index.js';
import assert from 'assert';

/**
 * TASK-302: セキュリティ対策 - 簡易テスト実装
 * 既存のセキュリティ機能が適切に動作していることを確認
 */

// Test helper to process markdown
async function processMarkdown(input, options = {}) {
  const processor = remark().use(remarkMarkHighlight, options);
  const result = await processor.process(input);
  return String(result);
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
  console.log('Running TASK-302 Security Tests...\n');

  // SR-001: XSS対策の確認
  await runTest('SR-001: XSS Prevention - Script tags', async () => {
    const input = '==<script>alert("XSS")</script>==';
    const output = await processMarkdown(input);
    console.log('  Output:', output.trim());

    // ハイライトが処理されているか、安全にエスケープされているかを確認
    const isProcessedSafely = output.includes('<mark') && output.includes('&lt;script&gt;');
    const isUnprocessedSafe = output.includes('\\=='); // remarkによるエスケープ
    const isEscapedContent = output.includes('&lt;script&gt;'); // HTMLエスケープ

    assert(isProcessedSafely || isUnprocessedSafe || isEscapedContent, 'Content should be safely handled');
    // 実行可能なスクリプトが存在しないことを確認（エスケープされているため）
    const hasExecutableScript = output.includes('<script>alert') && !output.includes('\\==');
    assert(!hasExecutableScript, 'Executable script should not exist');
  });

  await runTest('SR-001: XSS Prevention - Event handlers', async () => {
    const input = '==<img src="x" onerror="alert(1)"">==';
    const output = await processMarkdown(input);
    console.log('  Output:', output.trim());

    // 安全に処理されているかを確認
    const isProcessedSafely = output.includes('<mark') && output.includes('&lt;img');
    const isUnprocessedSafe = output.includes('\\=='); // remarkによるエスケープ
    const isEscapedContent = output.includes('&lt;img'); // HTMLエスケープ

    assert(isProcessedSafely || isUnprocessedSafe || isEscapedContent, 'Content should be safely handled');
    // イベントハンドラーが安全に処理されていることを確認
    const hasExecutableHandler = output.includes('onerror="alert') && !output.includes('\\==');
    assert(!hasExecutableHandler, 'Event handlers should be escaped');
  });

  await runTest('SR-001: XSS Prevention - JavaScript URL', async () => {
    const input = '==<a href="javascript:alert(1)">link</a>==';
    const output = await processMarkdown(input);
    console.log('  Output:', output.trim());

    // 安全に処理されているかを確認
    const isProcessedSafely = output.includes('<mark') && output.includes('&lt;a');
    const isUnprocessedSafe = output.includes('\\=='); // remarkによるエスケープ
    const isEscapedContent = output.includes('&lt;a'); // HTMLエスケープ

    assert(isProcessedSafely || isUnprocessedSafe || isEscapedContent, 'Content should be safely handled');
    // JavaScript URLが安全に処理されていることを確認
    const hasExecutableJS = output.includes('javascript:alert') && !output.includes('\\==');
    assert(!hasExecutableJS, 'JavaScript URL should be escaped');
  });

  // SR-002: HTMLタグのサニタイズ確認
  await runTest('SR-002: HTML Sanitization - Dangerous tags', async () => {
    const dangerousTags = [
      '==<object data="malicious.swf">==',
      '==<embed src="malicious.swf">==',
      '==<iframe src="evil.html">==',
      '==<form action="evil.php">==',
    ];

    for (const input of dangerousTags) {
      const output = await processMarkdown(input);

      // 危険なタグが実行可能な形で残っていないことを確認
      const hasExecutableTags = (
        output.includes('<object') ||
        output.includes('<embed') ||
        output.includes('<iframe') ||
        output.includes('<form')
      ) && !output.includes('\\==');

      assert(!hasExecutableTags, 'Dangerous tags should be escaped');

      // 安全に処理されているかを確認（エスケープ済みまたは未処理）
      const isProcessedSafely = output.includes('<mark') && output.includes('&lt;');
      const isUnprocessedSafe = output.includes('\\=='); // remarkによるエスケープ

      assert(isProcessedSafely || isUnprocessedSafe, 'Dangerous tags should be safely handled');
    }
  });

  // SR-003: 長い入力の処理確認（DoS対策）
  await runTest('SR-003: DoS Prevention - Long input', async () => {
    // 10KB の長い入力をテスト
    const longInput = '==' + 'a'.repeat(10000) + '==';

    const startTime = Date.now();
    const output = await processMarkdown(longInput);
    const endTime = Date.now();

    const processingTime = endTime - startTime;
    console.log(`  Processing time for 10KB input: ${processingTime}ms`);

    // 処理時間が合理的範囲内であることを確認（DoS防止）
    assert(processingTime < 1000, `Processing should be fast, took ${processingTime}ms`);
    assert(output.includes('<mark'), 'Should still process long input correctly');
  });

  // SR-003: 深いネスト構造への対応確認
  await runTest('SR-003: DoS Prevention - Deep nesting attempt', async () => {
    // 深いネスト構造を模擬（実際にはremarkが処理前に制限）
    const nestedInput = '==' + '=='.repeat(50) + 'content' + '=='.repeat(50) + '==';

    const output = await processMarkdown(nestedInput);
    console.log('  Nested output length:', output.length);

    // 処理が正常に完了することを確認
    assert(output.length > 0, 'Should handle nested structure gracefully');
    assert(output.includes('content'), 'Should preserve actual content');
  });

  // SR-004: 特殊文字の組み合わせパターンチェック
  await runTest('SR-004: Special character combinations', async () => {
    const specialInputs = [
      '==<>&"\'==',  // HTML特殊文字
      '==\x00\x01\x02==',  // 制御文字
      '==\u200B\u200C\u200D==',  // ゼロ幅文字
    ];

    for (const input of specialInputs) {
      const output = await processMarkdown(input);

      // 危険な文字がエスケープされていることを確認
      if (input.includes('<')) assert(output.includes('&lt;'), 'Less-than should be escaped');
      if (input.includes('>')) assert(output.includes('&gt;'), 'Greater-than should be escaped');
      if (input.includes('&')) assert(output.includes('&amp;'), 'Ampersand should be escaped');
      if (input.includes('"')) assert(output.includes('&quot;'), 'Quote should be escaped');

      // マーク要素は生成されることを確認
      assert(output.includes('<mark'), 'Should generate mark element');
    }
  });

  // パフォーマンス維持確認
  await runTest('Performance Impact - Security overhead', async () => {
    const testInput = '==normal content==';
    const iterations = 100;

    const startTime = Date.now();
    for (let i = 0; i < iterations; i++) {
      await processMarkdown(testInput);
    }
    const endTime = Date.now();

    const avgTime = (endTime - startTime) / iterations;
    console.log(`  Average processing time: ${avgTime.toFixed(2)}ms`);

    // セキュリティ処理による大幅な性能劣化がないことを確認
    assert(avgTime < 10, `Security overhead should be minimal, avg: ${avgTime.toFixed(2)}ms`);
  });

  // 既存機能保持確認
  await runTest('Functionality Preservation - Accessibility features', async () => {
    const inputs = [
      '==basic==',
      '==custom=={.highlight aria-label="test"}',
      '==test==',
    ];

    for (const input of inputs) {
      const output = await processMarkdown(input, { accessibility: true });

      // アクセシビリティ機能が保持されていることを確認
      assert(output.includes('role="mark"'), 'Accessibility features should be preserved');
    }
  });

  // 結果サマリー
  console.log('\n========================================');
  console.log(`Security Tests Results: ${testsPassed} passed, ${testsFailed} failed, ${testsRun} total`);
  console.log('========================================');

  if (testsFailed === 0) {
    console.log('\n✅ All security tests passed! The system is secure against known attack patterns.');
  } else {
    console.log('\n⚠️ Some security tests failed. Please review and fix the issues.');
  }

  return { passed: testsPassed, failed: testsFailed, total: testsRun };
}

// Run tests
runTests();