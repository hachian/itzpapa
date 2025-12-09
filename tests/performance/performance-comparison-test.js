import { remark } from 'remark';
import remarkWikilinkOriginal from '../../src/plugins/remark-wikilink/index.js';
import remarkWikilinkOptimized from '../../src/plugins/remark-wikilink/index-optimized.js';

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

// ベンチマーク実行
async function runBenchmark(plugin, pluginName, wikilinkCount) {
  const content = generateLargeWikilinkDocument(wikilinkCount);
  const processor = remark().use(plugin);
  
  const startTime = performance.now();
  const ast = processor.runSync(processor.parse(content));
  const endTime = performance.now();
  
  return {
    pluginName,
    duration: endTime - startTime,
    wikilinkCount
  };
}

// ベンチマーク比較テスト
async function runComparisonBenchmark() {
  // Wikilinkプラグインなし
  const contentWithoutWikilinks = '# テスト文書\n\n通常のテキストです。'.repeat(1000);
  const processorBasic = remark();
  
  const startTimeBasic = performance.now();
  processorBasic.runSync(processorBasic.parse(contentWithoutWikilinks));
  const endTimeBasic = performance.now();
  const basicDuration = endTimeBasic - startTimeBasic;
  
  return { basicDuration };
}

async function main() {
  console.log(colors.bold('\n🔬 Wikilink Plugin Performance Comparison\n'));
  console.log('=' . repeat(60) + '\n');

  const testCases = [100, 1000];
  
  for (const count of testCases) {
    console.log(`\n${colors.cyan('▶')} Testing with ${count} wikilinks:`);
    
    // 元のプラグイン
    const originalResult = await runBenchmark(remarkWikilinkOriginal, 'Original', count);
    console.log(`  ${colors.yellow('Original')}: ${originalResult.duration.toFixed(2)}ms`);
    
    // 最適化されたプラグイン
    const optimizedResult = await runBenchmark(remarkWikilinkOptimized, 'Optimized', count);
    console.log(`  ${colors.green('Optimized')}: ${optimizedResult.duration.toFixed(2)}ms`);
    
    // 改善率計算
    const improvement = ((originalResult.duration - optimizedResult.duration) / originalResult.duration) * 100;
    console.log(`  ${colors.bold('Improvement')}: ${improvement.toFixed(2)}%`);
  }
  
  // ベンチマーク比較
  console.log(`\n${colors.cyan('▶')} Benchmark comparison:`);
  const benchmark = await runComparisonBenchmark();
  
  // 最適化版の性能影響測定
  const optimizedWithPlugin = await runBenchmark(remarkWikilinkOptimized, 'Optimized', 0);
  const performanceImpact = ((optimizedWithPlugin.duration - benchmark.basicDuration) / benchmark.basicDuration) * 100;
  
  console.log(`  ${colors.green('✓')} ベース処理時間: ${benchmark.basicDuration.toFixed(2)}ms`);
  console.log(`  ${colors.green('✓')} 最適化プラグイン処理時間: ${optimizedWithPlugin.duration.toFixed(2)}ms`);
  console.log(`  ${colors.green('✓')} 性能影響: ${performanceImpact.toFixed(2)}%`);
  
  const meetsRequirement = performanceImpact <= 5;
  console.log(`  ${meetsRequirement ? colors.green('✓') : colors.red('✗')} 5%以下要件: ${meetsRequirement ? '満たしている' : '満たしていない'}`);
  
  if (meetsRequirement) {
    console.log(colors.green('\n✨ Performance optimization successful! ✨\n'));
  } else {
    console.log(colors.red('\n⚠️ Further optimization needed.\n'));
  }
}

main().catch(console.error);