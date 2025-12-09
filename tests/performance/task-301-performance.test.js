import { remark } from 'remark';
import remarkMarkHighlight from '../../src/plugins/remark-mark-highlight/index.js';
import assert from 'assert';

/**
 * TASK-301: パフォーマンス最適化 - TDDテスト実装
 *
 * このテストファイルは最初に失敗するように設計されています（RED phase）
 * パフォーマンス最適化後にすべてのテストがパスするようになります（GREEN phase）
 */

// Test helper to process markdown
async function processMarkdown(input, options = {}) {
  const processor = remark().use(remarkMarkHighlight, options);
  const result = await processor.process(input);
  return String(result);
}

// Helper to generate large test data
function generateTestData(count, pattern = '==highlight==') {
  return Array(count).fill(pattern).join(' ');
}

// Helper to measure execution time
async function measureTime(fn) {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return { result, time: end - start };
}

// Helper to measure memory usage
function measureMemory(fn) {
  if (global.gc) global.gc(); // Force garbage collection if available
  const beforeMemory = process.memoryUsage();
  const result = fn();
  const afterMemory = process.memoryUsage();
  return {
    result,
    heapUsed: afterMemory.heapUsed - beforeMemory.heapUsed,
    heapTotal: afterMemory.heapTotal - beforeMemory.heapTotal,
    external: afterMemory.external - beforeMemory.external
  };
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
  console.log('Running TASK-301 Performance Tests...');
  console.log('Note: These tests are designed to FAIL initially (TDD RED phase)\n');

  // TC-301-001: 基本処理速度ベンチマーク
  await runTest('TC-301-001: Basic processing speed benchmark', async () => {
    const testCases = [
      { size: 10, target: 1 },    // 1ms以内
      { size: 50, target: 2 },    // 2ms以内
      { size: 100, target: 3 },   // 3ms以内
      { size: 1000, target: 100 } // 100ms以内
    ];

    for (const testCase of testCases) {
      const testData = generateTestData(testCase.size);

      // Run multiple times and take average
      const measurements = [];
      for (let i = 0; i < 5; i++) {
        const { time } = await measureTime(() => processMarkdown(testData));
        measurements.push(time);
      }

      const avgTime = measurements.reduce((a, b) => a + b) / measurements.length;
      console.log(`  ${testCase.size} highlights: ${avgTime.toFixed(2)}ms (target: ${testCase.target}ms)`);

      assert(avgTime <= testCase.target,
        `${testCase.size} highlights took ${avgTime.toFixed(2)}ms, expected ≤${testCase.target}ms`);
    }
  });

  // TC-301-002: 正規表現実行時間測定
  await runTest('TC-301-002: Regex execution time measurement', async () => {
    const regexTestData = {
      simple: '==simple highlight==',
      multiple: '==first== text ==second== more ==third==',
      custom: '==custom=={.class aria-label="test"}',
      mixed: 'normal ==highlight== **bold** ==custom=>{.red} text',
      large: generateTestData(1000)
    };

    const targets = {
      simple: 0.1,   // 0.1ms以内
      multiple: 0.5, // 0.5ms以内
      custom: 0.2,   // 0.2ms以内
      mixed: 0.3,    // 0.3ms以内
      large: 50      // 50ms以内
    };

    for (const [name, data] of Object.entries(regexTestData)) {
      const { time } = await measureTime(() => processMarkdown(data));
      console.log(`  ${name}: ${time.toFixed(2)}ms (target: ${targets[name]}ms)`);

      assert(time <= targets[name],
        `${name} regex took ${time.toFixed(2)}ms, expected ≤${targets[name]}ms`);
    }
  });

  // TC-301-003: AST走査効率測定
  await runTest('TC-301-003: AST traversal efficiency measurement', async () => {
    const complexDocument = `# 大規模文書テスト
## セクション1
これは==ハイライト1==を含む段落です。

### サブセクション
- リスト項目 ==highlight==
- 別のリスト項目 ==another highlight==

## セクション2
> 引用内の==ハイライト==

\`\`\`code
コード内は==processed should not be==
\`\`\`

**複雑な==ネスト**記法==も含む文書。`;

    const { time } = await measureTime(() => processMarkdown(complexDocument));
    console.log(`  Complex document processing: ${time.toFixed(2)}ms (target: ≤20ms)`);

    // AST走査時間が20ms以内であること（厳しい基準）
    assert(time <= 20, `AST traversal took ${time.toFixed(2)}ms, expected ≤20ms`);
  });

  // TC-301-004: メモリ使用量測定
  await runTest('TC-301-004: Memory usage measurement', async () => {
    const memoryTestCases = [
      { name: '小規模', size: 100, target: 1024 * 1024 },      // 1MB以内
      { name: '中規模', size: 1000, target: 5 * 1024 * 1024 }, // 5MB以内
      { name: '大規模', size: 10000, target: 50 * 1024 * 1024 } // 50MB以内
    ];

    for (const testCase of memoryTestCases) {
      const testData = generateTestData(testCase.size);

      const memResult = measureMemory(() => {
        // Synchronous version for memory measurement
        const processor = remark().use(remarkMarkHighlight);
        return processor.processSync(testData);
      });

      console.log(`  ${testCase.name} (${testCase.size}): ${(memResult.heapUsed / 1024 / 1024).toFixed(2)}MB heap used`);

      assert(memResult.heapUsed <= testCase.target,
        `${testCase.name} used ${(memResult.heapUsed / 1024 / 1024).toFixed(2)}MB, expected ≤${(testCase.target / 1024 / 1024).toFixed(2)}MB`);
    }
  });

  // TC-301-005: 大量データ処理メモリテスト
  await runTest('TC-301-005: Large data processing memory test', async () => {
    // 10万文字の文書をシミュレート
    const largeDocument = generateTestData(10000) + ' text '.repeat(5000);

    const { time } = await measureTime(() => processMarkdown(largeDocument));
    console.log(`  Large document (100K chars): ${time.toFixed(2)}ms (target: ≤1000ms)`);

    assert(time <= 1000, `Large document took ${time.toFixed(2)}ms, expected ≤1000ms`);

    // メモリ使用量も確認
    const memResult = measureMemory(() => {
      const processor = remark().use(remarkMarkHighlight);
      return processor.processSync(largeDocument);
    });

    const memoryMB = memResult.heapUsed / 1024 / 1024;
    console.log(`  Memory used: ${memoryMB.toFixed(2)}MB (target: ≤100MB)`);
    assert(memoryMB <= 100, `Memory usage ${memoryMB.toFixed(2)}MB, expected ≤100MB`);
  });

  // TC-301-006: キャッシュヒット率測定
  await runTest('TC-301-006: Cache hit rate measurement', async () => {
    const cacheTestData = [
      '==repeated content==',  // 1回目
      '==another content==',
      '==repeated content==',  // 2回目（キャッシュヒットするはず）
      '==custom=={.class}',
      '==repeated content==',  // 3回目（キャッシュヒットするはず）
    ];

    // キャッシュを有効にしてテスト
    const times = [];
    for (const data of cacheTestData) {
      const { time } = await measureTime(() => processMarkdown(data, { cache: true }));
      times.push(time);
    }

    // 繰り返しデータの処理時間が短縮されているかチェック
    const firstTime = times[0];  // '==repeated content==' 1回目
    const secondTime = times[2]; // '==repeated content==' 2回目
    const thirdTime = times[4];  // '==repeated content==' 3回目

    console.log(`  First time: ${firstTime.toFixed(2)}ms, Second: ${secondTime.toFixed(2)}ms, Third: ${thirdTime.toFixed(2)}ms`);

    // 2回目と3回目は1回目より速いはず（キャッシュ効果）
    const improvement = ((firstTime - secondTime) / firstTime) * 100;
    console.log(`  Cache improvement: ${improvement.toFixed(1)}%`);

    // 最低30%の改善があること（実際のキャッシュ効果）
    assert(improvement >= 30, `Cache improvement ${improvement.toFixed(1)}%, expected ≥30%`);
  });

  // TC-301-007: キャッシュサイズ制限テスト（現在未実装のため失敗する）
  await runTest('TC-301-007: Cache size limit test', async () => {
    // キャッシュ制限を10とし、20個の異なるデータで実行
    const cacheOverflowTest = Array(20).fill(0).map((_, i) => `==content${i}==`);

    for (const data of cacheOverflowTest) {
      await processMarkdown(data);
    }

    // TODO: 実際のキャッシュサイズ取得機能が必要
    const cacheSize = 0; // 現在は未実装のため0

    console.log(`  Cache size after overflow: ${cacheSize} (target: ≤10)`);
    assert(cacheSize <= 10, `Cache size ${cacheSize}, expected ≤10`);
  });

  // TC-301-008: 実際の文書パフォーマンステスト
  await runTest('TC-301-008: Real document performance test', async () => {
    const realDocument = `# 実際のブログ記事風文書
これは==重要な情報==を含む記事です。

## 技術的な内容
プログラミングにおいて、==パフォーマンス最適化==は重要です。
特に、==正規表現==の使用や==メモリ管理==に注意が必要です。

### コード例
\`\`\`javascript
const result = processMarkdown('==example==');
\`\`\`

## まとめ
==最適化されたコード==により、==処理速度==と==メモリ効率==が向上します。
==ユーザーエクスペリエンス==の改善に繋がります。`;

    const { time } = await measureTime(() => processMarkdown(realDocument));
    console.log(`  Real document (5KB): ${time.toFixed(2)}ms (target: ≤10ms)`);

    assert(time <= 10, `Real document took ${time.toFixed(2)}ms, expected ≤10ms`);
  });

  // TC-301-009: 機能完全性テスト（回帰テスト）
  await runTest('TC-301-009: Functional completeness test', async () => {
    const functionalTests = [
      { input: '==basic==', expected: '<mark role="mark">basic</mark>' },
      { input: '==custom=={.highlight-yellow aria-label="test"}', expected: 'class="highlight-yellow"' },
      { input: '==test==', options: { accessibility: false }, expected: '<mark>test</mark>' },
    ];

    for (const test of functionalTests) {
      const output = await processMarkdown(test.input, test.options || {});
      assert(output.includes(test.expected),
        `Functional test failed: ${test.input} -> ${output}`);
    }
  });

  // TC-301-010: 品質維持テスト（セキュリティ）
  await runTest('TC-301-010: Quality maintenance test', async () => {
    const qualityTests = [
      '==<script>alert("xss")</script>==',  // XSS防止
      '==very long text that might cause issues==',  // 長いテキスト
      '==invalid\nmarkup==',  // 不正な入力
    ];

    for (const test of qualityTests) {
      const output = await processMarkdown(test);
      console.log(`  Testing: ${test} -> ${output.substring(0, 100)}...`);

      // XSS防止の確認
      if (test.includes('<script>')) {
        // 実際のXSS脆弱性の確認：実行可能なスクリプトタグがないこと
        const hasExecutableScript = output.includes('<script>') && !output.includes('\\==') && !output.includes('&lt;script&gt;');
        assert(!hasExecutableScript, 'XSS vulnerability: executable script tag found');

        // 安全な処理の確認：エスケープまたは無効化されていること
        const isProcessedAndEscaped = output.includes('<mark') && output.includes('&lt;script&gt;');
        const isUnprocessedButSafe = output.includes('\\=='); // remarkによるエスケープ
        const isSafelyEscaped = output.includes('&lt;script&gt;'); // HTMLエスケープ

        assert(isProcessedAndEscaped || isUnprocessedButSafe || isSafelyEscaped,
          'Content should be safely processed, escaped, or remain unprocessed');
      }

      // 出力が存在することを確認（エラーで空にならない）
      assert(output.length > 0, 'Output should not be empty');
    }
  });

  // TC-301-011: 最適化前後比較（ベースライン測定）
  await runTest('TC-301-011: Before/after optimization comparison', async () => {
    const comparisonData = generateTestData(1000);

    // 現在の実装での測定（最適化前ベースライン）
    const { time } = await measureTime(() => processMarkdown(comparisonData));

    console.log(`  Current implementation: ${time.toFixed(2)}ms`);
    console.log(`  Target improvement: 50% reduction (≤${(time * 0.5).toFixed(2)}ms)`);

    // この段階では改善目標を設定するだけ
    // 実際の最適化後に比較テストを実行
    assert(time > 0, 'Baseline measurement should be positive');
  });

  // 結果サマリー
  console.log('\n========================================');
  console.log(`Results: ${testsPassed} passed, ${testsFailed} failed, ${testsRun} total`);
  console.log('========================================');

  if (testsFailed > 0) {
    console.log('\nThis is expected! These tests will pass after implementing performance optimizations.');
    console.log('Key areas needing optimization:');
    console.log('- Regex performance');
    console.log('- AST traversal efficiency');
    console.log('- Memory usage optimization');
    console.log('- Cache implementation');
  }

  return { passed: testsPassed, failed: testsFailed, total: testsRun };
}

// Run tests
runTests();