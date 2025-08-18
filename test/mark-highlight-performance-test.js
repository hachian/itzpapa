#!/usr/bin/env node
/**
 * TASK-005: パフォーマンステスト実装
 * マークハイライトプラグインのパフォーマンスを測定
 */

import { remark } from 'remark';
import remarkMarkHighlight from '../src/plugins/remark-mark-highlight/index.js';
import { performance } from 'perf_hooks';
import { writeFileSync } from 'fs';

console.log('🚀 TASK-005: Mark Highlight Performance Tests\n');
console.log('=' .repeat(60));

// パフォーマンス測定結果を格納
const results = {
  timestamp: new Date().toISOString(),
  tests: [],
  baseline: {},
  optimized: {},
  improvement: {}
};

/**
 * メモリ使用量を測定
 */
function measureMemory() {
  if (global.gc) {
    global.gc();
  }
  const usage = process.memoryUsage();
  return {
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100, // MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024 * 100) / 100,
    external: Math.round(usage.external / 1024 / 1024 * 100) / 100,
    rss: Math.round(usage.rss / 1024 / 1024 * 100) / 100
  };
}

/**
 * 処理時間を測定
 */
async function measureProcessingTime(text, iterations = 10) {
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await remark()
      .use(remarkMarkHighlight)
      .process(text);
    const end = performance.now();
    times.push(end - start);
  }
  
  // 外れ値を除外（最初の実行は遅いことが多い）
  times.sort((a, b) => a - b);
  const trimmed = times.slice(1, -1);
  
  return {
    min: Math.round(Math.min(...trimmed) * 100) / 100,
    max: Math.round(Math.max(...trimmed) * 100) / 100,
    avg: Math.round(trimmed.reduce((a, b) => a + b, 0) / trimmed.length * 100) / 100,
    median: Math.round(trimmed[Math.floor(trimmed.length / 2)] * 100) / 100
  };
}

/**
 * テストケースを実行
 */
async function runTest(name, text, expectedTime) {
  console.log(`\n📊 ${name}`);
  console.log('-'.repeat(40));
  
  const memBefore = measureMemory();
  const timing = await measureProcessingTime(text);
  const memAfter = measureMemory();
  
  const memUsed = Math.round((memAfter.heapUsed - memBefore.heapUsed) * 100) / 100;
  const success = timing.avg <= expectedTime;
  
  console.log(`⏱️  処理時間:`);
  console.log(`   平均: ${timing.avg}ms (目標: <${expectedTime}ms)`);
  console.log(`   最小: ${timing.min}ms / 最大: ${timing.max}ms`);
  console.log(`   中央値: ${timing.median}ms`);
  console.log(`💾 メモリ使用量: ${memUsed}MB増加`);
  console.log(`   ヒープ: ${memBefore.heapUsed}MB → ${memAfter.heapUsed}MB`);
  console.log(`📈 結果: ${success ? '✅ 成功' : '❌ 失敗'}`);
  
  results.tests.push({
    name,
    timing,
    memoryDelta: memUsed,
    memoryBefore: memBefore,
    memoryAfter: memAfter,
    success,
    expectedTime,
    textLength: text.length,
    highlightCount: (text.match(/==/g) || []).length / 2
  });
  
  return success;
}

/**
 * PT-001: 小規模テキスト処理速度
 */
async function testSmallText() {
  const text = 'これは小規模なテストテキストです。==最初のハイライト==があり、続いて==2番目のハイライト==もあります。';
  return await runTest('PT-001: 小規模テキスト（100文字、2ハイライト）', text, 10);
}

/**
 * PT-002: 中規模テキスト処理速度
 */
async function testMediumText() {
  let text = '';
  for (let i = 0; i < 10; i++) {
    text += `これは段落${i + 1}です。==ハイライト${i + 1}==を含んでいます。この文章は繰り返されており、実際のドキュメントをシミュレートしています。`;
  }
  // 約1000文字、10個のハイライト
  return await runTest('PT-002: 中規模テキスト（1000文字、10ハイライト）', text, 100);
}

/**
 * PT-003: 大規模テキスト処理速度
 */
async function testLargeText() {
  let text = '';
  for (let i = 0; i < 50; i++) {
    text += `# セクション${i + 1}\n\n`;
    text += `この段落には==重要な部分${i + 1}==が含まれています。`;
    text += `長いテキストのパフォーマンステストを行うため、この文章は繰り返されています。`;
    text += `マークダウンの様々な記法と組み合わせて、実際の使用状況をシミュレートしています。\n\n`;
  }
  // 約10000文字、50個のハイライト
  return await runTest('PT-003: 大規模テキスト（10000文字、50ハイライト）', text, 1000);
}

/**
 * PT-004: 複雑なパターン処理速度
 */
async function testComplexPattern() {
  const text = `
# 複雑なパターンのテスト

==**太字のハイライト**==と==*イタリックのハイライト*==があります。

さらに==[リンク](https://example.com)==や==\`インラインコード\`==も含まれています。

ネストした記法: ==**_太字とイタリック_**==

エスケープが必要な文字: ==<div>HTMLタグ</div>==と==&特殊文字&==

日本語と英語の混在: ==これはJapanese text==と==This is English==

長い文字列: ==${'a'.repeat(100)}==
`;
  return await runTest('PT-004: 複雑なパターン', text, 200);
}

/**
 * MT-002: メモリリーク検証
 */
