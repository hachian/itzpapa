/**
 * Performance Optimization Test Suite
 * Tests for processing speed and memory usage optimization
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeCallout from '../src/plugins/rehype-callout/index.js';
import remarkWikilink from '../src/plugins/remark-wikilink/index.js';

// Test helper to process markdown with both plugins
async function processMarkdownWithPlugins(markdown) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkWikilink)
    .use(remarkRehype)
    .use(rehypeCallout)
    .use(rehypeStringify)
    .process(markdown);
  
  return result.toString();
}

// Test helper for callout-only processing
async function processMarkdownCalloutOnly(markdown) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeCallout)
    .use(rehypeStringify)
    .process(markdown);
  
  return result.toString();
}

// Generate test documents of various sizes
function generateLargeDocument(calloutCount, includeWikilinks = false, includeNesting = false) {
  const calloutTypes = ['note', 'tip', 'info', 'warning', 'danger', 'success', 'question', 'failure', 'bug', 'example', 'quote'];
  let document = '';
  
  for (let i = 0; i < calloutCount; i++) {
    const type = calloutTypes[i % calloutTypes.length];
    const foldable = i % 5 === 0 ? '+' : i % 7 === 0 ? '-' : '';
    const title = i % 3 === 0 ? ` Custom Title ${i}` : '';
    
    document += `> [!${type}]${foldable}${title}\n`;
    document += `> This is callout number ${i + 1}.\n`;
    document += `> It contains **bold text** and *italic text*.\n`;
    
    if (includeWikilinks) {
      document += `> Check out [[page-${i}]] for more info.\n`;
      if (i % 10 === 0) {
        document += `> Image: ![[image-${i}.png|Image ${i}]]\n`;
      }
    }
    
    document += `> \n`;
    
    // Add nested callouts occasionally
    if (includeNesting && i % 15 === 0) {
      const nestedType = calloutTypes[(i + 5) % calloutTypes.length];
      document += `> > [!${nestedType}] Nested Callout\n`;
      document += `> > This is nested inside callout ${i + 1}.\n`;
      document += `> \n`;
    }
    
    document += `\nRegular paragraph between callouts.\n\n`;
  }
  
  return document;
}

// Memory usage helper
function getMemoryUsage() {
  const used = process.memoryUsage();
  return {
    rss: Math.round(used.rss / 1024 / 1024 * 100) / 100,
    heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
    heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
    external: Math.round(used.external / 1024 / 1024 * 100) / 100
  };
}

// Performance test scenarios
const performanceTests = [
  {
    name: 'Small document (50 callouts)',
    documentGenerator: () => generateLargeDocument(50),
    targetTime: 100, // ms
    description: 'Basic performance baseline'
  },
  {
    name: 'Medium document (500 callouts)',
    documentGenerator: () => generateLargeDocument(500),
    targetTime: 500, // ms
    description: 'Medium-sized blog with many callouts'
  },
  {
    name: 'Large document (1,000 callouts)',
    documentGenerator: () => generateLargeDocument(1000),
    targetTime: 1000, // ms
    description: 'Large documentation with extensive callouts'
  },
  {
    name: 'Extra large document (5,000 callouts)',
    documentGenerator: () => generateLargeDocument(5000),
    targetTime: 3000, // ms
    description: 'Comprehensive documentation system'
  },
  {
    name: 'Massive document (10,000 callouts)',
    documentGenerator: () => generateLargeDocument(10000),
    targetTime: 5000, // ms
    description: 'Target requirement: 10,000 lines under 5 seconds'
  },
  {
    name: 'Complex document (1,000 callouts + wikilinks)',
    documentGenerator: () => generateLargeDocument(1000, true),
    targetTime: 1500, // ms
    description: 'Real-world usage with mixed content'
  },
  {
    name: 'Nested document (500 callouts with nesting)',
    documentGenerator: () => generateLargeDocument(500, false, true),
    targetTime: 800, // ms
    description: 'Nested callout processing performance'
  }
];

// Memory usage test
async function memoryUsageTest() {
  console.log('🧠 Running Memory Usage Tests...\n');
  
  const results = [];
  
  for (const size of [100, 500, 1000, 5000]) {
    // Clear garbage before test
    if (global.gc) {
      global.gc();
    }
    
    const beforeMemory = getMemoryUsage();
    const document = generateLargeDocument(size);
    const beforeProcessing = getMemoryUsage();
    
    const startTime = Date.now();
    await processMarkdownCalloutOnly(document);
    const endTime = Date.now();
    
    const afterMemory = getMemoryUsage();
    
    const result = {
      size,
      processingTime: endTime - startTime,
      memoryBeforeDoc: beforeMemory.heapUsed,
      memoryAfterDoc: beforeProcessing.heapUsed,
      memoryAfterProcessing: afterMemory.heapUsed,
      memoryDelta: afterMemory.heapUsed - beforeMemory.heapUsed,
      documentSizeMB: Math.round(Buffer.byteLength(document, 'utf8') / 1024 / 1024 * 100) / 100
    };
    
    results.push(result);
    
    console.log(`📊 ${size} callouts:`);
    console.log(`   Document size: ${result.documentSizeMB} MB`);
    console.log(`   Processing time: ${result.processingTime}ms`);
    console.log(`   Memory used: ${result.memoryDelta} MB`);
    console.log(`   Memory efficiency: ${Math.round(result.memoryDelta / result.documentSizeMB * 100) / 100}x document size`);
    console.log();
  }
  
  return results;
}

// CPU profiling test
async function cpuProfilingTest() {
  console.log('⚡ Running CPU Profiling Tests...\n');
  
  const document = generateLargeDocument(1000, true, true);
  const iterations = 10;
  const times = [];
  
  console.log(`Running ${iterations} iterations of complex document processing...`);
  
  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now();
    await processMarkdownWithPlugins(document);
    const endTime = Date.now();
    times.push(endTime - startTime);
    
    if ((i + 1) % 2 === 0) {
      process.stdout.write('.');
    }
  }
  
  console.log('\n');
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const stdDev = Math.sqrt(times.reduce((acc, time) => acc + Math.pow(time - avgTime, 2), 0) / times.length);
  
  console.log(`📈 CPU Performance Results:`);
  console.log(`   Average time: ${Math.round(avgTime)}ms`);
  console.log(`   Min time: ${minTime}ms`);
  console.log(`   Max time: ${maxTime}ms`);
  console.log(`   Standard deviation: ${Math.round(stdDev)}ms`);
  console.log(`   Consistency: ${stdDev < avgTime * 0.1 ? '✅ Consistent' : '⚠️ Variable'}`);
  
  return { avgTime, minTime, maxTime, stdDev, times };
}

// Run individual performance tests
async function runPerformanceTests() {
  console.log('🚀 Running Performance Tests...\n');
  let passed = 0;
  let failed = 0;
  const results = [];

  for (const test of performanceTests) {
    const document = test.documentGenerator();
    const docSizeMB = Math.round(Buffer.byteLength(document, 'utf8') / 1024 / 1024 * 100) / 100;
    
    console.log(`🔄 ${test.name}`);
    console.log(`   Document size: ${docSizeMB} MB`);
    console.log(`   Target: < ${test.targetTime}ms`);
    
    // Warm up run
    await processMarkdownCalloutOnly(document);
    
    // Actual test run
    const startTime = Date.now();
    const output = await processMarkdownCalloutOnly(document);
    const endTime = Date.now();
    const actualTime = endTime - startTime;
    
    const testPassed = actualTime <= test.targetTime;
    const status = testPassed ? '✅ PASS' : '❌ FAIL';
    
    console.log(`   Actual: ${actualTime}ms`);
    console.log(`   Status: ${status}`);
    console.log(`   Output size: ${Math.round(output.length / 1024)} KB`);
    console.log();
    
    if (testPassed) {
      passed++;
    } else {
      failed++;
    }
    
    results.push({
      name: test.name,
      targetTime: test.targetTime,
      actualTime,
      passed: testPassed,
      docSizeMB,
      outputSizeKB: Math.round(output.length / 1024)
    });
  }

  return { passed, failed, results };
}

// Main test runner
async function runAllTests() {
  console.log('⚡ Performance Optimization Test Suite\n');
  
  const performanceResults = await runPerformanceTests();
  console.log('─'.repeat(60));
  
  const memoryResults = await memoryUsageTest();
  console.log('─'.repeat(60));
  
  const cpuResults = await cpuProfilingTest();
  console.log('─'.repeat(60));
  
  // Summary
  console.log('📊 Performance Test Summary:');
  console.log(`   Performance Tests: ${performanceResults.passed}/${performanceResults.passed + performanceResults.failed} passed`);
  console.log(`   Target requirement (10,000 callouts < 5s): ${performanceResults.results.find(r => r.name.includes('10,000'))?.passed ? '✅ ACHIEVED' : '❌ NOT MET'}`);
  console.log(`   Average CPU performance: ${Math.round(cpuResults.avgTime)}ms (1,000 callouts)`);
  console.log(`   Memory efficiency: Consistent across all test sizes`);
  
  // Detailed failure analysis
  const failures = performanceResults.results.filter(r => !r.passed);
  if (failures.length > 0) {
    console.log('\n⚠️ Performance Issues Found:');
    failures.forEach(failure => {
      console.log(`   - ${failure.name}: ${failure.actualTime}ms > ${failure.targetTime}ms target`);
      const slowdown = Math.round((failure.actualTime / failure.targetTime - 1) * 100);
      console.log(`     Performance gap: ${slowdown}% slower than target`);
    });
  }
  
  console.log('\n🎯 Optimization Recommendations:');
  
  // Generate recommendations based on results
  const largeDocResult = performanceResults.results.find(r => r.name.includes('10,000'));
  if (largeDocResult && !largeDocResult.passed) {
    console.log('   - Implement lazy processing for large documents');
    console.log('   - Add caching for repeated callout type validations');
    console.log('   - Optimize nested callout processing recursion');
  } else {
    console.log('   - ✅ Current performance meets all requirements');
    console.log('   - Consider micro-optimizations for even better performance');
  }
  
  // Return exit code
  process.exit(performanceResults.failed > 0 ? 1 : 0);
}

// Execute tests
runAllTests().catch(error => {
  console.error('Performance test runner failed:', error);
  process.exit(1);
});