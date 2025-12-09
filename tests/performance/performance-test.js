import { remark } from 'remark';
import remarkWikilink from '../../src/plugins/remark-wikilink/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// カラー出力用のヘルパー
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`
};

// パフォーマンステストケース生成
function generateLargeWikilinkDocument(count) {
  const links = [];
  for (let i = 0; i < count; i++) {
    const pageNum = i + 1;
    links.push(`[[../test page ${pageNum}/index.md|テストページ ${pageNum}]]`);
  }
  return `# パフォーマンステスト文書\n\n${links.join('\n\n')}`;
}

// メモリ使用量監視
function getMemoryUsage() {
  const used = process.memoryUsage();
  return {
    rss: Math.round(used.rss / 1024 / 1024 * 100) / 100,
    heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
    heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
    external: Math.round(used.external / 1024 / 1024 * 100) / 100
  };
}

// パフォーマンステスト実行
async function runPerformanceTest(wikilinkCount, testName) {
  console.log(`\n${colors.cyan('▶')} Testing: ${colors.bold(testName)} (${wikilinkCount} wikilinks)`);
  
  const content = generateLargeWikilinkDocument(wikilinkCount);
  const processor = remark().use(remarkWikilink);
  
  // メモリ使用量（開始前）
  const memoryBefore = getMemoryUsage();
  
  // 実行時間測定
  const startTime = performance.now();
  
  try {
    const ast = processor.runSync(processor.parse(content));
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // メモリ使用量（実行後）
    const memoryAfter = getMemoryUsage();
    
    // リンクの数を数える
    let linkCount = 0;
    function countLinks(node) {
      if (node.type === 'link') linkCount++;
      if (node.children) {
        node.children.forEach(countLinks);
      }
    }
    countLinks(ast);
    
    // 結果表示
    console.log(`  ${colors.green('✓')} 処理時間: ${duration.toFixed(2)}ms`);
    console.log(`  ${colors.green('✓')} 変換されたリンク: ${linkCount}個`);
    console.log(`  ${colors.green('✓')} メモリ使用量増加: ${(memoryAfter.heapUsed - memoryBefore.heapUsed).toFixed(2)}MB`);
    
    return {
      success: true,
      duration,
      linkCount,
      memoryUsed: memoryAfter.heapUsed - memoryBefore.heapUsed,
      wikilinkCount
    };
  } catch (error) {
    console.log(`  ${colors.red('✗')} エラー: ${error.message}`);
    return {
      success: false,
      error: error.message,
      wikilinkCount
    };
  }
}

// ベンチマーク比較テスト
async function runBenchmarkTest() {
  console.log(`\n${colors.cyan('▶')} ベンチマーク比較テスト`);
  
  // 複数回実行して平均を取る
  const iterations = 10;
  let basicTotal = 0;
  let pluginTotal = 0;
  
  const contentWithoutWikilinks = '# テスト文書\n\n通常のテキストです。'.repeat(100);
  
  for (let i = 0; i < iterations; i++) {
    // Wikilinkプラグインなし
    const processorBasic = remark();
    const startTimeBasic = performance.now();
    processorBasic.runSync(processorBasic.parse(contentWithoutWikilinks));
    const endTimeBasic = performance.now();
    basicTotal += (endTimeBasic - startTimeBasic);
    
    // Wikilinkプラグインあり（ただしWikilinkなし）
    const processorWithPlugin = remark().use(remarkWikilink);
    const startTimeWithPlugin = performance.now();
    processorWithPlugin.runSync(processorWithPlugin.parse(contentWithoutWikilinks));
    const endTimeWithPlugin = performance.now();
    pluginTotal += (endTimeWithPlugin - startTimeWithPlugin);
  }
  
  const basicDuration = basicTotal / iterations;
  const pluginDuration = pluginTotal / iterations;
  
  // 性能低下計算
  const performanceImpact = ((pluginDuration - basicDuration) / basicDuration) * 100;
  
  console.log(`  ${colors.green('✓')} ベース処理時間: ${basicDuration.toFixed(2)}ms (${iterations}回平均)`);
  console.log(`  ${colors.green('✓')} プラグイン込み処理時間: ${pluginDuration.toFixed(2)}ms (${iterations}回平均)`);
  console.log(`  ${colors.green('✓')} 性能影響: ${performanceImpact.toFixed(2)}%`);
  
  return {
    basicDuration,
    pluginDuration,
    performanceImpact
  };
}