async function testMemoryLeak() {
  console.log('\n📊 MT-002: メモリリーク検証');
  console.log('-'.repeat(40));
  
  const text = '==テスト==を含むテキスト。'.repeat(10);
  const iterations = 100;
  
  const initialMem = measureMemory();
  console.log(`💾 初期メモリ: ${initialMem.heapUsed}MB`);
  
  // 最初の実行
  await remark().use(remarkMarkHighlight).process(text);
  const firstMem = measureMemory();
  const firstDelta = firstMem.heapUsed - initialMem.heapUsed;
  console.log(`💾 初回実行後: ${firstMem.heapUsed}MB (+${Math.round(firstDelta * 100) / 100}MB)`);
  
  // 繰り返し実行
  console.log(`🔄 ${iterations}回繰り返し実行中...`);
  for (let i = 0; i < iterations; i++) {
    await remark().use(remarkMarkHighlight).process(text);
    if (i % 20 === 0) {
      process.stdout.write('.');
    }
  }
  console.log();
  
  const finalMem = measureMemory();
  const totalDelta = finalMem.heapUsed - initialMem.heapUsed;
  const leakRatio = totalDelta / firstDelta;
  
  console.log(`💾 最終メモリ: ${finalMem.heapUsed}MB (+${Math.round(totalDelta * 100) / 100}MB)`);
  console.log(`📊 増加比率: ${Math.round(leakRatio * 100) / 100}倍`);
  
  const success = leakRatio < 2;
  console.log(`📈 結果: ${success ? '✅ メモリリークなし' : '❌ メモリリークの可能性'}`);
  
  results.tests.push({
    name: 'MT-002: メモリリーク検証',
    iterations,
    initialMemory: initialMem.heapUsed,
    finalMemory: finalMem.heapUsed,
    totalDelta,
    leakRatio,
    success
  });
  
  return success;
}

/**
 * BT-001: 処理速度ベンチマーク
 */
async function benchmarkSpeed() {
  console.log('\n📊 BT-001: 処理速度ベンチマーク');
  console.log('-'.repeat(40));
  
  // デバッグログあり（現在の実装）
  process.env.DEBUG = 'true';
  const withDebug = await measureProcessingTime('==テスト=='.repeat(10), 5);
  
  // デバッグログなし（最適化シミュレーション）
  process.env.DEBUG = 'false';
  const withoutDebug = await measureProcessingTime('==テスト=='.repeat(10), 5);
  
  const improvement = Math.round((1 - withoutDebug.avg / withDebug.avg) * 100);
  
  console.log(`📊 デバッグログあり: ${withDebug.avg}ms`);
  console.log(`📊 デバッグログなし: ${withoutDebug.avg}ms`);
  console.log(`📈 改善率: ${improvement}%`);
  
  results.baseline.withDebug = withDebug;
  results.optimized.withoutDebug = withoutDebug;
  results.improvement.debugLogRemoval = improvement;
  
  return improvement > 0;
}

/**
 * メインテスト実行
 */
async function runAllTests() {
  console.log('\n🧪 パフォーマンステスト開始\n');
  
  const testResults = [];
  
  // 各テストを実行
  testResults.push(await testSmallText());
  testResults.push(await testMediumText());
  testResults.push(await testLargeText());
  testResults.push(await testComplexPattern());
  testResults.push(await testMemoryLeak());
  testResults.push(await benchmarkSpeed());
  
  // サマリー
  console.log('\n' + '='.repeat(60));
  console.log('📊 テストサマリー\n');
  
  const successCount = testResults.filter(r => r).length;
  const totalCount = testResults.length;
  const successRate = Math.round(successCount / totalCount * 100);
  
  console.log(`✅ 成功: ${successCount}/${totalCount} (${successRate}%)`);
  
  // 平均処理時間の計算
  const avgTimes = results.tests
    .filter(t => t.timing)
    .map(t => t.timing.avg);
  if (avgTimes.length > 0) {
    const overallAvg = Math.round(avgTimes.reduce((a, b) => a + b, 0) / avgTimes.length * 100) / 100;
    console.log(`⏱️  平均処理時間: ${overallAvg}ms`);
  }
  
  // 平均メモリ使用量の計算
  const memDeltas = results.tests
    .filter(t => typeof t.memoryDelta === 'number')
    .map(t => t.memoryDelta);
  if (memDeltas.length > 0) {
    const avgMemDelta = Math.round(memDeltas.reduce((a, b) => a + b, 0) / memDeltas.length * 100) / 100;
    console.log(`💾 平均メモリ増加: ${avgMemDelta}MB`);
  }
  
  // レポートファイルに保存
  const reportPath = 'test/performance-test-results.json';
  writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 詳細レポート: ${reportPath}`);
  
  // パフォーマンス要件の達成状況
  console.log('\n📋 パフォーマンス要件の達成状況:');
  const requirements = [
    { name: '小規模テキスト(<10ms)', met: results.tests[0]?.success },
    { name: '中規模テキスト(<100ms)', met: results.tests[1]?.success },
    { name: '大規模テキスト(<1000ms)', met: results.tests[2]?.success },
    { name: 'メモリリークなし', met: results.tests[4]?.success }
  ];
  
  requirements.forEach(req => {
    console.log(`  ${req.met ? '✅' : '❌'} ${req.name}`);
  });
  
  const allMet = requirements.every(r => r.met);
  console.log(`\n🎯 総合評価: ${allMet ? '✅ 全要件達成' : '⚠️ 要件未達成（最適化が必要）'}`);
  
  process.exit(allMet ? 0 : 1);
}

// テスト実行
runAllTests().catch(console.error);