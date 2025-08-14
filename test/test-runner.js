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
  {
    name: 'Wikilink Core Tests',
    command: 'npm',
    args: ['run', 'test:wikilink'],
    timeout: 30000
  },
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
    name: 'Callout Core Tests',
    command: 'npm',
    args: ['run', 'test:callout'],
    timeout: 30000
  },
  {
    name: 'Callout Markdown Tests',
    command: 'npm',
    args: ['run', 'test:callout-markdown'],
    timeout: 30000
  },
  {
    name: 'Nested Callout Tests',
    command: 'npm',
    args: ['run', 'test:nested-callout'],
    timeout: 30000
  },
  {
    name: 'Callout Edge Cases Tests',
    command: 'npm',
    args: ['run', 'test:callout-edge-cases'],
    timeout: 45000
  },
  {
    name: 'Callout Security Tests',
    command: 'npm',
    args: ['run', 'test:callout-security'],
    timeout: 30000
  },
  {
    name: 'Callout Integration Tests',
    command: 'npm',
    args: ['run', 'test:callout-integration'],
    timeout: 60000
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
  console.log(colors.bold('\n🧪 Comprehensive Plugin Test Suite'));
  console.log(colors.dim('Running all test suites (wikilinks + callouts)...\n'));
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
  
  const reportPath = path.join(process.cwd(), 'test', 'test-report.json');
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