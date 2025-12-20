#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// カラー出力
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
  dim: (text) => `\x1b[2m${text}\x1b[0m`
};

// テスト設定
const testSuites = [
  // Fixture Loader
  {
    name: 'Fixture Loader Tests',
    command: 'node',
    args: ['--test', 'tests/utils/fixture-loader-test.js'],
    timeout: 30000
  },
  // Unit Tests
  {
    name: 'Wikilink Unit Tests',
    command: 'node',
    args: ['--test', 'tests/unit/wikilink-unit-test.js'],
    timeout: 30000
  },
  {
    name: 'Mark Highlight Unit Tests',
    command: 'node',
    args: ['--test', 'tests/unit/mark-highlight-unit-test.js'],
    timeout: 30000
  },
  {
    name: 'Tags Unit Tests',
    command: 'node',
    args: ['--test', 'tests/unit/tags-unit-test.js'],
    timeout: 30000
  },
  {
    name: 'Callout Unit Tests',
    command: 'node',
    args: ['--test', 'tests/unit/callout-test.js'],
    timeout: 30000
  },
  // Integration Tests
  {
    name: 'Integration Tests',
    command: 'node',
    args: ['--test', 'tests/integration/integration-test.js'],
    timeout: 60000
  },
  // E2E Tests
  {
    name: 'HTML Validator Tests',
    command: 'node',
    args: ['--test', 'tests/e2e/html-validator-test.js'],
    timeout: 30000
  },
  {
    name: 'E2E Tests',
    command: 'node',
    args: ['--test', 'tests/e2e/e2e-test.js'],
    timeout: 60000
  },
  // Legacy Tests
  {
    name: 'Image Wikilink Tests',
    command: 'npm',
    args: ['run', 'test:image'],
    timeout: 30000
  },
  {
    name: 'Table Wikilink Tests',
    command: 'npm',
    args: ['run', 'test:table'],
    timeout: 30000
  },
  {
    name: 'Performance Tests',
    command: 'npm',
    args: ['run', 'test:performance'],
    timeout: 60000,
    optional: true
  }
];

// テスト結果を格納する配列
const results = [];

// 単一テストスイートの実行
function runTestSuite(testSuite) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    console.log(`\n${colors.cyan('▶')} Running: ${colors.bold(testSuite.name)}`);
    console.log(colors.dim(`  Command: ${testSuite.command} ${testSuite.args.join(' ')}`));
    
    const child = spawn(testSuite.command, testSuite.args, {
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: process.platform === 'win32'
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    // タイムアウト処理
    const timeoutId = setTimeout(() => {
      child.kill();
      resolve({
        name: testSuite.name,
        success: false,
        duration: Date.now() - startTime,
        error: 'Test timeout',
        stdout,
        stderr,
        optional: testSuite.optional || false
      });
    }, testSuite.timeout);
    
    child.on('close', (code) => {
      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;
      
      const success = code === 0;
      console.log(`  ${success ? colors.green('✓') : colors.red('✗')} ${testSuite.name} ${colors.dim(`(${duration}ms)`)}`);
      
      resolve({
        name: testSuite.name,
        success,
        duration,
        code,
        stdout,
        stderr,
        optional: testSuite.optional || false
      });
    });
  });
}

// メイン実行関数
async function runAllTests() {
  console.log(colors.bold('\n🧪 Markdown Plugin Test Suite'));
  console.log(colors.dim('Running all test suites (Unit, Integration, E2E)...\n'));
  console.log('='.repeat(60));
  
  const startTime = Date.now();
  
  // 全テストスイートを順次実行
  for (const testSuite of testSuites) {
    const result = await runTestSuite(testSuite);
    results.push(result);
  }
  
  const totalDuration = Date.now() - startTime;
  
  // 結果の集計
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success && !r.optional).length;
  const warnings = results.filter(r => !r.success && r.optional).length;
  const total = results.length;
  
  // 結果の表示
  console.log('\n' + '='.repeat(60));
  console.log(colors.bold('\n📊 Test Summary'));
  console.log(`\n  ${colors.green(`Passed: ${passed}`)} / ${colors.cyan(`Total: ${total}`)}`);
  console.log(`  ${colors.red(`Failed: ${failed}`)}`);
  if (warnings > 0) {
    console.log(`  ${colors.yellow(`Warnings: ${warnings}`)} (optional tests with known limitations)`);
  }
  console.log(`  ${colors.dim(`Total Duration: ${totalDuration}ms`)}`);
  
  // 失敗したテストの詳細表示
  const failedTests = results.filter(r => !r.success && !r.optional);
  if (failedTests.length > 0) {
    console.log(colors.red('\n❌ Failed Tests:'));
    failedTests.forEach(test => {
      console.log(`\n  ${colors.red('●')} ${test.name}`);
      if (test.error) {
        console.log(`    ${colors.yellow('Error:')} ${test.error}`);
      }
      if (test.stderr) {
        console.log(`    ${colors.yellow('stderr:')}\n${test.stderr.split('\n').map(l => '      ' + l).join('\n')}`);
      }
    });
  }
  
  // レポートファイルの生成
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      total,
      passed,
      failed,
      duration: totalDuration
    },
    results: results.map(r => ({
      name: r.name,
      success: r.success,
      duration: r.duration,
      error: r.error || null
    }))
  };
  
  const reportPath = path.join(process.cwd(), 'tests', 'reports', 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  
  // 終了メッセージ
  if (failed === 0) {
    console.log(colors.green('\n✨ All tests passed! ✨'));
  } else {
    console.log(colors.red(`\n⚠️  ${failed} test suite(s) failed.`));
  }
  
  console.log(colors.dim(`\n📄 Test report saved to: ${reportPath}\n`));
  
  // 終了コード
  process.exit(failed > 0 ? 1 : 0);
}

// エラーハンドリング
process.on('uncaughtException', (error) => {
  console.error(colors.red('\n❌ Uncaught Exception:'), error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(colors.red('\n❌ Unhandled Rejection at:'), promise, 'reason:', reason);
  process.exit(1);
});

// 実行
runAllTests().catch(console.error);