// メインテスト実行
async function main() {
  console.log(colors.bold('\n🚀 Wikilink Performance Test Suite\n'));
  console.log('=' . repeat(60) + '\n');

  const testCases = [
    { count: 10, name: '小規模テスト' },
    { count: 100, name: '中規模テスト' },
    { count: 1000, name: '大規模テスト' },
    { count: 5000, name: '極大規模テスト' }
  ];

  const results = [];
  
  // 各テストケースを実行
  for (const testCase of testCases) {
    const result = await runPerformanceTest(testCase.count, testCase.name);
    results.push(result);
  }
  
  // ベンチマーク比較
  const benchmark = await runBenchmarkTest();
  
  // 結果分析
  console.log('\n' + '=' . repeat(60));
  console.log(colors.bold('\n📊 Performance Analysis:\n'));
  
  const successfulTests = results.filter(r => r.success);
  
  // 1000リンクのテスト結果チェック
  const thousandLinkTest = successfulTests.find(r => r.wikilinkCount === 1000);
  let meetsTimeRequirement = false;
  if (thousandLinkTest) {
    meetsTimeRequirement = thousandLinkTest.duration < 1000;
    console.log(`  ${meetsTimeRequirement ? colors.green('✓') : colors.red('✗')} 1000リンク処理時間要件: ${thousandLinkTest.duration.toFixed(2)}ms ${meetsTimeRequirement ? '(< 1000ms)' : '(≥ 1000ms)'}`);
  }
  
  // 性能低下要件チェック
  const meetsPerformanceRequirement = benchmark.performanceImpact <= 5;
  console.log(`  ${meetsPerformanceRequirement ? colors.green('✓') : colors.red('✗')} 性能低下要件: ${benchmark.performanceImpact.toFixed(2)}% ${meetsPerformanceRequirement ? '(≤ 5%)' : '(> 5%)'}`);
  
  if (successfulTests.length > 0) {
    // メモリ使用量分析
    const avgMemoryUsage = successfulTests.reduce((sum, r) => sum + r.memoryUsed, 0) / successfulTests.length;
    console.log(`  ${colors.green('✓')} 平均メモリ使用量: ${avgMemoryUsage.toFixed(2)}MB`);
    
    // スループット計算
    const throughput = successfulTests.map(r => r.linkCount / (r.duration / 1000));
    const avgThroughput = throughput.reduce((sum, t) => sum + t, 0) / throughput.length;
    console.log(`  ${colors.green('✓')} 平均スループット: ${avgThroughput.toFixed(0)} リンク/秒`);
  }
  
  // 失敗したテストの報告
  const failedTests = results.filter(r => !r.success);
  if (failedTests.length > 0) {
    console.log(`\n  ${colors.red('⚠️')} 失敗したテスト: ${failedTests.length}個`);
    failedTests.forEach(test => {
      console.log(`    - ${test.wikilinkCount}リンク: ${test.error}`);
    });
  }
  
  // 最終判定
  const allRequirementsMet = (
    meetsTimeRequirement &&
    meetsPerformanceRequirement &&
    (failedTests.length === 0)
  );
  
  if (allRequirementsMet) {
    console.log(colors.green('\n✨ All performance requirements met! ✨\n'));
  } else {
    console.log(colors.red('\n⚠️ Some performance requirements not met.\n'));
  }
  
  // 詳細レポート保存
  const report = {
    timestamp: new Date().toISOString(),
    testResults: results,
    benchmark,
    analysis: {
      requirementsMet: allRequirementsMet,
      avgMemoryUsage: successfulTests.length > 0 ? successfulTests.reduce((sum, r) => sum + r.memoryUsed, 0) / successfulTests.length : 0,
      avgThroughput: successfulTests.length > 0 ? successfulTests.map(r => r.linkCount / (r.duration / 1000)).reduce((sum, t) => sum + t, 0) / successfulTests.length : 0
    }
  };
  
  const reportPath = join(__dirname, 'performance-report.json');
  const fs = await import('fs');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Performance report saved to: ${reportPath}`);
  
  // Exit with appropriate code
  process.exit(allRequirementsMet ? 0 : 1);
}

// テスト実行
main().catch(console.error);